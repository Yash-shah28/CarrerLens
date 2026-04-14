from bson import ObjectId
from typing import Any, Dict, List

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert MongoDB ObjectIds to strings recursively.
    Useful for serializing documents before returning from API endpoints.
    """
    if doc is None:
        return None
    
    if isinstance(doc, ObjectId):
        return str(doc)
    
    if isinstance(doc, dict):
        return {key: serialize_doc(value) for key, value in doc.items()}
    
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    
    return doc

def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]
