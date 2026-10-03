"""
Seed realistic sample data for SpendSense AI.
Uses Indian currency (₹) with realistic spending patterns.
"""

from datetime import datetime, timedelta
from backend.models.models import Transaction, Income, Budget, SavingsGoal, AIInsight


def seed_database(db):
    """Seed the database with realistic sample data."""
    today = datetime.now()
    current_month = today.strftime("%Y-%m")

    # ===== INCOME =====
    income_records = [
        # Current month
        Income(amount=45000, source="Salary", date=f"{current_month}-01",
               description="Monthly salary - TechCorp India"),
        Income(amount=8500, source="Freelance", date=f"{current_month}-10",
               description="Website design project - Client A"),

        # Last month
        Income(amount=45000, source="Salary",
               date=_month_offset(today, -1).strftime("%Y-%m-01"),
               description="Monthly salary - TechCorp India"),
        Income(amount=5000, source="Freelance",
               date=_month_offset(today, -1).strftime("%Y-%m-15"),
               description="Logo design freelance project"),
        Income(amount=2000, source="Other",
               date=_month_offset(today, -1).strftime("%Y-%m-20"),
               description="Online course affiliate commission"),

        # 2 months ago
        Income(amount=45000, source="Salary",
               date=_month_offset(today, -2).strftime("%Y-%m-01"),
               description="Monthly salary - TechCorp India"),
        Income(amount=12000, source="Freelance",
               date=_month_offset(today, -2).strftime("%Y-%m-12"),
               description="Mobile app UI/UX project"),

        # 3 months ago
        Income(amount=45000, source="Salary",
               date=_month_offset(today, -3).strftime("%Y-%m-01"),
               description="Monthly salary - TechCorp India"),
        Income(amount=3000, source="Business",
               date=_month_offset(today, -3).strftime("%Y-%m-18"),
               description="Photography gig - corporate event"),
    ]

    db.add_all(income_records)

    # ===== TRANSACTIONS =====
    transactions = []

    # Current month transactions
    curr = current_month
    transactions += [
        Transaction(amount=15000, category="Rent", description="Monthly apartment rent",
                    date=f"{curr}-01", payment_method="Bank Transfer", type="expense"),
        Transaction(amount=999, category="Bills", description="Jio broadband monthly plan",
                    date=f"{curr}-02", payment_method="UPI", type="expense"),
        Transaction(amount=1299, category="Bills", description="Airtel postpaid mobile bill",
                    date=f"{curr}-03", payment_method="UPI", type="expense"),
        Transaction(amount=1800, category="Food", description="Swiggy food orders - week 1",
                    date=f"{curr}-04", payment_method="UPI", type="expense"),
        Transaction(amount=3200, category="Shopping", description="Amazon online shopping - clothes",
                    date=f"{curr}-05", payment_method="Credit Card", type="expense"),
        Transaction(amount=650, category="Transport", description="Uber cab rides - work commute",
                    date=f"{curr}-06", payment_method="UPI", type="expense"),
        Transaction(amount=420, category="Food", description="Zomato dinner order",
                    date=f"{curr}-07", payment_method="UPI", type="expense"),
        Transaction(amount=1500, category="Healthcare", description="Doctor consultation + medicines",
                    date=f"{curr}-08", payment_method="Cash", type="expense"),
        Transaction(amount=1200, category="Entertainment", description="Netflix + Spotify subscriptions",
                    date=f"{curr}-09", payment_method="Credit Card", type="expense"),
        Transaction(amount=2500, category="Food", description="BigBasket grocery shopping",
                    date=f"{curr}-10", payment_method="Debit Card", type="expense"),
        Transaction(amount=800, category="Transport", description="Metro card recharge",
                    date=f"{curr}-11", payment_method="UPI", type="expense"),
        Transaction(amount=350, category="Food", description="Chai and snacks - office",
                    date=f"{curr}-12", payment_method="Cash", type="expense"),
        Transaction(amount=2200, category="Education", description="Udemy course - React & Python",
                    date=f"{curr}-13", payment_method="Credit Card", type="expense"),
        Transaction(amount=1450, category="Bills", description="Electricity bill - BESCOM",
                    date=f"{curr}-14", payment_method="UPI", type="expense"),
        Transaction(amount=750, category="Entertainment", description="Movie tickets - PVR IMAX",
                    date=f"{curr}-15", payment_method="Credit Card", type="expense"),
    ]

    # Last month transactions
    lm = _month_offset(today, -1).strftime("%Y-%m")
    transactions += [
        Transaction(amount=15000, category="Rent", description="Monthly apartment rent",
                    date=f"{lm}-01", payment_method="Bank Transfer", type="expense"),
        Transaction(amount=999, category="Bills", description="Jio broadband monthly plan",
                    date=f"{lm}-02", payment_method="UPI", type="expense"),
        Transaction(amount=1299, category="Bills", description="Airtel postpaid mobile bill",
                    date=f"{lm}-03", payment_method="UPI", type="expense"),
        Transaction(amount=4500, category="Food", description="Swiggy, Zomato - entire month",
                    date=f"{lm}-05", payment_method="UPI", type="expense"),
        Transaction(amount=5800, category="Shopping", description="Myntra sale - clothes & shoes",
                    date=f"{lm}-08", payment_method="Credit Card", type="expense"),
        Transaction(amount=2800, category="Transport", description="Uber, Rapido and Metro",
                    date=f"{lm}-10", payment_method="UPI", type="expense"),
        Transaction(amount=1500, category="Entertainment", description="Concert tickets + OTT subscriptions",
                    date=f"{lm}-12", payment_method="Credit Card", type="expense"),
        Transaction(amount=900, category="Healthcare", description="Pharmacy purchase",
                    date=f"{lm}-14", payment_method="Cash", type="expense"),
        Transaction(amount=1500, category="Bills", description="Electricity + water bill",
                    date=f"{lm}-15", payment_method="UPI", type="expense"),
        Transaction(amount=3200, category="Food", description="BigBasket grocery + vegetables",
                    date=f"{lm}-18", payment_method="Debit Card", type="expense"),
        Transaction(amount=1000, category="Education", description="Online Python course",
                    date=f"{lm}-20", payment_method="Credit Card", type="expense"),
        Transaction(amount=600, category="Transport", description="Auto rickshaw rides",
                    date=f"{lm}-22", payment_method="Cash", type="expense"),
        Transaction(amount=1200, category="Entertainment", description="Weekend outing + restaurant",
                    date=f"{lm}-25", payment_method="Credit Card", type="expense"),
    ]

    # 2 months ago transactions
    m2 = _month_offset(today, -2).strftime("%Y-%m")
    transactions += [
        Transaction(amount=15000, category="Rent", description="Monthly apartment rent",
                    date=f"{m2}-01", payment_method="Bank Transfer", type="expense"),
        Transaction(amount=999, category="Bills", description="Jio broadband monthly plan",
                    date=f"{m2}-02", payment_method="UPI", type="expense"),
        Transaction(amount=1299, category="Bills", description="Airtel postpaid mobile bill",
                    date=f"{m2}-03", payment_method="UPI", type="expense"),
        Transaction(amount=3800, category="Food", description="Food delivery and groceries",
                    date=f"{m2}-06", payment_method="UPI", type="expense"),
        Transaction(amount=2100, category="Shopping", description="Amazon shopping",
                    date=f"{m2}-09", payment_method="Credit Card", type="expense"),
        Transaction(amount=2200, category="Transport", description="Fuel, Uber and Metro",
                    date=f"{m2}-12", payment_method="UPI", type="expense"),
        Transaction(amount=1200, category="Entertainment", description="Movies + event",
                    date=f"{m2}-15", payment_method="Credit Card", type="expense"),
        Transaction(amount=2000, category="Healthcare", description="Annual health checkup",
                    date=f"{m2}-17", payment_method="Debit Card", type="expense"),
        Transaction(amount=1350, category="Bills", description="Electricity bill",
                    date=f"{m2}-18", payment_method="UPI", type="expense"),
        Transaction(amount=2800, category="Food", description="Grocery store - Dmart",
                    date=f"{m2}-20", payment_method="Cash", type="expense"),
        Transaction(amount=500, category="Education", description="Stationery and books",
                    date=f"{m2}-23", payment_method="Cash", type="expense"),
        Transaction(amount=1800, category="Shopping", description="Flipkart Big Billion Day",
                    date=f"{m2}-26", payment_method="Credit Card", type="expense"),
    ]

    # 3 months ago transactions
    m3 = _month_offset(today, -3).strftime("%Y-%m")
    transactions += [
        Transaction(amount=15000, category="Rent", description="Monthly apartment rent",
                    date=f"{m3}-01", payment_method="Bank Transfer", type="expense"),
        Transaction(amount=999, category="Bills", description="Jio broadband monthly plan",
                    date=f"{m3}-02", payment_method="UPI", type="expense"),
        Transaction(amount=1299, category="Bills", description="Airtel postpaid mobile bill",
                    date=f"{m3}-03", payment_method="UPI", type="expense"),
        Transaction(amount=4200, category="Food", description="Food delivery + groceries",
                    date=f"{m3}-07", payment_method="UPI", type="expense"),
        Transaction(amount=4500, category="Shopping", description="Nykaa beauty + Myntra clothes",
                    date=f"{m3}-10", payment_method="Credit Card", type="expense"),
        Transaction(amount=1800, category="Transport", description="Monthly commute expenses",
                    date=f"{m3}-14", payment_method="UPI", type="expense"),
        Transaction(amount=1100, category="Entertainment", description="OTT + weekend activity",
                    date=f"{m3}-16", payment_method="Credit Card", type="expense"),
        Transaction(amount=700, category="Healthcare", description="Dentist appointment",
                    date=f"{m3}-19", payment_method="Cash", type="expense"),
        Transaction(amount=1400, category="Bills", description="Utility bills",
                    date=f"{m3}-20", payment_method="UPI", type="expense"),
        Transaction(amount=2500, category="Food", description="Grocery shopping",
                    date=f"{m3}-24", payment_method="Debit Card", type="expense"),
    ]

    db.add_all(transactions)

    # ===== BUDGETS =====
    budgets = [
        Budget(category="Food", monthly_limit=8000, month=current_month),
        Budget(category="Shopping", monthly_limit=5000, month=current_month),
        Budget(category="Transport", monthly_limit=3000, month=current_month),
        Budget(category="Bills", monthly_limit=5000, month=current_month),
        Budget(category="Entertainment", monthly_limit=2500, month=current_month),
        Budget(category="Healthcare", monthly_limit=3000, month=current_month),
        Budget(category="Education", monthly_limit=3000, month=current_month),
    ]
    db.add_all(budgets)

    # ===== SAVINGS GOALS =====
    savings_goals = [
        SavingsGoal(
            name="New Laptop",
            target_amount=60000,
            current_savings=25000,
            target_date="2027-01-01",
            description="MacBook Pro M3 for development work",
            is_completed=False
        ),
        SavingsGoal(
            name="Emergency Fund",
            target_amount=150000,
            current_savings=80000,
            target_date="2026-12-31",
            description="6 months of living expenses as emergency reserve",
            is_completed=False
        ),
        SavingsGoal(
            name="Goa Vacation",
            target_amount=30000,
            current_savings=12000,
            target_date="2026-12-01",
            description="Christmas vacation trip to Goa",
            is_completed=False
        ),
        SavingsGoal(
            name="New Phone",
            target_amount=25000,
            current_savings=25000,
            target_date="2026-06-01",
            description="iPhone 15 upgrade - Goal completed!",
            is_completed=True
        ),
    ]
    db.add_all(savings_goals)

    # ===== AI INSIGHTS =====
    ai_insights = [
        AIInsight(
            insight_type="recommendation",
            title="Reduce Food Delivery Spending",
            message="You spent ₹1,800 on food delivery this week alone. Meal prepping 3 days a week could save you ₹2,000/month.",
            severity="info",
            category="Food"
        ),
        AIInsight(
            insight_type="anomaly",
            title="Shopping Spike Detected",
            message="Your shopping spending of ₹3,200 this month is 52% above your usual average of ₹2,100.",
            severity="warning",
            category="Shopping"
        ),
        AIInsight(
            insight_type="prediction",
            title="Upcoming Bills Due",
            message="Based on historical data, expect ₹3,298 in bill payments (Rent excluded) this month.",
            severity="info",
            category="Bills"
        ),
    ]
    db.add_all(ai_insights)

    db.commit()
    print("✅ Sample data seeded successfully!")


def _month_offset(base_date: datetime, months: int) -> datetime:
    """Return the first day of the month offset from base_date."""
    month = base_date.month + months
    year = base_date.year
    while month <= 0:
        month += 12
        year -= 1
    while month > 12:
        month -= 12
        year += 1
    # Always return the 1st to avoid invalid day-of-month (e.g. Feb 30)
    return datetime(year, month, 1)
