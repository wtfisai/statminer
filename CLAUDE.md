# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: StatMiner/StatNerd - Multi-Model Data Aggregator

A comprehensive web-based data aggregator chatbot that provides statistics without commentary, integrating multiple LLM services, government/research databases, and Neo4j neural network visualization.

## Commands

### Development
```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Build for production
npm run start      # Run production build locally
npm run lint       # Run linting
```

### Firebase Deployment (if using Firebase)
```bash
npm run firebase:serve          # Start Firebase emulators
npm run firebase:deploy         # Build and deploy everything
npm run firebase:deploy:hosting # Deploy only hosting
npm run firebase:deploy:functions # Deploy only functions
npm run functions:logs          # View function logs
```

### Vercel Deployment
```bash
vercel         # Deploy to Vercel (requires CLI: npm i -g vercel)
vercel --prod  # Deploy to production
```

### Testing
No test framework currently configured. When adding tests, update this section with the appropriate commands.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Neo4j (graph database for neural network visualization)
- **LLM Providers**: OpenAI, Anthropic Claude, OpenRouter, Grok, Requesty
- **State Management**: Zustand
- **UI Components**: Radix UI primitives with custom styling
- **Visualization**: D3.js, Chart.js, react-d3-graph for network graphs
- **Deployment**: Vercel (primary) or Firebase (alternative)

### Core Modules

#### LLM Provider Integration (`src/lib/llm-providers/`)
- Unified interface for multiple AI models
- Parallel query execution across models
- Response comparison and aggregation
- Streaming support where available

#### Database Connectors (`src/lib/database-connectors/`)
- 50+ pre-configured API integrations
- Categories: government, academic, commercial, healthcare, financial
- Automatic rate limiting and retry logic
- Caching with Vercel KV

#### Neo4j Integration (`src/lib/neo4j-client/`)
- CRUD operations for neural network datasets
- Cypher query support
- Graph visualization data preparation
- Dataset versioning and metadata

#### Citation System (`src/lib/citation-formatter/`)
- MLA 9th edition formatting
- Automatic citation generation from API responses
- Works Cited page compilation
- Support for web, journal, book, database, and API sources

### API Routes Structure
- `/api/chat` - Multi-model chat endpoint with streaming
- `/api/neo4j/*` - Neo4j database operations
- `/api/databases/[id]/query` - Dynamic database querying
- `/api/citations/format` - Citation formatting service
- `/api/visualizations/generate` - Data visualization generation

## Environment Configuration

Required environment variables (create `.env.local`):
```bash
# Neo4j (Required)
NEO4J_URI=neo4j+s://[instance].databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=[password]

# LLM Services (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# NextAuth (Required for production)
NEXTAUTH_URL=https://[your-app].vercel.app
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]

# Government/Academic APIs (optional)
CENSUS_API_KEY=...
BLS_API_KEY=...
FRED_API_KEY=...
```

## Key Design Patterns

1. **Parallel Model Queries**: All LLM requests are executed concurrently using Promise.all
2. **Type Safety**: Comprehensive TypeScript interfaces in `src/types/index.ts`
3. **Error Boundaries**: Each API route has try-catch with detailed error responses
4. **Rate Limiting**: Built-in rate limiting for external API calls
5. **Caching Strategy**: Vercel KV for API responses, localStorage for user preferences

## UI/UX Guidelines

- **Theme**: Dark mode with glass morphism effects
- **Colors**: Cyan/blue gradient accents (#06b6d4 to #3b82f6)
- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design approach

## Database API Configurations

Pre-configured in `src/types/index.ts` as `DATABASE_CONFIGS`:
- Government: Census, BLS, FRED, CDC, NOAA, etc.
- Academic: PubMed, arXiv, CrossRef, Semantic Scholar
- Financial: World Bank, IMF, Yahoo Finance
- International: UN Data, Eurostat, OECD

## Security Considerations

- API keys stored in environment variables only
- No client-side exposure of sensitive credentials
- CORS properly configured for API routes
- Input validation on all user inputs
- SQL injection prevention in Cypher queries

## Common Development Tasks

### Adding a New LLM Provider
1. Add provider configuration to `src/lib/llm-providers/index.ts`
2. Implement provider-specific API client
3. Add to model selection UI in settings panel
4. Update TypeScript types in `src/types/index.ts`

### Adding a New Database API
1. Add configuration to `DATABASE_CONFIGS` in `src/types/index.ts`
2. Create connector in `src/lib/database-connectors/`
3. Add to database panel UI
4. Document API requirements and rate limits

### Modifying Neo4j Schema
1. Update dataset interfaces in `src/types/index.ts`
2. Modify CRUD operations in `src/lib/neo4j-client/`
3. Update visualization components if needed
4. Test with existing datasets for compatibility