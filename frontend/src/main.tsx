import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import theme from "./theme";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastProvider";
import { setupGlobalErrorHandlers } from "./setupGlobalErrorHandlers";
import "focus-visible/dist/focus-visible";
import "lazysizes";
import "lazysizes/plugins/parent-fit/ls.parent-fit";

setupGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);
