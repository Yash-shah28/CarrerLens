from fastapi import FastAPI
from database import connect_to_mongo, close_mongo_connection
from routes import router

app = FastAPI(title="FastAPI MongoDB Integration")

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.include_router(router, prefix="/api", tags=["users"])

@app.get("/")
async def root():
    return {"message": "FastAPI with MongoDB"}
