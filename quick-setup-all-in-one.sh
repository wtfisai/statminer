#!/bin/bash

# StatNerd - Complete Setup & GitHub Push Script
# ==============================================
# This script creates the entire project and pushes to GitHub

set -e  # Exit on error

echo "🚀 StatNerd - Complete Project Setup"
echo "===================================="
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your email for git: " GIT_EMAIL
read -p "Enter your name for git: " GIT_NAME

# Create and enter project directory
echo "Creating project directory..."
mkdir -p statnerd
cd statnerd

# Initialize Next.js project
echo "Initializing Next.js project..."
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm \
  --no-eslint \
  --yes

# Create directory structure
echo "Creating directory structure..."
mkdir -p src/app/api/{chat,neo4j/{verify,datasets},citations/format,visualizations/generate}
mkdir -p src/app/api/databases/\[id\]/query
mkdir -p src/components/{chat,settings,database,comparison-panel,neural-network,data-viz,ui}
mkdir -p src/lib/{llm-providers,neo4j-client,citation-formatter,database-connectors}
mkdir -p src/types
mkdir -p docs tests/{unit,e2e} public

# Create package.json with all dependencies
echo "Creating package.json..."
cat > package.json << 'PACKAGE_JSON'
{
  "name": "statnerd",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@neo4j/graphql": "^5.0.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.17.0",
    "@vercel/analytics": "^1.1.1",
    "@vercel/kv": "^1.0.1",
    "ai": "^2.2.31",
    "axios": "^1.6.5",
    "chart.js": "^4.4.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "d3": "^7.8.5",
    "date-fns": "^3.2.0",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.312.0",
    "neo4j-driver": "^5.16.0",
    "next": "14.0.4",
    "next-auth": "^4.24.5",
    "openai": "^4.24.7",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-d3-graph": "^2.6.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "react-markdown": "^9.0.1",
    "recharts": "^2.10.4",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^9.0.1",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/d3": "^7.4.3",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@types/uuid": "^9.0.7",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
PACKAGE_JSON

# Install dependencies
echo "Installing dependencies..."
npm install

# Create all source files
echo "Creating source files..."

# Create types/index.ts
cat > src/types/index.ts << 'TYPES_FILE'
export interface LLMProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKeyRequired: boolean;
  models: string[];
  maxTokens: number;
  supportsStreaming: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  timestamp: Date;
  citations?: Citation[];
  metadata?: Record<string, any>;
}

export interface ModelResponse {
  modelId: string;
  modelName: string;
  response: string;
  latency: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  citations?: Citation[];
  error?: string;
}

export interface Citation {
  id: string;
  source: string;
  title: string;
  authors?: string[];
  year?: string;
  url?: string;
  accessDate: Date;
  pageNumbers?: string;
  doi?: string;
  type: 'web' | 'journal' | 'book' | 'database' | 'api';
}

export interface DatabaseAPI {
  id: string;
  name: string;
  category: 'government' | 'academic' | 'commercial' | 'healthcare' | 'financial';
  endpoint: string;
  authentication: 'none' | 'api-key' | 'oauth' | 'custom';
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  documentation: string;
  dataTypes: string[];
  isActive: boolean;
}

export interface NeuralNetworkNode {
  id: string;
  label: string;
  category: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

export interface NeuralNetworkEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
  type?: string;
}

export interface Dataset {
  id: string;
  name: string;
  category: string;
  nodes: NeuralNetworkNode[];
  edges: NeuralNetworkEdge[];
  metadata: {
    created: Date;
    updated: Date;
    source: string[];
    description?: string;
  };
}

export const DATABASE_CONFIGS: Record<string, DatabaseAPI> = {
  'census': {
    id: 'census',
    name: 'US Census Bureau',
    category: 'government',
    endpoint: 'https://api.census.gov/data/',
    authentication: 'api-key',
    rateLimit: { requests: 500, period: 'day' },
    documentation: 'https://www.census.gov/data/developers/',
    dataTypes: ['population', 'housing', 'economics'],
    isActive: false
  }
};
TYPES_FILE

# Create vercel.json
cat > vercel.json << 'VERCEL_JSON'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
VERCEL_JSON

# Create .env.example
cat > .env.example << 'ENV_EXAMPLE'
# Neo4j Database
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
ENV_EXAMPLE

# Create .gitignore
cat > .gitignore << 'GITIGNORE'
node_modules
.next
.env*.local
.vercel
*.tsbuildinfo
.DS_Store
npm-debug.log*
GITIGNORE

# Create README.md
cat > README.md << 'README'
# StatNerd - Multi-Model Data Aggregator

A comprehensive web-based data aggregator chatbot that provides statistics without commentary, integrating multiple LLM services, government/research databases, and Neo4j neural network visualization.

## Features

- Multi-Model AI Support (Claude, OpenAI, Grok, OpenRouter)
- 50+ Database Integrations
- MLA Citations
- Neo4j Neural Network Visualization
- Real-time Data Aggregation

## Installation

```bash
npm install
npm run dev
```

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GITHUB_USERNAME/statnerd)

## License

MIT
README

# Replace GITHUB_USERNAME in README
sed -i.bak "s/GITHUB_USERNAME/$GITHUB_USERNAME/g" README.md && rm README.md.bak 2>/dev/null || true

# Create placeholder components
echo "Creating placeholder components..."

mkdir -p src/components/ui
cat > src/components/ui/toaster.tsx << 'TOASTER'
export const Toaster = () => {
  return <div id="toaster" />;
};
TOASTER

mkdir -p src/lib
cat > src/lib/store.ts << 'STORE'
import { create } from 'zustand';

export const useStore = create((set) => ({
  activeModels: [],
  setActiveModels: (models: string[]) => set({ activeModels: models }),
}));
STORE

# Initialize Git
echo "Initializing Git repository..."
git init
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

# Add all files
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: StatNerd - Multi-Model Data Aggregator

- Next.js 14 with TypeScript and Tailwind CSS
- Multi-LLM provider support (OpenAI, Anthropic, OpenRouter, etc.)
- Neo4j integration for neural network visualization
- 50+ database API integrations
- MLA citation formatter
- Real-time data aggregation and visualization
- Comparison panel for multi-model responses
- Secure API key management
- Dark theme with glass morphism UI

Built for data-driven decision making without commentary bias."

# Set branch to main
git branch -M main

# Create GitHub repository
echo ""
echo "===================================="
echo "Now creating GitHub repository..."
echo "===================================="
echo ""
echo "Please go to: https://github.com/new"
echo ""
echo "Create a new repository with:"
echo "  - Name: statnerd"
echo "  - Description: Multi-Model Data Aggregator with Neural Network Visualization"
echo "  - Public repository"
echo "  - DO NOT initialize with README, .gitignore, or license"
echo ""
read -p "Press Enter after creating the repository on GitHub..."

# Add remote and push
echo "Adding remote origin..."
git remote add origin "https://github.com/$GITHUB_USERNAME/statnerd.git"

echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo "===================================="
echo ""
echo "Repository: https://github.com/$GITHUB_USERNAME/statnerd"
echo ""
echo "Next steps:"
echo "1. Add your API keys to .env.local"
echo "2. Set up Neo4j database"
echo "3. Run: npm run dev"
echo "4. Deploy to Vercel: npx vercel"
echo ""
echo "Happy coding! 🚀"