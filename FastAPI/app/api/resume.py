from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.gemini_service import analyze_resume

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/extract")
async def extract_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    text = extract_text_from_pdf(file.file)

    if not text:
        raise HTTPException(status_code=400, detail="Unable to extract text from PDF")

    ai_result = analyze_resume(text)

    return {
        "extracted_text": text,
        "ai_analysis": ai_result
    }
