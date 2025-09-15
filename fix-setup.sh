#!/bin/bash

# AR Map Explorer - Fix Known Issues Script
echo "🔧 Fixing known issues in AR Map Explorer..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Backend Setup
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
print_status "Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    USER_NAME=$(whoami)
    cat > .env << EOF
DATABASE_URL=postgresql://$USER_NAME@localhost:5432/ar_map_explorer
SECRET_KEY=$(openssl rand -hex 32)
ACCESS_TOKEN_EXPIRE_MINUTES=10080
MAX_IMAGE_SIZE_MB=10
MAX_FILE_SIZE_MB=50
MAX_MODEL_SIZE_MB=100
MAX_TEXTURE_SIZE=4096
EOF
    print_status "Backend .env file created"
fi

# Create uploads directory
mkdir -p uploads/{image,video,model,pdf}
mkdir -p uploads/thumbnails
print_status "Upload directories created"

# Test database connection
python3 -c "
from app.core.database import engine
from sqlalchemy import text
try:
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    print('💡 Run: createdb ar_map_explorer')
"

# Run migrations
alembic upgrade head
print_status "Database migrations completed"

cd ..

# 2. Frontend Setup
echo "🔧 Setting up frontend..."
cd frontend

# Remove node_modules and package-lock to fix dependency issues
if [ -d "node_modules" ]; then
    print_warning "Removing node_modules to fix dependency conflicts"
    rm -rf node_modules package-lock.json
fi

# Install dependencies with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps
print_status "Frontend dependencies installed"

# Get local IP for mobile development
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "192.168.1.100")
fi

print_status "Setup completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "1. Start backend: ./start-backend.sh"
echo "2. Start frontend: ./start-frontend.sh"
echo "3. Update API URL in frontend/src/services/api.ts to: http://$LOCAL_IP:8001/api/v1"
echo ""
echo "📱 Your local IP: $LOCAL_IP"
