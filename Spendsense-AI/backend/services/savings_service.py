"""Savings Goals business logic service."""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.models.models import SavingsGoal


def get_all_savings_goals(db: Session) -> List[SavingsGoal]:
    """Retrieve all savings goals."""
    return db.query(SavingsGoal).order_by(SavingsGoal.created_at.desc()).all()


def get_savings_goal_by_id(db: Session, goal_id: int) -> Optional[SavingsGoal]:
    """Get a single savings goal by ID."""
    return db.query(SavingsGoal).filter(SavingsGoal.id == goal_id).first()


def create_savings_goal(db: Session, data: dict) -> SavingsGoal:
    """Create a new savings goal."""
    goal = SavingsGoal(**data)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_savings_goal(db: Session, goal_id: int, data: dict) -> Optional[SavingsGoal]:
    """Update a savings goal."""
    goal = get_savings_goal_by_id(db, goal_id)
    if not goal:
        return None

    for key, value in data.items():
        if value is not None and hasattr(goal, key):
            setattr(goal, key, value)

    # Auto-complete if current_savings >= target_amount
    if goal.current_savings >= goal.target_amount:
        goal.is_completed = True

    goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(goal)
    return goal


def delete_savings_goal(db: Session, goal_id: int) -> bool:
    """Delete a savings goal."""
    goal = get_savings_goal_by_id(db, goal_id)
    if not goal:
        return False

    db.delete(goal)
    db.commit()
    return True


def add_to_savings(db: Session, goal_id: int, amount: float) -> Optional[SavingsGoal]:
    """Add an amount to a savings goal's current savings."""
    goal = get_savings_goal_by_id(db, goal_id)
    if not goal:
        return None

    goal.current_savings = min(goal.current_savings + amount, goal.target_amount)
    if goal.current_savings >= goal.target_amount:
        goal.is_completed = True

    goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(goal)
    return goal


def get_savings_as_dicts(db: Session) -> List[dict]:
    """Return savings goals as dicts for AI processing."""
    goals = get_all_savings_goals(db)
    return [
        {
            "id": g.id,
            "name": g.name,
            "target_amount": g.target_amount,
            "current_savings": g.current_savings,
            "target_date": g.target_date,
            "is_completed": g.is_completed
        }
        for g in goals
    ]
