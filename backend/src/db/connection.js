import mysql from "mysql2/promise";

// --- Environment Variables ---
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;

if (!DATABASE_HOST || !DATABASE_USER || !DATABASE_PASSWORD || !DATABASE_NAME) {
  console.error("FATAL ERROR: Database environment variables are not set!");
  // process.exit(1); // Jika ingin server berhenti total
}

// --- Database Connection Pool ---
const pool = mysql.createPool({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  waitForConnections: true, // Default true, but good to be explicit
  connectionLimit: 10, // Adjust based on expected load
  queueLimit: 0,
});

export default pool;
