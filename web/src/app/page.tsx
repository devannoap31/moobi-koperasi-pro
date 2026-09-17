"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  Store,
  Wallet,
  Landmark,
  ShoppingBag,
  Users,
  CheckCircle2,
  Lock,
  ReceiptText,
  UserPlus,
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
            <span className="font-bold text-[#1C1B3A]">Koperasi &amp; Multi-Tenant Kantin</span>
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

        {/* Dual Portal Gateway Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* ========================================================================= */}
          {/* CARD 1: PORTAL PENGURUS & ADMIN KOPERASI                                 */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-6 sm:p-8 shadow-xl shadow-[#4A3AFF]/5 hover:shadow-2xl hover:shadow-[#4A3AFF]/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4A3AFF] to-[#8E79F5]" />

            <div className="space-y-5">
              {/* Header Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-[18px] bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center border border-[#E6E3F7] group-hover:scale-105 group-hover:bg-[#4A3AFF] group-hover:text-white transition-all">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                  Pengurus &amp; Superadmin
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-bold text-[#1C1B3A] group-hover:text-[#4A3AFF] transition-colors">
                  Portal Manajemen Koperasi
                </h2>
                <p className="text-xs text-[#6F6B88] leading-relaxed">
                  Pusat administrasi internal untuk mengelola simpan pinjam anggota, data karyawan, monitoring transaksi multi-kantin, integrasi payroll HRD, dan bank channeling.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-2 border-t border-[#E6E3F7]">
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Simpan Pinjam &amp; Simulasi Limit Pinjaman Karyawan</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Kelola Akun Mitra Kantin (Approval, Bekukan, Hapus)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Monitoring Arus Kas Belanja &amp; Jatuh Tempo Payroll (Tgl 25)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Likuiditas Channeling Plafon Rp 1.5 M Bank Mandiri</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-6">
              <Link
                href="/login"
                className="w-full py-3.5 px-5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4A3AFF]/20 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:gap-3"
              >
                <span>Masuk sebagai Pengurus / Admin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 2: PORTAL MITRA KANTIN & USAHA KARYAWAN (MULTI-TENANT)              */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-6 sm:p-8 shadow-xl shadow-[#4A3AFF]/5 hover:shadow-2xl hover:shadow-[#4A3AFF]/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFB547] via-[#2DBA7D] to-[#4A3AFF]" />

            <div className="space-y-5">
              {/* Header Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-[18px] bg-[#FFF4E5] text-[#D97706] flex items-center justify-center border border-[#FFE0B2] group-hover:scale-105 group-hover:bg-[#FFB547] group-hover:text-[#1C1B3A] transition-all">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]">
                  Multi-Tenant Kantin
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-bold text-[#1C1B3A] group-hover:text-[#D97706] transition-colors">
                  Portal Mitra Stand Kantin
                </h2>
                <p className="text-xs text-[#6F6B88] leading-relaxed">
                  Ruang kerja khusus pemilik stand kantin untuk melayani kasir POS, menerima pesanan online dari karyawan, mengelola menu privat, dan mencairkan pendapatan.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-2 border-t border-[#E6E3F7]">
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Kasir POS Digital Stand &amp; Pembayaran Potong Gaji</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Terima Orderan Masuk dari Aplikasi Mobile Karyawan</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Kelola Menu Makanan, Stok Barang &amp; Dual-Pricing Anggota</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#1C1B3A]">
                  <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />
                  <span>Laporan Omzet Penjualan &amp; Settlement Otomatis Koperasi</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Login + Register) */}
            <div className="pt-6 space-y-2.5">
              <Link
                href="/canteen-portal/login"
                className="w-full py-3.5 px-5 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Masuk Portal Mitra Kantin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/canteen-portal/register"
                className="w-full py-2.5 px-5 rounded-full bg-[#F5F3FF] hover:bg-[#E6E3F7] text-[#4A3AFF] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#E6E3F7]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Mitra Kantin Baru (Registrasi Stand)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. QUICK STATS SUMMARY TICKER */}
        <div className="mt-10 sm:mt-12 p-4 sm:p-5 rounded-[20px] bg-white border border-[#E6E3F7] shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-0.5">
            <p className="text-[11px] text-[#6F6B88]">Mitra Kantin Terdaftar</p>
            <p className="text-base sm:text-lg font-bold text-[#1C1B3A]">5 Stand Mitra</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-[#6F6B88]">Metode Pembayaran</p>
            <p className="text-base sm:text-lg font-bold text-[#4A3AFF]">Auto Payroll / Saldo</p>
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
