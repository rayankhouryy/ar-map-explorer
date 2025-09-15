#!/bin/bash

# Start AR Map Explorer Frontend
# Convenience script to start the React Native app with Expo

set -e

echo "📱 Starting AR Map Explorer Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Installing dependencies..."
    npm install
fi

# Check if backend is running
if ! curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "⚠️  Backend server not detected at http://localhost:8001"
    echo "   Please start the backend first by running: ./start-backend.sh"
    echo "   Or start it manually from the backend directory"
    echo
fi

# Get local IP address for mobile device access
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d: -f2 2>/dev/null)

if [ -z "$LOCAL_IP" ]; then
    # Try alternative method for Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "192.168.1.100")
fi

echo "📱 Make sure your mobile device is connected to the same WiFi network"
echo "🌐 Your local IP address: $LOCAL_IP"
echo "🔧 Backend should be accessible at: http://$LOCAL_IP:8001"
echo
echo "📲 Install Expo Go on your mobile device:"
echo "   iOS: https://apps.apple.com/app/expo-go/id982107779"
echo "   Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo
echo "🚀 Starting Expo development server..."
echo "   Scan the QR code with Expo Go (Android) or Camera app (iOS)"
echo

# Start Expo with proper Node.js version
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npx expo start
