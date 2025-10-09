export interface ProblemDetails {
  readonly type: string
  readonly title: string
  readonly status: number
  readonly detail: string
  readonly instance: string
  readonly code: string
  readonly request_id: string
  readonly trace_id: string
  readonly details?: {
    readonly fields?: ReadonlyArray<{
      readonly field: string
      readonly error: string
    }>
  }
}

export class ApiError extends Error {
  constructor(
    public readonly problemDetails: ProblemDetails,
    public readonly requestId: string
  ) {
    super(problemDetails.detail)
    this.name = 'ApiError'
  }
}

const RETRYABLE_CODES = new Set([
  'CONFLICT.VERSION_MISMATCH',
  'RATE_LIMIT.EXCEEDED',
  'SERVER.INTERNAL_ERROR',
  'SERVER.BAD_GATEWAY',
  'SERVER.UNAVAILABLE',
  'SERVER.GATEWAY_TIMEOUT',
])

export function isRetryable(code: string): boolean {
  return RETRYABLE_CODES.has(code)
}

export function calculateBackoff(attempt: number): number {
  const initialDelay = 100
  const multiplier = 2
  const maxDelay = 5000
  const jitterFactor = 0.25

  const baseDelay = Math.min(initialDelay * Math.pow(multiplier, attempt), maxDelay)
  const jitter = baseDelay * jitterFactor * (Math.random() * 2 - 1)
  
  return Math.max(0, baseDelay + jitter)
}
