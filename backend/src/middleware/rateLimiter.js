import { rateLimit } from "express-rate-limit";

const rateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // Default: 15 menit
    max: options.max || 100, // Default: 100 request per IP
    message: options.message || {
      error: "Terlalu banyak permintaan. Coba lagi nanti",
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable legacy headers
    handler: (req, res) => {
      // Custom handler untuk konsisten dengan error response lain
      res.status(429).json({
        error:
          options.message?.error ||
          "Terlalu banyak permintaan. Coba lagi nanti",
        retryAfter: Math.ceil(options.windowMs / 1000), // Detik
      });
    },
  });
};

export default rateLimiter;
