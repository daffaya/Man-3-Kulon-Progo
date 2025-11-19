// backend/src/controllers/userController.js

import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} UserModel
 * @property {function(id: number): Promise<Object|null>} findById - Finds a user by their ID.
 * @property {function(username: string): Promise<Object|null>} findByUsername - Finds a user by their username.
 * @property {function(): Promise<Array<Object>>} getAllUsers - Retrieves all users.
 * @property {function(data: Object): Promise<number>} create - Creates a new user and returns their ID.
 * @property {function(id: number, data: Object): Promise<boolean>} update - Updates a user's details.
 * @property {function(id: number, passwordHash: string): Promise<boolean>} updatePassword - Updates a user's password.
 * @property {function(id: number): Promise<boolean>} delete - Deletes a user by their ID.
 * @property {function(id: number, data: Object): Promise<boolean>} updateProfile - Updates a user's profile.
 */

/**
 * @typedef {Object} Dependencies
 * @property {UserModel} userModel - The user model for database operations.
 */

/**
 * Handles user-related operations including profile management, avatar uploads, and administrative CRUD actions.
 * @param {Dependencies} dependencies - Injected dependencies, primarily the user model.
 * @returns {Object} An object containing controller methods to handle user requests.
 */
const createUserController = ({ userModel }) => {
  // --- Configuration Constants ---
  const VALID_ROLES = [
    "arsiparis",
    "pengelola_bmn",
    "guru_bk",
    "jurnalis",
    "super_admin",
  ];
  const SALT_ROUNDS = 10;
  const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars");
  const AVATAR_SIZE = 200;

  // --- Helper Functions ---

  /**
   * Safely deletes an old avatar file from the filesystem.
   * @param {string} avatarUrl - The URL of the old avatar.
   * @returns {void}
   */
  const deleteOldAvatar = (avatarUrl) => {
    if (!avatarUrl || !avatarUrl.includes("/uploads/avatars/")) {
      return;
    }
    const filename = path.basename(avatarUrl);
    const oldAvatarPath = path.join(AVATAR_DIR, filename);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  };

  /**
   * Generates a full URL for an avatar file.
   * @param {Object} req - The Express request object.
   * @param {string} filename - The avatar's filename.
   * @returns {string} The full public URL to the avatar.
   */
  const generateAvatarUrl = (req, filename) => {
    return `${req.protocol}://${req.get("host")}/uploads/avatars/${filename}`;
  };

  // --- Controller Methods ---

  return {
    /**
     * Retrieves the profile of the currently authenticated user.
     * @param {Object} req - Express request object, with `req.user.id` from auth middleware.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    getUserProfile: async (req, res, next) => {
      try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
        res.json({ success: true, data: user });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Updates the profile of the currently authenticated user.
     * @param {Object} req - Express request object, with `req.user.id` and `req.body.full_name`.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    updateUserProfile: async (req, res, next) => {
      try {
        const { full_name } = req.body;
        const user = await userModel.findById(req.user.id);

        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        const updated = await userModel.updateProfile(req.user.id, {
          full_name,
          avatar: user.avatar, // Preserve existing avatar
        });

        if (updated) {
          const updatedUser = await userModel.findById(req.user.id);
          res.json({ success: true, data: updatedUser });
        } else {
          res.status(400).json({ message: "Failed to update profile." });
        }
      } catch (error) {
        next(error);
      }
    },

    /**
     * Handles uploading and processing a new user avatar.
     * @param {Object} req - Express request object, expects `req.file` from multer middleware.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    uploadAvatar: async (req, res, next) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded." });
        }

        const user = await userModel.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        if (!fs.existsSync(AVATAR_DIR)) {
          fs.mkdirSync(AVATAR_DIR, { recursive: true });
        }

        // Delete old avatar if it exists
        if (user.avatar) {
          deleteOldAvatar(user.avatar);
        }

        // Sanitize filename and process image
        const filename = `${Date.now()}-${req.file.originalname.replace(
          /\s+/g,
          "-"
        )}`;
        const outputPath = path.join(AVATAR_DIR, filename);

        await sharp(req.file.path)
          .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
          .toFile(outputPath);

        // Clean up the temporary file uploaded by multer
        fs.unlinkSync(req.file.path);

        const avatarUrl = generateAvatarUrl(req, filename);
        await userModel.updateProfile(req.user.id, { avatar: avatarUrl });

        res.json({ success: true, data: { avatar: avatarUrl } });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Updates a user's avatar using a URL from an external source.
     * @param {Object} req - Express request object, with `req.body.avatarUrl`.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    updateAvatarByUrl: async (req, res, next) => {
      try {
        const { avatarUrl } = req.body;
        const user = await userModel.findById(req.user.id);

        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        // Delete old local avatar if it exists
        if (user.avatar) {
          deleteOldAvatar(user.avatar);
        }

        await userModel.updateProfile(req.user.id, { avatar: avatarUrl });

        res.json({ success: true, data: { avatar: avatarUrl } });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Retrieves a list of all users. (Super Admin only)
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    getAllUsers: async (req, res, next) => {
      try {
        const users = await userModel.getAllUsers();
        res.json({ success: true, data: users });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Creates a new user. (Super Admin only)
     * @param {Object} req - Express request object, with user details in `req.body`.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    createUser: async (req, res, next) => {
      try {
        const { username, password, role, full_name = "" } = req.body;

        const existingUser = await userModel.findByUsername(username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists." });
        }

        if (!VALID_ROLES.includes(role)) {
          return res.status(400).json({ message: "Invalid role." });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const userId = await userModel.create({
          username,
          password_hash: passwordHash,
          role,
          full_name,
        });

        const newUser = await userModel.findById(userId);

        res.status(201).json({
          success: true,
          message: "User created successfully.",
          data: newUser,
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Updates an existing user's details. (Super Admin only)
     * @param {Object} req - Express request object, with user ID in `req.params.id` and details in `req.body`.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    updateUser: async (req, res, next) => {
      try {
        const { id } = req.params;
        const { username, role, full_name, password } = req.body;

        const user = await userModel.findById(id);
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        if (username !== user.username) {
          const existingUser = await userModel.findByUsername(username);
          if (existingUser && existingUser.id !== parseInt(id, 10)) {
            return res
              .status(400)
              .json({ message: "Username already exists." });
          }
        }

        if (!VALID_ROLES.includes(role)) {
          return res.status(400).json({ message: "Invalid role." });
        }

        await userModel.update(id, { username, role, full_name });

        if (password) {
          const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
          await userModel.updatePassword(id, passwordHash);
        }

        const updatedUser = await userModel.findById(id);

        res.json({
          success: true,
          message: "User updated successfully.",
          data: updatedUser,
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Handles changing the current user's password.
     * @param {Object} req - Express request object, with `req.user.id` and password details in `req.body`.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    changePassword: async (req, res, next) => {
      try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Fetch user with password hash
        const user = await userModel.findByUsername(req.user.username); // Using username to get the hash
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        // Verify the current password
        const isMatch = await bcrypt.compare(
          currentPassword,
          user.password_hash
        );
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect." });
        }

        // Hash the new password
        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update the password in the database
        const updated = await userModel.updatePassword(userId, newPasswordHash);

        if (updated) {
          res.json({
            success: true,
            message: "Password changed successfully.",
          });
        } else {
          res.status(400).json({ message: "Failed to change password." });
        }
      } catch (error) {
        next(error);
      }
    },

    /**
     * Deletes a user. (Super Admin only)
     * @param {Object} req - Express request object, with user ID in `req.params.id`.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next function for error handling.
     */
    deleteUser: async (req, res, next) => {
      try {
        const { id } = req.params;
        const user = await userModel.findById(id);

        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }

        if (parseInt(id, 10) === req.user.id) {
          return res
            .status(400)
            .json({ message: "Cannot delete your own account." });
        }

        const deleted = await userModel.delete(id);
        if (!deleted) {
          return res.status(400).json({ message: "Failed to delete user." });
        }

        res.json({
          success: true,
          message: "User deleted successfully.",
        });
      } catch (error) {
        next(error);
      }
    },
  };
};

export default createUserController;
