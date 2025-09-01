# Data Aggregator Chatbot - Deployment Guide

## Overview

A comprehensive web-based data aggregator chatbot that provides statistics without commentary, integrating multiple LLM services, government/research databases, and Neo4j neural network visualization.

## Features

- ✅ **Multi-Model Support**: Claude, OpenAI, Grok, OpenRouter, Requesty.ai
- ✅ **Parallel Model Queries**: Send queries to multiple models simultaneously
- ✅ **Model Comparison Panel**: Compare responses from different models
- ✅ **Database Integration**: 50+ government, academic, and research APIs
- ✅ **MLA Citations**: Automatic citation formatting and Works Cited generation
- ✅ **Neo4j Neural Network**: Visual dataset creation and relationship mapping
- ✅ **Data Visualizations**: Interactive charts and infographics
- ✅ **API Key Management**: Secure dashboard for managing service credentials

## Prerequisites

1. **Node.js** 18.x or higher
2. **Neo4j Database** (Cloud or Self-hosted)
3. **Vercel Account** (for deployment)
4. **API Keys** for desired services

## Setup Instructions

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/data-aggregator-app.git
cd data-aggregator-app

# Install dependencies
npm install
```

### 2. Neo4j Setup

#### Option A: Neo4j Aura (Cloud - Recommended)
1. Sign up at [Neo4j Aura](https://neo4j.com/cloud/aura/)
2. Create a free instance
3. Save your connection details:
   - Connection URI
   - Username (usually 'neo4j')
   - Password

#### Option B: Self-hosted Neo4j
```bash
# Using Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/yourpassword \
  neo4j:latest
```

### 3. Environment Configuration

Create a `.env.local` file:

```bash
# Neo4j Configuration
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password

# LLM API Keys (add the ones you have)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
GROK_API_KEY=xai-...
REQUESTY_API_KEY=req-...

# Government APIs (optional)
BLS_API_KEY=your-bls-key
CENSUS_API_KEY=your-census-key
FRED_API_KEY=your-fred-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

### 4. Local Development

```bash
# Run development server
npm run dev

# Open browser
http://localhost:3000
```

## Deployment to Vercel

### Step 1: Prepare for Deployment

```bash
# Build the project locally to test
npm run build

# Run production build locally
npm start
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: Select your account
# - Link to existing project: N
# - Project name: data-aggregator-app
# - Directory: ./
# - Override settings: N
```

#### Option B: Using GitHub Integration

1. Push code to GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Deploy

### Step 3: Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add all variables from `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEO4J_URI` | Neo4j connection URI | ✅ |
| `NEO4J_USER` | Neo4j username | ✅ |
| `NEO4J_PASSWORD` | Neo4j password | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `ANTHROPIC_API_KEY` | Anthropic API key | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API key | Optional |
| `NEXTAUTH_URL` | Your Vercel app URL | ✅ |
| `NEXTAUTH_SECRET` | Random secret for auth | ✅ |

### Step 4: Post-Deployment Setup

1. **Update NEXTAUTH_URL**:
   - After deployment, update `NEXTAUTH_URL` to your Vercel URL
   - Example: `https://data-aggregator-app.vercel.app`

2. **Configure Neo4j Whitelist** (if using Aura):
   - Add Vercel's IP ranges to Neo4j Aura whitelist
   - Or enable "Allow connections from anywhere" (less secure)

3. **Test the deployment**:
   - Visit your Vercel URL
   - Test API key configuration
   - Verify database connections

## API Key Setup Guide

### Government APIs

1. **Census API**: [Get key here](https://api.census.gov/data/key_signup.html)
2. **BLS API**: [Register here](https://www.bls.gov/developers/home.htm)
3. **FRED API**: [Get key here](https://fred.stlouisfed.org/docs/api/api_key.html)

### Academic APIs

1. **PubMed**: [Get key here](https://www.ncbi.nlm.nih.gov/account/settings/)
2. **Semantic Scholar**: [Get key here](https://www.semanticscholar.org/product/api)

### LLM Services

1. **OpenAI**: [API Keys](https://platform.openai.com/api-keys)
2. **Anthropic**: [Console](https://console.anthropic.com/)
3. **OpenRouter**: [Dashboard](https://openrouter.ai/keys)

## Usage

### Initial Setup
1. Navigate to Settings → API Keys
2. Enter your API keys for desired services
3. Enable database connections you want to use

### Creating Queries
1. Select models from the model selector
2. Type your query requesting data/statistics
3. View parallel responses from all selected models
4. Compare responses in the comparison panel

### Neural Network Datasets
1. Click the Brain icon to open neural network view
2. Create new dataset with categorized data
3. Visualize relationships between data points
4. Export or query datasets using Cypher

## Troubleshooting

### Common Issues

**Neo4j Connection Failed**
- Verify connection URI format
- Check username/password
- Ensure IP whitelist includes Vercel

**API Keys Not Working**
- Verify key format and validity
- Check rate limits
- Ensure proper environment variable names

**Build Failures**
- Clear `.next` folder and rebuild
- Check Node.js version compatibility
- Verify all dependencies installed

## Project Structure

```
data-aggregator-app/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Core libraries
│   │   ├── llm-providers/
│   │   ├── database-connectors/
│   │   ├── neo4j-client/
│   │   └── citation-formatter/
│   └── types/            # TypeScript definitions
├── public/               # Static assets
├── server/               # Backend services
└── vercel.json          # Vercel configuration
```

## Additional Information

### Database API Catalog
The application includes pre-configured connections to:
- 12+ Federal Government APIs
- 8+ International Government APIs
- 10+ Academic Research Services
- 20+ Commercial Data Providers

### Citation Format
All citations follow MLA 9th Edition guidelines with automatic formatting for:
- Web sources
- Journal articles
- Database queries
- API responses

### Support & Documentation

- **Issues**: GitHub Issues
- **Documentation**: `/docs` folder
- **API Reference**: `/docs/api-reference.md`

## License

MIT License - See LICENSE file for details

## Works Cited

Bureau of Labor Statistics. "BLS API Documentation." *U.S. Bureau of Labor Statistics*, 2025, www.bls.gov/developers/. Accessed 31 Aug 2025.

Neo4j, Inc. "Neo4j Graph Database Platform." *Neo4j*, 2025, neo4j.com. Accessed 31 Aug 2025.

Vercel Inc. "Vercel Documentation." *Vercel*, 2025, vercel.com/docs. Accessed 31 Aug 2025.