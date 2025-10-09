import mysql from "mysql2/promise";

console.log("[Connection] Initializing database connection...");

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || ""; // Kembalikan fallback untuk debug
const DATABASE_NAME = process.env.DATABASE_NAME;

console.log("[Connection] DB Config:", {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD: DATABASE_PASSWORD ? "[set]" : "[empty]",
  DATABASE_NAME,
});

if (!DATABASE_HOST || !DATABASE_USER || !DATABASE_NAME) {
  console.error(
    "[Connection] FATAL ERROR: Required database environment variables are not set!"
  );
  console.error("[Connection] Environment variables:", {
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
  });
  throw new Error("Database configuration incomplete");
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

export default pool;
