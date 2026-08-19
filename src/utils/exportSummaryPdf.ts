import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatIDR } from './formatters';

// Ringkasan pernikahan sebagai dokumen PDF bersih yang dibuat langsung dari
// data (bukan screenshot/print dari panel-panel dashboard) — supaya rapi,
// konsisten, dan bisa langsung di-download sebagai file (bukan cuma lewat
// dialog print browser).

interface SummaryData {
  coupleTitle: string;
  weddingDateLabel: string;
  daysLeftLabel: string;
  totalBudget: number;
  totalPaid: number;
  totalAllocated: number;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  totalVendors: number;
  bookedVendors: number;
  totalTasks: number;
  completedTasks: number;
}

const MAROON = rgb(0.545, 0.290, 0.322); // brand-primary
const GOLD = rgb(0.722, 0.588, 0.353); // brand-accent
const GRAY = rgb(0.42, 0.4, 0.39);
const LIGHT_LINE = rgb(0.88, 0.85, 0.84);

export async function generateSummaryPdf(data: SummaryData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  let y = height - 60;

  // --- Header ---
  page.drawText('EverVow Lux', { x: marginX, y, size: 12, font: bold, color: GOLD });
  y -= 18;
  page.drawText('Wedding Summary', { x: marginX, y, size: 24, font: bold, color: MAROON });
  y -= 26;
  page.drawText(data.coupleTitle, { x: marginX, y, size: 14, font, color: rgb(0.15, 0.13, 0.13) });
  y -= 18;
  page.drawText(`${data.weddingDateLabel}  •  ${data.daysLeftLabel}`, { x: marginX, y, size: 11, font, color: GRAY });
  y -= 20;
  page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: LIGHT_LINE });
  y -= 34;

  const sectionTitle = (title: string) => {
    page.drawText(title, { x: marginX, y, size: 13, font: bold, color: MAROON });
    y -= 20;
  };

  const row = (label: string, value: string) => {
    page.drawText(label, { x: marginX, y, size: 11, font, color: GRAY });
    const valueWidth = font.widthOfTextAtSize(value, 11);
    page.drawText(value, { x: width - marginX - valueWidth, y, size: 11, font: bold, color: rgb(0.15, 0.13, 0.13) });
    y -= 18;
  };

  // --- Budget ---
  sectionTitle('Budget');
  row('Target Budget', formatIDR(data.totalBudget));
  row('Sudah Dibayar', formatIDR(data.totalPaid));
  row('Sisa Anggaran', formatIDR(Math.max(0, data.totalBudget - data.totalPaid)));
  row('Total Teralokasi (Semua Pos)', formatIDR(data.totalAllocated));
  y -= 12;

  // --- Guests ---
  sectionTitle('Tamu Undangan');
  row('Target Tamu', `${data.totalGuests}`);
  row('Terkonfirmasi Hadir', `${data.confirmedGuests}`);
  row('Menunggu Konfirmasi', `${data.pendingGuests}`);
  row('Tidak Hadir', `${data.declinedGuests}`);
  y -= 12;

  // --- Vendors ---
  sectionTitle('Vendor');
  row('Total Vendor', `${data.totalVendors}`);
  row('Sudah Booking', `${data.bookedVendors}`);
  y -= 12;

  // --- Timeline ---
  sectionTitle('Timeline & Tugas');
  row('Total Tugas', `${data.totalTasks}`);
  row('Selesai', `${data.completedTasks}`);
  const progress = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  row('Progres Keseluruhan', `${progress}%`);

  // --- Footer ---
  const footerY = 40;
  page.drawLine({ start: { x: marginX, y: footerY + 14 }, end: { x: width - marginX, y: footerY + 14 }, thickness: 0.5, color: LIGHT_LINE });
  const generatedLabel = `Dibuat pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} — EverVow Lux`;
  page.drawText(generatedLabel, { x: marginX, y: footerY, size: 9, font, color: GRAY });

  return pdfDoc.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
