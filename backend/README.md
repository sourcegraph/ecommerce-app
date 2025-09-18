# Backend Development

FastAPI backend for the e-commerce demo application.

## Development Setup

### Container Testing (Recommended)
Container testing provides guaranteed consistency across environments:

```bash
# Run tests in container (default approach)
just test                 # Backend unit tests
just test-cov            # Backend tests with coverage
```

### Local Testing (Faster Development)
For faster iteration during development, you can run tests locally:

```bash
# Setup local environment
./setup-dev.sh

# Run tests locally
just test-local          # Backend unit tests locally
just test-cov-local      # Backend tests with coverage locally
just test-local-single   # Run specific test file/function
```

### Local Development Requirements
- Python 3.13+
- [uv](https://github.com/astral-sh/uv) package manager

### Switching Between Approaches
- **Container testing**: Use for CI/CD, onboarding new developers, or ensuring perfect reproducibility
- **Local testing**: Use for faster feedback loops during active development

## Architecture
- FastAPI framework with async/await patterns
- SQLModel for database models
- Pydantic schemas for request/response validation
- SQLite database with Alembic migrations
- HTTPException for error handling
- Dependency injection with Depends()

## Code Style
- Python type hints everywhere
- async/await for database operations
- Dependency injection pattern
- RESTful API design
