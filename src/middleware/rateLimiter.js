import { rateLimit } from "express-rate-limit";

/**
 * Creates an Express rate-limiting middleware with customizable options.
 * @param {Object} [options={}] - Configuration options for the rate limiter.
 * @param {number} [options.windowMs=15*60*1000] - The time window in milliseconds for which requests are counted. Default is 15 minutes.
 * @param {number} [options.max=100] - The maximum number of requests allowed from a single IP within the windowMs. Default is 100.
 * @param {Object|string} [options.message={ error: "Terlalu banyak permintaan. Coba lagi nanti" }] - The error message to send when the limit is reached.
 * @returns {Function} An Express middleware function that applies the rate limit.
 */
const rateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      error: "Terlalu banyak permintaan. Coba lagi nanti",
    },
    standardHeaders: true,
    legacyHeaders: false,
    /**
     * Custom handler for when the rate limit is exceeded.
     * Sends a JSON response with a 429 status code.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    handler: (req, res) => {
      res.status(429).json({
        error:
          options.message?.error ||
          "Terlalu banyak permintaan. Coba lagi nanti",
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  });
};

export default rateLimiter;
