/**
 * @fileoverview Database connection pool configuration.
 * This module configures and exports a MySQL connection pool using `mysql2/promise`.
 * It retrieves connection details from environment variables and throws an error
 * if required configurations are missing.
 */

import mysql from "mysql2/promise";

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || ""; // Fallback for local development
const DATABASE_NAME = process.env.DATABASE_NAME;

if (!DATABASE_HOST || !DATABASE_USER || !DATABASE_NAME) {
  throw new Error(
    "Database configuration incomplete. Check DATABASE_HOST, DATABASE_USER, and DATABASE_NAME environment variables."
  );
}

/**
 * MySQL connection pool.
 * Provides a pool of connections to the MySQL database to be used throughout the application.
 * @type {mysql.Pool}
 */
const pool = mysql.createPool({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
