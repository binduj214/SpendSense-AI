"""Transaction business logic service."""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.models.models import Transaction
from backend.ai.categorizer import categorize_transaction


def get_all_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    type_: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "date",
    sort_order: str = "desc"
) -> List[Transaction]:
    """Retrieve transactions with filtering, sorting, and pagination."""
    query = db.query(Transaction)

    if category:
        query = query.filter(Transaction.category == category)
    if type_:
        query = query.filter(Transaction.type == type_)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))

    # Sorting
    sort_column = getattr(Transaction, sort_by, Transaction.date)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    return query.offset(skip).limit(limit).all()


def get_transaction_by_id(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Get a single transaction by ID."""
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def create_transaction(db: Session, data: dict) -> Transaction:
    """Create a new transaction. Auto-categorize if category not provided."""
    # Auto-suggest category if not provided
    if not data.get("category") or data.get("category") == "Other":
        desc = data.get("description", "")
        if desc:
            data["category"] = categorize_transaction(desc)

    transaction = Transaction(**data)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(db: Session, transaction_id: int, data: dict) -> Optional[Transaction]:
    """Update an existing transaction."""
    transaction = get_transaction_by_id(db, transaction_id)
    if not transaction:
        return None

    for key, value in data.items():
        if value is not None and hasattr(transaction, key):
            setattr(transaction, key, value)

    transaction.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction_id: int) -> bool:
    """Delete a transaction by ID."""
    transaction = get_transaction_by_id(db, transaction_id)
    if not transaction:
        return False

    db.delete(transaction)
    db.commit()
    return True


def get_transaction_count(db: Session) -> int:
    """Get total number of transactions."""
    return db.query(Transaction).count()


def get_transactions_as_dicts(db: Session) -> List[dict]:
    """Return all transactions as dicts for AI processing."""
    transactions = db.query(Transaction).all()
    return [
        {
            "id": t.id,
            "amount": t.amount,
            "category": t.category,
            "description": t.description,
            "date": t.date,
            "payment_method": t.payment_method,
            "type": t.type,
            "notes": t.notes,
            "tags": t.tags,
        }
        for t in transactions
    ]
