import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/schema",
  out: "./drizzle", // Optional: folder for migrations
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
});
