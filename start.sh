#!/bin/bash

echo "🤖 Starting Seylane Chat Bot..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure your credentials"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing dashboard dependencies..."
    cd client && npm install && cd ..
fi

# Build if needed
if [ ! -d "dist" ]; then
    echo "🔨 Building backend..."
    npm run build
fi

echo ""
echo "✅ Starting services..."
echo ""
echo "Backend API: http://localhost:3000"
echo "Dashboard: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start backend
npm run dev &
BACKEND_PID=$!

# Start dashboard
cd client && npm run dev &
DASHBOARD_PID=$!

# Wait for Ctrl+C
trap "kill $BACKEND_PID $DASHBOARD_PID; exit" INT

wait

