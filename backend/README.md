# Backend Development

FastAPI backend for the e-commerce demo application.

## Development Setup

### Local Development Requirements
- Python 3.13+
- [uv](https://github.com/astral-sh/uv) package manager

### Running Tests

```bash
# Run all backend tests
just test-local

# Run specific test file/function
just test-local-single tests/test_products.py::test_create_product
```

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
