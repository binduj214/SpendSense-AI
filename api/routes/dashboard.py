from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.dependencies.deps import get_db_session
from backend.services.dashboard_service import get_dashboard_data

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(db: Session = Depends(get_db_session)):
    """Get comprehensive dashboard data."""
    return get_dashboard_data(db)
