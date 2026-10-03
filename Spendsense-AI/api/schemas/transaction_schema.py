from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


VALID_CATEGORIES = [
    "Food", "Shopping", "Transport", "Bills", "Entertainment",
    "Healthcare", "Education", "Rent", "Other"
]

VALID_PAYMENT_METHODS = [
    "UPI", "Cash", "Credit Card", "Debit Card", "Bank Transfer"
]

VALID_TYPES = ["expense", "income"]


class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount (must be positive)")
    category: str = Field(..., description="Transaction category")
    description: Optional[str] = Field(None, max_length=255)
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    payment_method: Optional[str] = Field("Cash")
    type: str = Field("expense", description="Transaction type: expense or income")
    notes: Optional[str] = Field(None, description="Optional free-text notes")
    tags: Optional[str] = Field(None, max_length=500, description="Comma-separated tags")

    @validator("amount")
    def amount_must_be_positive(cls, v):
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

    @validator("type")
    def validate_type(cls, v):
        if v not in VALID_TYPES:
            raise ValueError(f"Type must be one of: {VALID_TYPES}")
        return v

    @validator("payment_method")
    def validate_payment_method(cls, v):
        if v and v not in VALID_PAYMENT_METHODS:
            raise ValueError(f"Payment method must be one of: {VALID_PAYMENT_METHODS}")
        return v


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = Field(None, max_length=255)
    date: Optional[str] = None
    payment_method: Optional[str] = None
    type: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = Field(None, max_length=500)

    @validator("amount", pre=True, always=True)
    def amount_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2) if v else v

    @validator("date", pre=True, always=True)
    def validate_date(cls, v):
        if v:
            try:
                datetime.strptime(v, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Date must be in YYYY-MM-DD format")
        return v


class TransactionResponse(TransactionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
