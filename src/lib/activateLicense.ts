import { db } from "@/db";
import { accounts, licenses, weddingState } from "@/db/schema";
import { eq } from "drizzle-orm";
import { emptyWeddingState } from "@/lib/defaultState";
import type { WeddingState } from "@/lib/weddingTypes";
import { generateTimelineFromWeddingDate } from "@/lib/timelineGenerator";

/**
 * Satu-satunya tempat logika "tukarkan lisensi jadi akun aktif" hidup.
 *
 * Dipakai oleh DUA jalur masuk yang berbeda:
 * - POST /api/auth/login  — pembeli mengetik email + kode lisensi sendiri.
 * - POST /api/claim       — pembeli datang dari link Lynk.id, membuktikan
 *                           diri lewat No. Order + email, lalu langsung
 *                           dimasukkan tanpa pernah mengetik kode.
 *
 * Keduanya HARUS menerapkan aturan yang sama persis (kadaluarsa, email
 * harus cocok, satu lisensi satu akun). Menaruhnya di sini mencegah salah
 * satu jalur diam-diam jadi lebih longgar dari yang lain — celah keamanan
 * klasik saat ada dua pintu masuk ke hal yang sama.
 */

export type LicenseRow = typeof licenses.$inferSelect;
export type AccountRow = typeof accounts.$inferSelect;

export class LicenseInactiveError extends Error {
  constructor() {
    super("Kode lisensi tidak valid atau sudah tidak aktif.");
    this.name = "LicenseInactiveError";
  }
}

export class LicenseExpiredError extends Error {
  constructor() {
    super("Kode lisensi sudah kadaluarsa. Hubungi penjual untuk perpanjangan.");
    this.name = "LicenseExpiredError";
  }
}

export class EmailMismatchError extends Error {
  constructor() {
    super("Email tidak cocok dengan kode lisensi ini. Gunakan email yang sama dengan saat pembelian.");
    this.name = "EmailMismatchError";
  }
}

export class UsernameTakenError extends Error {
  constructor(public isEmailBased: boolean) {
    super(
      isEmailBased
        ? "Email ini sudah terdaftar pada akun lain."
        : "Username sudah dipakai. Pilih username lain."
    );
    this.name = "UsernameTakenError";
  }
}

/** Lisensi masih boleh dipakai? Dipakai juga sebelum menampilkan kode di /claim. */
export function assertLicenseUsable(license: LicenseRow): void {
  if (!license.isActive) throw new LicenseInactiveError();
  if (license.expiresAt && license.expiresAt.getTime() < Date.now()) {
    throw new LicenseExpiredError();
  }
}

/**
 * Bentuk jawaban checkout Lynk.id yang sudah dinormalkan oleh webhook.
 * Semua opsional — pembeli bisa saja melewati pertanyaan yang tidak wajib,
 * dan lisensi lama (dibuat manual dari /admin) tidak punya ini sama sekali.
 */
export interface CheckoutAnswers {
  brideName?: string;
  groomName?: string;
  weddingDate?: string; // ISO "YYYY-MM-DD"
  totalBudget?: number;
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * State awal untuk akun baru: tetap KOSONG (bukan data demo), tapi kalau
 * pembeli sudah menjawab pertanyaan saat checkout, isian itu dipakai supaya
 * dashboard pertama yang mereka lihat sudah menyapa nama mereka berdua dan
 * menghitung mundur hari-H — bukan form kosong.
 */
export function seedStateFromAnswers(answers: CheckoutAnswers | null | undefined): WeddingState {
  const state = emptyWeddingState();
  if (!answers) return state;

  if (answers.weddingDate) state.weddingDate = answers.weddingDate;
  if (typeof answers.totalBudget === "number" && Number.isFinite(answers.totalBudget)) {
    state.totalBudget = answers.totalBudget;
  }

  state.coupleProfile = {
    ...state.coupleProfile,
    ...(answers.brideName ? { brideName: answers.brideName } : {}),
    ...(answers.groomName ? { groomName: answers.groomName } : {}),
    ...(answers.contactEmail ? { contactEmail: answers.contactEmail } : {}),
    ...(answers.contactPhone ? { contactPhone: answers.contactPhone } : {}),
  };

  // Fitur pembeda utama: begitu tanggal nikah diketahui, Timeline langsung
  // terisi checklist persiapan yang jadwalnya disesuaikan dengan sisa waktu
  // yang ada — bukan modul kosong yang membingungkan pengantin baru soal
  // "harus mulai dari mana". Lihat lib/timelineGenerator.ts untuk logikanya.
  if (state.weddingDate) {
    const generated = generateTimelineFromWeddingDate(state.weddingDate);
    if (generated) {
      state.categories = generated.categories;
      state.tasks = generated.tasks;
    }
  }

  return state;
}

/**
 * Tukarkan lisensi jadi akun aktif dan kembalikan akunnya.
 *
 * `username` sudah harus dinormalkan (trim + lowercase) oleh pemanggil.
 * Melempar error bertipe di atas kalau ditolak — pemanggil yang menerjemahkan
 * jadi status HTTP, karena /login dan /claim memakai kode status berbeda
 * untuk kegagalan yang sama.
 */
export async function activateLicense(license: LicenseRow, username: string): Promise<AccountRow> {
  assertLicenseUsable(license);

  const existing = await db.query.accounts.findFirst({
    where: eq(accounts.licenseId, license.id),
  });

  if (existing) {
    // Lisensi sudah pernah dipakai — hanya pemilik username itu yang boleh masuk.
    if (existing.username !== username) throw new EmailMismatchError();
    await db
      .update(accounts)
      .set({ lastLoginAt: new Date() })
      .where(eq(accounts.id, existing.id));
    return existing;
  }

  // ---- Aktivasi pertama kali ----
  //
  // Lisensi BARU (punya buyerEmail): username WAJIB sama dengan email yang
  // tercatat saat pembelian — lapis verifikasi tambahan sekaligus bikin
  // username selalu konsisten.
  //
  // Lisensi LAMA (buyerEmail kosong, dibuat sebelum kolom itu ada): tetap
  // pakai perilaku lama, username bebas asal belum dipakai — supaya kode
  // yang sudah beredar ke pembeli lama tidak rusak.
  if (license.buyerEmail && license.buyerEmail.toLowerCase() !== username) {
    throw new EmailMismatchError();
  }

  const taken = await db.query.accounts.findFirst({
    where: eq(accounts.username, username),
  });
  if (taken) throw new UsernameTakenError(Boolean(license.buyerEmail));

  const [created] = await db
    .insert(accounts)
    .values({ username, licenseId: license.id })
    .returning();

  await db.insert(weddingState).values({
    accountId: created.id,
    state: seedStateFromAnswers(license.checkoutAnswers as CheckoutAnswers | null),
  });

  await db
    .update(licenses)
    .set({ activatedAt: new Date() })
    .where(eq(licenses.id, license.id));

  await db
    .update(accounts)
    .set({ lastLoginAt: new Date() })
    .where(eq(accounts.id, created.id));

  return created;
}
