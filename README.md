# Picorule Sentry

A React-based web application for extracting and analyzing variables from Picorules `.prb` files directly from GitHub.

## Features

- **Live GitHub Integration**: Fetches `.prb` files and `.txt` templates directly from the GitHub repository
- **Template Reference Tracking**: Shows which Jinja2 templates reference each variable
- **In-Memory Processing**: Parses all variables and holds the catalog in memory (no CSV files)
- **Interactive Filtering**: Search and filter by ruleblock, statement type, metadata, and reportability
- **Real-Time Statistics**: Displays summary statistics for functional/conditional statements and template usage
- **Dependency Navigation**: Click on any dependency to jump to that variable's definition with visual highlighting (automatically switches ruleblock filters for cross-ruleblock references)
- **Visual Loading Progress**: Sidebar shows detailed loading status with progress bar for ruleblocks and templates
- **Smart Caching**: SessionStorage cache for instant page loads after first visit
- **Responsive UI**: Modern interface built with React 19 and Tailwind CSS

## Technology Stack

- **React 19.0.0** - Latest stable React version
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run preview
```

## Configuration

### Environment Variables

The app can be configured using environment variables. Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Available configuration options:

```env
# GitHub Personal Access Token (optional, for higher rate limits)
# Without token: 60 requests/hour
# With token: 5000 requests/hour
VITE_GITHUB_TOKEN=your_github_personal_access_token

# Ruleblock Repository Configuration
VITE_GITHUB_OWNER=asaabey
VITE_GITHUB_REPO=tkc-picorules-rules
VITE_GITHUB_BRANCH=master
VITE_GITHUB_RULEBLOCK_PATH=picodomain_rule_pack/rule_blocks

# Template Repository Configuration
VITE_GITHUB_TEMPLATE_PATH=picodomain_template_pack/template_blocks
```

**Default Values**: If not specified, the app uses the defaults shown above to connect to the main TKC Picorules repository.

**Use Cases for Custom Configuration**:
- Point to a fork of the repository
- Use a different branch (e.g., `development`)
- Test against a custom repository structure

## How It Works

### Smart Caching

The app uses **SessionStorage** for intelligent caching:

- **First Load**: Fetches and parses all `.prb` files from GitHub
- **Page Refresh**: Instantly loads from cache (no GitHub API calls)
- **Session Scope**: Cache persists until you close the browser tab
- **Manual Refresh**: Click "Refresh from GitHub" button to force update

### Data Pipeline

1. **Check Cache**: On load, checks SessionStorage for cached data (v2)
2. **Fetch Ruleblocks**: Downloads the list of `.prb` files from `picodomain_rule_pack/rule_blocks/`
3. **Download Ruleblocks**: Fetches file contents in parallel (5 concurrent requests with retry logic)
4. **Parse Ruleblocks**: Each file using regex patterns ported from Python:
   - Extracts `#define_attribute()` metadata
   - Parses `#doc()` documentation
   - Identifies EADV attribute references
   - Tracks variable dependencies
   - Distinguishes functional (`=>`) vs conditional (`:`) statements
5. **Fetch Templates**: Downloads the list of `.txt` template files from `picodomain_template_pack/template_blocks/`
6. **Download Templates**: Fetches template contents in parallel (5 concurrent requests)
7. **Parse Templates**: Extracts variable references using Jinja2 patterns:
   - `{% if ruleblock.variable %}` conditionals
   - `{{ picoformat('ruleblock.variable') }}` formatting
   - `{{ picodate('ruleblock.variable') }}` date formatting
8. **Join Data**: Maps template references to variables (reverse lookup: variable → templates)
9. **Cache**: Saves parsed data to SessionStorage (v2) for instant subsequent loads
10. **Display**: All variables in an interactive table with filtering capabilities

## Project Structure

```
picorule-sentry/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── VariableCatalog.tsx
│   │   ├── VariableRow.tsx
│   │   ├── StatsSummary.tsx
│   │   ├── FilterBar.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useGithubData.ts
│   │   ├── useVariableFilter.ts
│   │   └── useTheme.ts
│   ├── services/           # Core business logic
│   │   ├── parser.ts       # Picorules parsing engine
│   │   ├── templateParser.ts # Jinja2 template parser
│   │   ├── githubApi.ts    # GitHub API integration
│   │   └── cacheService.ts # SessionStorage cache
│   ├── types/              # TypeScript definitions
│   │   ├── picorules.ts
│   │   └── github.ts
│   ├── lib/                # Utilities
│   │   └── utils.ts
│   ├── App.tsx             # Main application
│   └── main.tsx            # Entry point
├── .env.example            # Environment variables template
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Comparison with Python Script

This app provides the same functionality as `extract_variables.py` with these enhancements:

| Feature | Python Script | Picorule Sentry |
|---------|--------------|-----------------|
| Data Source | Local files or GitHub | GitHub only (live) |
| Template Analysis | Not supported | Full Jinja2 template parsing |
| Output Format | CSV file | In-memory + interactive UI |
| Filtering | Post-processing required | Real-time filtering |
| Statistics | Console output | Live dashboard with template stats |
| Loading Feedback | Basic progress | Detailed status with progress bar |
| Deployment | Requires Python environment | Static web app |
| Template References | Not tracked | Shows which templates use each variable |

## Recent Enhancements

- ✅ **Template Reference Tracking**: Parses 218 template files and tracks variable usage
- ✅ **Visual Loading Progress**: Sidebar shows detailed status for ruleblocks and templates
- ✅ **Template Column**: Displays template references directly in the table
- ✅ **Dark Mode**: Full dark mode support with theme toggle
- ✅ **Environment Variables**: Configurable repository settings

## Future Enhancements

- Dependency graph visualization
- Export to CSV/JSON with template references
- Branch comparison mode
- Virtual scrolling for 1000+ variables
- IndexedDB caching for offline support
- Clickable template names to view template content

## License

Part of the TKC Picorules Rules repository.
