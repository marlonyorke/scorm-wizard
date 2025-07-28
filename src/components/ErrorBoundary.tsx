import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  background: var(--secondary-bg, #f5f5f5);
  border-radius: 8px;
  margin: 1rem;
  border: 1px solid var(--border-color, #ddd);
  
  .theme-neon & {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid #00ff00;
    color: #00ff00;
  }
`;

const ErrorTitle = styled.h2`
  color: var(--error-color, #e74c3c);
  margin-bottom: 1rem;
  
  .theme-neon & {
    color: #ff6b6b;
  }
`;

const ErrorMessage = styled.p`
  color: var(--secondary-text, #666);
  margin-bottom: 1rem;
  
  .theme-neon & {
    color: #ccc;
  }
`;

const RetryButton = styled.button`
  background: var(--primary-accent, #4361ee);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 0.5rem;
  
  &:hover {
    background: var(--secondary-accent, #3a0ca3);
  }
  
  .theme-neon & {
    background: #00ff00;
    color: #000;
    
    &:hover {
      background: #00cc00;
    }
  }
`;

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Log to external service if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>
            {this.props.componentName ? `${this.props.componentName} Error` : 'Oops! Something went wrong'}
          </ErrorTitle>
          <ErrorMessage>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </ErrorMessage>
          {process.env.NODE_ENV === 'development' && (
            <ErrorMessage>
              <strong>Error:</strong> {this.state.error?.message}
            </ErrorMessage>
          )}
          <RetryButton onClick={this.handleRetry}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
