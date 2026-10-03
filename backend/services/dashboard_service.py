"""Dashboard aggregation service."""

from sqlalchemy.orm import Session
from typing import Dict, Any
from collections import defaultdict
from datetime import datetime
from backend.models.models import Transaction, Income, Budget, SavingsGoal


def get_dashboard_data(db: Session) -> Dict[str, Any]:
    """
    Aggregate all data needed for the dashboard.
    Returns a comprehensive financial summary.
    """
    current_month = datetime.now().strftime("%Y-%m")

    # --- Income ---
    all_income = db.query(Income).all()
    total_income = sum(i.amount for i in all_income)
    monthly_income = sum(
        i.amount for i in all_income if i.date[:7] == current_month
    )

    # --- Expenses ---
    all_expenses = db.query(Transaction).filter(Transaction.type == "expense").all()
    total_expenses = sum(t.amount for t in all_expenses)
    monthly_expenses = sum(
        t.amount for t in all_expenses if t.date[:7] == current_month
    )

    # --- Balance ---
    balance = total_income - total_expenses
    monthly_balance = monthly_income - monthly_expenses

    # --- Category breakdown (current month) ---
    category_spending = defaultdict(float)
    for t in all_expenses:
        if t.date[:7] == current_month:
            category_spending[t.category] += t.amount

    category_data = [
        {"category": cat, "amount": round(amt, 2)}
        for cat, amt in sorted(category_spending.items(), key=lambda x: x[1], reverse=True)
    ]

    # --- Monthly trend (last 6 months) ---
    monthly_expense_trend = defaultdict(float)
    monthly_income_trend = defaultdict(float)

    for t in all_expenses:
        if len(t.date) >= 7:
            monthly_expense_trend[t.date[:7]] += t.amount

    for i in all_income:
        if len(i.date) >= 7:
            monthly_income_trend[i.date[:7]] += i.amount

    # Get last 6 months
    all_months = sorted(set(list(monthly_expense_trend.keys()) + list(monthly_income_trend.keys())))
    recent_months = all_months[-6:]

    monthly_trend = [
        {
            "month": m,
            "expenses": round(monthly_expense_trend.get(m, 0), 2),
            "income": round(monthly_income_trend.get(m, 0), 2)
        }
        for m in recent_months
    ]

    # --- Budget utilization ---
    budgets = db.query(Budget).filter(Budget.month == current_month).all()
    budget_summary = []
    total_budget = 0
    total_budget_spent = 0

    for b in budgets:
        spent = category_spending.get(b.category, 0)
        pct = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0
        total_budget += b.monthly_limit
        total_budget_spent += spent
        budget_summary.append({
            "category": b.category,
            "limit": b.monthly_limit,
            "spent": round(spent, 2),
            "percent": round(pct, 1),
            "status": "exceeded" if spent > b.monthly_limit else ("warning" if pct >= 80 else "ok")
        })

    overall_budget_pct = (total_budget_spent / total_budget * 100) if total_budget > 0 else 0

    # --- Savings goals ---
    goals = db.query(SavingsGoal).all()
    total_savings = sum(g.current_savings for g in goals)
    goals_summary = [
        {
            "id": g.id,
            "name": g.name,
            "target": g.target_amount,
            "current": g.current_savings,
            "percent": round(g.current_savings / g.target_amount * 100, 1) if g.target_amount > 0 else 0,
            "is_completed": g.is_completed
        }
        for g in goals
    ]

    # --- Recent transactions ---
    recent_txns = (
        db.query(Transaction)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(8)
        .all()
    )
    recent_transactions = [
        {
            "id": t.id,
            "amount": t.amount,
            "category": t.category,
            "description": t.description,
            "date": t.date,
            "type": t.type,
            "payment_method": t.payment_method
        }
        for t in recent_txns
    ]

    return {
        "summary": {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "balance": round(balance, 2),
            "monthly_income": round(monthly_income, 2),
            "monthly_expenses": round(monthly_expenses, 2),
            "monthly_balance": round(monthly_balance, 2),
            "total_savings": round(total_savings, 2),
            "current_month": current_month
        },
        "budget": {
            "total_budget": round(total_budget, 2),
            "total_spent": round(total_budget_spent, 2),
            "utilization_percent": round(overall_budget_pct, 1),
            "categories": budget_summary
        },
        "category_spending": category_data,
        "monthly_trend": monthly_trend,
        "savings_goals": goals_summary,
        "recent_transactions": recent_transactions
    }
