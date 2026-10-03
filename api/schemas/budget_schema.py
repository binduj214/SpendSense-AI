from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class BudgetBase(BaseModel):
    category: str = Field(..., max_length=50)
    monthly_limit: float = Field(..., gt=0)
    month: str = Field(..., description="Month in YYYY-MM format")

    @validator("monthly_limit")
    def limit_positive(cls, v):
        if v <= 0:
            raise ValueError("Budget limit must be greater than 0")
        return round(v, 2)

    @validator("month")
    def validate_month(cls, v):
        try:
            datetime.strptime(v + "-01", "%Y-%m-%d")
        except ValueError:
            raise ValueError("Month must be in YYYY-MM format (e.g. 2026-08)")
        return v


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    category: Optional[str] = Field(None, max_length=50)
    monthly_limit: Optional[float] = Field(None, gt=0)
    month: Optional[str] = None

    @validator("monthly_limit", pre=True, always=True)
    def limit_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Budget limit must be greater than 0")
        return round(v, 2) if v else v


class BudgetResponse(BudgetBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BudgetUtilizationResponse(BaseModel):
    id: int
    category: str
    monthly_limit: float
    spent: float
    remaining: float
    utilization_percent: float
    status: str
    month: str
