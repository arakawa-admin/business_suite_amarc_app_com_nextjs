import { Pool } from "pg";

export const runtime = "nodejs";

if (!process.env.SUPABASE_DB_URL) {
    throw new Error("SUPABASE_DB_URL environment variable is not set");
}
export const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
});
