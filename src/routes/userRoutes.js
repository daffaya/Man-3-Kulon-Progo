/**
 * @fileoverview Defines the Express router for user-related endpoints.
 * This module creates and configures routes for user profile management and administrative user operations.
 * It includes endpoints for profile management, avatar uploads, password changes, and CRUD operations for users,
 * utilizing middleware for authentication, role-based access control, and input validation.
 */

import { Router } from "express";
import { body } from "express-validator";
import {
  authenticateTokenFactory,
  restrictTo,
} from "../middleware/authMiddleware.js";
import { avatarUpload } from "../services/fileUploadService.js";
import createUserModel from "../models/userModel.js";
import createUserController from "../controllers/userController.js";

/**
 * Array of valid user roles in the system.
 * @type {string[]}
 */
const VALID_ROLES = [
  "arsiparis",
  "pengelola_bmn",
  "guru_bk",
  "jurnalis",
  "super_admin",
];

/**
 * Validation rules for creating a new user.
 * @type {Array}
 */
const createUserValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username is required.")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric.")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(VALID_ROLES)
    .withMessage("Invalid role specified."),
  body("full_name")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Full name cannot exceed 255 characters."),
];

/**
 * Validation rules for updating a user.
 * @type {Array}
 */
const updateUserValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username is required.")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric.")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters."),
  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(VALID_ROLES)
    .withMessage("Invalid role specified."),
  body("full_name")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Full name cannot exceed 255 characters."),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

/**
 * Factory function that creates and configures the router for user-related operations.
 * This router handles profile management for authenticated users and administrative
 * CRUD operations for super admins.
 *
 * @param {object} dependencies - The dependencies for the router.
 * @param {import('mysql2/promise').Pool} dependencies.pool - MySQL connection pool.
 * @param {string} dependencies.JWT_SECRET - Secret key for JWT authentication.
 * @returns {import('express').Router} Configured Express router for user routes.
 */
const userRouterFactory = ({ pool, JWT_SECRET }) => {
  const router = Router();

  const userModel = createUserModel({ pool });
  const userController = createUserController({ userModel });

  const authenticate = authenticateTokenFactory({ JWT_SECRET });
  router.use(authenticate);

  /**
   * @route   GET /profile
   * @desc    Get the current user's profile.
   * @access  Private
   */
  router.get("/profile", userController.getUserProfile);

  /**
   * @route   PUT /profile
   * @desc    Update the current user's profile (e.g., full name).
   * @access  Private
   */
  router.put(
    "/profile",
    [body("full_name").notEmpty().withMessage("Full name is required.")],
    userController.updateUserProfile
  );

  /**
   * @route   POST /profile/avatar
   * @desc    Upload an avatar image for the current user.
   * @access  Private
   */
  router.post("/profile/avatar", avatarUpload, userController.uploadAvatar);

  /**
   * @route   PUT /profile/avatar
   * @desc    Update the current user's avatar using a URL.
   * @access  Private
   */
  router.put(
    "/profile/avatar",
    [body("avatarUrl").isURL().withMessage("Avatar URL must be a valid URL.")],
    userController.updateAvatarByUrl
  );

  /**
   * @route   PUT /change-password
   * @desc    Change the current user's password.
   * @access  Private
   */
  router.put(
    "/change-password",
    [
      body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required."),
      body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long."),
      body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Password confirmation does not match.");
        }
        return true;
      }),
    ],
    userController.changePassword
  );

  /**
   * @route   GET /users
   * @desc    Get a list of all users.
   * @access  Private (Super Admin)
   */
  router.get("/users", restrictTo(["super_admin"]), userController.getAllUsers);

  /**
   * @route   POST /users
   * @desc    Create a new user.
   * @access  Private (Super Admin)
   */
  router.post(
    "/users",
    restrictTo(["super_admin"]),
    createUserValidation,
    userController.createUser
  );

  /**
   * @route   PUT /users/:id
   * @desc    Update a user's details.
   * @access  Private (Super Admin)
   */
  router.put(
    "/users/:id",
    restrictTo(["super_admin"]),
    updateUserValidation,
    userController.updateUser
  );

  /**
   * @route   DELETE /users/:id
   * @desc    Delete a user.
   * @access  Private (Super Admin)
   */
  router.delete(
    "/users/:id",
    restrictTo(["super_admin"]),
    userController.deleteUser
  );

  return router;
};

export default userRouterFactory;
