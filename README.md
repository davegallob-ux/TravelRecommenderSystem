# Travel Recommender System 🏨✨

A transparent hotel recommendation system prototype designed to comply with the EU Digital Services Act (DSA). The application features two interactive recommendation strategies, offering real-time results, simplified step-by-step explanations, and deep-dive mathematical breakdowns.

## 🚀 Quick Start

To install dependencies and start the local development server, run the starter script:

```bash
chmod +x start.sh
./start.sh
```

Alternatively, you can run the commands manually:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will run locally at `http://localhost:5173`.

---

## 🛠️ Main Features

1. **Dual Algorithmic Strategies**:
   - **Weighted MAUT (Multi-Attribute Utility Theory)**: Rates Price, Location, Stars, Ratings, and Transport on a 0-10 importance scale. Computes a relative percentage match score for compensatory ranking.
   - **Constraint-Based Filtering**: Excludes hotels that violate user-defined thresholds (e.g., maximum price or minimum star rating).

2. **Step-by-Step Transparency Boards**:
   - Offers simple, non-technical explanations of how the algorithms compute outcomes.
   - Designed to meet the transparency guidelines of the EU Digital Services Act (DSA).

3. **On-Demand Mathematical Breakdown**:
   - Toggle LaTeX formulas to see the formal mathematical definitions of normalization and aggregation.
   - Inspect individual hotel cards to see the exact points, weights, and normalized values behind their match percentages.

---

## 🧪 Running Tests

Verify the correctness of the recommender engine's math, edge cases, boundaries, and filtering logic using the test suite containing **60 test cases** (30 for MAUT, 30 for filtering):

```bash
node run-tests.js
```

---

## 📁 Repository Structure

- [src/App.jsx](file:///Users/davidgallob/Projekte/recommendersystem/src/App.jsx) — Main frontend application logic, transparency panels, and controls.
- [src/recommenderEngine.js](file:///Users/davidgallob/Projekte/recommendersystem/src/recommenderEngine.js) — Algorithmic implementation of MAUT and constraint filtering.
- [src/data.js](file:///Users/davidgallob/Projekte/recommendersystem/src/data.js) — The mock hotel database (Vienna & Munich).
- [run-tests.js](file:///Users/davidgallob/Projekte/recommendersystem/run-tests.js) — Unit test suite with 60 test cases.
- [paper/](file:///Users/davidgallob/Projekte/recommendersystem/paper) — LaTeX source files and assets for the research paper.
- [presentation_latex/](file:///Users/davidgallob/Projekte/recommendersystem/presentation_latex) — LaTeX presentation slide assets and files.
