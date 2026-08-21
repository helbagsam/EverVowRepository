import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// PENTING: drizzle-kit adalah CLI terpisah dari Next.js — dia TIDAK
// otomatis membaca .env.local seperti `next dev`/`next build`. Tanpa baris
// ini, `npx drizzle-kit push` akan selalu gagal dengan error "connection
// url or host required" walau .env.local sudah terisi benar, karena
// process.env.DATABASE_URL memang belum pernah ke-set sama sekali di
// proses CLI-nya.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
