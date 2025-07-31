import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiError, ApiResponse } from '@/types';
import logger, { tradingLogger } from './logger';

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class TradingError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'TRADING_ERROR', true, details);
  }
}

export class MarketDataError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 503, 'MARKET_DATA_ERROR', true, details);
  }
}

export class BrokerError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 502, 'BROKER_ERROR', true, details);
  }
}

// Error handler for API routes
export function handleApiError(error: unknown, request?: NextRequest): NextResponse {
  let apiError: ApiError;
  
  if (error instanceof AppError) {
    apiError = {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
    
    // Log operational errors as warnings, programming errors as errors
    if (error.isOperational) {
      logger.warn('Operational error', {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        url: request?.url,
        method: request?.method,
      });
    } else {
      logger.error('Programming error', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
        url: request?.url,
        method: request?.method,
      });
    }
  } else if (error instanceof ZodError) {
    apiError = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 400,
      details: {
        issues: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      },
    };
    
    logger.warn('Validation error', {
      error: error.message,
      issues: error.issues,
      url: request?.url,
      method: request?.method,
    });
  } else if (error instanceof Error) {
    apiError = {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      statusCode: 500,
    };
    
    logger.error('Unexpected error', {
      error: error.message,
      stack: error.stack,
      url: request?.url,
      method: request?.method,
    });
  } else {
    apiError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      statusCode: 500,
    };
    
    logger.error('Unknown error', {
      error: String(error),
      url: request?.url,
      method: request?.method,
    });
  }
  
  const response: ApiResponse = {
    success: false,
    error: apiError,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(response, { status: apiError.statusCode });
}

// Async error wrapper for API routes
export function asyncHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}

// Error boundary for React components
export class ErrorBoundary extends Error {
  public readonly componentStack?: string;
  
  constructor(error: Error, errorInfo?: { componentStack: string }) {
    super(error.message);
    this.name = 'ErrorBoundary';
    this.stack = error.stack;
    this.componentStack = errorInfo?.componentStack;
    
    logger.error('React error boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    });
  }
}

// Global error handlers for different environments
export function setupGlobalErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack,
    });
    
    // Graceful shutdown
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled promise rejection', {
      reason: String(reason),
      promise: String(promise),
    });
    
    // Graceful shutdown
    process.exit(1);
  });
  
  // Handle SIGTERM (graceful shutdown)
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    
    // Perform cleanup operations here
    process.exit(0);
  });
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    
    // Perform cleanup operations here
    process.exit(0);
  });
}

// Utility functions for error handling
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

export function sanitizeError(error: Error): Partial<Error> {
  return {
    name: error.name,
    message: error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  };
}

export function createApiResponse<T>(
  data?: T,
  message?: string,
  success: boolean = true
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

// Trading specific error handlers
export function handleTradingError(error: unknown, userId?: string, botId?: string) {
  if (error instanceof TradingError) {
    tradingLogger.botError(userId || 'unknown', botId || 'unknown', error);
  } else if (error instanceof BrokerError) {
    tradingLogger.apiError('broker', error as Error, userId);
  } else if (error instanceof MarketDataError) {
    tradingLogger.apiError('market-data', error as Error, userId);
  } else {
    logger.error('Unexpected trading error', {
      error: error instanceof Error ? error.message : String(error),
      userId,
      botId,
    });
  }
}

// Rate limiting error handler
export function handleRateLimit(identifier: string, limit: number, windowMs: number) {
  const error = new RateLimitError(
    `Rate limit exceeded. Maximum ${limit} requests per ${windowMs / 1000} seconds.`
  );
  
  logger.warn('Rate limit exceeded', {
    identifier,
    limit,
    windowMs,
    timestamp: new Date().toISOString(),
  });
  
  return error;
}