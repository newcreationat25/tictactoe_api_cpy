"use strict";
// db/db.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// ✅ Explicitly point to the .env file at the project root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables.");
    process.exit(1);
}
// Initialize PostgreSQL connection pool
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
// Initialize Drizzle
const db = (0, node_postgres_1.drizzle)(pool);
// Run the connection test inside an async function
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db.execute("SELECT 1");
            console.log("Database connected:", result.rows);
        }
        catch (err) {
            console.error("Error testing database connection:", err);
        }
    });
}
testConnection();
exports.default = db;
