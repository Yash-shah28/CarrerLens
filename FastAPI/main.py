from dotenv import load_dotenv
load_dotenv()  # Load .env file at startup

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_to_mongo, close_mongo_connection
from routes.user_route import router as user_router
from routes.resume_route import router as resume_router
from routes.chat_route import router as chat_router
from routes.interview_route import router as interview_router
from bson import ObjectId
import json

# Custom JSON encoder for ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

app = FastAPI(title="FastAPI MongoDB Integration")

# Configure FastAPI to use custom JSON encoder
app.json_encoder = MongoJSONEncoder

# Allow frontend dev servers to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Note: resume_router already has prefix="/resume", so we include it under /api to make it /api/resume/...
# However, in the old main.py it was included with prefix="/api/resume", which might have resulted in /api/resume/resume/...
# I will standardise it here to be just /api/resume if possible, but to allow flexibility I'll map it to /api
# User router doesn't have a prefix in its definition, so we give it /api/users via /api prefix + hardcoded /users in router?
# Let's check user.py: @router.post("/users"...)
# So if we include user_router with prefix="/api", it becomes /api/users
app.include_router(user_router, prefix="/api", tags=["users"])

# Resume router has prefix="/resume".
# If we include it with prefix="/api", it becomes /api/resume
app.include_router(resume_router, prefix="/api", tags=["Resume"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(interview_router, prefix="/api", tags=["Interview"])

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "FastAPI with MongoDB"}
