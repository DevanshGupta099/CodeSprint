import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * High-performance sliding-window in-memory rate limiter
 * Protects against brute-force, scraping, and AI quota exhaustion
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  name?: string;
}) {
  const { windowMs, maxRequests, message, name = 'rate-limit' } = options;
  const ipMap = new Map<string, RateLimitRecord>();

  // Periodic garbage collection every 2 minutes to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      if (now > record.resetTime) {
        ipMap.delete(ip);
      }
    }
  }, 120000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP behind proxies (Render, Cloudflare, Vercel)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown-ip';

    const now = Date.now();
    let record = ipMap.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      ipMap.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: message || `Rate limit exceeded (${name}). Please retry in ${resetSeconds} seconds.`,
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  };
}

/**
 * Standard rate limiter for telemetry and read-only graph queries (120 req / min)
 */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  name: 'general',
  message: 'Too many API requests. Please throttle your client.',
});

/**
 * Stricter rate limiter for AI agents, disruption triggers, and file uploads (30 req / min)
 */
export const sensitiveEndpointLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  name: 'sensitive-ai-operation',
  message: 'Rate limit exceeded on mutation/AI endpoint. Throttled to preserve service stability.',
});

/**
 * Hardened HTTP security headers middleware (OWASP recommendations)
 */
export function hardenedSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Clickjacking defense
  res.setHeader('X-Frame-Options', 'DENY');
  // Legacy XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict Transport Security (HSTS) for HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Referrer privacy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict browser device features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // Restrict embedding
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  next();
}

/**
 * Identifier sanitizer for route parameters (e.g. scenarioKey, presetKey, supplierId, memoId)
 * Supports alphanumeric, underscores, and hyphens up to 100 chars (UUIDs and slugs)
 */
const SAFE_IDENTIFIER_REGEX = /^[A-Z0-9_-]{1,100}$/i;

export function validateSafeIdentifier(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const val = req.params[paramName];
    if (!val || !SAFE_IDENTIFIER_REGEX.test(val)) {
      return res.status(400).json({
        error: 'INVALID_IDENTIFIER',
        message: `Parameter '${paramName}' must be alphanumeric and under 64 characters.`,
      });
    }
    next();
  };
}

/**
 * Dynamic CORS configuration with support for production Vercel frontend domains
 */
export function getCorsOptions() {
  const allowed = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'https://veritas-supply.vercel.app',
        'http://localhost:3000',
        'http://localhost:5000',
      ];

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow mobile apps, curl, server-to-server requests without Origin header
      if (!origin) return callback(null, true);

      // Explicit whitelist check
      if (allowed.includes(origin) || allowed.includes('*')) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (*.vercel.app)
      if (/^https:\/\/[a-z0-9-]+(\.vercel\.app)$/i.test(origin)) {
        return callback(null, true);
      }

      // Allow in dev mode
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // Pre-flight cache for 24h
  };
}
