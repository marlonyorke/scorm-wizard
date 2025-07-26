// Structured logging utility for SCORM Wizard
// Supports multiple log levels: error, warn, info, debug

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
  constructor(context = 'General') {
    this.context = context;
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
      context: this.context,
      message,
      data,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
    };

    if (level <= CURRENT_LEVEL) {
      console.log(JSON.stringify(logEntry));
    }

    // In production, you might want to send logs to a service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLogService(logEntry);
    }
  }

  error(message, data) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  sendToLogService(logEntry) {
    // Placeholder for external logging service (e.g., LogRocket, Sentry)
    // This can be implemented based on your logging infrastructure
    if (process.env.NODE_ENV === 'development') {
      console.log('Log sent to service:', logEntry);
    }
  }
}

// Create specific loggers for different contexts
const apiLogger = new Logger('API');
const uiLogger = new Logger('UI');
const authLogger = new Logger('Auth');
const performanceLogger = new Logger('Performance');

// Convenience methods
const createLogger = (context) => new Logger(context);

export {
  Logger,
  apiLogger,
  uiLogger,
  authLogger,
  performanceLogger,
  createLogger
};
