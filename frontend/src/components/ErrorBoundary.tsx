import { Component, ReactNode } from 'react';
import { reportError } from '../lib/reporting';
import { getLastTraceId } from '../lib/trace';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error: Error): void {
    this.setState({ hasError: true, error });
    
    reportError(error, {
      trace_id: getLastTraceId(),
    });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#FAF9F6',
          color: '#1A1919',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '32rem',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#52504E',
              marginBottom: '2rem',
            }}>
              We're sorry for the inconvenience. Please try reloading the page or return to the home page.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#1A1919',
                  color: '#FAF9F6',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  backgroundColor: 'transparent',
                  color: '#1A1919',
                  border: '1px solid #DEDCDA',
                  borderRadius: '0.375rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
