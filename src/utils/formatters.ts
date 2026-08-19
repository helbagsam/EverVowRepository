/**
 * Centralized formatting utilities for EverVow Lux.
 * Consolidates currency formatting previously duplicated across
 * Budget.tsx, Dashboard.tsx, Vendors.tsx, and Logistics.tsx.
 */

/**
 * Formats a number as full Indonesian Rupiah, e.g. formatIDR(150000000) -> "Rp 150.000.000"
 */
export const formatIDR = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

/**
 * Formats a number as an abbreviated Indonesian Rupiah value for compact UI spaces,
 * e.g. formatShortIDR(1500000) -> "Rp 1.5M", formatShortIDR(2500) -> "Rp 3k".
 * Menangani angka negatif dengan benar (mis. saat budget overspend),
 * e.g. formatShortIDR(-1500000) -> "-Rp 1.5M".
 */
export const formatShortIDR = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1000000) return `${sign}Rp ${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}Rp ${(abs / 1000).toFixed(0)}k`;
  return `${sign}Rp ${abs}`;
};

/**
 * Formats a date string (e.g. "2024-10-25") into a human-readable Indonesian
 * date with the month name, e.g. formatDate("2024-10-25") -> "25 Okt 2024".
 * Falls back gracefully if the input is empty or not a valid date.
 */
export const formatDate = (
  dateStr: string | null | undefined,
  opts: { withWeekday?: boolean; longMonth?: boolean } = {}
): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // biarkan apa adanya jika bukan format tanggal valid
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: opts.longMonth ? 'long' : 'short',
    year: 'numeric',
    weekday: opts.withWeekday ? 'long' : undefined,
  });
};
