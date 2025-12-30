# Picorule Sentry

A React-based web application for extracting and analyzing variables from Picorules `.prb` files directly from GitHub.

## Features

- **Live GitHub Integration**: Fetches `.prb` files directly from the GitHub repository
- **In-Memory Processing**: Parses all variables and holds the catalog in memory (no CSV files)
- **Interactive Filtering**: Search and filter by ruleblock, statement type, metadata, and reportability
- **Real-Time Statistics**: Displays summary statistics for functional/conditional statements
- **Dependency Navigation**: Click on any dependency to jump to that variable's definition with visual highlighting (automatically switches ruleblock filters for cross-ruleblock references)
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

### GitHub Token (Optional)

For higher API rate limits (5000/hr instead of 60/hr), create a `.env.local` file:

```env
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

## How It Works

### Smart Caching

The app uses **SessionStorage** for intelligent caching:

- **First Load**: Fetches and parses all `.prb` files from GitHub
- **Page Refresh**: Instantly loads from cache (no GitHub API calls)
- **Session Scope**: Cache persists until you close the browser tab
- **Manual Refresh**: Click "Refresh from GitHub" button to force update

### Data Pipeline

1. **Check Cache**: On load, checks SessionStorage for cached data
2. **Fetch** (if needed): Downloads the list of `.prb` files from `picodomain_rule_pack/rule_blocks/`
3. **Download**: File contents in parallel (5 concurrent requests with retry logic)
4. **Parse**: Each file using regex patterns ported from Python:
   - Extracts `#define_attribute()` metadata
   - Parses `#doc()` documentation
   - Identifies EADV attribute references
   - Tracks variable dependencies
   - Distinguishes functional (`=>`) vs conditional (`:`) statements
5. **Cache**: Saves parsed data to SessionStorage for instant subsequent loads
6. **Display**: All variables in an interactive table with filtering capabilities

## Project Structure

```
picorule-sentry/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui primitives
│   │   ├── FileListPanel.tsx
│   │   ├── StatsSummary.tsx
│   │   ├── FilterBar.tsx
│   │   └── VariableCatalog.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useGithubData.ts
│   │   └── useVariableFilter.ts
│   ├── services/        # Core business logic
│   │   ├── parser.ts    # Picorules parsing engine
│   │   └── githubApi.ts # GitHub API integration
│   ├── types/           # TypeScript definitions
│   │   ├── picorules.ts
│   │   └── github.ts
│   ├── lib/             # Utilities
│   │   └── utils.ts
│   ├── App.tsx          # Main application
│   └── main.tsx         # Entry point
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
| Output Format | CSV file | In-memory + interactive UI |
| Filtering | Post-processing required | Real-time filtering |
| Statistics | Console output | Live dashboard |
| Deployment | Requires Python environment | Static web app |

## Future Enhancements

- Dependency graph visualization
- Export to CSV/JSON
- Branch comparison mode
- Dark mode support
- Virtual scrolling for 1000+ variables
- IndexedDB caching for offline support

## License

Part of the TKC Picorules Rules repository.
