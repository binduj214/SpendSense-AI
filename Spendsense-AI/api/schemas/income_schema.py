from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


VALID_SOURCES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"]


class IncomeBase(BaseModel):
    amount: float = Field(..., gt=0)
    source: str = Field(..., max_length=100)
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    description: Optional[str] = Field(None, max_length=255)

    @validator("amount")
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2)

    @validator("date")
    def validate_date(cls, v):
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v


class IncomeCreate(IncomeBase):
    pass


class IncomeUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    source: Optional[str] = Field(None, max_length=100)
    date: Optional[str] = None
    description: Optional[str] = Field(None, max_length=255)

    @validator("amount", pre=True, always=True)
    def amount_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2) if v else v


class IncomeResponse(IncomeBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
