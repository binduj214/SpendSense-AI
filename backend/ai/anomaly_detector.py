"""
AI Anomaly Detector
Identifies unusual spending patterns using statistical methods
(z-score / standard deviation approach).
"""

from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime
import statistics


def detect_anomalies(transactions: List[Dict]) -> Dict[str, Any]:
    """
    Detect spending anomalies by comparing current month spending
    to historical patterns using statistical methods.
    """
    if not transactions:
        return {"anomalies": [], "summary": "Not enough data for anomaly detection."}

    expenses = [t for t in transactions if t.get("type") == "expense"]
    if len(expenses) < 5:
        return {"anomalies": [], "summary": "Need more transaction history for anomaly detection."}

    # Group by month and category
    monthly_category = defaultdict(lambda: defaultdict(float))

    for txn in expenses:
        date_str = txn.get("date", "")
        if len(date_str) >= 7:
            month = date_str[:7]
            cat = txn.get("category", "Other")
            monthly_category[month][cat] += txn.get("amount", 0)

    if not monthly_category:
        return {"anomalies": [], "summary": "Could not parse transaction dates."}

    # Get current and historical months
    sorted_months = sorted(monthly_category.keys())
    current_month = sorted_months[-1]
    historical_months = sorted_months[:-1]

    if not historical_months:
        return {"anomalies": [], "summary": "Need at least 2 months of data."}

    anomalies = []
    all_categories = set(monthly_category[current_month].keys())

    for cat in all_categories:
        current_amount = monthly_category[current_month].get(cat, 0)

        # Historical amounts for this category
        historical_amounts = [
            monthly_category[m].get(cat, 0)
            for m in historical_months
            if monthly_category[m].get(cat, 0) > 0
        ]

        if len(historical_amounts) < 2:
            continue

        hist_mean = statistics.mean(historical_amounts)
        hist_stdev = statistics.stdev(historical_amounts) if len(historical_amounts) > 1 else hist_mean * 0.2

        if hist_stdev == 0:
            hist_stdev = hist_mean * 0.1

        # Z-score
        z_score = (current_amount - hist_mean) / hist_stdev if hist_stdev > 0 else 0

        # Flag if z-score > 2 (statistically unusual) or spending > 150% of average
        pct_change = ((current_amount - hist_mean) / hist_mean * 100) if hist_mean > 0 else 0

        if z_score > 1.5 or pct_change > 50:
            severity = "high" if z_score > 2.5 or pct_change > 100 else "medium"

            anomalies.append({
                "category": cat,
                "current_amount": round(current_amount, 2),
                "historical_average": round(hist_mean, 2),
                "percentage_change": round(pct_change, 1),
                "z_score": round(z_score, 2),
                "severity": severity,
                "message": _build_anomaly_message(cat, current_amount, hist_mean, pct_change, severity),
                "historical_range": {
                    "min": round(min(historical_amounts), 2),
                    "max": round(max(historical_amounts), 2),
                    "mean": round(hist_mean, 2)
                }
            })

    anomalies.sort(key=lambda x: x["percentage_change"], reverse=True)

    summary = (
        f"Found {len(anomalies)} unusual spending pattern(s) this month."
        if anomalies else
        "Your spending patterns look normal this month. Great job!"
    )

    return {
        "anomalies": anomalies,
        "current_month": current_month,
        "months_analyzed": len(historical_months),
        "summary": summary
    }


def _build_anomaly_message(
    category: str,
    current: float,
    average: float,
    pct_change: float,
    severity: str
) -> str:
    """Build a human-readable anomaly message."""
    direction = "higher" if current > average else "lower"
    prefix = "⚠️" if severity == "high" else "📊"

    return (
        f"{prefix} Your {category} spending (₹{current:,.0f}) is {pct_change:.0f}% {direction} "
        f"than your usual average of ₹{average:,.0f}."
    )
