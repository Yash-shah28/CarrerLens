from fastapi import FastAPI
from database import connect_to_mongo, close_mongo_connection
from routes.user_route import router as user_router
from routes.resume_route import router as resume_router

app = FastAPI(title="FastAPI MongoDB Integration")

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

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "FastAPI with MongoDB"}
