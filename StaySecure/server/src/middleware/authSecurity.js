const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const loginAttempts = new Map();
const requestBuckets = new Map();

const normalizeEmail = (value = '') => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

const getClientIdentifier = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;

  if (forwardedIp) {
    return forwardedIp.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const getLoginAttemptKey = (email, req) => {
  const normalizedEmail = normalizeEmail(email);
  const clientIp = getClientIdentifier(req);

  return `${normalizedEmail}::${clientIp}`;
};

const clearLoginAttempt = (key) => {
  loginAttempts.delete(key);
};

const isLoginLockedOut = (key, now = Date.now()) => {
  const entry = loginAttempts.get(key);

  if (!entry) {
    return false;
  }

  if (entry.lockedUntil && now < entry.lockedUntil) {
    return true;
  }

  if (entry.lockedUntil && now >= entry.lockedUntil) {
    loginAttempts.delete(key);
    return false;
  }

  return false;
};

const recordFailedLoginAttempt = (key, now = Date.now()) => {
  const existing = loginAttempts.get(key) || {
    count: 0,
    firstAttemptAt: now,
    lastAttemptAt: now,
    lockedUntil: null,
  };

  const elapsedSinceFirstAttempt = now - existing.firstAttemptAt;
  if (elapsedSinceFirstAttempt > LOCKOUT_DURATION_MS) {
    existing.count = 0;
    existing.firstAttemptAt = now;
    existing.lastAttemptAt = now;
    existing.lockedUntil = null;
  }

  existing.count += 1;
  existing.lastAttemptAt = now;

  if (existing.count >= MAX_LOGIN_ATTEMPTS) {
    existing.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(key, existing);
    return {
      lockedOut: true,
      attemptsRemaining: 0,
      resetInMs: LOCKOUT_DURATION_MS,
      count: existing.count,
    };
  }

  loginAttempts.set(key, existing);
  return {
    lockedOut: false,
    attemptsRemaining: MAX_LOGIN_ATTEMPTS - existing.count,
    resetInMs: 0,
    count: existing.count,
  };
};

const authRateLimit = (req, res, next) => {
  const clientIp = getClientIdentifier(req);
  const now = Date.now();
  const bucket = requestBuckets.get(clientIp) || { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (bucket.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication requests. Please try again later.',
    });
  }

  bucket.timestamps.push(now);
  requestBuckets.set(clientIp, bucket);
  next();
};

module.exports = {
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  getLoginAttemptKey,
  clearLoginAttempt,
  isLoginLockedOut,
  recordFailedLoginAttempt,
  authRateLimit,
};
