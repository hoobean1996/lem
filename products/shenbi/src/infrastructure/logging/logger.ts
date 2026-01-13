/**
 * Frontend Logger
 *
 * Provides info(), warn(), error() functions that send logs to the backend API.
 * Logs are batched to reduce network requests.
 * Falls back to console in development or when API is unavailable.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  component?: string;
  url?: string;
  stack_trace?: string;
}

interface LoggerConfig {
  apiUrl: string;
  batchSize: number;
  flushInterval: number;
  enabled: boolean;
}

const defaultConfig: LoggerConfig = {
  apiUrl: '/api/logs',
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  enabled: false, // Disabled - no backend logging endpoint
};

class Logger {
  private config: LoggerConfig;
  private queue: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private authToken: string | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };

    // Flush remaining logs before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
      window.addEventListener('pagehide', () => this.flush());
    }
  }

  /**
   * Set the auth token for API requests
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Enable or disable remote logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Log a debug message (development only, not sent to API)
   */
  debug(message: string, context?: Record<string, unknown>, component?: string): void {
    if (import.meta.env.DEV) {
      console.debug(`[${component || 'app'}]`, message, context || '');
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log('info', message, context, component);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log('warn', message, context, component);
  }

  /**
   * Log an error message
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>,
    component?: string
  ): void {
    let stackTrace: string | undefined;
    let errorContext = context || {};

    if (error instanceof Error) {
      stackTrace = error.stack;
      errorContext = {
        ...errorContext,
        errorName: error.name,
        errorMessage: error.message,
      };
    } else if (error !== undefined) {
      errorContext = {
        ...errorContext,
        error: String(error),
      };
    }

    this.log('error', message, errorContext, component, stackTrace);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    component?: string,
    stackTrace?: string
  ): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      component,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stack_trace: stackTrace,
    };

    // Always log to console in development
    if (import.meta.env.DEV) {
      const consoleFn =
        level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
      consoleFn(`[${component || 'app'}]`, message, context || '');
    }

    // Queue for API if enabled
    if (this.config.enabled) {
      this.queue.push(entry);

      // Flush immediately for errors
      if (level === 'error') {
        this.flush();
      } else if (this.queue.length >= this.config.batchSize) {
        this.flush();
      } else {
        this.scheduleFlush();
      }
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Send queued logs to the API
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const logs = [...this.queue];
    this.queue = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.config.apiUrl}/batch`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        // Re-queue logs on failure (but don't retry infinitely)
        if (this.queue.length < 100) {
          this.queue.unshift(...logs);
        }
        console.warn('Failed to send logs to API:', response.status);
      }
    } catch (err) {
      // Re-queue logs on network error
      if (this.queue.length < 100) {
        this.queue.unshift(...logs);
      }
      console.warn('Failed to send logs to API:', err);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const debug = (message: string, context?: Record<string, unknown>, component?: string) =>
  logger.debug(message, context, component);

export const info = (message: string, context?: Record<string, unknown>, component?: string) =>
  logger.info(message, context, component);

export const warn = (message: string, context?: Record<string, unknown>, component?: string) =>
  logger.warn(message, context, component);

export const error = (
  message: string,
  err?: Error | unknown,
  context?: Record<string, unknown>,
  component?: string
) => logger.error(message, err, context, component);

export const setAuthToken = (token: string | null) => logger.setAuthToken(token);
export const setEnabled = (enabled: boolean) => logger.setEnabled(enabled);
export const flush = () => logger.flush();
