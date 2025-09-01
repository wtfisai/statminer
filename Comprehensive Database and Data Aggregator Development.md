# Comprehensive Database API Catalog for Data Aggregator Development

A complete developer reference guide covering government databases, academic services, and commercial data providers with API access details, authentication requirements, and pricing information.

## Part 1: Government Databases - Federal Level

### US Federal Government APIs

| Database/Service | Specialty | API Endpoint | Authentication | Rate Limits | Data Formats | Key Data Types | Documentation |
|-----------------|-----------|--------------|----------------|-------------|--------------|----------------|--------------|
| **api.data.gov** | Federal API Gateway | `https://api.data.gov/` | API key (free) | 1,000 req/hour | JSON, XML, CSV | 450+ APIs from 25+ agencies | https://api.data.gov/docs/ |
| **Bureau of Labor Statistics** | Employment & Economics | `https://api.bls.gov/publicAPI/v2/` | Optional registration | 500 queries/day (v2) | JSON, Excel | Employment, wages, inflation, CPI | https://www.bls.gov/developers/ |
| **US Census Bureau** | Demographics | `https://api.census.gov/data/` | API key recommended | 500 req/day (no key) | JSON, XML | Population, housing, economics, ACS | https://www.census.gov/data/developers/ |
| **NOAA Weather Service** | Weather & Climate | `https://api.weather.gov/` | None required | Generous limits | JSON-LD | Forecasts, alerts, observations | https://www.weather.gov/documentation/services-web-api |
| **CDC Open Data** | Health Statistics | `https://data.cdc.gov/api/` | Optional API key | 1,000 req/hour | JSON, CSV, XML | Disease surveillance, mortality | https://open.cdc.gov/apis.html |
| **College Scorecard** | Higher Education | `https://api.data.gov/ed/collegescorecard/v1/` | API key required | Standard data.gov limits | JSON | College costs, outcomes, debt | Via api.data.gov |
| **FBI Crime Data** | Crime Statistics | `https://api.usa.gov/crime/fbi/sapi/` | None required | Not specified | JSON, CSV | UCR, NIBRS crime data | https://cde.ucr.cjis.gov/LATEST/webapp/#/pages/docApi |
| **USDA FoodData Central** | Nutrition | `https://api.nal.usda.gov/fdc/v1/` | API key required | 1,000 req/hour | JSON | Food composition, nutrition | https://fdc.nal.usda.gov/api-guide/ |
| **Energy Information Admin** | Energy Data | `https://api.eia.gov/v2/` | API key required | Reasonable use | JSON | Energy production, consumption, prices | https://www.eia.gov/opendata/documentation.php |
| **Federal Reserve (FRED)** | Economic Data | `https://api.stlouisfed.org/fred/` | API key required | Reasonable use | JSON, XML | 820,000+ economic time series | https://fred.stlouisfed.org/docs/api/fred/ |
| **SEC EDGAR** | Corporate Filings | `https://data.sec.gov/` | None (User-Agent required) | Fair access policy | JSON | Company filings, XBRL data | https://www.sec.gov/search-filings/edgar-application-programming-interfaces |
| **Treasury Fiscal Data** | Government Finance | `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/` | None required | Reasonable use | JSON | Spending, debt, revenue | https://fiscaldata.treasury.gov/api-documentation/ |

## Part 2: State & International Government Databases

### Major State Data Portals

| State/Region | Platform | API Type | Authentication | Data Coverage | Documentation |
|-------------|----------|----------|----------------|---------------|--------------|
| **California** | data.ca.gov | CKAN REST API | None for basic | Environmental, health, transport | CKAN documentation |
| **New York** | data.ny.gov | Socrata SODA API | App tokens recommended | 1,400+ datasets, COVID-19, education | https://data.ny.gov/developers |
| **Texas** | data.texas.gov | Tyler Data Platform | Sign-in for full access | Demographics, health, resources | Portal documentation |
| **Florida** | geodata.floridagio.gov | ArcGIS APIs | Varies by portal | Geospatial, environmental | Portal-specific docs |
| **Illinois** | data.illinois.gov | Tyler Data Platform | Sign-in for features | Multi-agency datasets | Portal documentation |

### International Government APIs

| Country/Organization | API Endpoint | Authentication | Rate Limits | Data Types | Documentation |
|---------------------|--------------|----------------|-------------|------------|--------------|
| **EU Eurostat** | `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/` | None required | Updates 2x daily | Economic, population, trade | https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access |
| **UK ONS** | `https://api.beta.ons.gov.uk/v1` | None required | 120 req/10 sec | Economic, population, health | https://developer.ons.gov.uk/ |
| **Statistics Canada** | `https://www150.statcan.gc.ca/t1/wds/rest/` | Optional API key | Reasonable use | Census, economic indicators | https://www.statcan.gc.ca/en/developers |
| **Australia ABS** | `https://data.api.abs.gov.au/rest/data/` | Optional (recommended) | Production limits | Economic, social, census | OpenAPI documentation |
| **World Bank** | `https://api.worldbank.org/v2/` | None required | Reasonable use | 16,000+ development indicators | https://datahelpdesk.worldbank.org/knowledgebase/topics/125589 |
| **WHO GHO** | `https://ghoapi.azureedge.net/api/` | None required | Reasonable use | Global health statistics | https://www.who.int/data/gho/info/gho-odata-api |
| **OECD** | `https://data.oecd.org/api/` | None required | No specific limits | Economic indicators, education | https://data.oecd.org/api/ |
| **IMF** | `https://data.imf.org/` | Beta account for some | Throttling applied | Financial statistics, exchange rates | https://data.imf.org/en/Resource-Pages/IMF-API |

## Part 3: Academic & Research Data Services

| Service | Specialty | API Endpoint | Authentication | Rate Limits | Cost | Documentation |
|---------|-----------|--------------|----------------|-------------|------|--------------|
| **PubMed/NCBI** | Biomedical Literature | `eutils.ncbi.nlm.nih.gov/entrez/eutils/` | Optional API key | 3 req/sec with key | Free | https://www.ncbi.nlm.nih.gov/home/develop/api/ |
| **CrossRef** | Scholarly Metadata | `api.crossref.org/` | None (mailto recommended) | Dynamic limiting | Free | https://www.crossref.org/documentation/retrieve-metadata/rest-api/ |
| **arXiv** | Preprints | `export.arxiv.org/api/query` | None required | No explicit limits | Free | https://info.arxiv.org/help/api/ |
| **Semantic Scholar** | AI-powered Search | `api.semanticscholar.org/` | API key recommended | 1000 req/sec without key | Free | https://www.semanticscholar.org/product/api |
| **Zenodo** | Research Repository | `zenodo.org/api/` | Token for uploads | Not specified | Free (50GB limit) | Zenodo developers section |
| **Harvard Dataverse** | Social Science Data | `dataverse.harvard.edu/api/` | API key for some ops | Not specified | Free (1TB max) | Harvard Dataverse guides |
| **GenBank** | Genetic Sequences | `eutils.ncbi.nlm.nih.gov/entrez/eutils/` | Optional API key | 3 req/sec with key | Free | NCBI documentation |
| **RCSB PDB** | Protein Structures | `data.rcsb.org/rest/v1/` | None required | Not specified | Free | RCSB PDB website |
| **ClinicalTrials.gov** | Clinical Trials | `clinicaltrials.gov/api/v2/` | None required | Not specified | Free | ClinicalTrials.gov docs |
| **ERIC** | Education Research | `api.ies.ed.gov/eric/` | None required | Not specified | Free | ERIC website |

## Part 4: Commercial Financial & Economic Data APIs

### Tier 1: Enterprise Solutions ($20,000+ annually)

| Service | Specialty | Authentication | Pricing | Rate Limits | Unique Features | Documentation |
|---------|-----------|----------------|---------|-------------|-----------------|--------------|
| **Bloomberg Terminal** | All asset classes | Terminal required | $24,000-$27,660/year | Daily/monthly limits | Real-time data, analytics | https://www.bloomberg.com/professional/support/api-library/ |
| **Refinitiv Workspace** | Global financial | Desktop/Platform session | $12,000-$27,660/year | Subscription-based | Reuters news, CodeBook | https://developers.refinitiv.com/ |
| **S&P Global** | Credit analytics | OAuth 2.0 | Enterprise pricing | Custom limits | Credit ratings, fixed income | Via FactSet portal |
| **FactSet** | Portfolio analytics | OAuth, API keys | $12,000+/year | Custom headers | Risk management tools | https://developer.factset.com/ |

### Tier 2: Professional Services ($1,000-$10,000/year)

| Service | Specialty | Authentication | Pricing Tiers | Rate Limits | Data Coverage | Documentation |
|---------|-----------|----------------|---------------|-------------|---------------|--------------|
| **Intrinio** | Institutional-grade | API key | $250-$2,400/month | Tier-based | US/global equities, options | https://docs.intrinio.com/ |
| **Polygon.io** | Real-time markets | API key | Free→$99-$399/month | 5/min (free)→unlimited | <20ms latency, WebSocket | https://polygon.io/docs/ |
| **EOD Historical Data** | Historical data | API key | $59.99-$99.99/month | Tier-based | 70+ exchanges, 30+ years | https://eodhd.com/api/ |
| **Financial Modeling Prep** | Fundamentals | API key | Free→$15-$199/month | 250/day→10,000+ | DCF models, insider trading | https://financialmodelingprep.com/developer/docs |

### Tier 3: Developer-Friendly (<$100/month)

| Service | Specialty | Free Tier | Paid Plans | Rate Limits | Unique Features | Documentation |
|---------|-----------|-----------|------------|-------------|-----------------|--------------|
| **Alpha Vantage** | Stocks, indicators | 25 calls/day | $49.99+/month | 5-1200/minute | 60+ technical indicators | https://www.alphavantage.co/documentation/ |
| **Twelve Data** | Multi-asset | 800 calls/day | $29-$149/month | 8/min→higher | 5,000+ crypto pairs | https://twelvedata.com/docs |
| **Marketstack** | Global stocks | 1,000/month | $9.99-$99.99/month | Tier-based | 30,000+ stocks | https://marketstack.com/documentation |
| **CoinGecko** | Cryptocurrency | 30 calls/min | $129-$499/month | 30-1000/min | 18,000+ cryptos, NFT data | https://docs.coingecko.com/ |

## Part 5: Specialized Commercial Services

### Business Intelligence & Credit

| Service | Specialty | API Access | Pricing Structure | Authentication | Key Features | Documentation |
|---------|-----------|------------|-------------------|----------------|--------------|--------------|
| **LexisNexis** | Legal/News/Business | REST APIs | $25K-$45K/year typical | API keys, OAuth | 45+ years archives, AI enrichment | API documentation available |
| **Dun & Bradstreet** | Business credit | D&B Direct+ API | Enterprise pricing | API keys | DUNS numbers, risk scoring | Developer portal |
| **Experian** | Consumer credit | Multiple APIs | $1-$10 per query | API keys, OAuth | Real-time fraud detection | Developer portal |
| **ZoomInfo** | B2B contacts | Enterprise API | $15K-$40K/year | API keys | 320M+ contacts, intent data | API documentation |
| **Crunchbase** | Startup data | Enterprise API | $29+/month, API extra | API keys | Funding data, company profiles | API documentation |

### Geospatial & Environmental

| Service | Specialty | Free Tier | Paid Plans | Rate Limits | Data Formats | Documentation |
|---------|-----------|-----------|------------|-------------|--------------|--------------|
| **Google Maps** | Mapping/Places | $200/month credit | $2-$30/1000 requests | 300 QPM per IP | JSON, XML | Comprehensive docs |
| **Mapbox** | Custom maps | 200K tiles/month | $6/1000 views | 600 req/min geocoding | JSON, vector tiles | Extensive tutorials |
| **HERE Maps** | Enterprise routing | 250K trans/month | $449+/month | ~5 req/sec free | JSON | Developer docs |
| **OpenWeatherMap** | Weather data | 1,000 calls/day | $40-$600/month | Tier-based | JSON, XML | API documentation |
| **Planet Labs** | Satellite imagery | 30-day trial | Subscription tiers | Tier-based | GeoTIFF, JSON | developers.planet.com |
| **Esri ArcGIS** | GIS analytics | 1M tiles/month | $1/1000 transactions | Usage-based | GeoJSON, REST | Comprehensive SDK |

### Healthcare & Scientific

| Service | Specialty | API Type | Authentication | Compliance | Data Types | Documentation |
|---------|-----------|----------|----------------|------------|------------|--------------|
| **Epic Systems** | EHR/FHIR | REST/FHIR R4 | OAuth 2.0, SMART | HIPAA required | USCDI patient data | open.epic.com |
| **Cerner/Oracle Health** | EHR systems | FHIR R4, DSTU2 | OAuth 2.0 | HIPAA required | Clinical data | fhir.cerner.com |
| **Athenahealth** | Practice management | 800+ endpoints | API keys | HIPAA required | Patient, billing, scheduling | docs.athenahealth.com |
| **IQVIA** | Pharma analytics | Various APIs | Commercial license | Data agreements | Market data, RWE | Partner documentation |
| **Google Earth Engine** | Geospatial analysis | Python/JS APIs | Google account | Terms of service | 37+ years satellite data | developers.google.com/earth-engine |

## Implementation Guidelines for Developers

### Authentication Methods Summary
- **API Keys**: Most common (80% of services)
- **OAuth 2.0**: Healthcare and enterprise services
- **No Authentication**: Many government APIs
- **SMART on FHIR**: Healthcare-specific standard
- **Terminal/Desktop**: Bloomberg, Refinitiv

### Rate Limiting Patterns
- **Per Minute/Hour**: Common for real-time APIs
- **Daily Quotas**: Government and free tiers
- **Credit Systems**: Contact enrichment services
- **Fair Use**: Many government APIs
- **Custom Enterprise**: Negotiated limits

### Data Format Standards
- **JSON**: Universal support (95% of APIs)
- **XML**: Legacy support (40% of APIs)
- **CSV**: Bulk downloads and exports
- **FHIR**: Healthcare data standard
- **SDMX**: Statistical data (IMF, Eurostat)
- **GeoJSON**: Geospatial services

### Compliance Requirements

**Healthcare APIs**:
- HIPAA compliance mandatory
- Business Associate Agreements (BAA)
- FHIR R4 standard compliance
- 21st Century Cures Act requirements

**Financial APIs**:
- SOC 2 compliance common
- Data retention policies
- Export restrictions (some data)

**Government Data**:
- Attribution requirements
- Non-commercial use restrictions (some)
- Fair use policies

### Cost Optimization Strategies

1. **Leverage Free Tiers**: Start with government APIs and free commercial tiers
2. **Cache Aggressively**: Reduce API calls for static/slow-changing data
3. **Batch Requests**: Use bulk endpoints where available
4. **Rate Limit Management**: Implement exponential backoff
5. **Hybrid Approach**: Combine free government data with targeted commercial APIs

### API Selection Decision Matrix

| Use Case | Recommended APIs | Cost Range |
|----------|-----------------|------------|
| **Academic Research** | Government APIs, PubMed, CrossRef, arXiv | Free |
| **Financial Startup** | Alpha Vantage, Polygon.io, FRED | $0-$500/month |
| **Enterprise Finance** | Bloomberg, Refinitiv, FactSet | $12K-$27K/year |
| **Healthcare App** | Epic FHIR, OpenFDA, RxNorm | Free-Enterprise |
| **Market Intelligence** | Crunchbase, ZoomInfo, D&B | $15K-$50K/year |
| **Environmental Analysis** | NOAA, NASA GIBS, Planet Labs | Free-Enterprise |

This comprehensive catalog provides developers with the essential information needed to build a robust data aggregator application, with clear details on API access, authentication, pricing, and compliance requirements across all major data domains.