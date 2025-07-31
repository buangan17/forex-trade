import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RateLimitError, AuthenticationError, AuthorizationError } from './error-handler';
import logger, { tradingLogger } from './logger';

// Rate limiting configurations
export const rateLimitConfigs = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
  },
  
  // Trading endpoints
  trading: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit each user to 30 trading requests per minute
    message: 'Too many trading requests, please slow down.',
  },
  
  // Market data endpoints
  marketData: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each user to 60 market data requests per minute
    message: 'Too many market data requests, please slow down.',
  },
};

// Create rate limiter middleware
export function createRateLimiter(config: typeof rateLimitConfigs.general) {
  return rateLimit({
    ...config,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const error = new RateLimitError(config.message);
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent'),
      });
      throw error;
    },
  });
}

// Security headers middleware
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'wss:', 'https:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
}

// Password hashing utilities
export const password = {
  async hash(plainPassword: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(plainPassword, saltRounds);
  },
  
  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
  
  generateSecure(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  },
};

// JWT utilities
export const token = {
  sign(payload: object, expiresIn: string = '7d'): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    return jwt.sign(payload, secret, { expiresIn });
  },
  
  verify(token: string): any {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  },
  
  decode(token: string): any {
    return jwt.decode(token);
  },
};

// API key utilities
export const apiKey = {
  generate(): string {
    return crypto.randomBytes(32).toString('hex');
  },
  
  hash(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  },
  
  verify(key: string, hashedKey: string): boolean {
    const hashedInput = crypto.createHash('sha256').update(key).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hashedKey));
  },
};

// Encryption utilities
export const encryption = {
  encrypt(text: string, key?: string): string {
    const secretKey = key || process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, secretKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  },
  
  decrypt(encryptedText: string, key?: string): string {
    const secretKey = key || process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const algorithm = 'aes-256-gcm';
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(algorithm, secretKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },
};

// Input sanitization
export const sanitize = {
  html(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  sql(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  },
  
  filename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  },
};

// IP address utilities
export const ip = {
  extract(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const connection = request.headers.get('x-connecting-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return real || connection || 'unknown';
  },
  
  isPrivate(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
    ];
    
    return privateRanges.some(range => range.test(ip));
  },
};

// Security middleware for API routes
export function withSecurity(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    requireRole?: string[];
    rateLimit?: keyof typeof rateLimitConfigs;
  } = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      if (options.rateLimit) {
        // Rate limiting logic would be implemented here
        // This is a simplified version
        const clientIp = ip.extract(request);
        logger.debug('Request from IP', { ip: clientIp, url: request.url });
      }
      
      // Apply authentication if required
      if (options.requireAuth) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AuthenticationError('Missing or invalid authorization header');
        }
        
        const tokenValue = authHeader.substring(7);
        const decoded = token.verify(tokenValue);
        
        // Add user info to request context
        (request as any).user = decoded;
        
        // Check role-based authorization
        if (options.requireRole && options.requireRole.length > 0) {
          const userRole = decoded.role;
          if (!options.requireRole.includes(userRole)) {
            throw new AuthorizationError('Insufficient permissions');
          }
        }
      }
      
      // Log security events
      tradingLogger.securityAlert('api_access', {
        url: request.url,
        method: request.method,
        ip: ip.extract(request),
        userAgent: request.headers.get('user-agent'),
        authenticated: options.requireAuth,
      });
      
      return await handler(request, context);
    } catch (error) {
      // Security-related errors are logged with higher priority
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        tradingLogger.securityAlert('auth_failure', {
          error: error.message,
          url: request.url,
          ip: ip.extract(request),
        });
      }
      
      throw error;
    }
  };
}

// CORS configuration
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Session security
export const session = {
  generateId(): string {
    return crypto.randomBytes(32).toString('hex');
  },
  
  isValidSessionId(sessionId: string): boolean {
    return /^[a-f0-9]{64}$/.test(sessionId);
  },
  
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64');
  },
  
  verifyCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'base64'),
      Buffer.from(sessionToken, 'base64')
    );
  },
};

// Audit logging
export const audit = {
  log(event: string, details: any, userId?: string) {
    logger.info('Audit event', {
      event,
      details,
      userId,
      timestamp: new Date().toISOString(),
    });
  },
  
  loginAttempt(email: string, success: boolean, ip: string) {
    this.log('login_attempt', {
      email,
      success,
      ip,
    });
  },
  
  passwordChange(userId: string, ip: string) {
    this.log('password_change', {
      userId,
      ip,
    });
  },
  
  permissionChange(userId: string, oldRole: string, newRole: string, changedBy: string) {
    this.log('permission_change', {
      userId,
      oldRole,
      newRole,
      changedBy,
    });
  },
};

// Data validation utilities
export const validate = {
  email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  strongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  },
  
  uuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  tradingSymbol(symbol: string): boolean {
    const symbolRegex = /^[A-Z]{3}_[A-Z]{3}$/;
    return symbolRegex.test(symbol);
  },
};