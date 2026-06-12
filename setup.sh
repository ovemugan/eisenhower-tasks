#!/bin/bash

echo "🚀 Eisenhower Task Manager - Quick Start"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo ""
    echo "Steps to get Firebase credentials:"
    echo "1. Go to https://firebase.google.com"
    echo "2. Create a new project"
    echo "3. Enable Authentication (Email/Password) and Firestore"
    echo "4. Go to Project Settings and copy your config"
    echo "5. Create .env.local file with your credentials"
    echo ""
    echo "Copy this template to .env.local:"
    cat .env.local.example
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Sign up with an email"
echo "4. Start adding tasks!"
echo ""
echo "🚀 To deploy: npm run build, then push to GitHub and connect to Vercel"
