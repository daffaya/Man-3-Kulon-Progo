import jwt from "jsonwebtoken";

export const restrictTo = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Token tidak valid atau tidak disediakan",
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: "Akses ditolak: Role tidak sesuai",
    });
  }

  next();
};

export const authenticateTokenFactory = ({ JWT_SECRET }) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      console.warn(
        "[Auth Middleware] Tidak ada token disediakan. Akses ditolak."
      );
      return res.status(401).json({ error: "Tidak ada token disediakan" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error("[Auth Middleware] Verifikasi JWT gagal:", err.message);

        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ error: "Token telah kadaluarsa" });
        }

        return res.status(403).json({ error: "Token tidak valid" });
      }

      req.user = user;
      console.log(
        "[Auth Middleware] Token valid. User:",
        user.username,
        "Role:",
        user.role
      );
      next();
    });
  };
};
