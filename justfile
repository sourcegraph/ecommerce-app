# FastAPI + React E-commerce Demo Automation
# Install 'just' via: brew install just (macOS) or cargo install just

# ─── variables ──────────────────────────────────────────────
LOG_DIR := "logs"

# Internal helper to ensure logs directory exists
_ensure-logs-dir:
    @mkdir -p {{LOG_DIR}}

# Default recipe to display available commands
default:
    @just --list

# Install backend dependencies
install:
    cd backend && uv sync

# Install frontend dependencies
install-frontend:
    cd frontend && npm install

# Install E2E test dependencies
install-e2e:
    cd frontend && npm install --save-dev @playwright/test
    cd frontend && npx playwright install --with-deps

# Install ALL project deps (Python, Node, Playwright browsers)
install-all:
    just install
    just install-frontend
    just install-e2e

# ─── native dev workflow ────────────────────────────────────────
# Run backend + frontend concurrently (hot-reload)
dev:
    @echo "Starting native dev servers on 3001/8001 ..."
    cd frontend && npx concurrently \
      --names "backend,frontend" \
      --prefix-colors "blue,green" \
      "cd ../backend && uv run --active uvicorn app.main:app --reload --reload-exclude '.venv/*' --host 0.0.0.0 --port 8001" \
      "npm run dev -- --host 0.0.0.0 --port 3001"

# Run backend + frontend in background (detached for agentic tools)
dev-headless: _ensure-logs-dir
    @echo "Starting headless dev servers on 3001/8001 ..."
    # truncate old logs so each run starts fresh
    > {{LOG_DIR}}/backend.log
    > {{LOG_DIR}}/frontend.log
    # backend
    cd backend && uv run --active uvicorn app.main:app --reload --reload-exclude '.venv/*' --host 0.0.0.0 --port 8001 >> ../{{LOG_DIR}}/backend.log 2>&1 &
    # frontend
    cd frontend && npm run dev -- --host 0.0.0.0 --port 3001 >> ../{{LOG_DIR}}/frontend.log 2>&1 &
    @echo "Services started in background. Use 'just logs' to inspect and 'just stop' to stop."

# Stop headless dev servers
stop:
    @echo "Stopping headless dev servers..."
    @pkill -f "uvicorn.*--port 8001" || echo "Backend was not running"
    @pkill -f "vite.*--port 3001" || echo "Frontend was not running"
    @echo "Services stopped."

# Independent servers (sometimes handy)
dev-backend:
    cd backend && uv run --active uvicorn app.main:app --reload --reload-exclude '.venv/*' --host 0.0.0.0 --port 8001

dev-frontend:
    cd frontend && npm run dev -- --host 0.0.0.0 --port 3001

# Show the last 100 lines of each log
logs:
    @echo "─── Backend (last 100 lines) ───"
    @tail -n 100 {{LOG_DIR}}/backend.log || echo "No backend log yet."
    @echo
    @echo "─── Frontend (last 100 lines) ───"
    @tail -n 100 {{LOG_DIR}}/frontend.log || echo "No frontend log yet."

# Follow both logs live (Ctrl-C to quit)
logs-follow:
    @echo "Tailing backend & frontend logs (Ctrl+C to exit)..."
    @tail -F {{LOG_DIR}}/backend.log {{LOG_DIR}}/frontend.log



# Seed the database with products and images
seed:
    cd backend && uv run --active python -m app.seed



# ─── testing ──────────────────────
# Run backend tests locally (requires: uv sync)
test-local:
    cd backend && uv run --active pytest

# Run single test locally
test-local-single TEST:
    cd backend && uv run --active pytest {{TEST}}

# Run E2E tests natively (headless - default)
test-e2e:
    @echo "Running E2E tests natively (headless)..."
    cd frontend && npx playwright test

# Run E2E tests natively (headed mode for debugging)
test-e2e-headed:
    @echo "Running E2E tests natively (headed)..."
    cd frontend && HEADED=1 npx playwright test

# Setup E2E testing (install browsers)
setup-e2e:
    cd frontend && npx playwright install --with-deps chromium

# Run all tests (backend + E2E)
test-all-local:
    @just test-local
    @just test-e2e

# Run CI checks locally (mirrors CI pipeline)
ci:
    @echo "Running full CI pipeline locally..."
    cd backend && uv run --active ruff format --check .
    @just check
    @just test-local
    cd frontend && npx prettier --check .
    cd frontend && npm run lint
    @just build
    @just test-e2e
    @echo "All CI checks passed!"



# Check backend code quality
check:
    cd backend && uv run --active ruff check .
    cd backend && uv run --active mypy .

# Format backend and frontend code
format:
    cd backend && uv run --active ruff format .
    cd frontend && npm run format

lint:
    cd frontend && npm run lint

# Build frontend for production
build:
    cd frontend && npm run build

# Reset database (removes store.db files)
reset-db:
    cd backend && rm -f store.db store.db-*

# Health check for running services
health:
    @echo "Checking service health..."
    @curl -f http://localhost:8001/health || echo "Backend not responding"
    @curl -f http://localhost:3001 || echo "Frontend not responding"

# Run database shell (SQLite CLI)
db-shell:
    cd backend && sqlite3 store.db

# Database migration commands
migrate-create MESSAGE:
    cd backend && uv run --active alembic revision --autogenerate -m "{{MESSAGE}}"

migrate-up:
    cd backend && uv run --active alembic upgrade head

migrate-down:
    cd backend && uv run --active alembic downgrade -1

migrate-history:
    cd backend && uv run --active alembic history
