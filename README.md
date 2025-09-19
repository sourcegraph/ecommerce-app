# Amp Demo

This is a demo repo that is carefully crafted to showcase the capabilities of Amp centered around an example e-commerce platform with a FastAPI backend and React frontend. Data is stored in SQLite so it is self contained and easy to run.

For more information about Amp visit the [Amp manual](https://ampcode.com/manual).

See the [DEMO.md](DEMO.md) for more information about how to effectively use this repo for an array of different demo purposes ranging from fixes an issue with a PR to advanced refactors.

<img width="1673" height="1010" alt="Screenshot 2025-09-17 at 3 48 15 PM" src="https://github.com/user-attachments/assets/2fd2b128-d937-4cc9-9437-5386c3ebc1f6" />


## Project Structure

```
.
├── .github/            # GitHub workflows and CI configuration
├── backend/            # FastAPI backend
│   ├── app/            # Application source code
│   ├── tests/          # Backend tests
│   ├── alembic/        # Database migrations
│   ├── pyproject.toml  # Python dependencies (managed by uv)
│   ├── pytest.ini      # Test configuration
│   ├── main.py         # FastAPI entry point
│   ├── AGENTS.md       # Agent documentation for backend
│   └── store.db        # SQLite database file
├── frontend/           # React frontend (TypeScript/Vite)
│   ├── src/            # React components and pages
│   ├── e2e/            # Playwright E2E tests
│   ├── public/         # Static assets
│   ├── package.json    # Node.js dependencies
│   ├── vite.config.ts  # Vite configuration
│   ├── AGENTS.md       # Agent documentation for frontend
│   └── playwright.config.ts # Playwright test configuration
├── justfile            # Development automation commands
├── package.json        # Root package.json for shared dependencies
├── AGENTS.md           # Agent documentation for overall project
├── DEMO.md             # Demo usage guide
└── README.md           # README
```

## Prerequisites

### Mandatory

- [Just](https://github.com/casey/just) - Command runner (`brew install just`)
- [Python 3.13+](https://www.python.org/) - Python runtime
- [uv](https://docs.astral.sh/uv/) - Python package manager
- [Node.js 20+](https://nodejs.org/) - JavaScript runtime
- [npm](https://www.npmjs.com/) - Package manager (ships with Node.js)

## Quick Start

Clone the project and verify prerequisites:

```bash
git clone https://github.com/sourcegraph/amp-demo.git
cd amp-demo

# Verify you have required tools
just --version
python --version
uv --version
node --version 
```

Install dependencies and setup testing:

```bash
just install-all      # Install all dependencies (backend, frontend, E2E browsers)
```

Run the application:

```bash
just dev             # Start both services with native hot-reload using concurrently
```

Access the application:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001

## Development Commands

### Lifecycle Commands

```bash
just dev              # Start both services (native hot-reload)
just dev-backend      # Start only backend
just dev-frontend     # Start only frontend
```

### Seed Database

```bash
just seed             # Populate database with sample data (only needed if database changes)
```

### Manual Development (individual services)

Install dependencies (if not already done):
```bash
just install-all      # All dependencies (backend, frontend, E2E browsers)
```

Run services individually (if needed):
```bash
just dev-backend      # Start only backend
just dev-frontend     # Start only frontend
```

### Testing & Quality

#### Setup E2E Testing (Required First Time)
```bash
just setup-e2e        # Install Playwright browsers
```

#### Running Tests
```bash
# Backend tests (native)
just test-local                        # Backend tests
just test-cov-local                    # Backend tests with coverage
just test-local-single TEST            # Run single test

# E2E tests
just test-e2e         # E2E tests (headless)
just test-e2e-headed  # E2E tests (headed - for debugging)

# Combined test suites
just test-all-local   # All tests (backend + E2E)
```

#### Code Quality
```bash
# backend
just check            # Run linting (ruff) and type checking (mypy)
just format           # Format backend code

# frontend
just lint             # Lint frontend TypeScript
```

#### Pre-Push Validation (Recommended)

Before pushing to CI, ensure all checks pass locally to avoid CI failures:

```bash
# One-time setup (if not done already)
just install-all      # Install all dependencies

# Run complete CI pipeline locally
just ci               # Runs: lint, tests, build, e2e (mirrors CI exactly)
```

`just ci` runs the exact same checks as the GitHub Actions CI pipeline:

1. **Backend Quality**: Ruff linting + MyPy type checking
2. **Backend Tests**: Full test suite with coverage
3. **Frontend Quality**: ESLint + TypeScript build
4. **E2E Tests**: End-to-end Playwright tests

### Build & Deployment

```bash
just build            # Build frontend for production
cd frontend && npm run build  # Alternative frontend build
```

### Database Management

```bash
just reset-db         # Reset SQLite database
just db-shell         # Open SQLite CLI
just migrate-create "message"  # Create new migration
just migrate-up       # Apply migrations
just migrate-down     # Rollback migration
```

### Monitoring & Debugging

```bash
just health           # Check service health
just logs             # View last 100 lines from backend and frontend logs
just logs-follow      # Follow both logs live (Ctrl+C to exit)
```

### Source

Based on the [ecommerce-demo repo](https://github.com/ViaxCo/ecommerce-demo).
