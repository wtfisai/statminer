#!/bin/bash

# deploy.sh - Automated deployment script for Data Aggregator App

echo "🚀 Data Aggregator Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo ""
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current version: $(node -v)"
        exit 1
    fi
    print_status "Node.js $(node -v) detected"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
else
    print_status "npm $(npm -v) detected"
fi

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not installed. Installing..."
    npm i -g vercel
    print_status "Vercel CLI installed"
else
    print_status "Vercel CLI detected"
fi

# Initialize project
echo ""
echo "Initializing project..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project directory?"
    exit 1
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo "Creating .env.local file..."
    cat > .env.local << EOL
# Neo4j Configuration
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# LLM API Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
GROK_API_KEY=
REQUESTY_API_KEY=

# Government APIs
BLS_API_KEY=
CENSUS_API_KEY=
FRED_API_KEY=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOL
    print_status ".env.local created - Please update with your API keys"
    print_warning "Edit .env.local before deployment"
fi

# Build the project
echo ""
echo "Building the project..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Build completed successfully"
else
    print_error "Build failed. Please fix errors before deploying."
    exit 1
fi

# Deployment options
echo ""
echo "Deployment Options:"
echo "1) Deploy to Vercel (Recommended)"
echo "2) Run locally only"
echo "3) Exit"
echo ""
read -p "Select option (1-3): " option

case $option in
    1)
        echo ""
        echo "Deploying to Vercel..."
        
        # Check if already logged in to Vercel
        vercel whoami &> /dev/null
        if [ $? -ne 0 ]; then
            echo "Please log in to Vercel:"
            vercel login
        fi
        
        # Deploy to Vercel
        echo ""
        echo "Starting deployment..."
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_status "Deployment successful!"
            echo ""
            echo "Next steps:"
            echo "1. Go to your Vercel dashboard"
            echo "2. Navigate to Settings → Environment Variables"
            echo "3. Add your API keys and Neo4j credentials"
            echo "4. Redeploy to apply environment variables"
        else
            print_error "Deployment failed"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo "Starting local server..."
        npm run dev
        ;;
        
    3)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

# Additional setup instructions
echo ""
echo "====================================="
echo "Setup Complete!"
echo "====================================="
echo ""
echo "Important Configuration Steps:"
echo ""
echo "1. Neo4j Setup:"
echo "   - Sign up at https://neo4j.com/cloud/aura/"
echo "   - Create a free instance"
echo "   - Update NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD in Vercel"
echo ""
echo "2. API Keys (Optional but recommended):"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo "   - Anthropic: https://console.anthropic.com/"
echo "   - Census: https://api.census.gov/data/key_signup.html"
echo "   - FRED: https://fred.stlouisfed.org/docs/api/api_key.html"
echo ""
echo "3. After adding environment variables in Vercel:"
echo "   - Trigger a redeployment"
echo "   - Test the application"
echo ""
echo "Documentation: Check README.md for detailed instructions"
echo ""
print_status "Script completed successfully!"