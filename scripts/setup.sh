#!/bin/bash

# AR Map Explorer Setup Script
echo "🚀 Setting up AR Map Explorer..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start database and Redis
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d db redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Setup backend
echo "🐍 Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
echo "📊 Running database migrations..."
alembic upgrade head

echo "✅ Backend setup complete"

# Setup frontend
echo "📱 Setting up frontend..."
cd ../frontend

# Install dependencies
npm install

echo "✅ Frontend setup complete"

# Create initial admin user (optional)
echo "👤 Would you like to create an admin user? (y/n)"
read -r create_admin

if [ "$create_admin" = "y" ]; then
    echo "📝 Creating admin user..."
    cd ../backend
    python -c "
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

db = SessionLocal()
admin_user = User(
    email='admin@example.com',
    hashed_password=get_password_hash('admin123'),
    full_name='Admin User',
    role=UserRole.TENANT_ADMIN,
    is_active=True,
    is_verified=True
)
db.add(admin_user)
db.commit()
print('Admin user created: admin@example.com / admin123')
"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the backend:"
echo "  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npx expo start"
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Happy coding! 🚀"
