/**
 * @fileoverview Application bootstrap and dependency injection.
 * This module is responsible for initializing the application by loading environment
 * variables, establishing a database connection, and providing core dependencies
 * (like the database pool and JWT secret) to the rest of the application.
 * It performs critical checks and will terminate the process if essential
 * configurations are missing or the database connection fails.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mysql from "mysql2/promise";

/**
 * Initializes the application and its core dependencies.
 * @async
 * @function initializeApplication
 * @returns {Promise<Object>} A promise that resolves to an object containing the core dependencies.
 * @property {mysql.Pool} pool - The MySQL connection pool.
 * @property {string} JWT_SECRET - The secret key for JWT signing.
 * @property {string} JWT_EXPIRATION - The expiration time for JWT tokens.
 * @property {string} FRONTEND_URL - The URL of the frontend application.
 * @throws {Error} Terminates the process if required environment variables are missing or the database connection fails.
 */
const initializeApplication = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
  const DATABASE_HOST = process.env.DATABASE_HOST;
  const DATABASE_USER = process.env.DATABASE_USER;
  const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
  const DATABASE_NAME = process.env.DATABASE_NAME;
  const FRONTEND_URL = process.env.FRONTEND_URL;

  if (
    !JWT_SECRET ||
    !JWT_EXPIRATION ||
    !DATABASE_HOST ||
    !DATABASE_USER ||
    !DATABASE_PASSWORD ||
    !DATABASE_NAME ||
    !FRONTEND_URL
  ) {
    console.error(
      "\nFATAL ERROR: Missing required environment variables in bootstrap!"
    );
    console.error("Please check your .env file (root folder) for:");
    console.error(
      "JWT_SECRET, JWT_EXPIRATION, DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME,"
    );
    console.error(
      "EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_SENDER, FRONTEND_URL\n"
    );
    process.exit(1);
  }

  const pool = mysql.createPool({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    await pool.query("SELECT 1");
  } catch (error) {
    console.error("\nFATAL ERROR: Database connection failed:", error.message);
    console.error(
      "Check your database credentials and server status in .env.\n"
    );
    process.exit(1);
  }

  return {
    pool,
    JWT_SECRET,
    JWT_EXPIRATION,
    FRONTEND_URL,
  };
};

export { initializeApplication };
