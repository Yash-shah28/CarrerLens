from fastapi import APIRouter, HTTPException
from models import UserModel, UserCreate
from database import get_database
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/users", response_model=UserModel)
async def create_user(user: UserCreate):
    db = get_database()
    user_dict = user.model_dump()
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    return UserModel(**created_user)

@router.get("/users/{user_id}", response_model=UserModel)
async def get_user(user_id: str):
    db = get_database()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserModel(**user)

@router.get("/users", response_model=List[UserModel])
async def get_all_users():
    db = get_database()
    users_cursor = db.users.find()
    users = await users_cursor.to_list(length=100)
    return [UserModel(**user) for user in users]

@router.put("/users/{user_id}", response_model=UserModel)
async def update_user(user_id: str, user: UserCreate):
    db = get_database()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    return UserModel(**updated_user)

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    db = get_database()
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

