from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from api.dependencies.deps import get_db_session
from api.schemas.budget_schema import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetUtilizationResponse
from backend.services.budget_service import (
    get_all_budgets, get_budget_by_id, create_budget,
    update_budget, delete_budget, get_budget_utilization,
    copy_budgets_to_next_month
)

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("/", response_model=List[BudgetResponse])
def list_budgets(
    month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)"),
    db: Session = Depends(get_db_session)
):
    """Get all budgets, optionally filtered by month."""
    return get_all_budgets(db, month=month)


@router.get("/utilization", response_model=List[BudgetUtilizationResponse])
def get_utilization(
    month: Optional[str] = Query(None),
    db: Session = Depends(get_db_session)
):
    """Get budget utilization for a given month."""
    if not month:
        month = datetime.now().strftime("%Y-%m")
    return get_budget_utilization(db, month)


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(budget_id: int, db: Session = Depends(get_db_session)):
    """Get a single budget by ID."""
    budget = get_budget_by_id(db, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail=f"Budget {budget_id} not found")
    return budget


@router.post("/", response_model=BudgetResponse, status_code=201)
def add_budget(data: BudgetCreate, db: Session = Depends(get_db_session)):
    """Create a new budget."""
    try:
        return create_budget(db, data.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{budget_id}", response_model=BudgetResponse)
def edit_budget(
    budget_id: int,
    data: BudgetUpdate,
    db: Session = Depends(get_db_session)
):
    """Update a budget."""
    budget = update_budget(db, budget_id, data.model_dump(exclude_none=True))
    if not budget:
        raise HTTPException(status_code=404, detail=f"Budget {budget_id} not found")
    return budget


@router.post("/copy-to-next-month")
def copy_to_next_month(
    data: dict,
    db: Session = Depends(get_db_session)
):
    """Copy all budgets from the given month to the following month.
    Body: { "from_month": "YYYY-MM" }
    Skips categories that already have a budget in the target month.
    """
    from_month = data.get("from_month", "").strip()
    if not from_month:
        raise HTTPException(status_code=400, detail="from_month is required (YYYY-MM format)")
    try:
        datetime.strptime(from_month + "-01", "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="from_month must be in YYYY-MM format")

    return copy_budgets_to_next_month(db, from_month)


@router.delete("/{budget_id}", status_code=200)
def remove_budget(budget_id: int, db: Session = Depends(get_db_session)):
    """Delete a budget."""
    success = delete_budget(db, budget_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Budget {budget_id} not found")
    return {"message": "Budget deleted successfully", "id": budget_id}
