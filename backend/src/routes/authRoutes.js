import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authenticateTokenFactory from "../middleware/authMiddleware.js";

const authRouterFactory = ({ pool, JWT_SECRET, JWT_EXPIRATION }) => {
  const authRouter = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });

  authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      console.log("[Auth Route] POST /login hit.");
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      if (rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "User tidak ditemukan" });
      }
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ success: false, message: "Username atau Password salah" });
      }
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
      });

      res.json({
        success: true,
        user: { username: user.username },
        token: token,
      });
    } catch (error) {
      console.error("Error saat melakukan query:", error);
      return res
        .status(500)
        .json({ success: false, message: "Terjadi kesalahan server" });
    }
  });
  return authRouter;
};

export default authRouterFactory;
