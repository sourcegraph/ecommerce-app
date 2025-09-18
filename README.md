# Amp Demo

This is a demo repo that is carefully crafted to showcase the capabilities of Amp centered around an example e-commerce platform with a FastAPI backend and React frontend. Data is stored in SQLite so it is self contained and easy to run.

For more information about Amp visit the [Amp manual](https://ampcode.com/manual).

See the [DEMO.md](DEMO.md) for more information about how to effectively use this repo for an array of different demo purposes ranging from fixes an issue with a PR to advanced refactors.

## Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── app/          # Application source code
│   ├── tests/        # Backend tests
│   ├── alembic/      # Database migrations (only needed if changes to database are made)
│   ├── pyproject.toml # Python dependencies (managed by uv)
│   └── pytest.ini    # Test configuration
├── frontend/          # React frontend (TypeScript/Vite)
│   ├── src/          # React components and pages
│   ├── e2e/          # Playwright E2E tests
│   ├── public/       # Static assets
│   └── package.json  # Node.js dependencies
├── compose.yml        # Docker Compose configuration
├── justfile          # Development automation commands
├── AGENTS.md         # Agent documentation
└── README.md
```

## Prerequisites

### Mandatory

- [Just](https://github.com/casey/just) - Command runner (`brew install just`)
- [Docker/Podman](https://podman.io/) - Container runtime (recommend podman)

### Locally Outside Containers Only

- [Node.js](https://nodejs.org/) - For frontend development
- [uv](https://docs.astral.sh/uv/) - Python package manager (backend uses Python 3.13+)

## Quick Start

Clone the project:

```bash
git clone https://github.com/sourcegraph/amp-demo.git
cd amp-demo
```

Run with Docker/Podman (recommended):

```bash
just up          # Start both services with hot-reload
```

Access the application:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001

## Development Commands

### Lifecycle Commands

```bash
just up               # Start both services
just backend          # Start only backend
just frontend         # Start only frontend
just down             # Stop all containers
```

### Seed Database

```bash
just seed             # Populate database with sample data (only needed if database changes)
```

### Local Development (without containers)

Install dependencies:
```bash
just install          # Backend dependencies (uv)
just install-frontend # Frontend dependencies (npm)
```

Run services locally:
```bash
# Backend
cd backend && uv run uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
```

### Testing & Quality

#### Container Testing (Recommended - Guaranteed Portability)
```bash
just test             # Backend tests in container
just test-cov         # Backend tests with coverage in container
just test-e2e         # E2E tests in container (headless)
just test-e2e-headed  # E2E tests in container (headed - for debugging)
just test-all         # All tests in containers (CI equivalent)
```

#### Local Testing (Optional - Faster Development)
```bash
# Setup local environment first
./backend/setup-dev.sh                 # Setup backend for local testing
just setup-e2e-local                   # Setup E2E testing locally

# Run tests locally
just test-local                        # Backend tests locally
just test-cov-local                    # Backend coverage locally  
just test-local-single TEST            # Run single test locally
just test-e2e-local                    # E2E tests locally (headless)
just test-e2e-local-headed             # E2E tests locally (headed - for debugging)
just test-all-local                    # All tests locally
```

#### Code Quality
```bash
just check            # Run linting (ruff) and type checking (mypy)
just format           # Format backend code
cd frontend && npm run lint            # Lint frontend TypeScript
```

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

just logs [service]   # View recent logs (default: backend)
just logs-follow [service]  # Follow live logs
```
