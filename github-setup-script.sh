#!/bin/bash

# GitHub Repository Setup Script for StatNerd
# ============================================

echo "🚀 StatNerd - GitHub Repository Setup"
echo "======================================"
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

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if GitHub CLI is installed (optional but helpful)
if command -v gh &> /dev/null; then
    print_status "GitHub CLI detected"
    USE_GH_CLI=true
else
    print_warning "GitHub CLI not found. You'll need to create the repo manually on GitHub.com"
    USE_GH_CLI=false
fi

# Get GitHub username
echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    print_error "GitHub username is required"
    exit 1
fi

# Initialize git repository
echo ""
print_info "Initializing local Git repository..."
git init
print_status "Git repository initialized"

# Configure git user (if not already configured)
if [ -z "$(git config user.name)" ]; then
    echo ""
    read -p "Enter your name for Git commits: " GIT_NAME
    git config user.name "$GIT_NAME"
    print_status "Git user name configured"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "Enter your email for Git commits: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
    print_status "Git user email configured"
fi

# Create .gitignore file
print_info "Creating .gitignore file..."
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
/.pnp
.pnp.js
.yarn/install-state.gz

# Testing
/coverage
/.nyc_output

# Next.js
/.next/
/out/

# Production
/build
/dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
Thumbs.db

# Neo4j
*.dump

# Logs
logs/
*.log

# Cache
.cache/
.parcel-cache/

# Temporary files
tmp/
temp/
EOL
print_status ".gitignore created"

# Create README if it doesn't exist
if [ ! -f "README.md" ]; then
    print_info "Creating README.md..."
    cat > README.md << 'EOL'
# StatNerd - Multi-Model Data Aggregator

A comprehensive web-based data aggregator chatbot that provides statistics without commentary, integrating multiple LLM services, government/research databases, and Neo4j neural network visualization.

## 🚀 Features

- **Multi-Model AI Support**: Query Claude, OpenAI, Grok, OpenRouter, and Requesty.ai simultaneously
- **Parallel Model Comparison**: Compare responses from different models side-by-side
- **50+ Database Integrations**: Government, academic, and research APIs
- **MLA Citations**: Automatic citation formatting and Works Cited generation
- **Neo4j Neural Network**: Visual dataset creation and relationship mapping
- **Data Visualizations**: Interactive charts and infographics
- **Secure API Management**: Dashboard for managing service credentials

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Neo4j Graph Database
- **LLM Providers**: OpenAI, Anthropic, OpenRouter, xAI, Requesty
- **Deployment**: Vercel
- **Data Sources**: 50+ APIs including Census, BLS, FRED, PubMed, CrossRef

## 📋 Prerequisites

- Node.js 18.x or higher
- Neo4j Database (Cloud or Self-hosted)
- API Keys for desired LLM services

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/GITHUB_USERNAME/statnerd.git
cd statnerd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys and Neo4j credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GITHUB_USERNAME/statnerd)

Or deploy manually:
```bash
npx vercel
```

## 📊 Available Data Sources

### Government Databases
- US Census Bureau
- Bureau of Labor Statistics
- Federal Reserve (FRED)
- NOAA Weather Service
- CDC Open Data
- SEC EDGAR

### Academic & Research
- PubMed/NCBI
- CrossRef
- arXiv
- Semantic Scholar
- ClinicalTrials.gov

### International Organizations
- World Bank
- WHO
- OECD
- IMF
- Eurostat

## 🔑 API Configuration

Add your API keys in the Settings panel or via environment variables:

- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `NEO4J_URI` - Neo4j database URI
- `NEO4J_USER` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Database Catalog](./docs/databases.md)
- [Citation Guide](./docs/citations.md)
- [Development Guide](./docs/development.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- OpenAI, Anthropic, and other LLM providers
- Neo4j for graph database technology
- All public data API providers
- Vercel for hosting platform

## 📞 Support

For issues and questions, please use [GitHub Issues](https://github.com/GITHUB_USERNAME/statnerd/issues)

---

Built with ❤️ for data-driven decision making
EOL
    print_status "README.md created"
fi

# Create LICENSE file
print_info "Creating MIT LICENSE file..."
cat > LICENSE << EOL
MIT License

Copyright (c) $(date +%Y) $GITHUB_USERNAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOL
print_status "LICENSE file created"

# Add all files to git
print_info "Adding files to Git..."
git add .
print_status "Files added to staging"

# Create initial commit
print_info "Creating initial commit..."
git commit -m "Initial commit: StatNerd - Multi-Model Data Aggregator

- Next.js 14 with TypeScript and Tailwind CSS
- Multi-LLM provider support (OpenAI, Anthropic, OpenRouter, etc.)
- Neo4j integration for neural network visualization
- 50+ database API integrations
- MLA citation formatter
- Real-time data aggregation and visualization
- Comparison panel for multi-model responses
- Secure API key management
- Dark theme with glass morphism UI"

print_status "Initial commit created"

# Set main branch
git branch -M main
print_status "Branch set to 'main'"

# Create GitHub repository
echo ""
if [ "$USE_GH_CLI" = true ]; then
    print_info "Creating GitHub repository using GitHub CLI..."
    
    # Check if already logged in
    if ! gh auth status &> /dev/null; then
        print_warning "You need to authenticate with GitHub CLI"
        gh auth login
    fi
    
    # Create repository
    gh repo create statnerd \
        --public \
        --description "Multi-Model Data Aggregator with Neural Network Visualization" \
        --source=. \
        --remote=origin \
        --push
    
    if [ $? -eq 0 ]; then
        print_status "Repository created and pushed successfully!"
        echo ""
        print_info "Your repository is now available at:"
        echo -e "${BLUE}https://github.com/$GITHUB_USERNAME/statnerd${NC}"
    else
        print_error "Failed to create repository with GitHub CLI"
        echo ""
        print_info "Please create the repository manually on GitHub.com"
    fi
else
    # Manual repository creation instructions
    echo ""
    print_info "Please follow these steps to create your GitHub repository:"
    echo ""
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: statnerd"
    echo "3. Description: Multi-Model Data Aggregator with Neural Network Visualization"
    echo "4. Set as Public"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    print_warning "Press Enter after creating the repository on GitHub..."
    read
    
    # Add remote origin
    print_info "Adding remote origin..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/statnerd.git"
    
    if [ $? -eq 0 ]; then
        print_status "Remote origin added"
    else
        print_warning "Remote might already exist, attempting to update..."
        git remote set-url origin "https://github.com/$GITHUB_USERNAME/statnerd.git"
    fi
    
    # Push to GitHub
    print_info "Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        print_status "Successfully pushed to GitHub!"
        echo ""
        print_info "Your repository is now available at:"
        echo -e "${BLUE}https://github.com/$GITHUB_USERNAME/statnerd${NC}"
    else
        print_error "Failed to push. Please check your credentials and try:"
        echo "git push -u origin main"
    fi
fi

# Final instructions
echo ""
echo "======================================"
print_status "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Visit your repository: https://github.com/$GITHUB_USERNAME/statnerd"
echo "2. Add a description and topics on GitHub"
echo "3. Set up GitHub Actions for CI/CD (optional)"
echo "4. Configure Vercel deployment from GitHub"
echo "5. Add environment variables in Vercel dashboard"
echo ""
echo "To clone your repository elsewhere:"
echo -e "${BLUE}git clone https://github.com/$GITHUB_USERNAME/statnerd.git${NC}"
echo ""
echo "To deploy to Vercel:"
echo -e "${BLUE}npx vercel${NC}"
echo ""
print_status "Happy coding! 🚀"