import type { Metadata } from "next";
import { EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EverVow Lux — Luxury Wedding Planner",
  description: "Dashboard perencanaan pernikahan EverVow Lux",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${ebGaramond.variable} ${jakartaSans.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning di <body>: error ini murni disebabkan
          ekstensi Grammarly yang menyuntik atribut data-gr-* ke DOM sebelum
          React selesai hydrate — bukan bug di kode kita. Next.js sendiri
          menyarankan suppressHydrationWarning untuk kasus persis ini
          (ekstensi browser mengubah HTML), lihat catatan di README. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
