"""
CSV Export endpoints for transactions and income.
Returns StreamingResponse with proper CSV content.
"""

import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

from api.dependencies.deps import get_db_session
from backend.services.transaction_service import get_all_transactions
from backend.services.income_service import get_all_income

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/transactions")
def export_transactions(
    category: Optional[str] = Query(None),
    type: Optional[str] = Query(None, alias="type"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db_session)
):
    """Export transactions to CSV. Supports same filters as the list endpoint."""
    transactions = get_all_transactions(
        db, skip=0, limit=10000,
        category=category, type_=type,
        start_date=start_date, end_date=end_date,
        search=search, sort_by="date", sort_order="desc"
    )

    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "ID", "Date", "Description", "Category",
        "Type", "Amount (INR)", "Payment Method", "Created At"
    ])

    # Data rows
    for t in transactions:
        writer.writerow([
            t.id,
            t.date,
            t.description or "",
            t.category,
            t.type,
            f"{t.amount:.2f}",
            t.payment_method or "",
            t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else ""
        ])

    output.seek(0)
    filename = f"spendsense_transactions_{datetime.now().strftime('%Y%m%d')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/income")
def export_income(db: Session = Depends(get_db_session)):
    """Export all income records to CSV."""
    income_records = get_all_income(db, skip=0, limit=10000)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Date", "Source", "Description", "Amount (INR)", "Created At"])

    for i in income_records:
        writer.writerow([
            i.id,
            i.date,
            i.source,
            i.description or "",
            f"{i.amount:.2f}",
            i.created_at.strftime("%Y-%m-%d %H:%M") if i.created_at else ""
        ])

    output.seek(0)
    filename = f"spendsense_income_{datetime.now().strftime('%Y%m%d')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/full-report")
def export_full_report(db: Session = Depends(get_db_session)):
    """Export a combined financial report (transactions + income summary) as CSV."""
    transactions = get_all_transactions(db, skip=0, limit=10000, sort_by="date", sort_order="desc")
    income_records = get_all_income(db, skip=0, limit=10000)

    output = io.StringIO()
    writer = csv.writer(output)

    # Summary section
    total_income = sum(i.amount for i in income_records)
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_income - total_expenses

    writer.writerow(["SpendSense AI – Full Financial Report"])
    writer.writerow([f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"])
    writer.writerow([])
    writer.writerow(["SUMMARY"])
    writer.writerow(["Total Income", f"₹{total_income:,.2f}"])
    writer.writerow(["Total Expenses", f"₹{total_expenses:,.2f}"])
    writer.writerow(["Net Balance", f"₹{balance:,.2f}"])
    writer.writerow([])

    # Income section
    writer.writerow(["INCOME RECORDS"])
    writer.writerow(["Date", "Source", "Description", "Amount (INR)"])
    for i in income_records:
        writer.writerow([i.date, i.source, i.description or "", f"{i.amount:.2f}"])
    writer.writerow([])

    # Transactions section
    writer.writerow(["TRANSACTIONS"])
    writer.writerow(["Date", "Description", "Category", "Type", "Amount (INR)", "Payment Method"])
    for t in transactions:
        writer.writerow([
            t.date, t.description or "", t.category,
            t.type, f"{t.amount:.2f}", t.payment_method or ""
        ])

    output.seek(0)
    filename = f"spendsense_full_report_{datetime.now().strftime('%Y%m%d')}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
