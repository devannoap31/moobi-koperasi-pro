"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  TrendingUp,
  Receipt,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  ExternalLink,
  MapPin,
  Sparkles,
  Send,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import {
  sampleEmployeeCanteenActivities,
  sampleProducts,
} from "@/data/mockData";
import { EmployeeCanteenActivity } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import {
  FormalReportConfig,
  buildCanteenSuperadminReportConfig,
  exportToCsv,
} from "@/utils/reportExporter";
import { ReportExportModal } from "@/components/common/ReportExportModal";

export const SuperadminCanteenManagementView: React.FC = () => {
  // Navigation Sub-tab: "PROFILE" | "ACTIVITIES" | "SETTINGS"
  const [activeTab, setActiveTab] = useState<"PROFILE" | "ACTIVITIES" | "SETTINGS">("PROFILE");

  // Employee Activities State
  const [activities, setActivities] = useState<EmployeeCanteenActivity[]>(sampleEmployeeCanteenActivities);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const debouncedActivitySearch = useDebounce(activitySearchTerm, 300);
  const [activityPaymentFilter, setActivityPaymentFilter] = useState<string>("ALL");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<FormalReportConfig | null>(null);

  // Broadcast Message State
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics Calculation for Kantin Tunggal
  const totalCanteenRevenue = 18950000;
  const canteenProducts = sampleProducts.filter((p) => p.category === "MAKANAN" || p.category === "MINUMAN");

  // Filter Activities
  const filteredActivities = activities.filter((act) => {
    const matchPayment = activityPaymentFilter === "ALL" || act.paymentMethod === activityPaymentFilter;
    const matchSearch =
      !debouncedActivitySearch.trim() ||
      act.employeeName.toLowerCase().includes(debouncedActivitySearch.toLowerCase()) ||
      act.employeeNik.toLowerCase().includes(debouncedActivitySearch.toLowerCase()) ||
      act.itemsSummary.toLowerCase().includes(debouncedActivitySearch.toLowerCase());
    return matchPayment && matchSearch;
  });

  // Handle Send Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    showToast("Pengumuman berhasil disiarkan ke layar POS kasir kantin!");
    setTimeout(() => {
      setBroadcastMessage("");
      setBroadcastSent(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        config={reportConfig}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div
            className={`py-3 px-4 rounded-[14px] shadow-2xl border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-[#1C1B3A] text-white border-white/10"
                : toastMessage.type === "error"
                ? "bg-red-600 text-white border-red-700"
                : "bg-[#4A3AFF] text-white border-[#4A3AFF]"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#2DBA7D]" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-white" />}
            {toastMessage.type === "info" && <AlertCircle className="w-4 h-4 text-white" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. HEADER & EXECUTIVE METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-[#E6E3F7] shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1B3A] tracking-tight">
              Monitoring Kantin Utama PT Bhakti Idola Tama
            </h1>
            <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30">
              Kantin Tunggal Pabrik BIT
            </span>
          </div>
          <p className="text-xs text-[#6F6B88]">
            Pusat pengawasan operasional satu-satunya kantin pabrik, transaksi makan karyawan (Shift 1 &amp; 2), serta integrasi POS Kasir.
          </p>
        </div>

        {/* Quick Portal Switch Link */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/canteen-portal/merchant/pos"
            target="_blank"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs shadow-md shadow-[#4A3AFF]/20 transition-all cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Buka POS Kasir Kantin</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Status Operasional */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Status Kantin Pabrik</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#1C1B3A]">
            Buka Operasional
          </p>
          <div className="flex items-center gap-1.5 text-[10.5px]">
            <span className="text-[#2DBA7D] font-bold">Shift 1 &amp; Shift 2 (06:30 - 21:00)</span>
          </div>
        </div>

        {/* Card 2: Total Menu Aktif */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Menu Makanan &amp; Minuman</span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#4A3AFF]">{canteenProducts.length} Menu Tersedia</p>
          <p className="text-[10.5px] text-[#6F6B88]">
            Makanan, Camilan &amp; Minuman Dingin
          </p>
        </div>

        {/* Card 3: Total Omzet Kantin */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Akumulasi Omzet Kantin</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#1C1B3A]">
            Rp {(totalCanteenRevenue / 1000000).toFixed(1)} Jt
          </p>
          <p className="text-[10.5px] text-[#2DBA7D]">Uang Tunai Kasir &amp; QRIS Statis Stand</p>
        </div>

        {/* Card 4: Metode Pembayaran */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Metode Pembayaran Kasir</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#1C1B3A]">Tunai &amp; QRIS Stand</p>
          <p className="text-[10.5px] text-[#6F6B88]">
            Penerimaan langsung di stand kantin
          </p>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E6E3F7] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("PROFILE")}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "PROFILE"
              ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Profil Kantin Utama BIT</span>
        </button>

        <button
          onClick={() => setActiveTab("ACTIVITIES")}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ACTIVITIES"
              ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Monitoring Transaksi Makan Karyawan</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "SETTINGS"
              ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pengumuman &amp; Broadcast Kasir</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFIL KANTIN UTAMA PABRIK BIT                                     */}
      {/* ========================================================================= */}
      {activeTab === "PROFILE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Detail Profil Kantin */}
            <div className="lg:col-span-2 bg-white rounded-[22px] border border-[#E6E3F7] p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E3F7] pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-[#4A3AFF] to-[#8E79F5] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                    <UtensilsCrossed className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-[#1C1B3A]">
                        Kantin Utama Koperasi PT. Bhakti Idola Tama
                      </h2>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                        Aktif Beroperasi
                      </span>
                    </div>
                    <p className="text-xs text-[#6F6B88] mt-0.5">
                      Melayani sarapan, makan siang, dan makan malam seluruh karyawan pabrik PT. Bhakti Idola Tama.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
                  <span className="text-[#6F6B88] font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    Lokasi Stand Kantin
                  </span>
                  <p className="font-bold text-[#1C1B3A] text-sm">Area Kantin Pabrik Lantai 1</p>
                  <p className="text-[11px] text-[#6F6B88]">Kawasan Industri PT. Bhakti Idola Tama, Jakarta Barat</p>
                </div>

                <div className="p-4 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
                  <span className="text-[#6F6B88] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    Jam Operasional Layanan
                  </span>
                  <p className="font-bold text-[#1C1B3A] text-sm">Shift 1 &amp; Shift 2 (06:30 - 21:00 WIB)</p>
                  <p className="text-[11px] text-[#2DBA7D] font-semibold">Buka Setiap Hari Kerja (Senin - Sabtu)</p>
                </div>

                <div className="p-4 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
                  <span className="text-[#6F6B88] font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    Mitra Pengelola &amp; Kontak
                  </span>
                  <p className="font-bold text-[#1C1B3A] text-sm">Bu Siti Rahayu</p>
                  <p className="text-[11px] text-[#6F6B88]">WhatsApp: 0812-3456-7890</p>
                </div>

                <div className="p-4 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
                  <span className="text-[#6F6B88] font-medium flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    Metode Pembayaran Aktif
                  </span>
                  <p className="font-bold text-[#1C1B3A] text-sm">Uang Tunai (Cash) &amp; QRIS Stand</p>
                  <p className="text-[11px] text-[#6F6B88]">Penerimaan langsung on-the-spot di kasir</p>
                </div>
              </div>

              {/* Menu Spotlight */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#1C1B3A]">
                    Daftar Menu Siap Saji Kantin
                  </h3>
                  <span className="text-xs text-[#6F6B88]">
                    Total: <strong>{canteenProducts.length} Menu Makanan &amp; Minuman</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {canteenProducts.map((prd) => (
                    <div
                      key={prd.id}
                      className="p-3.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-xs text-[#1C1B3A]">{prd.name}</p>
                        <p className="text-[11px] text-[#6F6B88] mt-0.5">
                          Harga Khusus Anggota BIT: <strong className="text-[#4A3AFF]">Rp {prd.memberPrice.toLocaleString("id-ID")}</strong>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] shrink-0">
                        Stok Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Account Management Box (Unified in /users) */}
            <div className="space-y-6">
              {/* Account Management Card */}
              <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#4A3AFF]">
                  <UserCheck className="w-4 h-4" />
                  <span>Akun Login Kasir Kantin</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1C1B3A]">
                    Manajemen Akun Terpusat
                  </h3>
                  <p className="text-xs text-[#6F6B88] leading-relaxed">
                    Sesuai kebijakan satu kantin tunggal, akun login pengelola/kasir kantin dikelola terpusat di menu <strong>Manajemen Pengguna</strong>.
                  </p>
                </div>

                {/* Account Details */}
                <div className="p-4 rounded-[16px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6B88]">Username Kasir:</span>
                    <strong className="text-[#1C1B3A] font-mono bg-white px-2 py-0.5 rounded border border-[#E6E3F7]">
                      kasir.kantin
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6B88]">Nama Petugas:</span>
                    <strong className="text-[#1C1B3A]">Agus Setiawan</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6B88]">Role Sistem:</span>
                    <span className="font-bold text-[#D97706] bg-[#FFF4E5] px-2 py-0.5 rounded-full text-[10px] border border-[#FDE68A]">
                      PENGELOLA_KANTIN
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6F6B88]">Status Akun:</span>
                    <span className="font-bold text-[#2DBA7D] flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-[#2DBA7D]" />
                      Aktif (Protected)
                    </span>
                  </div>
                </div>

                {/* Direct Link to Users Management */}
                <Link
                  href="/users"
                  className="w-full py-3 px-4 rounded-full bg-white border border-[#4A3AFF] text-[#4A3AFF] hover:bg-[#F5F3FF] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Buka Menu Manajemen Pengguna</span>
                </Link>
              </div>

              {/* Cashflow Notice Card */}
              <div className="bg-gradient-to-br from-[#FAFAFC] to-[#F5F3FF] rounded-[22px] border border-[#E6E3F7] p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2DBA7D]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ketentuan Arus Kas Kantin</span>
                </div>
                <p className="text-xs text-[#1C1B3A] leading-relaxed">
                  Seluruh pembayaran makanan &amp; minuman di kasir stand diterima langsung secara <strong>Tunai (Cash Fisik)</strong> atau <strong>QRIS Statis Stand</strong>. Tidak ada pemotongan gaji bulanan (payroll cutoff) untuk transaksi kantin.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONITORING AKTIVITAS TRANSAKSI KARYAWAN                            */}
      {/* ========================================================================= */}
      {activeTab === "ACTIVITIES" && (
        <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E3F7] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#1C1B3A]">
                Log Transaksi Makan &amp; Belanja Karyawan
              </h2>
              <p className="text-xs text-[#6F6B88]">
                Pantau seluruh aktivitas transaksi belanja makanan dan minuman karyawan di kasir kantin pabrik.
              </p>
            </div>

            {/* Filters & Export Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-[#6F6B88] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari karyawan / menu..."
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-8.5 pr-3 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <select
                value={activityPaymentFilter}
                onChange={(e) => setActivityPaymentFilter(e.target.value)}
                className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-2 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
              >
                <option value="ALL">Semua Metode Pembayaran</option>
                <option value="CASH_TUNAI">Uang Tunai (Cash)</option>
                <option value="QRIS_TUNAI">QRIS Statis Stand</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const cfg = buildCanteenSuperadminReportConfig(filteredActivities, "September 2026");
                  exportToCsv({
                    filename: "Laporan-Aktivitas-Kantin-September-2026",
                    columns: cfg.columns,
                    data: cfg.data,
                    totalRow: cfg.totalRow,
                    reportTitle: cfg.title,
                    period: cfg.period,
                  });
                }}
                className="px-3.5 py-2 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] hover:bg-[#2DBA7D] hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Unduh Spreadsheet Excel (.csv)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const cfg = buildCanteenSuperadminReportConfig(filteredActivities, "September 2026");
                  setReportConfig(cfg);
                  setIsReportModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                title="Buka Pratinjau & Cetak PDF Resmi"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF Laporan</span>
              </button>
            </div>
          </div>

          {/* Activities Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
                <tr>
                  <th className="py-3 px-3">Waktu Belanja</th>
                  <th className="py-3 px-3">Identitas Karyawan</th>
                  <th className="py-3 px-3">Item yang Dibeli</th>
                  <th className="py-3 px-3">Total Belanja</th>
                  <th className="py-3 px-3">Metode Bayar</th>
                  <th className="py-3 px-3">Status Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E3F7]">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                    <td className="py-3.5 px-3 text-[#6F6B88] whitespace-nowrap">
                      {act.transactionTime}
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-bold text-[#1C1B3A]">{act.employeeName}</p>
                      <p className="text-[10.5px] text-[#6F6B88]">
                        NIK: {act.employeeNik} • {act.department}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 text-[#1C1B3A] max-w-xs truncate">
                      {act.itemsSummary}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#4A3AFF] text-sm">
                        Rp {act.totalAmount.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[10px] text-[#2DBA7D] block font-semibold">
                        Diskon Anggota: Rp {act.memberSavings.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          act.paymentMethod === "QRIS_TUNAI"
                            ? "bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]"
                            : "bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0]"
                        }`}
                      >
                        {act.paymentMethod === "QRIS_TUNAI" ? (
                          <>
                            <QrCode className="w-3 h-3" />
                            <span>QRIS Statis Stand</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3 h-3" />
                            <span>Uang Tunai (Cash)</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[10.5px] font-bold text-[#2DBA7D] bg-[#E6F9F0] px-2.5 py-0.5 rounded-full">
                        ✓ Lunas Langsung
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PENGUMUMAN & BROADCAST KASIR KANTIN                                */}
      {/* ========================================================================= */}
      {activeTab === "SETTINGS" && (
        <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-6 shadow-xs space-y-6 max-w-3xl">
          <div className="space-y-1 border-b border-[#E6E3F7] pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A3AFF]">
              <Send className="w-4 h-4" />
              <span>Broadcast Pesan &amp; Pengumuman Kasir Kantin</span>
            </div>
            <h3 className="text-base font-bold text-[#1C1B3A]">
              Kirim Notifikasi ke Layar POS Kasir Kantin
            </h3>
            <p className="text-xs text-[#6F6B88]">
              Kirimkan pengumuman operasional penting (misal: jadwal menu spesial hari ini, jadwal libur operasional pabrik, atau kebersihan stand).
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#1C1B3A]">Isi Pesan Pengumuman:</label>
              <textarea
                rows={5}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Contoh: Diberitahukan kepada kasir kantin bahwa menu makan siang hari ini dilengkapi Nasi Kuning Spesial & Soto Ayam Lamongan..."
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[16px] p-3.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>

            <button
              type="submit"
              disabled={!broadcastMessage.trim() || broadcastSent}
              className="py-3 px-6 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#4A3AFF]/20 cursor-pointer disabled:bg-gray-300 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{broadcastSent ? "Pesan Terkirim!" : "Kirim Siaran ke Kasir Kantin"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
