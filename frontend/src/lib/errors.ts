export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  request_id: string;
  trace_id: string;
  details?: Record<string, unknown>;
}

export const RETRYABLE_ERROR_CODES = new Set([
  "CONFLICT.VERSION_MISMATCH",
  "RATE_LIMIT.EXCEEDED",
  "SERVER.INTERNAL_ERROR",
  "SERVER.BAD_GATEWAY",
  "SERVER.UNAVAILABLE",
  "SERVER.GATEWAY_TIMEOUT",
]);

export async function parseProblemDetails(
  response: globalThis.Response
): Promise<ProblemDetails | null> {
  const contentType = response.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/problem+json")) {
    return null;
  }

  try {
    const problem = (await response.json()) as ProblemDetails;
    return problem;
  } catch {
    return null;
  }
}

export function formatUserMessage(problem: ProblemDetails): string {
  if (problem.status === 401) {
    if (problem.code === "AUTH.TOKEN_EXPIRED") {
      return "Your session has expired. Please log in again.";
    }
    return "Your session has expired. Please log in again.";
  }

  if (problem.status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (problem.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  const requestIdSuffix = problem.request_id
    ? ` or contact support with Request ID: ${problem.request_id.substring(0, 8)}`
    : "";

  const actionMessages: Record<number, string> = {
    400: `Request failed. Please check your input${requestIdSuffix}.`,
    404: `Resource not found. Please try again${requestIdSuffix}.`,
    422: `Unable to process request. Please check your input${requestIdSuffix}.`,
    500: `An error occurred. Please try again${requestIdSuffix}.`,
    502: `Service temporarily unavailable. Please try again${requestIdSuffix}.`,
    503: `Service temporarily unavailable. Please try again${requestIdSuffix}.`,
    504: `Request timed out. Please try again${requestIdSuffix}.`,
  };

  return (
    actionMessages[problem.status] ||
    `Request failed. Please try again${requestIdSuffix}.`
  );
}

export function isRetryable(problem: ProblemDetails): boolean {
  return RETRYABLE_ERROR_CODES.has(problem.code);
}
