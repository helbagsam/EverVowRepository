import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";

/**
 * licenses: dibuat oleh Admin/License Generator (project terpisah, DB sama).
 * Satu baris = satu kode lisensi yang dijual ke satu pembeli.
 */
export const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(), // kode lisensi unik, mis. EVLX-BUDI-2847
  buyerName: text("buyer_name").notNull(),
  // Nullable demi backward compat: lisensi lama (sebelum kolom ini ada)
  // tidak punya email, dan tetap harus terus bisa dipakai. Untuk lisensi
  // BARU, kolom ini WAJIB diisi lewat validasi di API (bukan di level DB)
  // karena inilah yang akan jadi username login pembeli.
  buyerEmail: text("buyer_email"),
  orderRef: text("order_ref"),
  platform: text("platform"), // Tokopedia / Shopee / TikTok Shop / dst
  price: integer("price"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
});

/**
 * accounts: satu akun = satu pasangan pengantin yang login pakai
 * username + kode lisensi. account.licenseId merujuk ke licenses.id
 * yang dibuat lewat admin generator.
 */
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  licenseId: uuid("license_id").notNull().references(() => licenses.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

/**
 * wedding_state: SATU baris JSONB per akun, isinya seluruh state
 * yang dulu tersebar di banyak localStorage key (lihat AppContext.tsx
 * versi lama). Strukturnya sengaja dibuat identik dengan bentuk state
 * lama supaya migrasi UI = 0 perubahan pada file views/*.
 */
export const weddingState = pgTable("wedding_state", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  state: jsonb("state").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * assets: catatan file yang diupload ke UploadThing, supaya bisa
 * dihapus dari UploadThing juga saat data dihapus/diganti di app
 * (menjaga kuota free tier UploadThing tetap kecil / tidak ada file yatim).
 */
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  fileKey: text("file_key").notNull(), // UploadThing file key, dipakai utk delete
  url: text("url").notNull(),
  usedFor: text("used_for"), // contoh: "attire:3", "expense-receipt:7"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * login_attempts: dipakai untuk rate-limiting percobaan login (pembeli
 * maupun admin) — mencegah brute-force kode lisensi / password admin.
 * Disimpan di DB (bukan memory) supaya tetap efektif di lingkungan
 * serverless Vercel yang instance-nya tidak persisten.
 */
export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptKey: text("attempt_key").notNull(), // mis. "login:203.0.113.5" atau "admin_login:203.0.113.5"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
