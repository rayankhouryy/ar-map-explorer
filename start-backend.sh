#!/bin/bash

# Start AR Map Explorer Backend Server
# Convenience script to start the backend with proper configuration

set -e

echo "🚀 Starting AR Map Explorer Backend..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run setup.sh first."
    exit 1
fi

# Check if database is accessible
if ! psql -d ar_map_explorer -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database. Please ensure PostgreSQL is running and database exists."
    echo "Try: createdb ar_map_explorer"
    exit 1
fi

# Run database migrations
echo "🔄 Running database migrations..."
alembic upgrade head

# Create uploads directory
mkdir -p uploads/{images,models,thumbnails,previews,image,video,model,pdf}/

# Seed sample data (Space Needle and Seattle landmarks)
echo "🗼 Seeding sample data..."
python scripts/seed_sample_data.py

echo "✅ Backend starting on http://localhost:8001"
echo "📖 API Documentation: http://localhost:8001/docs"
echo "❤️  Health Check: http://localhost:8001/health"
echo

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
