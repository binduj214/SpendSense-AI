"""
AI Spending Pattern Analyzer
Analyzes historical transaction data to identify spending patterns,
trends, and behavioral insights.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from datetime import datetime, timedelta
import statistics


def analyze_spending_patterns(transactions: List[Dict]) -> Dict[str, Any]:
    """
    Analyze spending patterns from historical transactions.
    Returns insights about spending behavior.
    """
    if not transactions:
        return {
            "total_analyzed": 0,
            "highest_category": None,
            "average_monthly_spending": 0,
            "frequent_categories": [],
            "monthly_trends": {},
            "insights": []
        }

    expenses = [t for t in transactions if t.get("type") == "expense"]
    if not expenses:
        return {
            "total_analyzed": 0,
            "highest_category": None,
            "average_monthly_spending": 0,
            "frequent_categories": [],
            "monthly_trends": {},
            "insights": []
        }

    # Category spending totals
    category_totals = defaultdict(float)
    category_counts = defaultdict(int)

    # Monthly spending
    monthly_spending = defaultdict(float)

    for txn in expenses:
        cat = txn.get("category", "Other")
        amount = txn.get("amount", 0)
        date_str = txn.get("date", "")

        category_totals[cat] += amount
        category_counts[cat] += 1

        # Extract month from date (YYYY-MM-DD)
        if date_str and len(date_str) >= 7:
            month_key = date_str[:7]
            monthly_spending[month_key] += amount

    # Find highest spending category
    highest_category = max(category_totals, key=category_totals.get) if category_totals else None

    # Frequent categories (sorted by transaction count)
    frequent_categories = sorted(
        [{"category": k, "count": v, "total": round(category_totals[k], 2)}
         for k, v in category_counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    # Average monthly spending
    avg_monthly = statistics.mean(monthly_spending.values()) if monthly_spending else 0

    # Monthly trends
    sorted_months = sorted(monthly_spending.keys())
    monthly_trends = {
        month: round(monthly_spending[month], 2)
        for month in sorted_months[-6:]  # last 6 months
    }

    # Category breakdown (percentage)
    total_expenses = sum(category_totals.values())
    category_breakdown = [
        {
            "category": cat,
            "amount": round(amount, 2),
            "percentage": round((amount / total_expenses * 100), 1) if total_expenses > 0 else 0
        }
        for cat, amount in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]

    # Generate textual insights
    insights = _generate_pattern_insights(
        category_totals, monthly_spending, category_counts, frequent_categories
    )

    return {
        "total_analyzed": len(expenses),
        "total_expenses": round(total_expenses, 2),
        "highest_category": highest_category,
        "highest_category_amount": round(category_totals.get(highest_category, 0), 2),
        "average_monthly_spending": round(avg_monthly, 2),
        "frequent_categories": frequent_categories,
        "monthly_trends": monthly_trends,
        "category_breakdown": category_breakdown,
        "insights": insights
    }


def _generate_pattern_insights(
    category_totals: Dict,
    monthly_spending: Dict,
    category_counts: Dict,
    frequent_categories: List
) -> List[str]:
    """Generate human-readable insights from spending data."""
    insights = []

    if not category_totals:
        return insights

    total = sum(category_totals.values())
    if total == 0:
        return insights

    # Top spending category insight
    top_cat = max(category_totals, key=category_totals.get)
    top_pct = (category_totals[top_cat] / total) * 100
    if top_pct > 30:
        insights.append(
            f"{top_cat} accounts for {top_pct:.0f}% of your total spending — your largest expense category."
        )

    # Monthly trend insight
    if len(monthly_spending) >= 2:
        sorted_months = sorted(monthly_spending.keys())
        last_month = monthly_spending[sorted_months[-1]]
        prev_month = monthly_spending[sorted_months[-2]]
        if prev_month > 0:
            change_pct = ((last_month - prev_month) / prev_month) * 100
            if change_pct > 15:
                insights.append(
                    f"Your spending increased by {change_pct:.0f}% compared to last month."
                )
            elif change_pct < -15:
                insights.append(
                    f"Great job! Your spending decreased by {abs(change_pct):.0f}% compared to last month."
                )

    # Frequent small purchases
    if frequent_categories:
        top_frequent = frequent_categories[0]
        if top_frequent["count"] >= 10:
            insights.append(
                f"You made {top_frequent['count']} transactions in {top_frequent['category']} — "
                f"your most frequent expense category."
            )

    return insights


def get_monthly_comparison(transactions: List[Dict], months: int = 3) -> Dict[str, Any]:
    """
    Compare spending across multiple months by category.
    Returns month-over-month category breakdown.
    """
    expenses = [t for t in transactions if t.get("type") == "expense"]

    monthly_category = defaultdict(lambda: defaultdict(float))
    all_months = set()

    for txn in expenses:
        date_str = txn.get("date", "")
        if date_str and len(date_str) >= 7:
            month_key = date_str[:7]
            cat = txn.get("category", "Other")
            monthly_category[month_key][cat] += txn.get("amount", 0)
            all_months.add(month_key)

    sorted_months = sorted(all_months)[-months:]

    return {
        "months": sorted_months,
        "data": {
            month: {
                cat: round(amt, 2)
                for cat, amt in monthly_category[month].items()
            }
            for month in sorted_months
        }
    }
