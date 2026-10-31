#!/bin/bash

# Smart College Event Management System — One-Command Startup
echo "=========================================================="
echo "🎓 Starting Smart College Event Management System (NexEvent)"
echo "=========================================================="

# Check Python virtual environment
if [ ! -d "backend/venv" ]; then
    echo "Creating Python venv..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# Check Node modules
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo "🚀 Starting FastAPI Backend on http://127.0.0.1:8000..."
backend/venv/bin/uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "✨ Starting Vite React Frontend on http://localhost:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both services running!"
echo "   - Web Application: http://localhost:5173"
echo "   - Interactive API Docs: http://127.0.0.1:8000/docs"
echo "   - Health Check: http://127.0.0.1:8000/api/health"
echo ""
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait

