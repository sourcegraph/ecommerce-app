import { reportError } from "./lib/reporting";
import { getLastTraceId } from "./lib/trace";

export function setupGlobalErrorHandlers(): void {
  window.onerror = (message, source, lineno, colno, error) => {
    if (error) {
      reportError(error, {
        trace_id: getLastTraceId(),
        request_id: getLastTraceId(),
      });
    } else {
      const syntheticError = new Error(
        typeof message === "string" ? message : "Unknown error"
      );
      syntheticError.stack = `at ${source}:${lineno}:${colno}`;
      reportError(syntheticError, {
        trace_id: getLastTraceId(),
        request_id: getLastTraceId(),
      });
    }
    return false;
  };

  window.onunhandledrejection = (event) => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    reportError(error, {
      trace_id: getLastTraceId(),
      request_id: getLastTraceId(),
    });
  };
}
