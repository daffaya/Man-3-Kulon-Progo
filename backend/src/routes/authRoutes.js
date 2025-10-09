import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";

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
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRATION,
        }
      );

      res.json({
        success: true,
        user: { username: user.username, role: user.role },
        token: token,
      });
    } catch (error) {
      console.error("Error saat melakukan query:", error);
      return res
        .status(500)
        .json({ success: false, message: "Terjadi kesalahan server" });
    }
  });

  authRouter.post(
    "/register",
    authenticateToken,
    restrictTo(["admin"]),
    async (req, res) => {
      const { username, password, role } = req.body;
      try {
        console.log("[Auth Route] POST /register hit.");
        if (!username || !password || !role) {
          return res.status(400).json({
            success: false,
            message: "All field are required!",
          });
        }

        // Check if user already exists
        const [existingUserRows] = await pool.query(
          "SELECT * FROM users WHERE username = ?",
          [username]
        );

        if (existingUserRows.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Username already exists",
          });
        }

        const validRoles = [
          "arsiparis",
          "pengelola_bmn",
          "guru_bk",
          "jurnalis",
        ];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Roles",
          });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.query(
          "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
          [username, passwordHash, role]
        );

        res.status(201).json({
          success: true,
          message: "User registered successfully",
        });
      } catch (error) {
        console.error("Registration error", error);
        res.status(500).json({
          success: false,
          message: "Server error during registration",
        });
      }
    }
  );

  return authRouter;
};

export default authRouterFactory;
