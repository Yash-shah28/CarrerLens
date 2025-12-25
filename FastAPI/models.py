from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, Annotated
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` in the model and JSON,
# but can be initialized from a `str` or `ObjectId`.
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: str
    age: int

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders = {ObjectId: str} # Fallback for older Pydantic behavior
    )

class UserCreate(BaseModel):
    name: str
    email: str
    age: int


