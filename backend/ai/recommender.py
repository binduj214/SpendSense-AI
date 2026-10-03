"""
AI Savings Recommender
Generates personalized spending and savings recommendations
based on transaction data, budgets, and financial goals.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from datetime import datetime
import statistics


def generate_recommendations(
    transactions: List[Dict],
    budgets: List[Dict],
    savings_goals: List[Dict],
    income: List[Dict]
) -> List[Dict[str, Any]]:
    """
    Generate AI-powered recommendations based on financial data.
    Returns a list of personalized recommendations.
    """
    recommendations = []

    if not transactions:
        recommendations.append({
            "type": "onboarding",
            "title": "Start Tracking Your Expenses",
            "message": "Add your first transaction to begin receiving personalized insights.",
            "severity": "info",
            "category": None,
            "potential_savings": 0
        })
        return recommendations

    expenses = [t for t in transactions if t.get("type") == "expense"]

    # Get current month data
    current_month = datetime.now().strftime("%Y-%m")
    current_month_expenses = [
        t for t in expenses
        if t.get("date", "")[:7] == current_month
    ]

    # Monthly spending by category
    current_category_spending = defaultdict(float)
    for txn in current_month_expenses:
        current_category_spending[txn.get("category", "Other")] += txn.get("amount", 0)

    # Historical spending averages by category
    historical_expenses = [
        t for t in expenses
        if t.get("date", "")[:7] != current_month
    ]
    hist_monthly_category = defaultdict(lambda: defaultdict(float))
    for txn in historical_expenses:
        date_str = txn.get("date", "")
        if len(date_str) >= 7:
            month = date_str[:7]
            hist_monthly_category[month][txn.get("category", "Other")] += txn.get("amount", 0)

    hist_category_avg = {}
    all_hist_months = list(hist_monthly_category.keys())
    if all_hist_months:
        all_categories = set()
        for m in hist_monthly_category.values():
            all_categories.update(m.keys())
        for cat in all_categories:
            monthly_amounts = [
                hist_monthly_category[m].get(cat, 0)
                for m in all_hist_months
                if hist_monthly_category[m].get(cat, 0) > 0
            ]
            if monthly_amounts:
                hist_category_avg[cat] = statistics.mean(monthly_amounts)

    # 1. Budget-related recommendations
    budget_recs = _budget_recommendations(current_category_spending, budgets)
    recommendations.extend(budget_recs)

    # 2. Spending increase recommendations
    spending_recs = _spending_increase_recommendations(
        current_category_spending, hist_category_avg
    )
    recommendations.extend(spending_recs)

    # 3. Savings goal recommendations
    goal_recs = _savings_goal_recommendations(savings_goals, income, current_category_spending)
    recommendations.extend(goal_recs)

    # 4. Category-specific tips
    category_tips = _category_specific_tips(current_category_spending, hist_category_avg)
    recommendations.extend(category_tips)

    # Limit to top 8 most relevant recommendations
    recommendations = sorted(
        recommendations,
        key=lambda x: {"alert": 0, "warning": 1, "info": 2}.get(x.get("severity", "info"), 2)
    )[:8]

    return recommendations


def _budget_recommendations(
    current_spending: Dict,
    budgets: List[Dict]
) -> List[Dict]:
    """Generate recommendations based on budget utilization."""
    recs = []

    for budget in budgets:
        cat = budget.get("category")
        limit = budget.get("monthly_limit", 0)
        spent = current_spending.get(cat, 0)

        if limit <= 0:
            continue

        utilization = (spent / limit) * 100

        if utilization >= 100:
            recs.append({
                "type": "budget_exceeded",
                "title": f"{cat} Budget Exceeded",
                "message": (
                    f"You've exceeded your {cat} budget by ₹{(spent - limit):,.0f}. "
                    f"Consider reviewing your {cat.lower()} expenses for the rest of the month."
                ),
                "severity": "alert",
                "category": cat,
                "potential_savings": round(spent - limit, 2)
            })
        elif utilization >= 80:
            recs.append({
                "type": "budget_warning",
                "title": f"{cat} Budget Alert",
                "message": (
                    f"You've used {utilization:.0f}% of your {cat} budget. "
                    f"Only ₹{(limit - spent):,.0f} remaining this month."
                ),
                "severity": "warning",
                "category": cat,
                "potential_savings": 0
            })

    return recs


def _spending_increase_recommendations(
    current_spending: Dict,
    hist_avg: Dict
) -> List[Dict]:
    """Recommend based on spending increases vs historical averages."""
    recs = []

    for cat, current in current_spending.items():
        avg = hist_avg.get(cat, 0)
        if avg <= 0:
            continue

        pct_increase = ((current - avg) / avg) * 100
        if pct_increase >= 25:
            recs.append({
                "type": "spending_increase",
                "title": f"Increased {cat} Spending",
                "message": (
                    f"You spent {pct_increase:.0f}% more on {cat} this month "
                    f"(₹{current:,.0f} vs usual ₹{avg:,.0f}). "
                    f"Cutting back could save you ₹{(current - avg):,.0f}."
                ),
                "severity": "warning" if pct_increase >= 50 else "info",
                "category": cat,
                "potential_savings": round(current - avg, 2)
            })

    return recs


def _savings_goal_recommendations(
    savings_goals: List[Dict],
    income: List[Dict],
    current_spending: Dict
) -> List[Dict]:
    """Generate recommendations related to savings goals."""
    recs = []

    for goal in savings_goals:
        if goal.get("is_completed"):
            continue

        target = goal.get("target_amount", 0)
        current = goal.get("current_savings", 0)
        remaining = target - current
        name = goal.get("name", "Goal")
        target_date = goal.get("target_date", "")

        if remaining <= 0:
            continue

        # Calculate if goal is achievable
        if target_date:
            try:
                target_dt = datetime.strptime(target_date, "%Y-%m-%d")
                months_left = max(1, (target_dt - datetime.now()).days // 30)
                monthly_needed = remaining / months_left

                recs.append({
                    "type": "savings_goal",
                    "title": f"Save ₹{monthly_needed:,.0f}/month for {name}",
                    "message": (
                        f"To reach your '{name}' goal of ₹{target:,.0f} by {target_date}, "
                        f"save ₹{monthly_needed:,.0f} monthly. "
                        f"You're ₹{remaining:,.0f} away from your target."
                    ),
                    "severity": "info",
                    "category": None,
                    "potential_savings": round(monthly_needed, 2)
                })
            except ValueError:
                pass

    return recs


def _category_specific_tips(
    current_spending: Dict,
    hist_avg: Dict
) -> List[Dict]:
    """Provide specific tips for top spending categories."""
    tips = []

    CATEGORY_TIPS = {
        "Food": "Consider meal prepping to reduce frequent food delivery orders.",
        "Entertainment": "Review your subscriptions — canceling unused ones can free up extra savings.",
        "Shopping": "Try a 24-hour rule before non-essential purchases to reduce impulse buying.",
        "Transport": "Combining trips or using public transport when possible can reduce transport costs.",
        "Bills": "Compare service providers for internet and phone plans to find better rates.",
    }

    total_spending = sum(current_spending.values())
    if total_spending == 0:
        return tips

    for cat, amount in current_spending.items():
        pct = (amount / total_spending) * 100
        if pct >= 25 and cat in CATEGORY_TIPS:
            tips.append({
                "type": "category_tip",
                "title": f"Tip: Manage Your {cat} Spending",
                "message": CATEGORY_TIPS[cat],
                "severity": "info",
                "category": cat,
                "potential_savings": 0
            })

    return tips[:2]


def _get_total_monthly_income(income: List[Dict]) -> float:
    """Get total income for the current month."""
    current_month = datetime.now().strftime("%Y-%m")
    return sum(
        i.get("amount", 0)
        for i in income
        if i.get("date", "")[:7] == current_month
    )
