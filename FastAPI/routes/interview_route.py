import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, Optional
from utils.serializers import serialize_doc
from schemas.interview import InterviewResponseSchema, SummarySchema

try:
    from livekit.api import AccessToken, VideoGrants
    from livekit.protocol.room import RoomConfiguration
    from livekit.protocol.agent_dispatch import RoomAgentDispatch
    LIVEKIT_AVAILABLE = True
except ImportError as e:
    LIVEKIT_AVAILABLE = False
    AccessToken = None
    VideoGrants = None
    RoomConfiguration = None
    RoomAgentDispatch = None

from datetime import datetime
import httpx

router = APIRouter(prefix="/interview", tags=["Interview"])

class InterviewContextRequest(BaseModel):
    resume_data: Optional[Dict[str, Any]] = None
    jd_text: Optional[str] = None
    room: str = "mock-interview-room"
    identity: str = "interviewee"

@router.post("/livekit-token")
async def get_livekit_token(request: InterviewContextRequest):
    if not LIVEKIT_AVAILABLE:
        raise HTTPException(status_code=500, detail="LiveKit SDK not installed. Install with: pip install livekit livekit-api")
    
    api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "secret")
    livekit_url = os.getenv("LIVEKIT_URL", "wss://interview-euncju1i.livekit.cloud")

    try:
        # Create RoomConfiguration with agents
        room_config = RoomConfiguration()
        
        # Create RoomAgentDispatch with the Interviewee agent name
        # RoomConfiguration.agents expects RoomAgentDispatch objects directly
        dispatch = RoomAgentDispatch()
        dispatch.agent_name = "Interviewee"  # Must match @server.rtc_session(agent_name="Interviewee")
        room_config.agents.append(dispatch)

        # Pass resume and JD context to the Python agent via the LiveKit token metadata.
        # The agent reads this on participant join to dynamically customize its system prompt.
        metadata_dict = {
            "resume_data": request.resume_data or {},
            "jd_text": request.jd_text or ""
        }
        metadata_str = json.dumps(metadata_dict)

        grant = VideoGrants(
            room_join=True,
            room=request.room,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        )
        access_token = (
            AccessToken(api_key, api_secret)
            .with_grants(grant)
            .with_identity(request.identity)
            .with_name("Interviewee")
            .with_metadata(metadata_str)
        )
        
        # Add room configuration to the token (this tells LiveKit to dispatch the agent)
        access_token.room_config = room_config
        
        return {
            "token": access_token.to_jwt(),
            "server_url": livekit_url,
            "room": request.room,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token generation error: {str(e)}")

class TranscriptMessage(BaseModel):
    speaker: str
    message: str
    timestamp: Optional[float] = None  # Agent sends None when no timestamp is available

class TranscriptPayload(BaseModel):
    candidate_name: str
    transcript: list[TranscriptMessage]
    room_id: str
    resume_text: Optional[str] = None
    jd_text: Optional[str] = None

class SummaryPayload(BaseModel):
    candidate_name: str
    summary: Dict[str, Any]
    room_id: str
    timestamp: float

@router.post("/process-transcript")
async def process_transcript(payload: TranscriptPayload):
    try:
        from database import get_database
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        # 1. Save Transcript to MongoDB
        transcript_doc = payload.dict()
        transcript_doc["created_at"] = datetime.utcnow()
        await db["interview_transcripts"].insert_one(transcript_doc)
        
        # 2. Generate Summary using Gemini via OpenRouter
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OpenRouter API key not configured")
        
        dialogue = "\n".join([f"{m.speaker}: {m.message}" for m in payload.transcript])
        
        prompt = f"""
        You are an expert technical recruiter. Analyze the following interview transcript and generate a detailed assessment report.
        
        Candidate: {payload.candidate_name}
        Resume Context: {payload.resume_text or "Not provided"}
        Job Description: {payload.jd_text or "Not provided"}
        
        Transcript:
        {dialogue}
        
        Generate a JSON response with EXACTLY this structure:
        {{
          "technicalSkills": {{ "score": number, "feedback": "string", "strengths": ["string"], "weaknesses": ["string"] }},
          "communication": {{ "score": number, "feedback": "string" }},
          "problemSolving": {{ "score": number, "feedback": "string" }},
          "experience": {{ "score": number, "feedback": "string" }},
          "cultureFit": {{ "score": number, "feedback": "string" }},
          "summary": {{
            "overallFeedback": "string",
            "keyStrengths": ["string"],
            "areasForImprovement": ["string"],
            "recommendation": "HIRE" | "REJECT" | "MAYBE",
            "recommendationReason": "string"
          }}
        }}
        Return ONLY valid JSON. No other text. Use ONLY double quotes for keys and strings. No trailing commas.
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "http://localhost:3000", 
                    "X-Title": "CareerLens Interview Assessment",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"}
                },
                timeout=45
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"OpenRouter Error: {response.text}")
            
            resp_data = response.json()
            text = resp_data["choices"][0]["message"]["content"]
        
        # Clean JSON if Gemini adds backticks
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            assessment = json.loads(json_match.group())
        else:
            raise ValueError(f"Gemini returned invalid response: {text}")
        
        # 3. Save Assessment to MongoDB
        summary_doc = {
            "candidate_name": payload.candidate_name,
            "summary": assessment,
            "room_id": payload.room_id,
            "timestamp": datetime.utcnow().timestamp(),
            "transcript_id": str(transcript_doc.get("_id"))
        }
        result = await db["interview_summaries"].insert_one(summary_doc)
        
        # Add the inserted ID and serialize for JSON response
        summary_doc["_id"] = result.inserted_id
        serialized_doc = serialize_doc(summary_doc)
        
        return {"status": "success", "summary": serialized_doc}
    
    except Exception as e:
        print(f"Error processing transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────
# DIAGNOSTIC ENDPOINTS - To help debug transcript/assessment saving
# ─────────────────────────────────────────────────────────────────

@router.get("/transcripts")
async def get_all_transcripts():
    """Get all saved transcripts for debugging."""
    try:
        from database import get_database
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        transcripts = await db["interview_transcripts"].find().to_list(None)
        return {
            "count": len(transcripts),
            "transcripts": [serialize_doc(t) for t in transcripts]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transcripts: {str(e)}")


@router.get("/summaries")
async def get_all_summaries():
    """Get all saved summaries/assessments for debugging."""
    try:
        from database import get_database
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        summaries = await db["interview_summaries"].find().to_list(None)
        return {
            "count": len(summaries),
            "summaries": [serialize_doc(s) for s in summaries]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summaries: {str(e)}")


@router.get("/transcript/{room_id}")
async def get_transcript_by_room(room_id: str):
    """Get a specific interview transcript by room ID."""
    try:
        from database import get_database
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        transcript = await db["interview_transcripts"].find_one({"room_id": room_id})
        if not transcript:
            raise HTTPException(status_code=404, detail=f"No transcript found for room {room_id}")
        
        return serialize_doc(transcript)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transcript: {str(e)}")


@router.get("/summary/{room_id}")
async def get_summary_by_room(room_id: str):
    """Get a specific interview assessment summary by room ID."""
    try:
        from database import get_database
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        summary = await db["interview_summaries"].find_one({"room_id": room_id})
        if not summary:
            raise HTTPException(status_code=404, detail=f"No summary found for room {room_id}")
        
        return serialize_doc(summary)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching summary: {str(e)}")


@router.post("/debug/api-status")
async def debug_api_status():
    """Check if all required services and credentials are configured."""
    import os
    return {
        "openrouter_api_key_set": bool(os.getenv("OPENROUTER_API_KEY")),
        "fastapi_url": os.getenv("FASTAPI_URL", "http://127.0.0.1:8000"),
        "livekit_url": os.getenv("LIVEKIT_URL"),
        "database_connected": True  # If we got here, DB is connected
    }


@router.get("/past-interviews/{candidate_name}")
async def get_past_interviews(candidate_name: str):
    """Retrieve all past interviews and assessments for a candidate."""
    try:
        from database import get_database
        db = get_database()
        if db is None:
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        summaries = await db["interview_summaries"].find(
            {"candidate_name": candidate_name}
        ).sort("timestamp", -1).to_list(None)
        
        return {
            "candidate_name": candidate_name,
            "count": len(summaries),
            "interviews": [serialize_doc(s) for s in summaries]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching interviews: {str(e)}")
