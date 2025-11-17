/**
 * Error Boundary Components
 * Catch and handle React component errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[]; // If any of these keys change, reset the error state
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// Main Error Boundary Component
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler prop
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Could send to error tracking service here
    // e.g., Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;

      if (prevKeys.length !== currentKeys.length ||
          prevKeys.some((key, index) => key !== currentKeys[index])) {
        this.resetError();
      }
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Default Error Fallback Component
// ============================================================================

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Oops! Something went wrong
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          We're sorry, but an unexpected error occurred. Don't worry, your data is safe.
        </p>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-red-800 mb-2">Error Message:</h2>
          <p className="text-sm text-red-700 font-mono break-words">
            {error.message || 'Unknown error'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={resetError}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm text-gray-600 hover:text-gray-800 underline mb-4"
        >
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </button>

        {/* Technical Details */}
        {showDetails && errorInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-auto">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Component Stack:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
              {errorInfo.componentStack}
            </pre>
          </div>
        )}

        {/* Support Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            If this problem persists, please{' '}
            <a
              href="https://github.com/tanneressmeier/Tool-Repository-/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              report the issue on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Specialized Error Boundaries
// ============================================================================

/**
 * Minimal error fallback for non-critical sections
 */
export const MinimalErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            This section encountered an error
          </h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          <button
            onClick={resetError}
            className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Error boundary for AI operations with retry functionality
 */
export const AIErrorBoundary: React.FC<{
  children: ReactNode;
  onRetry?: () => void;
}> = ({ children, onRetry }) => {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 m-4">
          <div className="flex items-center mb-4">
            <svg
              className="h-6 w-6 text-yellow-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-yellow-900">
              AI Operation Failed
            </h3>
          </div>

          <p className="text-sm text-yellow-800 mb-4">
            {error.message.includes('API_KEY')
              ? 'Please configure your Gemini API key in settings.'
              : error.message.includes('rate limit')
              ? 'API rate limit exceeded. Please wait a moment before retrying.'
              : `An error occurred: ${error.message}`}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (onRetry) onRetry();
                resetError();
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={resetError}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Error boundary for data operations with data recovery options
 */
export const DataErrorBoundary: React.FC<{
  children: ReactNode;
  onClearData?: () => void;
}> = ({ children, onClearData }) => {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            Data Error
          </h3>

          <p className="text-sm text-red-800 mb-4">
            {error.message.includes('QuotaExceededError')
              ? 'Storage quota exceeded. Please clear old data to continue.'
              : error.message.includes('parse')
              ? 'Failed to load saved data. The data may be corrupted.'
              : `Data operation failed: ${error.message}`}
          </p>

          <div className="flex gap-3">
            <button
              onClick={resetError}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            {onClearData && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'This will clear all saved data. Are you sure?'
                    )
                  ) {
                    onClearData();
                    resetError();
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Clear Data
              </button>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default ErrorBoundary;
