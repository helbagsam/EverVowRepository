/**
 * Lapisan terjemahan untuk NILAI DATA (bukan teks statis UI).
 *
 * Beberapa field di aplikasi ini (status tamu, status vendor, prioritas
 * tugas, dst.) tersimpan sebagai string bahasa Inggris di database DAN
 * dipakai langsung di logika (`===`, switch, filter). Kalau string itu
 * diterjemahkan langsung di tempat penyimpanannya, perbandingan logika di
 * banyak file lain akan diam-diam rusak.
 *
 * Solusinya: nilai yang TERSIMPAN & DIBANDINGKAN tetap bahasa Inggris apa
 * adanya — hanya fungsi di sini yang dipanggil saat MENAMPILKAN ke
 * pengguna. Jadi `guest.status === "Confirmed"` di kode manapun tetap
 * valid, tapi yang muncul di layar adalah `guestStatusLabel(guest.status)`
 * → "Terkonfirmasi".
 */

import type { Guest, Vendor, Task, Expense, Activity, LogisticItem, RentalItem, HandoverItem, LogisticsTimeline, TransportStay } from "./weddingTypes";

export function guestStatusLabel(status: Guest["status"]): string {
  switch (status) {
    case "Confirmed": return "Terkonfirmasi";
    case "Pending": return "Menunggu";
    case "Declined": return "Menolak";
    default: return status;
  }
}

export function vendorStatusLabel(status: Vendor["status"]): string {
  switch (status) {
    case "RESEARCHING": return "Riset";
    case "CONTACTED": return "Dihubungi";
    case "NEGOTIATING": return "Negosiasi";
    case "BOOKED": return "Dipesan";
    case "COMPLETED": return "Selesai";
    default: return status;
  }
}

export function taskPriorityLabel(priority: Task["priority"]): string {
  switch (priority) {
    case "High": return "Tinggi";
    case "Medium": return "Sedang";
    case "Low": return "Rendah";
    default: return priority;
  }
}

export function taskStatusLabel(status: Task["status"]): string {
  switch (status) {
    case "Not Started": return "Belum Mulai";
    case "In Progress": return "Berjalan";
    case "Completed": return "Selesai";
    case "On Hold": return "Ditunda";
    default: return status;
  }
}

export function expenseStatusLabel(status: Expense["status"]): string {
  switch (status) {
    case "Lunas": return "Lunas"; // sudah bahasa Indonesia, dipertahankan
    case "DP": return "DP"; // istilah umum, tidak diterjemahkan
    case "Unpaid": return "Belum Bayar";
    default: return status;
  }
}

export function activityStatusLabel(status: Activity["status"]): string {
  switch (status) {
    case "Confirmed": return "Terkonfirmasi";
    case "Planning": return "Perencanaan";
    default: return status;
  }
}

/**
 * Status Attire tidak dimodelkan sebagai union type di weddingTypes.ts
 * (cuma `string`), tapi Attire.tsx memperlakukannya sebagai satu set
 * tetap. Daftar di sini HARUS persis sama dengan yang dipakai di
 * getStatusColor/getStatusBgColor/getStatusIcon/getProgress di Attire.tsx.
 */
export function attireStatusLabel(status: string): string {
  switch (status) {
    case "Not Started": return "Belum Mulai";
    case "In Progress": return "Berjalan";
    case "Final Fitting": return "Fitting Akhir";
    case "Completed": return "Selesai";
    default: return status;
  }
}

export function logisticItemStatusLabel(status: LogisticItem["status"]): string {
  switch (status) {
    case "Confirmed": return "Terkonfirmasi";
    case "Pending": return "Menunggu";
    case "Inquiry": return "Tanya Ketersediaan";
    default: return status;
  }
}

export function rentalConditionLabel(status: RentalItem["arrivalStatus"]): string {
  switch (status) {
    case "Pending": return "Menunggu";
    case "Good": return "Baik";
    case "Damaged": return "Rusak";
    case "Missing": return "Hilang";
    default: return status;
  }
}

export function handoverStatusLabel(status: HandoverItem["status"]): string {
  switch (status) {
    case "Pending": return "Menunggu";
    case "Handed Over": return "Sudah Diserahkan";
    case "Returned": return "Sudah Dikembalikan";
    default: return status;
  }
}

export function logisticsTimelineTypeLabel(type: LogisticsTimeline["type"]): string {
  switch (type) {
    case "Load-In": return "Muat Masuk";
    case "Operational": return "Operasional";
    case "Load-Out": return "Muat Keluar";
    default: return type;
  }
}

export function logisticsTimelineStatusLabel(status: LogisticsTimeline["status"]): string {
  switch (status) {
    case "Pending": return "Menunggu";
    case "In Progress": return "Berjalan";
    case "Completed": return "Selesai";
    default: return status;
  }
}

export function transportStayTypeLabel(type: TransportStay["type"]): string {
  switch (type) {
    case "Vehicle": return "Kendaraan";
    case "Shuttle": return "Shuttle";
    case "Accommodation": return "Akomodasi";
    default: return type;
  }
}
