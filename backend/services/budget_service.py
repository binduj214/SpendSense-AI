"""Budget business logic service."""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.models.models import Budget, Transaction
from collections import defaultdict


def get_all_budgets(db: Session, month: Optional[str] = None) -> List[Budget]:
    """Retrieve all budgets, optionally filtered by month."""
    query = db.query(Budget)
    if month:
        query = query.filter(Budget.month == month)
    return query.order_by(Budget.category.asc()).all()


def get_budget_by_id(db: Session, budget_id: int) -> Optional[Budget]:
    """Get a single budget by ID."""
    return db.query(Budget).filter(Budget.id == budget_id).first()


def get_budget_for_category(db: Session, category: str, month: str) -> Optional[Budget]:
    """Get budget for a specific category and month."""
    return db.query(Budget).filter(
        Budget.category == category,
        Budget.month == month
    ).first()


def create_budget(db: Session, data: dict) -> Budget:
    """Create a new budget. Raises ValueError if budget already exists."""
    existing = get_budget_for_category(db, data["category"], data["month"])
    if existing:
        raise ValueError(f"Budget for {data['category']} in {data['month']} already exists.")

    budget = Budget(**data)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def update_budget(db: Session, budget_id: int, data: dict) -> Optional[Budget]:
    """Update an existing budget."""
    budget = get_budget_by_id(db, budget_id)
    if not budget:
        return None

    for key, value in data.items():
        if value is not None and hasattr(budget, key):
            setattr(budget, key, value)

    budget.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(budget)
    return budget


def delete_budget(db: Session, budget_id: int) -> bool:
    """Delete a budget."""
    budget = get_budget_by_id(db, budget_id)
    if not budget:
        return False

    db.delete(budget)
    db.commit()
    return True


def get_budget_utilization(db: Session, month: str) -> List[dict]:
    """
    Calculate budget utilization for a given month.
    Returns list of budgets with spent amount and percentage.
    """
    budgets = get_all_budgets(db, month=month)

    # Get all expenses for the month
    expenses = db.query(Transaction).filter(
        Transaction.type == "expense",
        Transaction.date.like(f"{month}%")
    ).all()

    # Calculate spending per category
    category_spending = defaultdict(float)
    for t in expenses:
        category_spending[t.category] += t.amount

    result = []
    for budget in budgets:
        spent = category_spending.get(budget.category, 0)
        remaining = max(0, budget.monthly_limit - spent)
        utilization_pct = (spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0
        status = "exceeded" if spent > budget.monthly_limit else (
            "warning" if utilization_pct >= 80 else "ok"
        )

        result.append({
            "id": budget.id,
            "category": budget.category,
            "monthly_limit": budget.monthly_limit,
            "spent": round(spent, 2),
            "remaining": round(remaining, 2),
            "utilization_percent": round(utilization_pct, 1),
            "status": status,
            "month": budget.month
        })

    return result


def get_budgets_as_dicts(db: Session, month: Optional[str] = None) -> List[dict]:
    """Return budgets as dicts for AI processing."""
    budgets = get_all_budgets(db, month=month)
    return [
        {
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "month": b.month
        }
        for b in budgets
    ]


def copy_budgets_to_next_month(db: Session, from_month: str) -> dict:
    """
    Copy all budgets from from_month to the following month.
    Skips categories that already have a budget in the target month.
    Returns a summary: { copied, skipped, target_month }
    """
    # Calculate next month
    year, month_num = int(from_month[:4]), int(from_month[5:7])
    if month_num == 12:
        year, month_num = year + 1, 1
    else:
        month_num += 1
    target_month = f"{year}-{month_num:02d}"

    source_budgets = get_all_budgets(db, month=from_month)
    if not source_budgets:
        return {"copied": 0, "skipped": 0, "target_month": target_month,
                "message": f"No budgets found for {from_month} to copy."}

    copied, skipped = 0, 0
    for b in source_budgets:
        existing = get_budget_for_category(db, b.category, target_month)
        if existing:
            skipped += 1
            continue
        new_budget = Budget(
            category=b.category,
            monthly_limit=b.monthly_limit,
            month=target_month
        )
        db.add(new_budget)
        copied += 1

    if copied > 0:
        db.commit()

    return {
        "copied": copied,
        "skipped": skipped,
        "target_month": target_month,
        "message": (
            f"Copied {copied} budget(s) to {target_month}."
            + (f" Skipped {skipped} already existing." if skipped else "")
        )
    }
