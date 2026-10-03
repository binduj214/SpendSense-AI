from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class SavingsGoalBase(BaseModel):
    name: str = Field(..., max_length=100)
    target_amount: float = Field(..., gt=0)
    current_savings: float = Field(default=0.0, ge=0)
    target_date: Optional[str] = None
    description: Optional[str] = Field(None, max_length=255)

    @validator("target_amount")
    def target_positive(cls, v):
        if v <= 0:
            raise ValueError("Target amount must be greater than 0")
        return round(v, 2)

    @validator("current_savings")
    def savings_non_negative(cls, v):
        if v < 0:
            raise ValueError("Current savings cannot be negative")
        return round(v, 2)

    @validator("target_date", pre=True, always=True)
    def validate_date(cls, v):
        if v:
            try:
                datetime.strptime(v, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Target date must be in YYYY-MM-DD format")
        return v


class SavingsGoalCreate(SavingsGoalBase):
    pass


class SavingsGoalUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    target_amount: Optional[float] = Field(None, gt=0)
    current_savings: Optional[float] = Field(None, ge=0)
    target_date: Optional[str] = None
    description: Optional[str] = Field(None, max_length=255)
    is_completed: Optional[bool] = None

    @validator("current_savings", pre=True, always=True)
    def savings_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Current savings cannot be negative")
        return round(v, 2) if v is not None else v


class SavingsGoalResponse(SavingsGoalBase):
    id: int
    is_completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
