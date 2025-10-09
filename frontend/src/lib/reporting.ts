export interface ErrorReport {
  message: string;
  stack?: string;
  trace_id?: string | null;
  request_id?: string | null;
  url: string;
  userAgent: string;
  timestamp: string;
}

type ErrorReporter = (report: ErrorReport) => void;

let reporter: ErrorReporter = () => {};

export function setErrorReporter(fn: ErrorReporter): void {
  reporter = fn;
}

export function reportError(
  error: Error,
  context?: {
    trace_id?: string | null;
    request_id?: string | null;
  }
): void {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    trace_id: context?.trace_id,
    request_id: context?.request_id,
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  reporter(report);
}
