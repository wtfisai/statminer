# StatNerd - GitHub Repository Setup Commands
# =============================================

# Step 1: Initialize your project directory
mkdir statnerd
cd statnerd

# Step 2: Initialize Next.js project
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint

# Step 3: Copy all the created files into their proper locations
# (Copy all the artifacts we created into the project structure)

# Step 4: Install all dependencies
npm install @neo4j/graphql @radix-ui/react-accordion @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover \
  @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot \
  @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast \
  @tanstack/react-query @vercel/analytics @vercel/kv ai axios \
  chart.js class-variance-authority clsx d3 date-fns framer-motion \
  lucide-react neo4j-driver next-auth openai react-chartjs-2 \
  react-d3-graph react-hook-form react-markdown recharts \
  tailwind-merge tailwindcss-animate uuid zod zustand

# Step 5: Initialize Git repository
git init

# Step 6: Configure Git (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Step 7: Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js
.yarn/install-state.gz

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.idea/
.vscode/

# Neo4j
*.dump
EOF

# Step 8: Create .env.example
cat > .env.example << 'EOF'
# Neo4j Database
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
GROK_API_KEY=xai-...
REQUESTY_API_KEY=req-...

# Government API Keys (optional)
BLS_API_KEY=
CENSUS_API_KEY=
FRED_API_KEY=

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
EOF

# Step 9: Add all files to Git
git add .

# Step 10: Create initial commit
git commit -m "Initial commit: StatNerd - Multi-Model Data Aggregator

Features:
- Multi-LLM provider support (OpenAI, Anthropic, OpenRouter, Grok, Requesty)
- Neo4j integration for neural network visualization
- 50+ database API integrations (government, academic, commercial)
- MLA citation formatter with automatic Works Cited generation
- Real-time data aggregation and visualization
- Parallel model querying with comparison panel
- Secure API key management dashboard
- Dark theme with glass morphism UI
- TypeScript, Next.js 14, Tailwind CSS

Data Sources:
- Federal Government APIs (Census, BLS, FRED, NOAA, CDC, SEC)
- International Organizations (World Bank, WHO, OECD, IMF)
- Academic Services (PubMed, CrossRef, arXiv, Semantic Scholar)
- Commercial providers with free tiers

Built for data-driven decision making without commentary bias."

# Step 11: Rename branch to main
git branch -M main

# Step 12: Create repository on GitHub
# Go to https://github.com/new
# - Repository name: statnerd
# - Description: Multi-Model Data Aggregator with Neural Network Visualization
# - Public repository
# - DO NOT initialize with README, .gitignore, or license

# Step 13: Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/statnerd.git

# Step 14: Push to GitHub
git push -u origin main

# =============================================
# Alternative: Using GitHub CLI (if installed)
# =============================================

# Install GitHub CLI (if not installed)
# macOS: brew install gh
# Windows: winget install --id GitHub.cli
# Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authenticate with GitHub
gh auth login

# Create repository and push in one command
gh repo create statnerd \
  --public \
  --description "Multi-Model Data Aggregator with Neural Network Visualization" \
  --source=. \
  --remote=origin \
  --push

# =============================================
# Post-Setup: Additional Git Commands
# =============================================

# Check repository status
git status

# View commit history
git log --oneline

# Add repository topics on GitHub (via web or CLI)
gh repo edit --add-topic nextjs,typescript,neo4j,data-aggregation,llm,api

# Create development branch
git checkout -b development
git push -u origin development

# Switch back to main
git checkout main

# =============================================
# Vercel Deployment from GitHub
# =============================================

# Option 1: Deploy via Vercel CLI
npx vercel --prod

# Option 2: Import from GitHub on Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Import Git Repository
# 3. Select statnerd
# 4. Configure environment variables
# 5. Deploy

# =============================================
# Useful Git Aliases
# =============================================

git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.ps push
git config --global alias.pl pull
git config --global alias.lg "log --oneline --graph --decorate"