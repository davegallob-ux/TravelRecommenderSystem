#!/bin/bash

# Exit immediately if any command fails
set -e

echo "=================================================="
echo " Starting Travel Recommender System..."
echo "=================================================="

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
else
    echo "📦 Dependencies already installed."
fi

# Run the test suite first to ensure stability
echo "🧪 Running unit tests..."
node run-tests.js

# Start the Vite development server
echo "🚀 Starting development server..."
npm run dev
