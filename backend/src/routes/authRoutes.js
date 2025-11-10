import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import createUserModel from "../models/userModel.js";

/**
 * Factory function to create authentication routes with login and register endpoints.
 * @param {Object} dependencies - Dependencies to be injected
 * @param {Object} dependencies.pool - Database connection pool
 * @param {string} dependencies.JWT_SECRET - Secret key for JWT signing
 * @param {string} dependencies.JWT_EXPIRATION - Expiration time for JWT tokens
 * @returns {Router} Express router with authentication endpoints
 */
const authRouterFactory = ({ pool, JWT_SECRET, JWT_EXPIRATION }) => {
  const authRouter = Router();
  const authenticateToken = authenticateTokenFactory({ JWT_SECRET });
  const userModel = createUserModel({ pool });

  /**
   * Array of valid user roles in the system
   */
  const VALID_ROLES = [
    "arsiparis",
    "pengelola_bmn",
    "guru_bk",
    "jurnalis",
    "super_admin",
  ];

  /**
   * Handles user login and returns a JWT token
   * @route POST /login
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.username - User's username
   * @param {string} req.body.password - User's password
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with user data and JWT token
   */
  authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Find user by username
      const user = await userModel.findByUsername(username);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRATION,
        }
      );

      // Return user data without password
      const { password_hash, ...userWithoutPassword } = user;

      if (
        userWithoutPassword.avatar &&
        !userWithoutPassword.avatar.startsWith("http")
      ) {
        userWithoutPassword.avatar = `${req.protocol}://${req.get("host")}${
          userWithoutPassword.avatar
        }`;
      }

      res.json({
        success: true,
        user: userWithoutPassword,
        token: token,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  });

  /**
   * Handles user registration (restricted to super_admin role)
   * @route POST /register
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.username - New user's username
   * @param {string} req.body.password - New user's password
   * @param {string} req.body.role - New user's role
   * @param {string} [req.body.full_name] - New user's full name
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with registration status
   */
  authRouter.post(
    "/register",
    authenticateToken,
    restrictTo(["super_admin"]),
    async (req, res) => {
      const { username, password, role, full_name = "" } = req.body;

      try {
        // Validate input
        if (!username || !password || !role) {
          return res.status(400).json({
            success: false,
            message: "Username, password, and role are required",
          });
        }

        // Check if user already exists
        const existingUser = await userModel.findByUsername(username);

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username already exists",
          });
        }

        // Validate role
        if (!VALID_ROLES.includes(role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid role",
          });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create new user
        const userId = await userModel.create({
          username,
          password_hash: passwordHash,
          role,
          full_name,
        });

        res.status(201).json({
          success: true,
          message: "User registered successfully",
          userId,
        });
      } catch (error) {
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
