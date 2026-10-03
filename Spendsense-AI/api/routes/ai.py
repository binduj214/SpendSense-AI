from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.dependencies.deps import get_db_session
from backend.services.ai_service import (
    get_ai_insights, get_ai_predictions,
    process_assistant_query, categorize_expense
)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/insights")
def ai_insights(db: Session = Depends(get_db_session)):
    """Get AI-generated spending insights, anomalies, and recommendations."""
    return get_ai_insights(db)


@router.get("/predictions")
def ai_predictions(db: Session = Depends(get_db_session)):
    """Get AI-generated expense predictions for upcoming period."""
    return get_ai_predictions(db)


@router.post("/assistant")
def ai_assistant(data: dict, db: Session = Depends(get_db_session)):
    """
    Send a natural language query to the AI Financial Assistant.
    
    Example queries:
    - "How much did I spend this month?"
    - "Where am I spending the most?"
    - "Can I save ₹5000 this month?"
    """
    query = data.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    return process_assistant_query(db, query)


@router.post("/categorize")
def auto_categorize(data: dict):
    """Auto-categorize an expense based on its description."""
    description = data.get("description", "").strip()
    if not description:
        raise HTTPException(status_code=400, detail="Description is required")

    return categorize_expense(description)
