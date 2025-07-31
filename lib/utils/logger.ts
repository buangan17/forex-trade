import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),
  
  // Error log file
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    handleExceptions: true,
    json: true,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // Combined log file
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    json: true,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  
  // Trading specific logs
  new DailyRotateFile({
    filename: 'logs/trading-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    json: true,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// Custom log methods for trading activities
export const tradingLogger = {
  orderPlaced: (userId: string, order: any) => {
    logger.info('Order placed', {
      userId,
      orderId: order.id,
      symbol: order.symbol,
      type: order.type,
      side: order.side,
      amount: order.amount,
      price: order.price,
      timestamp: new Date().toISOString(),
    });
  },
  
  orderFilled: (userId: string, order: any) => {
    logger.info('Order filled', {
      userId,
      orderId: order.id,
      symbol: order.symbol,
      filledAmount: order.filledAmount,
      averagePrice: order.averagePrice,
      fees: order.fees,
      timestamp: new Date().toISOString(),
    });
  },
  
  positionOpened: (userId: string, position: any) => {
    logger.info('Position opened', {
      userId,
      positionId: position.id,
      symbol: position.symbol,
      side: position.side,
      size: position.size,
      entryPrice: position.entryPrice,
      timestamp: new Date().toISOString(),
    });
  },
  
  positionClosed: (userId: string, position: any) => {
    logger.info('Position closed', {
      userId,
      positionId: position.id,
      symbol: position.symbol,
      realizedPnL: position.realizedPnL,
      closePrice: position.currentPrice,
      timestamp: new Date().toISOString(),
    });
  },
  
  botStarted: (userId: string, botId: string, botName: string) => {
    logger.info('Trading bot started', {
      userId,
      botId,
      botName,
      timestamp: new Date().toISOString(),
    });
  },
  
  botStopped: (userId: string, botId: string, botName: string, reason?: string) => {
    logger.info('Trading bot stopped', {
      userId,
      botId,
      botName,
      reason,
      timestamp: new Date().toISOString(),
    });
  },
  
  botError: (userId: string, botId: string, error: Error) => {
    logger.error('Trading bot error', {
      userId,
      botId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  },
  
  apiError: (endpoint: string, error: Error, userId?: string) => {
    logger.error('API error', {
      endpoint,
      error: error.message,
      stack: error.stack,
      userId,
      timestamp: new Date().toISOString(),
    });
  },
  
  securityAlert: (type: string, details: any, userId?: string) => {
    logger.warn('Security alert', {
      type,
      details,
      userId,
      timestamp: new Date().toISOString(),
    });
  },
};

// Performance logger
export const performanceLogger = {
  apiResponse: (endpoint: string, duration: number, statusCode: number) => {
    logger.http('API response', {
      endpoint,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  },
  
  dbQuery: (query: string, duration: number) => {
    logger.debug('Database query', {
      query,
      duration,
      timestamp: new Date().toISOString(),
    });
  },
  
  cacheHit: (key: string, type: 'hit' | 'miss') => {
    logger.debug('Cache operation', {
      key,
      type,
      timestamp: new Date().toISOString(),
    });
  },
};

// System logger
export const systemLogger = {
  startup: (service: string, version: string) => {
    logger.info('Service started', {
      service,
      version,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
  },
  
  shutdown: (service: string, reason?: string) => {
    logger.info('Service shutdown', {
      service,
      reason,
      timestamp: new Date().toISOString(),
    });
  },
  
  healthCheck: (service: string, status: 'healthy' | 'unhealthy', details?: any) => {
    logger.info('Health check', {
      service,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

export default logger;