# Error Handling and Logging Standards

**Version:** 2.0  
**Effective Date:** 2025-Q4  
**Scope:** All backend and frontend services

## 1. Structured Logging Requirements

### 1.1 Log Format
All services MUST emit structured JSON logs with these required fields:

```json
{
  "timestamp": "2025-10-09T14:32:15.123Z",
  "level": "TRACE|DEBUG|INFO|WARN|ERROR|FATAL",
  "message": "string",
  "service_name": "linea-api",
  "service_version": "1.2.3",
  "environment": "production|staging|development",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "request_id": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

**Recommended context fields:**
- `http_method`, `http_path`, `http_status_code`, `duration_ms`
- `user_id`, `session_id`
- `error_code`, `error_type`, `error_stack` (server-side only)

**Log Levels:**
- `TRACE` - Very detailed diagnostic information
- `DEBUG` - Detailed debugging information for development
- `INFO` - General informational messages (default for production)
- `WARN` - Warning messages for potentially harmful situations
- `ERROR` - Error events that might still allow the application to continue
- `FATAL` - Severe errors that cause service termination

### 1.2 Request Correlation
- MUST generate `trace_id` (hex string, 32 characters) for every HTTP request
- MUST generate `span_id` (hex string, 16 characters) for each operation within a request
- MUST use W3C Trace Context format (`traceparent` header) for cross-service propagation:
  - Format: `00-{trace_id}-{span_id}-01`
  - Example: `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`
- MUST also set `X-Request-ID` header to `trace_id` value for client compatibility
- MUST include `trace_id` and `span_id` in all logs for that request
- MUST return both `X-Request-ID` and `traceparent` in response headers
- MUST expose these headers via CORS: `Access-Control-Expose-Headers: X-Request-ID, traceparent`

### 1.3 Prohibited Practices
- `print()` or `console.log()` for application logging
- Logging passwords, tokens, API keys, credit card numbers, or other sensitive data
- Unstructured text-only log messages

## 2. Error Response Standards

### 2.1 API Error Schema
All backend API errors MUST return RFC 7807 (Problem Details for HTTP APIs) JSON structure:

```json
{
  "type": "https://docs.lineasupply.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request body contains invalid fields",
  "instance": "/api/v1/orders",
  "code": "VALIDATION.INVALID_FIELDS",
  "request_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "details": {
    "fields": [
      {"field": "email", "error": "Invalid email format"},
      {"field": "quantity", "error": "Must be positive integer"}
    ]
  }
}
```

**Required fields (RFC 7807):**
- `type` - URI reference identifying the problem type
- `title` - Short, human-readable summary
- `status` - HTTP status code
- `detail` - Human-readable explanation specific to this occurrence
- `instance` - URI reference identifying the specific occurrence

**Required extensions:**
- `code` - Machine-readable error code (see 2.2)
- `request_id` - Request correlation ID
- `trace_id` - Trace correlation ID

**Optional extensions:**
- `details` - Additional structured data about the error

### 2.2 Standard Error Codes

Error codes MUST follow the namespaced format: `DOMAIN.REASON`

| Code | HTTP Status | Retryable | Usage |
|------|-------------|-----------|-------|
| `VALIDATION.INVALID_FIELDS` | 400 | No | Invalid request data format or values |
| `VALIDATION.MISSING_REQUIRED` | 400 | No | Required fields missing from request |
| `AUTH.INVALID_TOKEN` | 401 | No | Missing or invalid authentication token |
| `AUTH.TOKEN_EXPIRED` | 401 | No | Authentication token has expired |
| `AUTH.INSUFFICIENT_PERMISSIONS` | 403 | No | User lacks required permissions |
| `RESOURCE.NOT_FOUND` | 404 | No | Requested resource doesn't exist |
| `CONFLICT.DUPLICATE` | 409 | No | Resource already exists |
| `CONFLICT.VERSION_MISMATCH` | 409 | Yes | Optimistic locking conflict |
| `VALIDATION.UNPROCESSABLE` | 422 | No | Semantically invalid request |
| `RATE_LIMIT.EXCEEDED` | 429 | Yes | Too many requests |
| `SERVER.INTERNAL_ERROR` | 500 | Yes | Unexpected server error |
| `SERVER.BAD_GATEWAY` | 502 | Yes | Upstream service error |
| `SERVER.UNAVAILABLE` | 503 | Yes | Service temporarily unavailable |
| `SERVER.GATEWAY_TIMEOUT` | 504 | Yes | Upstream service timeout |

**Retryable Errors:**
- Clients MAY automatically retry requests for errors marked as retryable
- Clients MUST implement exponential backoff with jitter for retries
- Recommended retry policy: initial delay 100ms, max delay 5s, max 3 attempts

### 2.3 Error Handling Rules
- MUST NOT expose stack traces or internal error details to clients
- MUST log full error context server-side with `request_id` and `trace_id`
- MUST use appropriate HTTP status codes per RFC 7231
- MUST return `Content-Type: application/problem+json` for all API errors
- MUST return JSON (never HTML) for API error responses

## 3. Frontend Requirements

### 3.1 Error Boundaries
- MUST implement root-level `ErrorBoundary` component (React)
- MUST display user-friendly fallback UI on application crash
- SHOULD provide recovery actions (reload page, navigate to home)
- MUST log crash details with trace information to error tracking service

### 3.2 Global Error Handlers
- MUST implement `window.onerror` handler for uncaught JavaScript errors
- MUST implement `window.onunhandledrejection` handler for unhandled promise rejections
- MUST capture and log errors with trace context to error tracking service
- SHOULD include user agent, URL, and timestamp in error reports

### 3.3 API Error Handling
- MUST parse RFC 7807 error responses consistently across all API calls
- MUST extract and propagate `traceparent` header from backend responses
- MUST send `traceparent` header in all API requests
- MUST display `request_id` in user-facing error messages
- MUST implement retry logic with exponential backoff for retryable errors:
  - Check `code` field to determine if error is retryable
  - Initial retry delay: 100ms
  - Backoff multiplier: 2x with random jitter (±25%)
  - Maximum retry delay: 5 seconds
  - Maximum retry attempts: 3
- MUST show loading states during async operations
- MUST handle authentication errors (401) by redirecting to login
- MUST handle permission errors (403) with appropriate messaging

### 3.4 User Error Messages
Format: `"[Action failed]. [Next step] or contact support with Request ID: [request_id]"`

**Examples:**
- *"Unable to load products. Please try again or contact support with Request ID: 4bf92f35"*
- *"Payment failed. Please check your payment method or contact support with Request ID: a3ce929d"*
- *"Too many requests. Please wait a moment and try again."* (for 429 rate limits)

**Authentication/Authorization Messages:**
- 401: *"Your session has expired. Please log in again."*
- 403: *"You don't have permission to perform this action."*

## 4. Implementation Guidelines

### 4.1 Backend (FastAPI/Python)
- Use `structlog` or Python `logging` with JSON formatter
- Implement middleware to generate and propagate `trace_id` and `span_id`
- Parse incoming `traceparent` header or generate new trace context
- Add trace context to all log records
- Return RFC 7807 error responses using consistent exception handlers
- Include `service_name`, `service_version`, `environment` from config

### 4.2 Frontend (React/TypeScript)
- Use centralized API client (e.g., Axios) with interceptors
- Request interceptor: add `traceparent` header to outgoing requests
- Response interceptor: parse RFC 7807 errors, handle retries for retryable codes
- Store trace context in React Context or state management
- Display errors using consistent toast/alert components
- Log frontend errors to monitoring service with trace context

### 4.3 CORS Configuration
Backend MUST include these headers for cross-origin requests:
```
Access-Control-Allow-Headers: Content-Type, Authorization, traceparent, X-Request-ID
Access-Control-Expose-Headers: X-Request-ID, traceparent, Content-Type
```

## 5. Observability Integration

### 5.1 Log Aggregation
- All structured logs SHOULD be sent to centralized logging system
- Logs MUST be queryable by `trace_id`, `request_id`, `service_name`, `environment`
- Retention policies SHOULD be environment-specific:
  - Production: 90 days
  - Staging: 30 days
  - Development: 7 days

### 5.2 Metrics and Alerting
Recommended metrics to track:
- Error rate by `error_code` and `http_status_code`
- Request latency (p50, p95, p99) by endpoint
- Retry rate for retryable errors
- Rate limit violations (429 responses)

Recommended alerts:
- Error rate > 5% sustained for 5 minutes
- p95 latency > threshold for 5 minutes
- 5xx errors from any endpoint

### 5.3 Distributed Tracing
- Use `trace_id` to correlate logs across frontend, backend, and services
- Each operation SHOULD create child spans with unique `span_id`
- Frontend API calls, backend handlers, and database queries SHOULD be traced
- Trace data SHOULD include timing, status, and error information
