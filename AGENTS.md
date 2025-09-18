# ecommerce-demo Agent Guide

## Essential Commands

**Pass CI:** `just ci` (runs lint, tests, build, e2e)  
**Run app:** `just up` (ports 3001/8001)  
**Run tests:** `just test-all` (backend + e2e in containers)  
**Stop:** `just down`

## Development

**Quick start:**
- `just up` - Start both services (hot-reload)
- `just seed` - Add sample data
- `just check` - Lint & type check backend
- `cd frontend && npm run lint` - Lint frontend

**Testing:**
- `just test` - Backend tests
- `just test-e2e` - E2E tests  
- `just test-all-local` - All tests locally (faster)

**URLs:** Frontend http://localhost:3001, Backend http://localhost:8001/docs

## Architecture
FastAPI (Python 3.13+) + React TypeScript. SQLite + Alembic. Docker with hot-reload.

## Code Style
**Backend:** Type hints, SQLModel, Pydantic, HTTPException, async/await, Depends()  
**Frontend:** Functional components, TypeScript interfaces, Chakra UI, Context API, Formik+Yup

## GitHub Workflow

### Issue & Pull Request Management
- Always use GitHub CLI for interacting with the GitHub repository
- Use GitHub CLI for fetching issues, creating pull requests, commenting, and any other GitHub operations
- Never use curl commands or MC for GitHub API operations
- For operations like fetching issues, commit changes, or creating pull requests, rely exclusively on the GitHub CLI tools
