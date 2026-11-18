const requestCounts = new Map();

/**
 * Basic in-memory rate limiter for authentication endpoints.
 * @param {number} windowMs 
 * @param {number} maxRequests 
 */
function authRateLimiter(windowMs = 60000, maxRequests = 10) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many authentication attempts. Please try again after one minute.'
        }
      });
    }

    next();
  };
}

module.exports = {
  authRateLimiter
};
