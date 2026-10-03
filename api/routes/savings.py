from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.deps import get_db_session
from api.schemas.savings_schema import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse
from backend.services.savings_service import (
    get_all_savings_goals, get_savings_goal_by_id,
    create_savings_goal, update_savings_goal,
    delete_savings_goal, add_to_savings
)

router = APIRouter(prefix="/savings-goals", tags=["Savings Goals"])


@router.get("/", response_model=List[SavingsGoalResponse])
def list_savings_goals(db: Session = Depends(get_db_session)):
    """Get all savings goals."""
    return get_all_savings_goals(db)


@router.get("/{goal_id}", response_model=SavingsGoalResponse)
def get_savings_goal(goal_id: int, db: Session = Depends(get_db_session)):
    """Get a single savings goal by ID."""
    goal = get_savings_goal_by_id(db, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail=f"Savings goal {goal_id} not found")
    return goal


@router.post("/", response_model=SavingsGoalResponse, status_code=201)
def add_savings_goal(data: SavingsGoalCreate, db: Session = Depends(get_db_session)):
    """Create a new savings goal."""
    return create_savings_goal(db, data.model_dump())


@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def edit_savings_goal(
    goal_id: int,
    data: SavingsGoalUpdate,
    db: Session = Depends(get_db_session)
):
    """Update a savings goal."""
    goal = update_savings_goal(db, goal_id, data.model_dump(exclude_none=True))
    if not goal:
        raise HTTPException(status_code=404, detail=f"Savings goal {goal_id} not found")
    return goal


@router.delete("/{goal_id}", status_code=200)
def remove_savings_goal(goal_id: int, db: Session = Depends(get_db_session)):
    """Delete a savings goal."""
    success = delete_savings_goal(db, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Savings goal {goal_id} not found")
    return {"message": "Savings goal deleted successfully", "id": goal_id}


@router.post("/{goal_id}/add-savings")
def deposit_to_goal(
    goal_id: int,
    data: dict,
    db: Session = Depends(get_db_session)
):
    """Add money to a savings goal."""
    amount = data.get("amount", 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    goal = add_to_savings(db, goal_id, amount)
    if not goal:
        raise HTTPException(status_code=404, detail=f"Savings goal {goal_id} not found")

    return {
        "message": f"₹{amount} added to '{goal.name}'",
        "current_savings": goal.current_savings,
        "target_amount": goal.target_amount,
        "is_completed": goal.is_completed
    }
