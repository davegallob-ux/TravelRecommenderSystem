# Presentation: User Control in Tourism Recommender Systems
**Lab Course: Projects in Recommender Systems (SS 2026)**
**Group W3**

---

## 1. Project Overview: Group W3
* **Topic:** User Control and Strategies for Influencing Algorithms.
* **Core Goal:** Moving away from "black-box" systems by giving users direct influence over ranking logic.
* **Motivation:**
    * Improving user trust through transparency.
    * Compliance with the **EU Digital Services Act (DSA)** (Requirement for transparent and explainable algorithms).
    * Allowing users to express complex, multi-dimensional preferences (e.g., "I want a luxury hotel, but it MUST be near a metro station").

---

## 2. Current Status: Static Prototype
* **Frontend Stack:** React + Vite + CSS (Modern Glassmorphism UI).
* **UI Components Developed:**
    * **City Selector:** Currently supports Vienna and Munich.
    * **Preference Sliders:** Five interactive sliders for:
        1. **Price Importance** (Lower is better)
        2. **Location Importance** (Closer to center is better)
        3. **Hotel Stars** (Higher is better)
        4. **User Rating** (Higher is better)
        5. **Public Transport Access** (Higher is better)
    * **Results Grid:** Real-time visualization of hotel cards with "Match Score" badges.
* **"Static" Note:** The current logic uses a placeholder Weighted Sum, but the UI is fully functional for demonstration.

---

## 3. Proposed Algorithms for Comparison

We aim to allow users to choose between two distinct algorithmic approaches to see which provides better "perceived control."

### Algorithm A: Weighted Multi-Attribute Utility Theory (MAUT)
* **Mechanism:** Linear combination of normalized scores.
* **Transparency:** 100% transparent. Users see exactly how much each slider contributes to the final percentage.
* **Use Case:** "Expert" users who want precise control over every trade-off.

### Algorithm B: Constraint-Based / Critiquing Hybrid
* **Mechanism:** 
    * **Filters:** Users set hard limits (e.g., "Max 150€").
    * **Critiquing:** "More like this, but closer to the center."
* **Transparency:** High. Recommendations are explained via satisfied vs. unsatisfied constraints.
* **Use Case:** Users who prefer natural-language-like intent rather than adjusting 5-10 numerical weights.

---

## 4. User Choice: Switching Between Algorithms
* **Key Feature:** A toggle or selection menu to switch between "Manual Weighting" and "Constraint-Guided" modes.
* **Research Question:** Does the ability to *choose* the algorithm itself increase user satisfaction and trust?
* **Transparency Panel:** (Planned) A detailed view showing the mathematical breakdown of the current score calculation.

---

## 5. Next Steps
1. **Algorithm Implementation:** Finalize the normalization logic and implement the second (Constraint-based) algorithm.
2. **Algorithm Selector UI:** Add the toggle to the main dashboard.
3. **Data Expansion:** Add more cities and potentially crawl more detailed "Transport Access" data.
4. **Evaluation:** Small user study comparing the two modes.

---

# Q&A
*How can we further simplify user control without losing transparency?*
