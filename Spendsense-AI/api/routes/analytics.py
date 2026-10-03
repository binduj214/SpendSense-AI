from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.dependencies.deps import get_db_session
from backend.services.ai_service import get_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/")
def get_analytics_data(db: Session = Depends(get_db_session)):
    """Get detailed analytics and spending pattern data."""
    return get_analytics(db)
