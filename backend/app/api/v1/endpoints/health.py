from fastapi import APIRouter
from app.domain.rules import VEHICLE_CATEGORIES, DOCUMENT_CATEGORIES, INDIAN_STATES

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Spark Radar API",
        "version": "1.0.0",
        "environment": "production-ready"
    }

@router.get("/reference-data")
def get_reference_data():
    return {
        "vehicle_categories": VEHICLE_CATEGORIES,
        "document_categories": list(DOCUMENT_CATEGORIES.values()),
        "indian_states": INDIAN_STATES
    }
