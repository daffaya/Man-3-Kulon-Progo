// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Creates a middleware function to restrict access to specific user roles.
 * This is a higher-order function that returns the actual middleware.
 * @param {string[]} roles - An array of roles (e.g., ['jurnalis', 'admin']) that are allowed to access the route.
 * @returns {Function} An Express middleware function that checks the user's role.
 */
export const restrictTo = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Token tidak valid" });
  }

  const userRole = req.user.role.toLowerCase();

  if (userRole === "super_admin" || roles.includes(userRole)) {
    return next();
  }

  return res.status(403).json({
    error: `Akses ditolak: Role ${userRole} tidak diizinkan`,
  });
};

/**
 * Creates a middleware function to authenticate a JSON Web Token (JWT).
 * This is a factory function that configures the middleware with a JWT secret.
 * @param {object} options - Configuration options.
 * @param {string} options.JWT_SECRET - The secret key used to verify the JWT.
 * @returns {Function} An Express middleware function that authenticates the request.
 */
export const authenticateTokenFactory = ({ JWT_SECRET }) => {
  return (req, res, next) => {
    // AUDIT-011: prefer the httpOnly cookie (set by POST /login) — this is
    // what the frontend now relies on, since the JWT is no longer written
    // anywhere JS can read it (localStorage). The Authorization header is
    // kept as a fallback so non-browser API clients (and this project's own
    // test suite) that send a Bearer token still work.
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];
    const token = req.cookies?.token || headerToken;

    if (token == null) {
      return res.status(401).json({ error: "Tidak ada token disediakan" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token telah kadaluarsa" });
        }

        return res.status(403).json({ error: "Token tidak valid" });
      }

      req.user = user;
      next();
    });
  };
};
