"""
AI Expense Categorizer
Rule-based classification that maps transaction descriptions to categories.
Designed to be replaceable with an ML model later.
"""

import re
from typing import Optional

# Keyword mapping for categorization
CATEGORY_RULES = {
    "Food": [
        "swiggy", "zomato", "food", "restaurant", "cafe", "pizza", "burger",
        "biryani", "dinner", "lunch", "breakfast", "grocery", "vegetables",
        "fruits", "milk", "bread", "supermarket", "bigbasket", "blinkit",
        "zepto", "dunzo", "hotel", "dhabha", "canteen", "mess", "tiffin",
        "chai", "coffee", "tea", "snacks", "bakery", "dominos", "kfc",
        "mcdonalds", "subway", "starbucks", "haldirams", "amul"
    ],
    "Transport": [
        "uber", "ola", "auto", "taxi", "bus", "metro", "train", "flight",
        "petrol", "fuel", "diesel", "parking", "toll", "rapido", "bike",
        "rickshaw", "cab", "transport", "irctc", "indigo", "airindia",
        "spicejet", "travel", "commute", "ferry"
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa", "shopping",
        "clothes", "shoes", "shirt", "pants", "dress", "watch", "bag",
        "accessories", "electronics", "mobile", "laptop", "gadget", "snapdeal",
        "jiomart", "walmart", "reliance", "dmart", "mall", "store", "purchase"
    ],
    "Bills": [
        "electricity", "water", "gas", "internet", "wifi", "broadband",
        "phone", "mobile", "recharge", "dth", "cable", "jio", "airtel",
        "vodafone", "bsnl", "utility", "maintenance", "society", "bill",
        "netflix", "amazon prime", "hotstar", "subscription"
    ],
    "Entertainment": [
        "movie", "cinema", "pvr", "inox", "netflix", "hotstar", "spotify",
        "youtube", "gaming", "game", "concert", "event", "party", "club",
        "bar", "pub", "recreation", "fun", "outing", "picnic", "amusement",
        "bookmyshow", "paytm games", "entertainment", "leisure"
    ],
    "Healthcare": [
        "doctor", "hospital", "clinic", "medicine", "pharmacy", "medical",
        "health", "apollo", "fortis", "aiims", "diagnostic", "test", "blood",
        "xray", "scan", "surgery", "dental", "eye", "prescription", "tablet",
        "capsule", "injection", "medplus", "wellness", "gym", "yoga",
        "fitness", "healthkart", "netmeds", "1mg", "pharmeasy"
    ],
    "Education": [
        "school", "college", "university", "course", "udemy", "coursera",
        "byju", "unacademy", "tuition", "class", "education", "book",
        "stationery", "pen", "pencil", "notebook", "library", "exam",
        "fees", "admission", "tutorial", "coaching", "training", "workshop",
        "seminar", "certificate", "degree"
    ],
    "Rent": [
        "rent", "housing", "flat", "apartment", "pg", "hostel", "accommodation",
        "landlord", "lease", "deposit", "house", "room", "tenant"
    ],
    "Other": []
}


def categorize_transaction(description: str) -> str:
    """
    Categorize a transaction based on its description.
    Returns the best matching category or 'Other' if no match found.
    """
    if not description:
        return "Other"

    description_lower = description.lower().strip()

    # Score each category based on keyword matches
    scores = {category: 0 for category in CATEGORY_RULES}

    for category, keywords in CATEGORY_RULES.items():
        for keyword in keywords:
            if keyword in description_lower:
                # Give higher weight to longer keyword matches
                scores[category] += len(keyword)

    # Find the best matching category
    best_category = max(scores, key=scores.get)
    if scores[best_category] == 0:
        return "Other"

    return best_category


def get_category_confidence(description: str, category: str) -> float:
    """
    Return a confidence score (0.0 - 1.0) for the categorization.
    """
    if not description or category == "Other":
        return 0.3

    description_lower = description.lower()
    keywords = CATEGORY_RULES.get(category, [])
    matched = sum(1 for kw in keywords if kw in description_lower)

    if matched == 0:
        return 0.3
    elif matched == 1:
        return 0.7
    else:
        return min(0.95, 0.7 + matched * 0.1)


def suggest_categories(description: str) -> list:
    """
    Return a ranked list of category suggestions for a given description.
    """
    if not description:
        return list(CATEGORY_RULES.keys())

    description_lower = description.lower().strip()
    scores = {}

    for category, keywords in CATEGORY_RULES.items():
        score = sum(len(kw) for kw in keywords if kw in description_lower)
        scores[category] = score

    # Sort by score descending
    sorted_categories = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [cat for cat, _ in sorted_categories]
