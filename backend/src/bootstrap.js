import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mysql from "mysql2/promise";

const initializeApplication = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  console.log("[Bootstrap] .env loaded.");

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
    process.exit(1); // Hentikan proses jika variabel env penting tidak ada
  }

  const pool = mysql.createPool({
    host: DATABASE_HOST, // Gunakan konstanta yang sudah dibaca
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    // Opsional: Coba koneksi DB untuk memastikan berhasil
    const [rows] = await pool.query("SELECT 1 + 1 AS solution");
    if (rows[0].solution !== 2) {
      throw new Error("Database connection test failed");
    }
  } catch (error) {
    console.error("\nFATAL ERROR: Database connection failed:", error);
    console.error(
      "Check your database credentials and server status in .env.\n"
    );
    process.exit(1); // Hentikan proses jika koneksi DB gagal
  }

  return {
    pool,
    JWT_SECRET,
    JWT_EXPIRATION,
    FRONTEND_URL,
  };
};

export { initializeApplication };
