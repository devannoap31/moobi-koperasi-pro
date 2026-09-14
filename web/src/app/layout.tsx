import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kopkar BIT - PT. Bhakti Idola Tama (Moobi Koperasi Pro)",
  description: "Platform digital Koperasi Karyawan PT. Bhakti Idola Tama: Simpan Pinjam, Kantin & Toko Perkakas, serta Integrasi Payroll Potong Gaji.",
  icons: {
    icon: "/icons/favicon.png",
    shortcut: "/icons/favicon.png",
    apple: "/icons/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/icons/favicon.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F7FD] text-[#212529] font-sans">
        {children}
      </body>
    </html>
  );
}
