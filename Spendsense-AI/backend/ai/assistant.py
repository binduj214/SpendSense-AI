"""
AI Financial Assistant
Intent-based conversational assistant that answers financial questions
using the user's actual transaction and budget data.
No external API required.
"""

from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime
import re
import statistics


def process_query(
    query: str,
    transactions: List[Dict],
    income: List[Dict],
    budgets: List[Dict],
    savings_goals: List[Dict]
) -> Dict[str, Any]:
    """
    Process a natural language financial query and return a structured response.
    Uses intent detection + data analysis.
    """
    if not query or not query.strip():
        return {
            "response": "Please ask me a financial question. For example: 'How much did I spend this month?'",
            "intent": "unknown",
            "data": {}
        }

    query_lower = query.lower().strip()
    intent = _detect_intent(query_lower)

    response_func = INTENT_HANDLERS.get(intent, _handle_unknown)
    return response_func(query_lower, transactions, income, budgets, savings_goals)


def _detect_intent(query: str) -> str:
    """Detect the user's intent from the query."""
    # Monthly spending
    if any(kw in query for kw in ["spend this month", "spent this month", "expenses this month",
                                   "monthly expense", "month spending"]):
        return "monthly_spending"

    # Highest spending
    if any(kw in query for kw in ["most", "highest", "largest", "biggest", "top spending",
                                   "where am i spending", "where do i spend"]):
        return "highest_spending"

    # Savings feasibility
    if any(kw in query for kw in ["can i save", "save ", "savings goal", "how much can i save"]):
        return "savings_check"

    # Category increase
    if any(kw in query for kw in ["increased", "went up", "more than", "category increased",
                                   "what increased", "which category"]):
        return "category_increase"

    # Budget status
    if any(kw in query for kw in ["budget", "limit", "remaining budget", "budget left"]):
        return "budget_status"

    # Balance
    if any(kw in query for kw in ["balance", "how much do i have", "net", "total money"]):
        return "balance"

    # Income
    if any(kw in query for kw in ["income", "salary", "earn", "how much did i earn"]):
        return "income_summary"

    # Transactions count
    if any(kw in query for kw in ["how many transactions", "transaction count", "number of"]):
        return "transaction_count"

    # Reduce / cut spending
    if any(kw in query for kw in ["reduce", "cut", "if i reduce", "if i cut", "what if"]):
        return "what_if_savings"

    return "general_summary"


def _handle_monthly_spending(query, transactions, income, budgets, savings_goals):
    """Handle queries about monthly spending."""
    current_month = datetime.now().strftime("%Y-%m")
    month_name = datetime.now().strftime("%B %Y")

    expenses = [
        t for t in transactions
        if t.get("type") == "expense" and t.get("date", "")[:7] == current_month
    ]

    total = sum(t["amount"] for t in expenses)
    category_totals = defaultdict(float)
    for t in expenses:
        category_totals[t.get("category", "Other")] += t["amount"]

    if not expenses:
        return {
            "response": f"No expenses recorded for {month_name} yet.",
            "intent": "monthly_spending",
            "data": {"total": 0, "month": month_name, "transactions": 0}
        }

    top_cat = max(category_totals, key=category_totals.get)
    breakdown = ", ".join(
        f"{cat}: ₹{amt:,.0f}"
        for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:3]
    )

    return {
        "response": (
            f"In {month_name}, you've spent ₹{total:,.0f} across {len(expenses)} transactions. "
            f"Your top spending categories: {breakdown}. "
            f"{top_cat} is your biggest expense this month."
        ),
        "intent": "monthly_spending",
        "data": {
            "total": round(total, 2),
            "month": month_name,
            "transactions": len(expenses),
            "by_category": dict(category_totals)
        }
    }


def _handle_highest_spending(query, transactions, income, budgets, savings_goals):
    """Handle queries about highest spending areas."""
    expenses = [t for t in transactions if t.get("type") == "expense"]

    if not expenses:
        return {
            "response": "No expense data found. Add transactions to get spending insights.",
            "intent": "highest_spending",
            "data": {}
        }

    category_totals = defaultdict(float)
    for t in expenses:
        category_totals[t.get("category", "Other")] += t["amount"]

    sorted_cats = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    top_cat, top_amt = sorted_cats[0]
    total = sum(v for _, v in sorted_cats)
    pct = (top_amt / total * 100) if total > 0 else 0

    top_3 = "\n".join(
        f"  {i+1}. {cat}: ₹{amt:,.0f} ({amt/total*100:.0f}%)"
        for i, (cat, amt) in enumerate(sorted_cats[:3])
    )

    return {
        "response": (
            f"Your highest spending area is **{top_cat}** with ₹{top_amt:,.0f} "
            f"({pct:.0f}% of total expenses).\n\nTop 3 categories:\n{top_3}"
        ),
        "intent": "highest_spending",
        "data": {"categories": [{"category": c, "amount": a} for c, a in sorted_cats[:5]]}
    }


def _handle_savings_check(query, transactions, income, budgets, savings_goals):
    """Handle queries about savings feasibility."""
    # Extract amount from query if present
    amount_match = re.search(r'₹?\s*(\d[\d,]*)', query)
    target_savings = float(amount_match.group(1).replace(',', '')) if amount_match else None

    current_month = datetime.now().strftime("%Y-%m")
    month_income = sum(
        i["amount"] for i in income
        if i.get("date", "")[:7] == current_month
    )
    month_expenses = sum(
        t["amount"] for t in transactions
        if t.get("type") == "expense" and t.get("date", "")[:7] == current_month
    )
    current_savings_capacity = month_income - month_expenses

    if target_savings:
        if current_savings_capacity >= target_savings:
            return {
                "response": (
                    f"Yes! Based on this month's data, you can save ₹{target_savings:,.0f}. "
                    f"Your current savings capacity is ₹{current_savings_capacity:,.0f} "
                    f"(Income: ₹{month_income:,.0f} - Expenses: ₹{month_expenses:,.0f})."
                ),
                "intent": "savings_check",
                "data": {
                    "feasible": True,
                    "target": target_savings,
                    "capacity": current_savings_capacity
                }
            }
        else:
            shortfall = target_savings - current_savings_capacity
            return {
                "response": (
                    f"Saving ₹{target_savings:,.0f} this month will be challenging. "
                    f"Your current savings capacity is ₹{current_savings_capacity:,.0f}. "
                    f"You'd need to cut expenses by ₹{shortfall:,.0f} to reach that goal."
                ),
                "intent": "savings_check",
                "data": {
                    "feasible": False,
                    "target": target_savings,
                    "capacity": current_savings_capacity,
                    "shortfall": shortfall
                }
            }

    return {
        "response": (
            f"This month, your savings capacity is ₹{current_savings_capacity:,.0f} "
            f"(Income ₹{month_income:,.0f} minus Expenses ₹{month_expenses:,.0f}). "
            f"{'You are on track!' if current_savings_capacity > 0 else 'Consider reducing expenses to save more.'}"
        ),
        "intent": "savings_check",
        "data": {"capacity": current_savings_capacity}
    }


def _handle_category_increase(query, transactions, income, budgets, savings_goals):
    """Handle queries about category spending increases."""
    expenses = [t for t in transactions if t.get("type") == "expense"]

    monthly_cat = defaultdict(lambda: defaultdict(float))
    for t in expenses:
        date_str = t.get("date", "")
        if len(date_str) >= 7:
            monthly_cat[date_str[:7]][t.get("category", "Other")] += t["amount"]

    sorted_months = sorted(monthly_cat.keys())
    if len(sorted_months) < 2:
        return {
            "response": "Need at least 2 months of data to compare category changes.",
            "intent": "category_increase",
            "data": {}
        }

    current = monthly_cat[sorted_months[-1]]
    previous = monthly_cat[sorted_months[-2]]

    changes = []
    for cat in set(list(current.keys()) + list(previous.keys())):
        curr_amt = current.get(cat, 0)
        prev_amt = previous.get(cat, 0)
        if prev_amt > 0:
            pct = ((curr_amt - prev_amt) / prev_amt) * 100
            changes.append((cat, pct, curr_amt, prev_amt))

    changes.sort(key=lambda x: x[1], reverse=True)

    if not changes:
        return {"response": "No comparable data found.", "intent": "category_increase", "data": {}}

    top_increase = changes[0]
    response_lines = [
        f"Comparing {sorted_months[-2]} vs {sorted_months[-1]}:",
        f"📈 Most increased: **{top_increase[0]}** (+{top_increase[1]:.0f}%)",
        f"  (₹{top_increase[3]:,.0f} → ₹{top_increase[2]:,.0f})"
    ]

    if len(changes) > 1 and changes[-1][1] < 0:
        top_decrease = changes[-1]
        response_lines.append(
            f"📉 Most decreased: {top_decrease[0]} ({top_decrease[1]:.0f}%)"
        )

    return {
        "response": "\n".join(response_lines),
        "intent": "category_increase",
        "data": {"changes": [{"category": c, "pct_change": p} for c, p, _, _ in changes[:5]]}
    }


def _handle_budget_status(query, transactions, income, budgets, savings_goals):
    """Handle budget status queries."""
    if not budgets:
        return {
            "response": "No budgets set yet. Go to the Budgets section to create monthly category budgets.",
            "intent": "budget_status",
            "data": {}
        }

    current_month = datetime.now().strftime("%Y-%m")
    expenses = [
        t for t in transactions
        if t.get("type") == "expense" and t.get("date", "")[:7] == current_month
    ]

    cat_spending = defaultdict(float)
    for t in expenses:
        cat_spending[t.get("category", "Other")] += t["amount"]

    status_lines = []
    for b in budgets:
        cat = b["category"]
        limit = b["monthly_limit"]
        spent = cat_spending.get(cat, 0)
        pct = (spent / limit * 100) if limit > 0 else 0
        status = "🔴 Exceeded" if pct >= 100 else ("🟡 Alert" if pct >= 80 else "🟢 On Track")
        status_lines.append(f"  {cat}: ₹{spent:,.0f}/₹{limit:,.0f} ({pct:.0f}%) {status}")

    return {
        "response": f"Budget status for {datetime.now().strftime('%B %Y')}:\n" + "\n".join(status_lines),
        "intent": "budget_status",
        "data": {"budgets": len(budgets)}
    }


def _handle_balance(query, transactions, income, budgets, savings_goals):
    """Handle balance queries."""
    total_income = sum(i["amount"] for i in income)
    total_expenses = sum(t["amount"] for t in transactions if t.get("type") == "expense")
    balance = total_income - total_expenses

    return {
        "response": (
            f"Your overall financial summary:\n"
            f"  💰 Total Income: ₹{total_income:,.0f}\n"
            f"  💸 Total Expenses: ₹{total_expenses:,.0f}\n"
            f"  💵 Net Balance: ₹{balance:,.0f}\n"
            f"{'You are in the green! 🎉' if balance >= 0 else '⚠️ Your expenses exceed your income.'}"
        ),
        "intent": "balance",
        "data": {"income": total_income, "expenses": total_expenses, "balance": balance}
    }


def _handle_income_summary(query, transactions, income, budgets, savings_goals):
    """Handle income summary queries."""
    current_month = datetime.now().strftime("%Y-%m")
    this_month = sum(i["amount"] for i in income if i.get("date", "")[:7] == current_month)
    all_time = sum(i["amount"] for i in income)

    source_totals = defaultdict(float)
    for i in income:
        source_totals[i.get("source", "Other")] += i["amount"]

    top_source = max(source_totals, key=source_totals.get) if source_totals else "None"

    return {
        "response": (
            f"Income summary:\n"
            f"  This month: ₹{this_month:,.0f}\n"
            f"  All time: ₹{all_time:,.0f}\n"
            f"  Primary source: {top_source} (₹{source_totals.get(top_source, 0):,.0f})"
        ),
        "intent": "income_summary",
        "data": {"this_month": this_month, "all_time": all_time}
    }


def _handle_transaction_count(query, transactions, income, budgets, savings_goals):
    """Handle transaction count queries."""
    current_month = datetime.now().strftime("%Y-%m")
    total = len(transactions)
    this_month = sum(1 for t in transactions if t.get("date", "")[:7] == current_month)

    return {
        "response": (
            f"You have {total} total transactions recorded. "
            f"{this_month} transactions were added this month."
        ),
        "intent": "transaction_count",
        "data": {"total": total, "this_month": this_month}
    }


def _handle_what_if_savings(query, transactions, income, budgets, savings_goals):
    """Handle 'what if I reduce X' queries."""
    # Try to detect category from query
    categories = ["Food", "Shopping", "Transport", "Bills", "Entertainment",
                  "Healthcare", "Education", "Rent"]
    detected_cat = None
    for cat in categories:
        if cat.lower() in query:
            detected_cat = cat
            break

    # Extract amount if present
    amount_match = re.search(r'₹?\s*(\d[\d,]*)', query)
    reduction = float(amount_match.group(1).replace(',', '')) if amount_match else None

    if detected_cat and reduction:
        return {
            "response": (
                f"If you reduce your {detected_cat} spending by ₹{reduction:,.0f} per month, "
                f"you would save ₹{reduction:,.0f} extra monthly, "
                f"or ₹{reduction * 12:,.0f} annually. "
                f"That's a meaningful step toward your financial goals!"
            ),
            "intent": "what_if_savings",
            "data": {"category": detected_cat, "monthly_saving": reduction, "annual_saving": reduction * 12}
        }
    elif detected_cat:
        current_month = datetime.now().strftime("%Y-%m")
        cat_spending = sum(
            t["amount"] for t in transactions
            if t.get("type") == "expense"
            and t.get("category") == detected_cat
            and t.get("date", "")[:7] == current_month
        )
        suggestion = round(cat_spending * 0.2, 0)
        return {
            "response": (
                f"You spent ₹{cat_spending:,.0f} on {detected_cat} this month. "
                f"Reducing by 20% (₹{suggestion:,.0f}) would save ₹{suggestion * 12:,.0f} annually."
            ),
            "intent": "what_if_savings",
            "data": {"category": detected_cat, "current_spending": cat_spending}
        }

    return _handle_general_summary(query, transactions, income, budgets, savings_goals)


def _handle_general_summary(query, transactions, income, budgets, savings_goals):
    """Fallback: provide a general financial summary."""
    current_month = datetime.now().strftime("%Y-%m")
    total_income = sum(i["amount"] for i in income if i.get("date", "")[:7] == current_month)
    total_expenses = sum(
        t["amount"] for t in transactions
        if t.get("type") == "expense" and t.get("date", "")[:7] == current_month
    )
    balance = total_income - total_expenses

    suggestions = [
        "How much did I spend this month?",
        "Where am I spending the most?",
        "Can I save ₹5,000 this month?",
        "What category increased the most?",
        "What is my budget status?",
        "How much do I earn?"
    ]

    return {
        "response": (
            f"This month: Income ₹{total_income:,.0f}, Expenses ₹{total_expenses:,.0f}, "
            f"Balance ₹{balance:,.0f}.\n\n"
            f"You can ask me things like:\n" +
            "\n".join(f"  • {s}" for s in suggestions)
        ),
        "intent": "general_summary",
        "data": {"income": total_income, "expenses": total_expenses, "balance": balance}
    }


def _handle_unknown(query, transactions, income, budgets, savings_goals):
    return _handle_general_summary(query, transactions, income, budgets, savings_goals)


# Intent handler registry
INTENT_HANDLERS = {
    "monthly_spending": _handle_monthly_spending,
    "highest_spending": _handle_highest_spending,
    "savings_check": _handle_savings_check,
    "category_increase": _handle_category_increase,
    "budget_status": _handle_budget_status,
    "balance": _handle_balance,
    "income_summary": _handle_income_summary,
    "transaction_count": _handle_transaction_count,
    "what_if_savings": _handle_what_if_savings,
    "general_summary": _handle_general_summary,
}
