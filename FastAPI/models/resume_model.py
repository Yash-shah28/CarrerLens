from typing import Optional, Annotated
from pydantic import Field, ConfigDict, BeforeValidator
from bson import ObjectId
from schemas.resume import ResumeData

# Represents an ObjectId field in the database.
PyObjectId = Annotated[str, BeforeValidator(str)]

class ResumeModel(ResumeData):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
