// db/db.ts

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// ✅ Explicitly point to the .env file at the project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables.");
  process.exit(1);
}

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize Drizzle
const db = drizzle(pool);

// Run the connection test inside an async function
async function testConnection() {
  try {
    const result = await db.execute("SELECT 1");
    console.log("Database connected:", result.rows);
  } catch (err) {
    console.error("Error testing database connection:", err);
  }
}

testConnection();

export default db;
