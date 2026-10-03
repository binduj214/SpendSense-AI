from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from api.dependencies.deps import get_db_session
from api.schemas.transaction_schema import TransactionCreate, TransactionUpdate, TransactionResponse
from backend.services.transaction_service import (
    get_all_transactions, get_transaction_by_id,
    create_transaction, update_transaction,
    delete_transaction, get_transaction_count
)
from backend.ai.categorizer import categorize_transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/", response_model=List[TransactionResponse])
def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None, alias="type"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db_session)
):
    """Get all transactions with optional filters."""
    return get_all_transactions(
        db, skip=skip, limit=limit,
        category=category, type_=type,
        start_date=start_date, end_date=end_date,
        search=search, sort_by=sort_by, sort_order=sort_order
    )


@router.get("/count")
def count_transactions(db: Session = Depends(get_db_session)):
    """Get total transaction count."""
    return {"count": get_transaction_count(db)}


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db_session)):
    """Get a single transaction by ID."""
    txn = get_transaction_by_id(db, transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    return txn


@router.post("/", response_model=TransactionResponse, status_code=201)
def add_transaction(data: TransactionCreate, db: Session = Depends(get_db_session)):
    """Create a new transaction."""
    return create_transaction(db, data.model_dump())


@router.put("/{transaction_id}", response_model=TransactionResponse)
def edit_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    db: Session = Depends(get_db_session)
):
    """Update an existing transaction."""
    txn = update_transaction(db, transaction_id, data.model_dump(exclude_none=True))
    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    return txn


@router.delete("/{transaction_id}", status_code=200)
def remove_transaction(transaction_id: int, db: Session = Depends(get_db_session)):
    """Delete a transaction."""
    success = delete_transaction(db, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
    return {"message": "Transaction deleted successfully", "id": transaction_id}


@router.post("/categorize")
def auto_categorize(data: dict, db: Session = Depends(get_db_session)):
    """Auto-categorize a transaction based on its description."""
    description = data.get("description", "")
    if not description:
        raise HTTPException(status_code=400, detail="Description is required")
    category = categorize_transaction(description)
    return {"description": description, "suggested_category": category}
