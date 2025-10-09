export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitterFactor?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitterFactor: 0.25,
};

function calculateDelay(
  attemptNumber: number,
  options: Required<RetryOptions>
): number {
  const baseDelay =
    options.initialDelayMs * Math.pow(options.backoffMultiplier, attemptNumber);
  const cappedDelay = Math.min(baseDelay, options.maxDelayMs);

  const jitterRange = cappedDelay * options.jitterFactor;
  const jitter = (Math.random() * 2 - 1) * jitterRange;

  return Math.max(0, cappedDelay + jitter);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts - 1 || !shouldRetry(error)) {
        throw error;
      }

      const delay = calculateDelay(attempt, opts);
      await sleep(delay);
    }
  }

  throw lastError;
}
