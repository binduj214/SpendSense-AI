from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.deps import get_db_session
from api.schemas.income_schema import IncomeCreate, IncomeUpdate, IncomeResponse
from backend.services.income_service import (
    get_all_income, get_income_by_id,
    create_income, update_income, delete_income
)

router = APIRouter(prefix="/income", tags=["Income"])


@router.get("/", response_model=List[IncomeResponse])
def list_income(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db_session)
):
    """Get all income records."""
    return get_all_income(db, skip=skip, limit=limit)


@router.get("/{income_id}", response_model=IncomeResponse)
def get_income(income_id: int, db: Session = Depends(get_db_session)):
    """Get a single income record by ID."""
    record = get_income_by_id(db, income_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Income record {income_id} not found")
    return record


@router.post("/", response_model=IncomeResponse, status_code=201)
def add_income(data: IncomeCreate, db: Session = Depends(get_db_session)):
    """Add a new income record."""
    return create_income(db, data.model_dump())


@router.put("/{income_id}", response_model=IncomeResponse)
def edit_income(
    income_id: int,
    data: IncomeUpdate,
    db: Session = Depends(get_db_session)
):
    """Update an income record."""
    record = update_income(db, income_id, data.model_dump(exclude_none=True))
    if not record:
        raise HTTPException(status_code=404, detail=f"Income record {income_id} not found")
    return record


@router.delete("/{income_id}", status_code=200)
def remove_income(income_id: int, db: Session = Depends(get_db_session)):
    """Delete an income record."""
    success = delete_income(db, income_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Income record {income_id} not found")
    return {"message": "Income record deleted successfully", "id": income_id}
