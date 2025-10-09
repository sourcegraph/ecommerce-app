import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import theme from "./theme";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { getLastRequestId } from "./api/client";
import { getTraceparent } from "./utils/tracing";
// Remove blue outline from buttons and links
import "focus-visible/dist/focus-visible";
// Lazy load images
import "lazysizes";
// import a plugin
import "lazysizes/plugins/parent-fit/ls.parent-fit";

window.onerror = (message, source, lineno, colno, error) => {
  console.error('Uncaught error:', {
    message,
    source,
    lineno,
    colno,
    error: error?.stack,
    requestId: getLastRequestId(),
    traceparent: getTraceparent(),
    timestamp: new Date().toISOString(),
    userAgent: globalThis.navigator.userAgent,
    url: window.location.href,
  })
  return false
}

window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
    requestId: getLastRequestId(),
    traceparent: getTraceparent(),
    timestamp: new Date().toISOString(),
    userAgent: globalThis.navigator.userAgent,
    url: window.location.href,
  })
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </ErrorBoundary>
  </StrictMode>
);
