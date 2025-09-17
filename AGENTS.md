# ecommerce-demo Agent Guide

## Running the App
**With containers (recommended for development):**

**Containers (hot-reload, ports 3001/8001):**
- `just up` - Both services with hot-reload (recommended)
- `just down` - Stop all containers
- `just backend` - Backend only (auto-reload)
- `just frontend` - Frontend only (Vite hot-reload)

**Locally without containers:**
- `cd backend && uv run uvicorn main:app --reload` - Backend only
- `cd frontend && npm run dev` - Frontend only

**URLs:** Frontend http://localhost:3001, Backend http://localhost:8001, Docs http://localhost:8001/docs

## Tests & Quality
- `just test` - Run backend tests (pytest in container)
- `just test-cov` - Run backend tests with coverage report  
- `just test-e2e` - Run E2E tests with Playwright
- `just test-all` - Run all backend + E2E tests
- `cd backend && pytest tests/api/test_products.py::test_get_products` - Single test (local)
- `just check` - Lint (ruff) and type check (mypy) backend
- `just format` - Format backend code with ruff
- `cd frontend && npm run lint` - Lint frontend TypeScript
- `just build` - Build frontend production bundle
- `just seed` - Seed a fresh SQLite database

## Architecture
FastAPI (Python 3.13+) backend with React TypeScript frontend. SQLite database with Alembic migrations. Docker containerized with development hot-reload. Backend serves API at :8001, frontend at :3001. Uses uv for Python deps, npm for Node deps.

## Code Style
**Backend**: Python type hints everywhere, SQLModel for DB models, Pydantic schemas for validation, HTTPException for errors, async/await patterns, dependency injection with Depends()
**Frontend**: Functional React components with TypeScript interfaces, Chakra UI styling, Context API state management, Formik forms with Yup validation, Framer Motion animations, arrow functions
