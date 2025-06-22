#!/bin/bash

# zkSalaryStream-Mock Setup Script
# This script helps you get the development environment running quickly

set -e

echo "🚀 Setting up zkSalaryStream-Mock development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm 9+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ npm $(npm --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment files
echo "🔧 Creating environment configuration files..."

# Backend environment file
cat > apps/backend/.env.local << EOF
# Database
MONGODB_URI=your_mongodb_connection_string_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Ethereum
ETHEREUM_RPC_URL=http://localhost:8545

# Application
PORT=4000
NODE_ENV=development

# Optional: For production use with real Kotani Pay
# KOTANI_API_KEY=your_real_api_key
# KOTANI_API_SECRET=your_real_api_secret
# KOTANI_BASE_URL=https://api.kotanipay.com
EOF

# Frontend environment file
cat > apps/dashboard/.env.local << EOF
VITE_BACKEND_URL=http://localhost:4000
EOF

echo "✅ Environment files created"
echo ""
echo "⚠️  IMPORTANT: Please update apps/backend/.env.local with your MongoDB connection string!"
echo "   Replace 'your_mongodb_connection_string_here' with your actual MongoDB URI"
echo ""

# Check Redis
echo "🔍 Checking Redis availability..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is not running. Starting with Docker..."
        if command -v docker &> /dev/null; then
            docker run -d --name zksalary-redis -p 6379:6379 redis:7-alpine
            echo "✅ Redis started in Docker container"
        else
            echo "❌ Redis is not running and Docker is not available."
            echo "   Please start Redis manually:"
            echo "   - macOS: brew services start redis"
            echo "   - Ubuntu: sudo systemctl start redis"
            echo "   - Or install Docker to use containerized Redis"
        fi
    fi
else
    echo "⚠️  Redis CLI not found. Attempting to start Redis with Docker..."
    if command -v docker &> /dev/null; then
        docker run -d --name zksalary-redis -p 6379:6379 redis:7-alpine
        echo "✅ Redis started in Docker container"
    else
        echo "❌ Redis is not available and Docker is not found."
        echo "   Please install Redis or Docker first."
    fi
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile --workspace=contracts

echo ""
echo "🎉 Setup complete! To start the development environment:"
echo ""
echo "1. Start Hardhat local network:"
echo "   npm run dev:hardhat"
echo ""
echo "2. Deploy contracts (in another terminal):"
echo "   npm run deploy:contracts"
echo ""
echo "3. Start the backend (in another terminal):"
echo "   npm run dev:backend"
echo ""
echo "4. Start the frontend (in another terminal):"
echo "   npm run dev:dashboard"
echo ""
echo "📱 Access the application:"
echo "   • Dashboard: http://localhost:3000"
echo "   • Backend API: http://localhost:4000"
echo "   • GraphQL Playground: http://localhost:4000/graphql"
echo ""
echo "🧪 Run tests:"
echo "   npm run test:contracts"
echo "   npm run test:backend"
echo ""
echo "Happy coding! 🚀" 