#!/bin/bash

# AR Map Explorer Setup Script
# This script sets up the entire development environment

set -e  # Exit on any error

echo "🌍 Setting up AR Map Explorer..."
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on macOS, Linux, or Windows (Git Bash)
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

echo -e "${BLUE}Detected OS: $OS${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        print_status "Node.js $NODE_VERSION (✓ >= 20.0.0)"
    else
        print_error "Node.js $NODE_VERSION is too old. Please install Node.js 20+ from https://nodejs.org/"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 10 ]; then
        print_status "Python $PYTHON_VERSION (✓ >= 3.10.0)"
    else
        print_error "Python $PYTHON_VERSION is too old. Please install Python 3.10+ from https://python.org/"
        exit 1
    fi
elif command_exists python; then
    print_warning "Using 'python' command instead of 'python3'"
    PYTHON_CMD="python"
else
    print_error "Python not found. Please install Python 3.10+ from https://python.org/"
    exit 1
fi

# Set Python command
PYTHON_CMD=${PYTHON_CMD:-python3}

# Check PostgreSQL
if command_exists psql; then
    POSTGRES_VERSION=$(psql --version | cut -d' ' -f3 | cut -d'.' -f1)
    if [ "$POSTGRES_VERSION" -ge 12 ]; then
        print_status "PostgreSQL $POSTGRES_VERSION (✓ >= 12.0)"
    else
        print_warning "PostgreSQL $POSTGRES_VERSION might be too old. Recommended: 14+"
    fi
else
    print_error "PostgreSQL not found. Please install PostgreSQL from https://postgresql.org/download/"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "  Windows: Download from https://postgresql.org/download/windows/"
    exit 1
fi

# Check Git
if command_exists git; then
    print_status "Git $(git --version | cut -d' ' -f3)"
else
    print_error "Git not found. Please install Git from https://git-scm.com/"
    exit 1
fi

echo

# Setup database
echo -e "${BLUE}Setting up database...${NC}"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw ar_map_explorer; then
    print_warning "Database 'ar_map_explorer' already exists"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb ar_map_explorer 2>/dev/null || true
        createdb ar_map_explorer
        print_status "Database recreated"
    else
        print_status "Using existing database"
    fi
else
    createdb ar_map_explorer
    print_status "Database 'ar_map_explorer' created"
fi

echo

# Setup backend
echo -e "${BLUE}Setting up backend...${NC}"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    print_status "Python virtual environment created"
else
    print_status "Python virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
print_status "Python dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    USER_NAME=$(whoami)
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://$USER_NAME@localhost:5432/ar_map_explorer

# Security
SECRET_KEY=$(openssl rand -hex 32)
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# File Upload Settings
MAX_IMAGE_SIZE_MB=10
MAX_FILE_SIZE_MB=50
MAX_MODEL_SIZE_MB=100
MAX_TEXTURE_SIZE=4096

# Optional: Redis for caching
# REDIS_URL=redis://localhost:6379

# Optional: AWS S3 for file storage
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_BUCKET_NAME=your_bucket_name
EOF
    print_status "Backend .env file created"
else
    print_status "Backend .env file already exists"
fi

# Run database migrations
alembic upgrade head
print_status "Database migrations completed"

cd ..

echo

# Setup frontend
echo -e "${BLUE}Setting up frontend...${NC}"
cd frontend

# Install Node.js dependencies
npm install
print_status "Node.js dependencies installed"

# Update API configuration
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d: -f2)

if [ -z "$LOCAL_IP" ]; then
    # Try alternative method for Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "192.168.1.100")
fi

echo -e "${YELLOW}📱 IMPORTANT: Update your API configuration${NC}"
echo "Edit frontend/src/services/api.ts and replace:"
echo "  http://10.0.0.252:8001/api/v1"
echo "With:"
echo "  http://$LOCAL_IP:8001/api/v1"
echo

cd ..

echo

# Final instructions
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "================================="
echo
echo -e "${BLUE}To start the application:${NC}"
echo
echo "1. Start the backend server:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"
echo
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm start"
echo
echo "3. Install Expo Go on your mobile device and scan the QR code"
echo
echo -e "${BLUE}Useful links:${NC}"
echo "• API Documentation: http://localhost:8001/docs"
echo "• Health Check: http://localhost:8001/health"
echo "• Expo Go (iOS): https://apps.apple.com/app/expo-go/id982107779"
echo "• Expo Go (Android): https://play.google.com/store/apps/details?id=host.exp.exponent"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "• Grant location and camera permissions when prompted"
echo "• Register as a Creator to start making AR content"
echo "• Check the README.md for detailed usage instructions"
echo
echo -e "${GREEN}Happy AR creating! 🚀✨${NC}"
