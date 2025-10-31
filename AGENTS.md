# Linea Supply - Agent Guide

## Project Overview

**Brand:** Linea Supply - Premium minimal e-commerce with monochrome design  
**Purpose:** Full-stack e-commerce demo showcasing modern development practices with TDD  
**Architecture:** FastAPI (Python 3.13+) backend + React TypeScript frontend  
**Stack:** SQLite + Alembic, Native hot-reload, E2E testing with Playwright  
**Design System:** Monochrome palette (sand/ink/charcoal) with subtle slate blue accents  
**URLs:** Frontend http://localhost:3001, Backend http://localhost:8001/docs

## Development Commands

**Quick start:**

- `just dev-headless` - Start both services in background (detached for agentic development, always use this to start the services for testing)
- `just stop` - Stop both services (always do this when you are done)
- `just logs` - View last 100 lines from both service logs (use for troubleshooting)
- `just seed` - Add sample data to the sqlite database

**Testing:**

- `just test-all-local` - Run all tests (backend + E2E)
- `just test-local` - Run backend tests only
- `just test-e2e` - Run E2E tests (headless)
- `just setup-e2e` - Install Playwright browsers

**Code Quality:**

- `just check` - Run linting (ruff) and type checking (mypy) for backend
- `just lint` - Lint frontend TypeScript
- `just format` - Format backend (ruff) and frontend (prettier) code
- `just build` - Build frontend for production

**Pass CI:**

- `just ci` - Run complete CI pipeline (lint, tests, build, e2e)

**Error Handling:**

- If build fails, ensure ports 3001/8001 are available
- For E2E test failures, check `frontend/test-results/` directory for detailed logs

## Testing Guidelines

### Behavior-Driven Testing Principles

- No "unit tests" - test expected behavior, treating implementation as black box
- Test through public API exclusively - internals invisible to tests
- No 1:1 mapping between test files and implementation files
- 100% coverage expected at all times, based on business behavior
- Tests must document expected business behavior

### Test Data Pattern

Use factory functions with optional overrides for all test data:

```python
# Backend example
def get_mock_product(overrides: dict = None) -> Product:
    base = {
        "id": "prod_123",
        "name": "Test Product",
        "price": 29.99,
        "category": "electronics",
        "in_stock": True
    }
    return Product(**(base | (overrides or {})))
```

```typescript
// Frontend example
const getMockUser = (overrides?: Partial<User>): User => ({
  id: "user_123",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

## Code Style & Quality

### Formatting

**Backend:** Ruff for formatting (Black-compatible)  
**Frontend:** Prettier for formatting, ESLint for code quality

**Always run `just format` after making code changes** to ensure consistent formatting across backend and frontend. ESLint is configured with `eslint-config-prettier` to disable conflicting style rules.

### TypeScript Guidelines (Frontend)

**Strict Mode Requirements:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Rules:**

- No `any` - ever. Use `unknown` if type is truly unknown
- No type assertions (`as SomeType`) unless absolutely necessary with clear justification
- No `@ts-ignore` or `@ts-expect-error` without explicit explanation
- These rules apply to test code as well as production code

### Python Guidelines (Backend)

- Type hints required for all functions and methods
- Use SQLModel for database models
- Pydantic for request/response validation
- HTTPException for error handling
- Async/await patterns with FastAPI Depends()
- Factory pattern for test data creation
- NEVER use `# type: ignore` comments - always fix the underlying type issue instead

### General Code Quality

**No Comments in Code:** Code should be self-documenting through clear naming and structure. Comments indicate code isn't clear enough.

**Prefer Options Objects:** Use options objects for function parameters as default pattern:

```python
# Python
@dataclass
class CreateOrderOptions:
    user_id: str
    items: list[OrderItem]
    shipping_address: str
    payment_method: str
    discount_code: Optional[str] = None

def create_order(options: CreateOrderOptions) -> Order:
    # implementation
```

**Understanding DRY:** Don't Repeat Yourself is about knowledge, not code. Avoid duplicating business logic, not similar-looking code.

### Error Handling

Use Result types or early returns:

```python
from typing import Union
from dataclasses import dataclass

@dataclass
class Success:
    data: Any

@dataclass
class Error:
    message: str
    code: str

Result = Union[Success, Error]

def process_payment(payment_data: dict) -> Result:
    if not is_valid_payment(payment_data):
        return Error("Invalid payment data", "INVALID_PAYMENT")

    return Success(execute_payment(payment_data))
```

## Architecture & Patterns

### Backend Architecture

- **Design Patterns:** Feature-based folder structure, dependency injection via FastAPI Depends()
- **Data Flow:** SQLModel → Pydantic schemas → API responses
- **Database:** SQLite with Alembic migrations in `backend/alembic/versions/`
- **API Conventions:** RESTful endpoints, snake_case in responses

### Frontend Architecture

- **Components:** Functional components only, TypeScript interfaces
- **State Management:** Context API for global state, local state with useState/useReducer
- **Forms:** Formik + Yup for validation
- **UI:** Chakra UI components
- **Data Flow:** API calls → context state → component props

### Testing Architecture

- **Backend:** pytest with async support, factory-boy for test data
- **E2E:** Playwright for full user journey testing
- **Coverage:** 100% coverage requirement for all business logic

## Refactoring Guidelines

**Refactoring Rules:**

1. Commit before refactoring
2. Look for useful abstractions based on semantic meaning
3. Maintain external APIs during refactoring
4. Verify and commit after refactoring
5. Never break existing consumers of your code

## Development Workflow

### Pre-commit Checklist

1. Format all code changes (`just format`)
2. All tests pass (`just test-all-local`)
3. Code follows TDD process (tests written first)
4. Linting passes (`just check` for backend, `just lint` for frontend)
5. No type errors in TypeScript (`just build`)
6. Factory functions used for all test data
7. Business behavior documented through tests

Run `just ci` to verify all checks pass before pushing.

### GitHub Workflow

**Issue & Pull Request Management:**

- Always use GitHub CLI for repository interactions
- Use GitHub CLI for fetching issues, creating PRs, commenting
- Never use curl commands or MCP for GitHub API operations
- Rely exclusively on GitHub CLI tools for repository operations

## Security Considerations

- **Environment Variables:** All secrets in `.env` files, never committed
- **Input Validation:** All inputs validated with Pydantic (backend) before database access
- **Database:** Use SQLModel with proper relationships, no raw SQL queries
- **Authentication:** JWT tokens, proper session management
- **Dependencies:** Regular security audits, address vulnerabilities within 3 days

### Sourcegraph CLI

If a user asks Amp to use Sourcegraph or Sourcegraph Code Search and does not specify MCP then always utilize the Sourcegraph CLI `src`. Review the query syntax at [https://sourcegraph.com/docs/code-search/queries](https://sourcegraph.com/docs/code-search/queries) and then run `src search -json 'query'` to search.