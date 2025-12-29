from fastapi import FastAPI
from database import connect_to_mongo, close_mongo_connection
from routes import router as user_router
from app.api.resume import router as resume_router

app = FastAPI(title="FastAPI MongoDB Integration")

app.include_router(resume_router, prefix="/api", tags=["Resume"])

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.include_router(user_router, prefix="/api", tags=["users"])

@app.get("/")
async def root():
    return {"message": "FastAPI with MongoDB"}
