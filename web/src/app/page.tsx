"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Factory,
} from "lucide-react";

export default function RootLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FD] flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#4A3AFF]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#FFB547]/5 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#2DBA7D]/5 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* 1. TOP NAVBAR */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-[#E6E3F7] py-4 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-auto flex items-center shrink-0">
              <Image
                src="/images/logo.webp"
                alt="Moobi Logo"
                width={120}
                height={36}
                quality={100}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
            <div className="border-l border-[#E6E3F7] pl-3">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#1C1B3A] tracking-tight">
                  Kopkar BIT
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                  PRO
                </span>
              </div>
              <p className="text-[10.5px] text-[#6F6B88] font-medium">
                PT Bhakti Idola Tama
              </p>
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3FF] border border-[#E6E3F7] text-xs">
            <div className="w-2 h-2 rounded-full bg-[#2DBA7D] animate-pulse" />
            <span className="text-[#6F6B88]">Sistem Aktif:</span>
            <span className="font-bold text-[#1C1B3A]">Koperasi &amp; Kantin Utama Pabrik BIT</span>
          </div>
        </div>
      </header>

      {/* 2. HERO & PORTAL SELECTION */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Title Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FF] border border-[#E6E3F7] text-xs font-semibold text-[#4A3AFF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Layanan Terpadu Koperasi Karyawan</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1B3A] tracking-tight leading-tight">
            Selamat Datang di Portal Digital <br className="hidden sm:inline" />
            <span className="text-[#4A3AFF]">Kopkar PT Bhakti Idola Tama</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6B88] leading-relaxed">
            Silakan pilih pintu masuk portal sesuai dengan peran dan kebutuhan Anda:
          </p>
        </div>

        {/* Triple Portal Gateway Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-6">
          {/* ========================================================================= */}
          {/* CARD 1: PORTAL PENGURUS & ADMIN KOPERASI                                 */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-6 shadow-xl shadow-[#4A3AFF]/5 hover:shadow-2xl hover:shadow-[#4A3AFF]/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4A3AFF] to-[#8E79F5]" />

            <div className="space-y-4">
              {/* Header Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[16px] bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center border border-[#E6E3F7] group-hover:scale-105 group-hover:bg-[#4A3AFF] group-hover:text-white transition-all">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                  Pengurus &amp; Superadmin
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-[#1C1B3A] group-hover:text-[#4A3AFF] transition-colors">
                  Portal Manajemen Koperasi
                </h2>
                <p className="text-xs text-[#6F6B88] leading-relaxed">
                  Pusat administrasi simpan pinjam anggota (DSR 30%), data karyawan, rekap payroll HRD, dan bank channeling Mandiri.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6E3F7]">
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Simpan Pinjam &amp; Verifikasi Plafon HRD</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Toko Koperasi &amp; Penjualan Elektronik</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Rekapitulasi Potong Gaji (Tgl 25)</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Channeling Plafon Rp 1.5 M Mandiri</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-5">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#4A3AFF]/20 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:gap-2.5"
              >
                <span>Masuk Portal Koperasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 2: PORTAL KASIR & OPERASIONAL KANTIN PABRIK                         */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-6 shadow-xl shadow-[#4A3AFF]/5 hover:shadow-2xl hover:shadow-[#4A3AFF]/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFB547] via-[#2DBA7D] to-[#4A3AFF]" />

            <div className="space-y-4">
              {/* Header Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[16px] bg-[#FFF4E5] text-[#D97706] flex items-center justify-center border border-[#FFE0B2] group-hover:scale-105 group-hover:bg-[#FFB547] group-hover:text-[#1C1B3A] transition-all">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30">
                  Kantin Pabrik BIT
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-[#1C1B3A] group-hover:text-[#D97706] transition-colors">
                  Portal Kasir &amp; Dapur Kantin BIT
                </h2>
                <p className="text-xs text-[#6F6B88] leading-relaxed">
                  Ruang kasir POS cepat melayani jam istirahat makan karyawan pabrik dan antrean pesanan makanan siap saji.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6E3F7]">
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Kasir POS Kasir &amp; Uang Tunai / QRIS Statis</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Kitchen Display Antrean Pesanan Karyawan</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Status Stok Menu Makanan &amp; Minuman Siap Saji</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Laporan Omzet Kas Harian Shift 1 &amp; Shift 2</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-5">
              <Link
                href="/canteen-portal/login"
                className="w-full py-3 px-4 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] active:scale-[0.98] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Masuk Portal Kasir Kantin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 3: MODUL MANAJEMEN PRODUKSI & BAHAN BAKU                            */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-6 shadow-xl shadow-[#4A3AFF]/5 hover:shadow-2xl hover:shadow-[#4A3AFF]/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2DBA7D] via-[#4A3AFF] to-[#6B5CEB]" />

            <div className="space-y-4">
              {/* Header Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[16px] bg-[#EBFBF5] text-[#2DBA7D] flex items-center justify-center border border-[#B8F2D8] group-hover:scale-105 group-hover:bg-[#2DBA7D] group-hover:text-white transition-all">
                  <Factory className="w-6 h-6" />
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                  Produksi &amp; HPP/COGS
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-[#1C1B3A] group-hover:text-[#2DBA7D] transition-colors">
                  Modul Manajemen Produksi &amp; Bahan Baku
                </h2>
                <p className="text-xs text-[#6F6B88] leading-relaxed">
                  Pengolahan resep menu kantin (Batagor, Mie Ayam, dll.), kalkulasi HPP/COGS, PO &amp; penerimaan bahan, pemakaian, dan stok opname.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6E3F7]">
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Setting Resep BOM &amp; Kalkulasi Otomatis COGS / Margin</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Master Bahan Baku &amp; Konversi Satuan (Kg ➔ gram/ml)</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>PO Supplier &amp; Faktur Pembelian Tambah Stok</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[#1C1B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D] shrink-0" />
                  <span>Stok Opname Fisik &amp; Kartu Mutasi Bahan Baku</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-5">
              <Link
                href="/production/login"
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#2DBA7D] to-[#25A26C] hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-[#2DBA7D]/20 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:gap-2.5"
              >
                <span>Masuk Modul Produksi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. QUICK STATS SUMMARY TICKER */}
        <div className="mt-10 sm:mt-12 p-4 sm:p-5 rounded-[20px] bg-white border border-[#E6E3F7] shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-0.5">
            <p className="text-[11px] text-[#6F6B88]">Fasilitas Kantin</p>
            <p className="text-base sm:text-lg font-bold text-[#1C1B3A]">1 Kantin Utama (Shift 1 &amp; 2)</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-[#6F6B88]">Metode Pembayaran</p>
            <p className="text-base sm:text-lg font-bold text-[#4A3AFF]">Uang Tunai &amp; QRIS Statis</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-[#6F6B88]">Jadwal Cutoff Payroll</p>
            <p className="text-base sm:text-lg font-bold text-[#2DBA7D]">Tgl 25 Setiap Bulan</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-[#6F6B88]">Partner Bank Likuiditas</p>
            <p className="text-base sm:text-lg font-bold text-[#1C1B3A]">Bank Mandiri (1.5 M)</p>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="w-full bg-white border-t border-[#E6E3F7] py-4 px-4 sm:px-8 text-center text-xs text-[#6F6B88] space-y-1">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2DBA7D]" />
          <span>Sistem Koperasi Digital Terproteksi SSL 256-Bit PT Bhakti Idola Tama</span>
        </div>
        <p className="text-[11px] text-[#A5A2B8]">
          &copy; 2026 PT. Bhakti Idola Tama — Moobi Koperasi Pro.
        </p>
      </footer>
    </div>
  );
}
