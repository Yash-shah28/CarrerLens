from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from utils.chat_agent import run_chat_agent

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    sender: str  # "user" or "bot"
    text: str

class ChatRequest(BaseModel):
    message: str
    resume_data: Optional[Dict[str, Any]] = None
    jd_text: Optional[str] = None
    chat_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    resume_updates: Optional[Dict[str, Any]] = None

@router.post("/", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Chat endpoint for the ResumeEditor AI assistant.
    Accepts the current resume data, JD, and chat history to provide contextual AI responses.
    May return resume_updates which should be merged into the frontend editor state.
    """
    try:
        history_dicts = [{"sender": m.sender, "text": m.text} for m in (request.chat_history or [])]
        
        result = run_chat_agent(
            message=request.message,
            resume_data=request.resume_data or {},
            jd_text=request.jd_text or "",
            chat_history=history_dicts
        )
        return ChatResponse(
            reply=result["reply"],
            resume_updates=result.get("resume_updates")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI agent error: {str(e)}")
