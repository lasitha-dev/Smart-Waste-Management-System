/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays fallback UI
 * 
 * @author Kumarasinghe S.S (IT22221414)
 * @module ErrorBoundary
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorHandler, AppError, ErrorTypes, ErrorSeverity } from '../utils/errorHandling';

/**
 * Error Boundary Component
 * Provides error boundaries for React component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  /**
   * Static method to update state when error occurs
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Catches errors and logs them
   */
  componentDidCatch(error, errorInfo) {
    const appError = new AppError(
      error.message || 'Component render error',
      ErrorTypes.SYSTEM_ERROR,
      ErrorSeverity.HIGH,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.name || 'Unknown',
        retryCount: this.state.retryCount
      }
    );

    // Log the error
    ErrorHandler.logError(appError);

    // Update state with error info
    this.setState({
      error: appError,
      errorInfo
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }
  }

  /**
   * Handles retry attempt
   */
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Call optional retry callback
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  /**
   * Handles reset to initial state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });

    // Call optional reset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Handles contact support
   */
  handleContactSupport = () => {
    const errorDetails = {
      error: this.state.error?.message,
      component: this.props.name,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    };

    console.log('📞 Contacting support with error details:', errorDetails);
    
    // In a real app, this would open support channels
    if (this.props.onContactSupport) {
      this.props.onContactSupport(errorDetails);
    }
  };

  /**
   * Renders error fallback UI
   */
  renderErrorFallback() {
    const { error, retryCount } = this.state;
    const { 
      showRetry = true, 
      showReset = true, 
      showSupport = true,
      maxRetries = 3,
      customMessage 
    } = this.props;

    const canRetry = showRetry && retryCount < maxRetries;

    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>

          {/* Error Title */}
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>

          {/* Error Message */}
          <Text style={styles.errorMessage}>
            {customMessage || 
             error?.message || 
             'An unexpected error occurred while loading this screen.'}
          </Text>

          {/* Error Details (Development only) */}
          {__DEV__ && error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorDetailsTitle}>Error Details (Dev Mode):</Text>
              <Text style={styles.errorDetailsText}>
                {error.message}
              </Text>
              {error.details && (
                <Text style={styles.errorDetailsText}>
                  {JSON.stringify(error.details, null, 2)}
                </Text>
              )}
            </View>
          )}

          {/* Retry Information */}
          {retryCount > 0 && (
            <Text style={styles.retryInfo}>
              Retry attempts: {retryCount}/{maxRetries}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {canRetry && (
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={this.handleRetry}
                testID="error-retry-button"
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            {showReset && (
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={this.handleReset}
                testID="error-reset-button"
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}

            {showSupport && (
              <TouchableOpacity 
                style={styles.supportButton} 
                onPress={this.handleContactSupport}
                testID="error-support-button"
              >
                <Text style={styles.supportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>What can you do?</Text>
            <Text style={styles.helpText}>
              • Try refreshing the screen using the "Try Again" button
            </Text>
            <Text style={styles.helpText}>
              • Check your internet connection
            </Text>
            <Text style={styles.helpText}>
              • Close and reopen the app
            </Text>
            <Text style={styles.helpText}>
              • Contact our support team if the problem persists
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.handleReset);
      }

      // Render default error UI
      return this.renderErrorFallback();
    }

    // Render children normally
    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 * @param {React.Component} Component - Component to wrap
 * @param {Object} errorBoundaryProps - Props for error boundary
 * @returns {React.Component} Wrapped component
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Specialized error boundaries for different parts of the app
 */

/**
 * Screen-level error boundary
 */
export const ScreenErrorBoundary = ({ children, screenName }) => (
  <ErrorBoundary
    name={`${screenName}Screen`}
    showRetry={true}
    showReset={true}
    showSupport={true}
    maxRetries={3}
    customMessage={`Unable to load the ${screenName} screen. Please try again.`}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Component-level error boundary
 */
export const ComponentErrorBoundary = ({ children, componentName }) => (
  <ErrorBoundary
    name={`${componentName}Component`}
    showRetry={true}
    showReset={false}
    showSupport={false}
    maxRetries={2}
    customMessage={`The ${componentName} component encountered an error.`}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Service-level error boundary (for critical operations)
 */
export const ServiceErrorBoundary = ({ children, serviceName }) => (
  <ErrorBoundary
    name={`${serviceName}Service`}
    showRetry={true}
    showReset={true}
    showSupport={true}
    maxRetries={1}
    customMessage={`A critical service error occurred. Please contact support if this continues.`}
  >
    {children}
  </ErrorBoundary>
);

const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  disabled: '#9E9E9E',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  iconContainer: {
    marginBottom: 24
  },
  errorIcon: {
    fontSize: 64,
    textAlign: 'center'
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16
  },
  errorMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16
  },
  errorDetails: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%'
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  errorDetailsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 4
  },
  retryInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 120
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  resetButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 120
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  supportButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120
  },
  supportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  helpContainer: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    width: '100%'
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4
  }
});

export default ErrorBoundary;
