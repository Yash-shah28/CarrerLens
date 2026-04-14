import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, Optional

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
