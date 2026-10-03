"""AI orchestration service - coordinates AI modules with database data."""

from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime

from backend.services.transaction_service import get_transactions_as_dicts
from backend.services.income_service import get_income_as_dicts
from backend.services.budget_service import get_budgets_as_dicts
from backend.services.savings_service import get_savings_as_dicts
from backend.ai.pattern_analyzer import analyze_spending_patterns, get_monthly_comparison
from backend.ai.predictor import predict_upcoming_expenses
from backend.ai.anomaly_detector import detect_anomalies
from backend.ai.recommender import generate_recommendations
from backend.ai.assistant import process_query
from backend.ai.categorizer import categorize_transaction, suggest_categories


def get_ai_insights(db: Session) -> Dict[str, Any]:
    """Generate comprehensive AI insights from user data."""
    transactions = get_transactions_as_dicts(db)
    income = get_income_as_dicts(db)
    budgets = get_budgets_as_dicts(db)
    savings_goals = get_savings_as_dicts(db)

    patterns = analyze_spending_patterns(transactions)
    anomalies = detect_anomalies(transactions)
    recommendations = generate_recommendations(transactions, budgets, savings_goals, income)

    return {
        "patterns": patterns,
        "anomalies": anomalies,
        "recommendations": recommendations,
        "generated_at": datetime.now().isoformat()
    }


def get_ai_predictions(db: Session) -> Dict[str, Any]:
    """Get expense predictions."""
    transactions = get_transactions_as_dicts(db)
    return predict_upcoming_expenses(transactions)


def process_assistant_query(db: Session, query: str) -> Dict[str, Any]:
    """Process a natural language query through the AI assistant."""
    transactions = get_transactions_as_dicts(db)
    income = get_income_as_dicts(db)
    budgets = get_budgets_as_dicts(db)
    savings_goals = get_savings_as_dicts(db)

    return process_query(query, transactions, income, budgets, savings_goals)


def categorize_expense(description: str) -> Dict[str, Any]:
    """Auto-categorize an expense description."""
    category = categorize_transaction(description)
    suggestions = suggest_categories(description)

    return {
        "description": description,
        "suggested_category": category,
        "all_suggestions": suggestions[:5]
    }


def get_analytics(db: Session) -> Dict[str, Any]:
    """Get detailed analytics data."""
    transactions = get_transactions_as_dicts(db)

    patterns = analyze_spending_patterns(transactions)
    monthly_comparison = get_monthly_comparison(transactions, months=6)

    return {
        "patterns": patterns,
        "monthly_comparison": monthly_comparison,
        "generated_at": datetime.now().isoformat()
    }
