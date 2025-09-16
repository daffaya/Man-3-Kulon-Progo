import jwt from "jsonwebtoken";

const authenticateTokenFactory = ({ JWT_SECRET }) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      console.warn(
        "[Auth Middleware] Tidak ada token disediakan. Akses ditolak."
      );
      return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error("[Auth Middleware] Verifikasi JWT gagal:", err.message);
        return res.sendStatus(403);
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

export default authenticateTokenFactory;
