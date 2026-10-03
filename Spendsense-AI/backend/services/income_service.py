"""Income business logic service."""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.models.models import Income


def get_all_income(db: Session, skip: int = 0, limit: int = 100) -> List[Income]:
    """Retrieve all income records."""
    return db.query(Income).order_by(Income.date.desc()).offset(skip).limit(limit).all()


def get_income_by_id(db: Session, income_id: int) -> Optional[Income]:
    """Get a single income record by ID."""
    return db.query(Income).filter(Income.id == income_id).first()


def create_income(db: Session, data: dict) -> Income:
    """Create a new income record."""
    income = Income(**data)
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


def update_income(db: Session, income_id: int, data: dict) -> Optional[Income]:
    """Update an income record."""
    income = get_income_by_id(db, income_id)
    if not income:
        return None

    for key, value in data.items():
        if value is not None and hasattr(income, key):
            setattr(income, key, value)

    db.commit()
    db.refresh(income)
    return income


def delete_income(db: Session, income_id: int) -> bool:
    """Delete an income record."""
    income = get_income_by_id(db, income_id)
    if not income:
        return False

    db.delete(income)
    db.commit()
    return True


def get_income_as_dicts(db: Session) -> List[dict]:
    """Return all income records as dicts for AI processing."""
    income_records = db.query(Income).all()
    return [
        {
            "id": i.id,
            "amount": i.amount,
            "source": i.source,
            "date": i.date,
            "description": i.description
        }
        for i in income_records
    ]
