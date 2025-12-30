from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.pdf_extractor import extract_text_from_pdf
from utils.resume_generation import analyze_resume
from schemas.resume import ResumeResponse
from database import get_database

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/extract", response_model=ResumeResponse)
async def extract_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    extraction_result = extract_text_from_pdf(file.file)
    text = extraction_result["text"]
    links = extraction_result["links"]

    if not text:
        raise HTTPException(status_code=400, detail="Unable to extract text from PDF")

    ai_result = analyze_resume(text, links)

    # Store in database
    db = get_database()
    resume_collection = db["resumes"]
    
    # Convert Pydantic model to dict for MongoDB
    resume_data_dict = ai_result.model_dump()
    
    # Insert
    new_resume = await resume_collection.insert_one(resume_data_dict)
    
    # Optionally add the ID to the response if needed, for now just returning data
    # created_id = new_resume.inserted_id

    return {
        # "extracted_text": text,
        # "links": links,
        "data": ai_result
    }
