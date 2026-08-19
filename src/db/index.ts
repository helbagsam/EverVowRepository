import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL belum diset. Tambahkan connection string Neon di file .env.local (lihat .env.example)."
  );
}

// neon-http driver: cocok untuk Vercel Serverless Functions (stateless,
// tidak butuh connection pooling manual, hemat resource di free tier Neon).
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
