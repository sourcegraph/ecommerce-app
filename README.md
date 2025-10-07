# Amp Demo App

This repository is a carefully crafted demo that showcases the capabilities of Amp, centered around an example e-commerce platform featuring a FastAPI backend and a React frontend. Data is stored in SQLite, so it is self-contained and easy to run.

For more information about Amp visit the [Amp manual](https://ampcode.com/manual).

<img width="1290" height="1016" alt="Screenshot 2025-10-03 at 12 32 11 PM" src="https://github.com/user-attachments/assets/214b7e59-8168-446b-adef-bd481b586d64" />

## How to use this repo

Follow the [Quick Start](#quick-start) guide to get started. Once the front and back ends are running (with the `just dev` command), then you can open your browser on one side of the screen with Amp up on the other (in VS Code or the CLI).

See the [DEMO.md](DEMO.md) for more information about how to effectively use this repo for an array of different demo purposes ranging from issue to PR to advanced feature adds.

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
│   │   ├── api/        # API client and types
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React Context providers
│   │   ├── hooks/      # Custom React hooks
│   │   ├── mockDB/     # Mock data for development
│   │   ├── pages/      # Page-level components
│   │   └── theme/      # Chakra UI theme configuration
│   ├── e2e/            # Playwright E2E tests
│   ├── public/         # Static assets
│   ├── package.json    # Node.js dependencies
│   ├── vite.config.ts  # Vite configuration
│   ├── eslint.config.js # ESLint configuration
│   ├── AGENTS.md       # Agent documentation for frontend
│   └── playwright.config.ts # Playwright test configuration
├── specs/              # Project specifications
├── logs/               # Service logs (dev-headless mode)
├── test-results/       # Test output and reports
├── justfile            # Development automation commands
├── package.json        # Root package.json for shared dependencies
├── settings.json       # Workspace settings
├── AGENTS.md           # Agent documentation for overall project
├── DEMO.md             # Demo usage guide
└── README.md           # README
```

## Quick Start

1. [Install Amp](https://ampcode.com/) (VS Code extension and/or CLI)

2. Install the prerequisites and clone the project:

```bash
# Install homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install just
brew install just

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Install python
uv python install 3.13 --default

# Install node
brew install node

# Install vite
brew install vite

# Install gh CLI and authenticate
brew install gh
gh auth login
```

```bash
# Verify you have the required tools
source $HOME/.local/bin/env
just --version
python --version
uv --version
node --version 
```

```bash
git clone https://github.com/sourcegraph/ecommerce-app.git
cd ecommerce-app
```

3. Install dependencies and setup testing:

```bash
just install-all      # Install all dependencies (backend, frontend, E2E browsers)
```

4. Run the application:

```bash
just dev             # Start both services with native hot-reload using concurrently
```

Access the application:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001

## Development Commands

### Lifecycle Commands

```bash
just dev              # Start both services (native hot-reload, interactive)
just dev-headless     # Start both services in background (for agentic development)
just stop             # Stop headless services
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
# Backend tests
just test-local                        # Backend tests
just test-cov-local                    # Backend tests with coverage
just test-local-single TEST            # Run single test

# E2E tests (Playwright)
just test-e2e         # E2E tests (headless)
just test-e2e-headed  # E2E tests (headed - for debugging)

# Combined test suites
just test-all-local   # All tests (backend + E2E)
```

**Note:** Frontend has no unit tests - only E2E tests with Playwright that test the full application.

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

**Headless Development Workflow:**  
When using `just dev-headless` for agentic development, services run in the background and log to `logs/backend.log` and `logs/frontend.log`. Use `just logs` to inspect output and `just stop` to stop the services.

### Source

Based on the [ecommerce-demo repo](https://github.com/ViaxCo/ecommerce-demo).
