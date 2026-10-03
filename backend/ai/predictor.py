"""
AI Predictive Expense Engine
Analyzes historical transactions to predict upcoming/recurring expenses.
Uses frequency analysis and statistical methods.
"""

from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime, timedelta
import statistics
import re


def predict_upcoming_expenses(transactions: List[Dict]) -> Dict[str, Any]:
    """
    Predict upcoming expenses based on historical transaction patterns.
    Identifies recurring expenses and estimates their next occurrence.
    """
    if not transactions:
        return {"predictions": [], "total_predicted": 0, "confidence": "low"}

    expenses = [t for t in transactions if t.get("type") == "expense"]
    if not expenses:
        return {"predictions": [], "total_predicted": 0, "confidence": "low"}

    # Group transactions by similar descriptions for recurring detection
    recurring = _detect_recurring_expenses(expenses)

    # Predict next month's expenses by category
    category_predictions = _predict_by_category(expenses)

    # Combine recurring and category predictions
    predictions = []

    # Add confirmed recurring
    for item in recurring:
        predictions.append({
            "description": item["description"],
            "predicted_amount": item["avg_amount"],
            "category": item["category"],
            "frequency": item["frequency"],
            "confidence": item["confidence"],
            "next_expected": item["next_expected"],
            "source": "recurring"
        })

    # Add category-level predictions
    for item in category_predictions:
        if not any(p["category"] == item["category"] and p["source"] == "recurring"
                   for p in predictions):
            predictions.append({
                "description": f"Expected {item['category']} spending",
                "predicted_amount": item["predicted_amount"],
                "category": item["category"],
                "frequency": "monthly",
                "confidence": item["confidence"],
                "next_expected": item["next_month"],
                "source": "historical_average"
            })

    total_predicted = sum(p["predicted_amount"] for p in predictions)

    return {
        "predictions": sorted(predictions, key=lambda x: x["predicted_amount"], reverse=True),
        "total_predicted": round(total_predicted, 2),
        "confidence": "medium" if len(recurring) > 2 else "low",
        "note": "These are estimates based on your historical spending patterns."
    }


def _detect_recurring_expenses(expenses: List[Dict]) -> List[Dict]:
    """
    Detect recurring expenses by analyzing transaction descriptions
    and finding patterns that repeat monthly.
    """
    # Normalize descriptions for grouping
    normalized_groups = defaultdict(list)

    for txn in expenses:
        desc = txn.get("description", "").lower().strip()
        # Normalize: remove numbers/amounts, strip common words
        key = re.sub(r'\d+', '', desc).strip()
        key = re.sub(r'\s+', ' ', key)
        if key:
            normalized_groups[key].append(txn)

    recurring = []

    for key, txns in normalized_groups.items():
        if len(txns) < 2:
            continue

        amounts = [t["amount"] for t in txns]
        avg_amount = statistics.mean(amounts)

        # Extract months for frequency analysis
        months = set()
        for t in txns:
            date_str = t.get("date", "")
            if len(date_str) >= 7:
                months.add(date_str[:7])

        if len(months) >= 2:
            # Likely recurring
            frequency = "monthly" if len(months) >= 2 else "occasional"
            confidence = "high" if len(months) >= 3 else "medium"

            # Sort transactions by date to get latest
            sorted_txns = sorted(txns, key=lambda x: x.get("date", ""), reverse=True)
            latest_date = sorted_txns[0].get("date", "")

            # Predict next occurrence (add ~30 days)
            next_expected = _add_days_to_date(latest_date, 30)

            recurring.append({
                "description": sorted_txns[0].get("description", key),
                "avg_amount": round(avg_amount, 2),
                "category": sorted_txns[0].get("category", "Other"),
                "frequency": frequency,
                "confidence": confidence,
                "occurrences": len(txns),
                "months_seen": len(months),
                "next_expected": next_expected
            })

    return sorted(recurring, key=lambda x: x["avg_amount"], reverse=True)[:10]


def _predict_by_category(expenses: List[Dict]) -> List[Dict]:
    """
    Predict next month's spending per category based on historical averages.
    """
    monthly_category = defaultdict(lambda: defaultdict(float))

    for txn in expenses:
        date_str = txn.get("date", "")
        if len(date_str) >= 7:
            month = date_str[:7]
            cat = txn.get("category", "Other")
            monthly_category[month][cat] += txn.get("amount", 0)

    if not monthly_category:
        return []

    # Calculate per-category average
    all_categories = set()
    for month_data in monthly_category.values():
        all_categories.update(month_data.keys())

    predictions = []
    next_month = _get_next_month()

    for cat in all_categories:
        monthly_amounts = [
            monthly_category[m].get(cat, 0)
            for m in monthly_category
            if monthly_category[m].get(cat, 0) > 0
        ]

        if not monthly_amounts:
            continue

        avg = statistics.mean(monthly_amounts)
        months_with_data = len(monthly_amounts)

        predictions.append({
            "category": cat,
            "predicted_amount": round(avg, 2),
            "historical_months": months_with_data,
            "confidence": "medium" if months_with_data >= 2 else "low",
            "next_month": next_month
        })

    return sorted(predictions, key=lambda x: x["predicted_amount"], reverse=True)


def _add_days_to_date(date_str: str, days: int) -> str:
    """Add days to a date string (YYYY-MM-DD)."""
    try:
        dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
        new_dt = dt + timedelta(days=days)
        return new_dt.strftime("%Y-%m-%d")
    except Exception:
        return date_str


def _get_next_month() -> str:
    """Get the next month in YYYY-MM format."""
    today = datetime.now()
    if today.month == 12:
        return f"{today.year + 1}-01"
    else:
        return f"{today.year}-{today.month + 1:02d}"
