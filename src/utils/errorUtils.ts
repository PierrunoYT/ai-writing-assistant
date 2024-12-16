import { ErrorInfo } from 'react';
import { ERROR_MESSAGES } from '../config/constants';

interface ErrorLogData {
  error: Error;
  errorInfo?: ErrorInfo;
  timestamp: number;
  userAgent: string;
  location: string;
}

/**
 * Logs error to a service (replace with your error tracking service)
 */
export const logErrorToService = async (error: Error, errorInfo?: ErrorInfo): Promise<void> => {
  const errorData: ErrorLogData = {
    error,
    errorInfo,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    location: window.location.href,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData);
    return;
  }

  try {
    // TODO: Replace with your error tracking service
    // await fetch('your-error-tracking-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
};

/**
 * Formats API errors into user-friendly messages
 */
export const formatAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Validates input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 60, timeWindow: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilNextWindow(): number {
    if (this.requests.length === 0) return 0;
    return this.timeWindow - (Date.now() - this.requests[0]);
  }
}

/**
 * Retry utility for async operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i === maxRetries - 1) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, i)));
    }
  }
  
  throw lastError!;
};
