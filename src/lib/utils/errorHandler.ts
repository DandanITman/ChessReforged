// Error handling utility for user-friendly error messages
export interface AppError {
  userMessage: string;
  internalCode: string;
  severity: 'error' | 'warning' | 'info';
}

// Firebase Auth error code mappings
const FIREBASE_AUTH_ERRORS: Record<string, string> = {
  // Authentication errors
  'auth/invalid-credential': 'The email or password you entered is incorrect. Please try again.',
  'auth/user-not-found': 'No account found with this email address. Please check your email or create a new account.',
  'auth/wrong-password': 'The password you entered is incorrect. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been temporarily disabled. Please contact support for assistance.',
  'auth/too-many-requests': 'Too many failed login attempts. Please wait a few minutes before trying again.',
  
  // Registration errors
  'auth/email-already-in-use': 'An account with this email address already exists. Please sign in instead.',
  'auth/weak-password': 'Please choose a stronger password with at least 8 characters.',
  'auth/operation-not-allowed': 'This sign-in method is not currently available. Please try a different method.',
  
  // Password reset errors
  'auth/expired-action-code': 'This password reset link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This password reset link is invalid. Please request a new one.',
  
  // Network errors
  'auth/network-request-failed': 'Network connection failed. Please check your internet connection and try again.',
  'auth/timeout': 'The request timed out. Please try again.',
  
  // Provider errors
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
  'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups for this site.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  
  // General errors
  'auth/internal-error': 'An unexpected error occurred. Please try again later.',
  'auth/unauthorized-domain': 'This domain is not authorized for this application.',
};

// Firestore error code mappings
const FIRESTORE_ERRORS: Record<string, string> = {
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested data was not found.',
  'already-exists': 'This data already exists.',
  'resource-exhausted': 'Service is temporarily unavailable. Please try again later.',
  'unauthenticated': 'Please sign in to continue.',
  'unavailable': 'Service is temporarily unavailable. Please try again later.',
  'deadline-exceeded': 'Request timed out. Please try again.',
};

// General application error mappings
const APP_ERRORS: Record<string, string> = {
  'network-error': 'Network connection failed. Please check your internet connection.',
  'validation-error': 'Please check your input and try again.',
  'server-error': 'Server error occurred. Please try again later.',
  'unknown-error': 'An unexpected error occurred. Please try again.',
};

export function handleError(error: unknown): AppError {
  let userMessage = 'An unexpected error occurred. Please try again.';
  let internalCode = 'unknown-error';
  const severity: 'error' | 'warning' | 'info' = 'error';

  // Type guard for error objects
  const isErrorWithCode = (err: unknown): err is { code: string; message?: string; stack?: string } => {
    return typeof err === 'object' && err !== null && 'code' in err && typeof (err as Record<string, unknown>).code === 'string';
  };

  const isErrorWithMessage = (err: unknown): err is { message: string; stack?: string } => {
    return typeof err === 'object' && err !== null && 'message' in err && typeof (err as Record<string, unknown>).message === 'string';
  };

  // Log the full error for debugging
  console.error('Application Error:', {
    message: isErrorWithMessage(error) ? error.message : 'Unknown error',
    code: isErrorWithCode(error) ? error.code : 'no-code',
    stack: isErrorWithMessage(error) ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  if (isErrorWithCode(error)) {
    internalCode = error.code;
    
    // Check Firebase Auth errors
    if (FIREBASE_AUTH_ERRORS[error.code]) {
      userMessage = FIREBASE_AUTH_ERRORS[error.code];
    }
    // Check Firestore errors
    else if (FIRESTORE_ERRORS[error.code]) {
      userMessage = FIRESTORE_ERRORS[error.code];
    }
    // Check general app errors
    else if (APP_ERRORS[error.code]) {
      userMessage = APP_ERRORS[error.code];
    }
  } else if (isErrorWithMessage(error)) {
    // Try to extract error code from message
    const codeMatch = error.message.match(/\(([^)]+)\)/);
    if (codeMatch && codeMatch[1]) {
      internalCode = codeMatch[1];
      if (FIREBASE_AUTH_ERRORS[codeMatch[1]]) {
        userMessage = FIREBASE_AUTH_ERRORS[codeMatch[1]];
      }
    }
  }

  // Special handling for network errors
  if (isErrorWithMessage(error) && (error.message.includes('network') || error.message.includes('fetch'))) {
    userMessage = 'Network connection failed. Please check your internet connection and try again.';
    internalCode = 'network-error';
  }

  return {
    userMessage,
    internalCode,
    severity
  };
}

// Helper function for form validation errors
export function createValidationError(message: string): AppError {
  return {
    userMessage: message,
    internalCode: 'validation-error',
    severity: 'warning'
  };
}

// Helper function for success messages
export function createSuccessMessage(message: string): AppError {
  return {
    userMessage: message,
    internalCode: 'success',
    severity: 'info'
  };
}

// Error reporting function (could send to analytics service)
export function reportError(error: AppError, context?: string): void {
  // In production, this could send to an error reporting service
  console.error('Error Report:', {
    userMessage: error.userMessage,
    internalCode: error.internalCode,
    severity: error.severity,
    context: context || 'unknown',
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  });
}