# Milestone Presentation: User Control in Tourism Recommender Systems
**Lab Course: Projects in Recommender Systems (SS 2026)**

---

## 1. Project Overview & Motivation
* **The Goal:** Build a recommender system that isn't a "black box", giving users direct control over how hotels are ranked.
* **Why it matters:**
    * Users trust recommendations more when they understand them.
    * Compliance with the **EU Digital Services Act (DSA)**, which requires platforms to explain their main parameters and offer choices that don't rely on profiling.
    * Real-world preferences are complicated (e.g. "I want a cheap place near a metro station, and I don't care about stars"). Sliders let users express this easily.

---

## 2. The Frontend UI
A responsive web app was built using **React + Vite + CSS**. Instead of hiding things, the UI puts control and math transparency front and center.

* **Working UI Features:**
    * **City Selector:** Toggle between Vienna and Munich.
    * **Preference Sliders:** Five sliders to set custom weights for:
        1. **Price Importance** (lower is better)
        2. **Distance to Center** (closer is better)
        3. **Hotel Stars** (higher is better)
        4. **User Rating** (higher is better)
        5. **Public Transport Access** (higher is better)
    * **Results Grid:** Real-time updates of hotel cards with "Match Score" badges.
    * **Transparency Panel:** Each hotel card has a "Show Mathematical Breakdown" button that explains exactly how its score was calculated.

---

## 3. The Algorithms (Behind the Scenes)
The project compares two different ways of letting users guide recommendations to see which feels better and gives them more perceived control.

### Algorithm A: Weighted Multi-Attribute Utility Theory (MAUT)
* **How it works:** Normalize hotel attributes (like price or distance) between 0 and 1, multiply them by the user's slider weights, and sum them up.
* **Transparency:** High. Users see the exact math behind the percentage.
* **Current Status: Implemented but buggy!**
    * *Warning:* It's not fully stable yet.
    * *Crashes:* Sometimes it crashes (e.g., if you drag all sliders to 0, which triggers a division-by-zero error).
    * *Weird scores:* Sometimes it calculates match scores over 100% due to normalization edge cases. This math needs to be fixed next.

### Algorithm B: Constraint-Based Filtering
* **How it works:** Hard limits. Instead of a percentage, users set thresholds (e.g. "Price must be under $150").
* **Transparency:** Very clear. Hotels are either in or out based on binary logic.
* **Current Status:** Fully implemented, stable, and working perfectly.

---

## 4. User Interaction & Explainability
* **The Algorithm Toggle:** Users can switch between "Weighted Ranking" (MAUT) and "Constraint Filtering" using a simple selector.
* **DSA Compliance:** 
    * The **Global Explanation Banner** at the top explains the selected algorithm.
    * The **On-Demand Breakdown** shows the raw values, normalized values, and active weights.

---

## 5. Next Steps
1. **Fix the MAUT bugs:** Stop the app from crashing on zero weights and correct the normalization logic so scores never exceed 100%.
2. **Smooth out the Toggle UI:** Make the transition between modes cleaner.
3. **Expand Dataset:** Add more hotels and get real transit data.
4. **User Study:** Do a quick evaluation with real users to see which algorithm gives them a better sense of control.

---

# Questions & Discussion
*How can user control be simplified further without losing transparency?*
