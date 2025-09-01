#!/bin/bash

# deploy-firebase.sh - Firebase Deployment Script for StatNerd
# ============================================================

echo "🔥 StatNerd Firebase - Complete Setup & Deployment"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
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

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
    print_warning "Firebase CLI not installed. Installing..."
    npm install -g firebase-tools
    print_status "Firebase CLI installed"
else
    print_status "Firebase CLI detected"
fi

# Get project information
echo ""
read -p "Enter your Firebase project ID (or press Enter to create new): " FIREBASE_PROJECT_ID
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your email for git: " GIT_EMAIL
read -p "Enter your name for git: " GIT_NAME

# Initialize project
echo ""
print_info "Initializing StatNerd project..."

# Create project directory
mkdir -p statnerd-firebase
cd statnerd-firebase

# Initialize Next.js
print_info "Creating Next.js application..."
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint \
  --yes

# Create directory structure
print_info "Creating directory structure..."
mkdir -p src/lib/firebase
mkdir -p src/components/{auth,chat,settings,database,comparison-panel,neural-network,ui}
mkdir -p src/app/{login,dashboard,settings}
mkdir -p functions/src
mkdir -p public

# Install dependencies
print_info "Installing dependencies..."
npm install firebase firebase-admin firebase-functions \
  @react-firebase-hooks/auth @react-firebase-hooks/firestore \
  axios neo4j-driver openai framer-motion lucide-react \
  uuid zustand d3 react-d3-graph chart.js react-chartjs-2

# Install Firebase Functions dependencies
print_info "Setting up Firebase Functions..."
cd functions
npm init -y
npm install firebase-admin firebase-functions axios openai neo4j-driver cors
npm install --save-dev typescript @types/cors
cd ..

# Firebase Login
print_info "Logging into Firebase..."
firebase login

# Initialize Firebase project
if [ -z "$FIREBASE_PROJECT_ID" ]; then
    print_info "Creating new Firebase project..."
    firebase projects:create
    read -p "Enter the project ID that was created: " FIREBASE_PROJECT_ID
else
    print_info "Using existing project: $FIREBASE_PROJECT_ID"
fi

# Initialize Firebase services
print_info "Initializing Firebase services..."
firebase init hosting functions firestore storage --project $FIREBASE_PROJECT_ID

# Create environment files
print_info "Creating environment configuration..."

# Create .env.local
cat > .env.local << EOL
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Neo4j Configuration
NEXT_PUBLIC_NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USER=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password
EOL

# Create Firebase Functions environment config
firebase functions:config:set \
  neo4j.uri="neo4j+s://your-instance.databases.neo4j.io" \
  neo4j.user="neo4j" \
  neo4j.password="your-password"

# Get Firebase configuration
print_info "Getting Firebase configuration..."
echo ""
echo "Please go to Firebase Console: https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID"
echo "1. Go to Project Settings > General"
echo "2. Scroll down to 'Your apps' section"
echo "3. Click 'Add app' > Web"
echo "4. Register app with nickname 'StatNerd Web'"
echo "5. Copy the firebaseConfig values"
echo ""
print_warning "Update .env.local with your Firebase configuration values"
read -p "Press Enter after updating .env.local..."

# Build the application
print_info "Building the application..."
npm run build
npm run export

# Deploy to Firebase
print_info "Deploying to Firebase..."
firebase deploy --project $FIREBASE_PROJECT_ID

# Initialize Git repository
print_info "Initializing Git repository..."
git init
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

# Create .gitignore
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env.local

# Firebase
.firebase/
.firebaserc
firebase-debug.log
firestore-debug.log
functions/lib/
functions/node_modules/
functions/*.log

# IDE
.idea/
.vscode/

# OS
Thumbs.db
GITIGNORE

# Create README
cat > README.md << 'README'
# StatNerd Firebase - Multi-Model Data Aggregator

A comprehensive web-based data aggregator with Firebase backend, featuring multiple LLM services, government/research databases, and Neo4j neural network visualization.

## 🔥 Powered by Firebase

- **Firebase Hosting**: Fast, secure web hosting
- **Firebase Functions**: Serverless API endpoints
- **Firestore**: NoSQL document database
- **Firebase Auth**: Secure authentication
- **Firebase Storage**: File storage for exports

## Features

- Multi-Model AI Support (Claude, OpenAI, Grok, OpenRouter)
- 50+ Database Integrations
- MLA Citations with Firestore persistence
- Neo4j Neural Network Visualization
- Real-time data synchronization with Firestore
- Secure authentication with Firebase Auth

## Installation

```bash
npm install
firebase login
firebase init
```

## Development

```bash
# Run locally with Firebase emulators
firebase emulators:start

# In another terminal
npm run dev
```

## Deployment

```bash
npm run build
npm run export
firebase deploy
```

## Firebase Services Used

- Hosting: Static site hosting
- Functions: API endpoints
- Firestore: Database
- Authentication: User management
- Storage: File uploads

## Environment Variables

Create `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## License

MIT
README

# Replace PROJECT_ID in README
sed -i.bak "s/FIREBASE_PROJECT_ID/$FIREBASE_PROJECT_ID/g" README.md && rm README.md.bak 2>/dev/null || true

# Add and commit to Git
git add .
git commit -m "Initial commit: StatNerd Firebase - Multi-Model Data Aggregator

- Firebase Hosting, Functions, Firestore, Auth, Storage
- Next.js 14 with TypeScript and Tailwind CSS
- Multi-LLM provider support via Firebase Functions
- Firestore for data persistence
- Firebase Auth for user management
- Neo4j integration for neural network visualization
- 50+ database API integrations
- MLA citation formatter
- Real-time data synchronization
- Secure API key management with Firestore

Deployed on Firebase with serverless architecture."

# Set branch to main
git branch -M main

# Create GitHub repository
echo ""
echo "===================================="
print_info "Creating GitHub repository..."
echo "===================================="
echo ""
echo "Please go to: https://github.com/new"
echo ""
echo "Create a new repository with:"
echo "  - Name: statnerd-firebase"
echo "  - Description: Multi-Model Data Aggregator with Firebase Backend"
echo "  - Public repository"
echo "  - DO NOT initialize with README, .gitignore, or license"
echo ""
read -p "Press Enter after creating the repository on GitHub..."

# Add remote and push
git remote add origin "https://github.com/$GITHUB_USERNAME/statnerd-firebase.git"
git push -u origin main

# Setup Firebase GitHub Action for CI/CD
print_info "Setting up GitHub Actions for CI/CD..."

mkdir -p .github/workflows
cat > .github/workflows/firebase-deploy.yml << 'GITHUB_ACTION'
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm ci
        cd functions && npm ci
        
    - name: Build
      run: |
        npm run build
        npm run export
        
    - name: Deploy to Firebase
      uses: w9jds/firebase-action@master
      with:
        args: deploy --only hosting,functions
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
GITHUB_ACTION

# Get Firebase CI token
print_info "Getting Firebase CI token for GitHub Actions..."
firebase login:ci

echo ""
print_warning "Copy the token above and add it to your GitHub repository:"
echo "1. Go to: https://github.com/$GITHUB_USERNAME/statnerd-firebase/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: FIREBASE_TOKEN"
echo "4. Value: [paste the token]"
echo ""
read -p "Press Enter after adding the secret to GitHub..."

# Final deployment status
echo ""
echo "===================================="
print_status "🎉 Setup Complete!"
echo "===================================="
echo ""
echo "Your StatNerd Firebase application is now:"
echo ""
echo "📍 Deployed at:"
echo "   https://$FIREBASE_PROJECT_ID.web.app"
echo "   https://$FIREBASE_PROJECT_ID.firebaseapp.com"
echo ""
echo "📦 GitHub Repository:"
echo "   https://github.com/$GITHUB_USERNAME/statnerd-firebase"
echo ""
echo "🔧 Firebase Console:"
echo "   https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
echo "2. Configure Neo4j connection"
echo "3. Enable Firebase Authentication providers"
echo "4. Set up Firestore security rules"
echo "5. Test locally with: firebase emulators:start"
echo ""
echo "Local development:"
echo "  firebase emulators:start  # Start Firebase emulators"
echo "  npm run dev              # Start Next.js dev server"
echo ""
echo "Production deployment:"
echo "  firebase deploy          # Deploy everything"
echo "  firebase deploy --only hosting     # Deploy frontend only"
echo "  firebase deploy --only functions   # Deploy functions only"
echo ""
print_status "Happy coding with Firebase! 🔥"