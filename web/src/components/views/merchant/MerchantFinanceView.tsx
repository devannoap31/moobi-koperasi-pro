"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  TrendingUp,
  QrCode,
  X,
  Building2,
  Clock,
  Printer,
  Search,
  ArrowUpRight,
  Banknote,
  Sparkles,
  ShoppingBag,
  Receipt,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";
import { useMerchant } from "@/context/MerchantContext";
import { CanteenPaymentMethod } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import {
  FormalReportConfig,
  buildMerchantFinanceReportConfig,
  exportToCsv,
} from "@/utils/reportExporter";
import { ReportExportModal } from "@/components/common/ReportExportModal";

interface LedgerTransaction {
  id: string;
  orderNumber: string;
  timestamp: string;
  timeOnly: string;
  dateOnly: string;
  customerName: string;
  customerType: "KARYAWAN" | "UMUM";
  customerNik?: string;
  department?: string;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: CanteenPaymentMethod;
  disbursementStatus: "MENUNGGU_CUTOFF" | "DITERIMA_LANGSUNG";
}

export const MerchantFinanceView: React.FC = () => {
  const { currentTenant, settlements } = useMerchant();
  const [showQrisPreviewModal, setShowQrisPreviewModal] = useState(false);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);

  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "7_DAYS">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<FormalReportConfig | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Mock Ledger Data
  const sampleTransactions: LedgerTransaction[] = useMemo(() => {
    return [
      {
        id: "TX-01",
        orderNumber: "ORD-20260916-042",
        timestamp: "2026-09-16 12:45",
        dateOnly: "2026-09-16",
        timeOnly: "12:45 WIB",
        customerName: "Budi Santoso",
        customerType: "KARYAWAN",
        customerNik: "BIT-2021-089",
        department: "Logistik & Warehouse",
        itemsSummary: "2x Ayam Geprek, 1x Es Teh Manis",
        totalAmount: 38000,
        paymentMethod: "QRIS_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
      {
        id: "TX-02",
        orderNumber: "ORD-20260916-039",
        timestamp: "2026-09-16 12:30",
        dateOnly: "2026-09-16",
        timeOnly: "12:30 WIB",
        customerName: "Siti Rahmawati",
        customerType: "KARYAWAN",
        customerNik: "BIT-2023-142",
        department: "Technical Service & QC",
        itemsSummary: "1x Nasi Goreng Spesial, 1x Kopi Hitam",
        totalAmount: 22000,
        paymentMethod: "CASH_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
      {
        id: "TX-03",
        orderNumber: "ORD-20260916-031",
        timestamp: "2026-09-16 12:10",
        dateOnly: "2026-09-16",
        timeOnly: "12:10 WIB",
        customerName: "Darmawan (Vendor Mesin)",
        customerType: "UMUM",
        itemsSummary: "1x Soto Ayam Lamongan, 1x Kerupuk",
        totalAmount: 18000,
        paymentMethod: "QRIS_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
      {
        id: "TX-04",
        orderNumber: "ORD-20260916-025",
        timestamp: "2026-09-16 11:50",
        dateOnly: "2026-09-16",
        timeOnly: "11:50 WIB",
        customerName: "Ahmad Fauzi",
        customerType: "KARYAWAN",
        customerNik: "BIT-2025-412",
        department: "Assembly & Packaging",
        itemsSummary: "1x Ayam Geprek Sambal Korek",
        totalAmount: 15000,
        paymentMethod: "CASH_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
      {
        id: "TX-05",
        orderNumber: "ORD-20260915-088",
        timestamp: "2026-09-15 13:15",
        dateOnly: "2026-09-15",
        timeOnly: "13:15 WIB",
        customerName: "Hendra Wijaya",
        customerType: "KARYAWAN",
        customerNik: "BIT-2020-015",
        department: "Sales & Distribusi",
        itemsSummary: "3x Nasi Goreng Spesial, 3x Es Jeruk",
        totalAmount: 69000,
        paymentMethod: "QRIS_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
      {
        id: "TX-06",
        orderNumber: "ORD-20260915-072",
        timestamp: "2026-09-15 12:20",
        dateOnly: "2026-09-15",
        timeOnly: "12:20 WIB",
        customerName: "Dewi Lestari",
        customerType: "KARYAWAN",
        customerNik: "BIT-2024-301",
        department: "HR & General Affairs",
        itemsSummary: "1x Soto Ayam Lamongan, 1x Es Teh",
        totalAmount: 20000,
        paymentMethod: "CASH_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
      {
        id: "TX-07",
        orderNumber: "ORD-20260914-061",
        timestamp: "2026-09-14 12:05",
        dateOnly: "2026-09-14",
        timeOnly: "12:05 WIB",
        customerName: "Rizky Pratama",
        customerType: "KARYAWAN",
        customerNik: "BIT-2022-198",
        department: "Logistik & Warehouse",
        itemsSummary: "2x Ayam Geprek Sambal Korek",
        totalAmount: 30000,
        paymentMethod: "QRIS_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
      {
        id: "TX-08",
        orderNumber: "ORD-20260914-044",
        timestamp: "2026-09-14 09:30",
        dateOnly: "2026-09-14",
        timeOnly: "09:30 WIB",
        customerName: "Tamu Audit Eksternal",
        customerType: "UMUM",
        itemsSummary: "2x Kopi Hitam Mantap, 2x Roti Bakar",
        totalAmount: 28000,
        paymentMethod: "QRIS_TUNAI",
        disbursementStatus: "DITERIMA_LANGSUNG",
      },
    ];
  }, []);

  // 7-Day Trend Mock Data
  const weeklySales = [
    { day: "Kam (10/09)", amount: 650000, height: "65%" },
    { day: "Jum (11/09)", amount: 790000, height: "79%" },
    { day: "Sab (12/09)", amount: 430000, height: "43%" },
    { day: "Min (13/09)", amount: 150000, height: "15%" },
    { day: "Sen (14/09)", amount: 680000, height: "68%" },
    { day: "Sel (15/09)", amount: 720000, height: "72%" },
    { day: "Rab (16/09)", amount: 810000, height: "81%" },
  ];

  // Top 5 Best-Selling Menus
  const topMenus = [
    { name: "Ayam Geprek Sambal Korek", portions: 65, revenue: 975000, percent: 35 },
    { name: "Nasi Goreng Spesial BIT", portions: 52, revenue: 780000, percent: 28 },
    { name: "Soto Ayam Lamongan", portions: 40, revenue: 600000, percent: 22 },
    { name: "Es Teh Manis Jumbo", portions: 90, revenue: 270000, percent: 10 },
    { name: "Kopi Hitam Mantap", portions: 35, revenue: 140000, percent: 5 },
  ];

  // Revenue Breakdown Calculations
  const revenueBreakdown = {
    qris: { amount: 2850000, percent: 65, label: "QRIS Statis Stand" },
    cash: { amount: 1550000, percent: 35, label: "Cash / Tunai Kasir" },
  };

  // Filtered Ledger
  const filteredLedger = sampleTransactions.filter((tx) => {
    const matchPayment = paymentFilter === "ALL" || tx.paymentMethod === paymentFilter;
    const matchSearch =
      !debouncedSearch.trim() ||
      tx.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      tx.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (tx.customerNik && tx.customerNik.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      tx.itemsSummary.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchPayment && matchSearch;
  });

  // Export handlers
  const handleExportCSV = () => {
    const config = buildMerchantFinanceReportConfig(filteredLedger, revenueBreakdown, "September 2026", currentTenant);
    exportToCsv({
      filename: `Rekap-Omzet-${currentTenant.id}-September-2026`,
      columns: config.columns,
      data: config.data,
      totalRow: config.totalRow,
      reportTitle: config.title,
      period: config.period,
    });
  };

  const handleOpenReportModal = () => {
    const config = buildMerchantFinanceReportConfig(filteredLedger, revenueBreakdown, "September 2026", currentTenant);
    setReportConfig(config);
    setIsReportModalOpen(true);
  };

  // Cutoff calculation
  const pendingGross = currentTenant.pendingSettlement || 4200000;
  const platformFee = Math.round(pendingGross * 0.01);
  const estimatedNetDisbursement = pendingGross - platformFee;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Formal Report Export Modal */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        config={reportConfig}
      />

      {/* 1. Header & Actions */}
      <div className="bg-white p-6 rounded-[22px] border border-[#E6E3F7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-[#1C1B3A]">
              Keuangan &amp; Arus Kas Stand Kantin
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
              {currentTenant.name}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DBA7D] animate-pulse" />
              Settlement Tgl 25 Aktif
            </span>
          </div>
          <p className="text-xs text-[#6F6B88]">
            Pantau arus kas harian, rincian omzet per metode bayar, estimasi pencairan payroll dari koperasi, dan laporan pembukuan berkala.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-full border border-[#E6E3F7] bg-[#FAFAFC] hover:bg-white text-xs font-bold text-[#1C1B3A] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2DBA7D]" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            type="button"
            onClick={handleOpenReportModal}
            className="px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap Laporan Resmi (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Highlights Grid (Stat Cards & Countdown Settlement) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6F6B88] uppercase tracking-wider">
              Total Omzet Terkumpul
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1C1B3A]">
            Rp {currentTenant.totalRevenue.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#2DBA7D] font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Akumulasi POS kasir &amp; aplikasi</span>
          </p>
        </div>

        {/* Saldo Menunggu Settlement */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6F6B88] uppercase tracking-wider">
              Saldo Menunggu Settlement
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#7C3AED]">
            Rp {pendingGross.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#6F6B88]">
            Potong Gaji &amp; Saldo Dompet Kopkar
          </p>
        </div>

        {/* Countdown & Estimasi Bersih Cutoff Tgl 25 */}
        <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] p-5 rounded-[20px] border border-[#4A3AFF]/30 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A3AFF] uppercase tracking-wider">
              Pencairan Cutoff Tgl 25
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4A3AFF] text-white">
              Sisa 9 Hari
            </span>
          </div>
          <p className="text-xl font-black text-[#4A3AFF]">
            Rp {estimatedNetDisbursement.toLocaleString("id-ID")}
          </p>
          <div className="text-[10px] text-[#6F6B88] space-y-0.5">
            <span>Estimasi dana bersih setelah iuran 1% (-Rp {platformFee.toLocaleString("id-ID")})</span>
          </div>
        </div>

        {/* Rekening Pencairan Bank Stand */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6F6B88] uppercase tracking-wider">
              Rekening Transfer Bank
            </span>
            <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1C1B3A] truncate">{currentTenant.bankName}</p>
            <p className="text-xs font-mono font-bold text-[#4A3AFF]">{currentTenant.bankAccountNumber}</p>
          </div>
          <p className="text-[11px] text-[#6F6B88] truncate">a.n {currentTenant.bankAccountName}</p>
        </div>
      </div>

      {/* 3. Komposisi Metode Pembayaran (Revenue Breakdown Cards) */}
      <div className="bg-white p-6 rounded-[22px] border border-[#E6E3F7] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1C1B3A]">
              Komposisi Omzet Berdasarkan Metode Pembayaran
            </h3>
            <p className="text-xs text-[#6F6B88]">
              Pemisahan antara dana yang menunggu transfer koperasi vs dana yang sudah langsung diterima.
            </p>
          </div>
          <span className="text-xs font-bold text-[#4A3AFF] bg-[#F5F3FF] px-3 py-1 rounded-full border border-[#E6E3F7]">
            Bulan Ini: Rp {(revenueBreakdown.qris.amount + revenueBreakdown.cash.amount).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* QRIS Stand */}
          <div className="p-4 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#2DBA7D]" />
                <span className="text-xs font-bold text-[#1C1B3A]">QRIS Statis Stand Mandiri</span>
              </div>
              <span className="text-[10px] font-bold text-[#2DBA7D]">{revenueBreakdown.qris.percent}%</span>
            </div>
            <p className="text-lg font-bold text-[#1C1B3A]">
              Rp {revenueBreakdown.qris.amount.toLocaleString("id-ID")}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] inline-block">
              Langsung Masuk Rekening Bank
            </span>
          </div>

          {/* Cash Tunai */}
          <div className="p-4 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-bold text-[#1C1B3A]">Cash / Uang Tunai Kasir</span>
              </div>
              <span className="text-[10px] font-bold text-[#0284C7]">{revenueBreakdown.cash.percent}%</span>
            </div>
            <p className="text-lg font-bold text-[#1C1B3A]">
              Rp {revenueBreakdown.cash.amount.toLocaleString("id-ID")}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] inline-block">
              Uang Fisik di Laci Kasir Stand
            </span>
          </div>
        </div>
      </div>

      {/* 4. Tren Penjualan 7 Hari & Top 5 Menu Terlaris Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tren Penjualan & Jam Sibuk */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[22px] border border-[#E6E3F7] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#4A3AFF]" />
              <h3 className="text-sm font-bold text-[#1C1B3A]">
                Tren Omzet 7 Hari Terakhir &amp; Jam Sibuk
              </h3>
            </div>
            <span className="text-[11px] text-[#6F6B88]">Rata-rata: Rp 604.000 / Hari</span>
          </div>

          {/* Visual Bar Chart */}
          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-[#E6E3F7] pb-3">
            {weeklySales.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] font-bold text-[#1C1B3A] opacity-0 group-hover:opacity-100 transition-opacity">
                  {(item.amount / 1000).toFixed(0)}k
                </span>
                <div className="w-full bg-[#F5F3FF] rounded-t-[8px] h-28 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-[#4A3AFF] hover:bg-[#6B5CEB] rounded-t-[8px] transition-all duration-500"
                    style={{ height: item.height }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#6F6B88] truncate w-full text-center">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          {/* Peak Hours Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#1C1B3A]">11:30 - 13:30 WIB</p>
                <p className="text-[10px] text-[#6F6B88]">Shift Istirahat Siang Pabrik (62% Omzet)</p>
              </div>
            </div>

            <div className="p-3 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#1C1B3A]">Rp 24.500 / Transaksi</p>
                <p className="text-[10px] text-[#6F6B88]">Rata-rata Nilai Belanja (AOV)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Menu Paling Menghasilkan */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[22px] border border-[#E6E3F7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-sm font-bold text-[#1C1B3A]">
                Top 5 Menu Paling Menghasilkan
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
              Bulan Ini
            </span>
          </div>

          <div className="space-y-3">
            {topMenus.map((menu, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1C1B3A] truncate max-w-[180px]">
                    {idx + 1}. {menu.name}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#1C1B3A]">
                      Rp {menu.revenue.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-[#6F6B88] ml-1">({menu.portions}x)</span>
                  </div>
                </div>
                <div className="w-full bg-[#E6E3F7] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#4A3AFF] h-full rounded-full"
                    style={{ width: `${menu.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. QRIS Stand Card */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-20 bg-[#FAFAFC] rounded-[12px] border border-[#E6E3F7] p-1 shrink-0 overflow-hidden shadow-2xs">
            <Image
              src="/images/qris-example.jpg"
              alt="QRIS Stand"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#1C1B3A]">QRIS Merchant Stand BIT</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                Aktif &amp; Terhubung Bank
              </span>
            </div>
            <p className="text-xs text-[#6F6B88]">
              NMID: <strong>ID1020039281920</strong> • Settlement otomatis ke Rekening {currentTenant.bankName} ({currentTenant.bankAccountNumber})
            </p>
            <p className="text-[11px] text-[#A5A2B8]">
              Digunakan untuk menerima pembayaran langsung di kasir dari pembeli karyawan maupun non-karyawan.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowQrisPreviewModal(true)}
          className="py-2.5 px-4 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white border border-[#E6E3F7] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
        >
          <QrCode className="w-4 h-4" />
          <span>Tampilkan / Preview QRIS Stand</span>
        </button>
      </div>

      {/* 6. Buku Kas & Log Transaksi Harian Lengkap (Transaction Ledger) */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1C1B3A] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#4A3AFF]" />
              <span>Buku Kas &amp; Log Transaksi Penjualan Masuk</span>
            </h3>
            <p className="text-xs text-[#6F6B88]">
              Rincian transaksi belanja pelanggan di kasir stand kantin secara terperinci.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#6F6B88] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pembeli / order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAFAFC] border border-[#E6E3F7] rounded-full text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-1.5 text-xs text-[#1C1B3A] font-semibold focus:outline-none focus:border-[#4A3AFF]"
            >
              <option value="ALL">Semua Tanggal</option>
              <option value="TODAY">Hari Ini (16 Sep)</option>
              <option value="7_DAYS">7 Hari Terakhir</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-1.5 text-xs text-[#1C1B3A] font-semibold focus:outline-none focus:border-[#4A3AFF]"
            >
              <option value="ALL">Semua Metode</option>
              <option value="CASH_TUNAI">Uang Tunai (Cash)</option>
              <option value="QRIS_TUNAI">QRIS Statis Stand</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
              <tr>
                <th className="py-3 px-3">No. Order / Waktu</th>
                <th className="py-3 px-3">Pembeli</th>
                <th className="py-3 px-3">Menu Terjual</th>
                <th className="py-3 px-3">Metode Bayar</th>
                <th className="py-3 px-3">Total Bayar</th>
                <th className="py-3 px-3">Status Dana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E3F7]">
              {filteredLedger.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-[#4A3AFF] block">{tx.orderNumber}</span>
                    <span className="text-[10px] text-[#6F6B88]">{tx.timeOnly}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#1C1B3A] block">{tx.customerName}</span>
                    {tx.customerType === "KARYAWAN" ? (
                      <span className="text-[10px] text-[#6F6B88]">
                        {tx.customerNik} • {tx.department}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#2DBA7D] font-semibold">Tamu / Umum</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#1C1B3A] max-w-xs">{tx.itemsSummary}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        tx.paymentMethod === "QRIS_TUNAI"
                          ? "bg-[#E6F9F0] text-[#2DBA7D]"
                          : "bg-[#E0F2FE] text-[#0284C7]"
                      }`}
                    >
                      {tx.paymentMethod === "QRIS_TUNAI"
                        ? "QRIS Statis Stand"
                        : "Uang Tunai (Cash)"}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#1C1B3A]">
                    Rp {tx.totalAmount.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3">
                    {tx.disbursementStatus === "MENUNGGU_CUTOFF" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#D97706]">
                        Menunggu Cutoff 25
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                        Langsung Cair
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Settlement History Table */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1C1B3A]">
              Riwayat Settlement Pencairan dari Koperasi
            </h3>
            <p className="text-xs text-[#6F6B88]">
              Catatan rekap transfer rutin per tanggal 25 setiap bulan ke rekening stand.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#6F6B88]">
            Iuran Koperasi: 1%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
              <tr>
                <th className="py-2.5 px-3">Periode Cutoff</th>
                <th className="py-2.5 px-3">Transaksi</th>
                <th className="py-2.5 px-3">Omzet Kotor</th>
                <th className="py-2.5 px-3">Iuran Kopkar (1%)</th>
                <th className="py-2.5 px-3">Dana Bersih Ditransfer</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E3F7]">
              {settlements.map((stl) => (
                <tr key={stl.id} className="hover:bg-[#F5F3FF]/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#1C1B3A]">{stl.period}</td>
                  <td className="py-3 px-3">{stl.totalTransactions} x</td>
                  <td className="py-3 px-3">Rp {stl.grossRevenue.toLocaleString("id-ID")}</td>
                  <td className="py-3 px-3 text-red-500 font-medium">
                    -Rp {stl.platformFee.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#4A3AFF]">
                    Rp {stl.netDisbursement.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stl.status === "PROCESSED"
                          ? "bg-[#E6F9F0] text-[#2DBA7D]"
                          : "bg-[#FFF4E5] text-[#D97706]"
                      }`}
                    >
                      {stl.status === "PROCESSED" ? "Sudah Ditransfer" : "Menunggu Cutoff 25"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Stand QRIS Full Preview Modal */}
      {showQrisPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-xs">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1B3A]">QRIS Stand Resmi</h4>
                  <p className="text-[10px] text-[#6F6B88]">{currentTenant.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrisPreviewModal(false)}
                className="w-7 h-7 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-64 h-80 mx-auto bg-[#FAFAFC] rounded-[16px] border border-[#E6E3F7] p-2 flex items-center justify-center shadow-inner overflow-hidden">
              <Image
                src="/images/qris-example.jpg"
                alt="QRIS Stand"
                fill
                sizes="260px"
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-[#1C1B3A]">NMID: ID1020039281920</p>
              <p className="text-[11px] text-[#6F6B88]">
                Rekening Pencairan: {currentTenant.bankName} - {currentTenant.bankAccountNumber}
              </p>
            </div>

            <button
              onClick={() => setShowQrisPreviewModal(false)}
              className="w-full py-2.5 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] text-white font-bold text-xs cursor-pointer"
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Official Monthly Settlement & Financial Report Print Modal */}
      {showPrintReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-[#1C1B3A] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-[#4A3AFF]" />
                </div>
                <div>
                  <h3 className="font-bold text-base">REKAP LAPORAN OMZET &amp; SETTLEMENT</h3>
                  <p className="text-xs text-white/70">
                    Kopkar PT Bhakti Idola Tama • Periode September 2026
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrintReportModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 bg-[#FAFAFC] text-xs text-[#1C1B3A]">
              {/* Stand Header Info */}
              <div className="flex justify-between items-start border-b border-[#E6E3F7] pb-4">
                <div>
                  <h4 className="font-bold text-sm text-[#1C1B3A]">{currentTenant.name}</h4>
                  <p className="text-[#6F6B88]">Pemilik: {currentTenant.ownerName} ({currentTenant.location})</p>
                  <p className="text-[11px] font-mono text-[#4A3AFF]">NMID: ID1020039281920</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#6F6B88]">Tanggal Cetak:</span>
                  <p className="font-semibold">16 September 2026</p>
                </div>
              </div>

              {/* Rincian Omzet per Metode */}
              <div className="p-4 rounded-[16px] bg-white border border-[#E6E3F7] space-y-2.5">
                <span className="font-bold text-xs uppercase tracking-wider text-[#6F6B88] block">
                  Rincian Penerimaan Omzet
                </span>
                <div className="flex justify-between">
                  <span>1. Omzet QRIS Statis Stand Mandiri:</span>
                  <span className="font-bold">Rp {revenueBreakdown.qris.amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Omzet Cash / Tunai Kasir:</span>
                  <span className="font-bold">Rp {revenueBreakdown.cash.amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-dashed border-[#E6E3F7] pt-2 flex justify-between font-bold text-sm">
                  <span>Total Omzet Keseluruhan:</span>
                  <span className="text-[#4A3AFF]">
                    Rp {(revenueBreakdown.qris.amount + revenueBreakdown.cash.amount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Perhitungan Settlement Koperasi */}
              <div className="p-4 rounded-[16px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#4A3AFF] block">
                  Perhitungan Settlement Koperasi (Cutoff 25 September)
                </span>
                <div className="flex justify-between">
                  <span>Total Dana Tertahan di Koperasi (Payroll + Saldo):</span>
                  <span className="font-bold">Rp {pendingGross.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Iuran / Fee Platform Koperasi (1%):</span>
                  <span className="font-bold">- Rp {platformFee.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-[#4A3AFF]/30 pt-2 flex justify-between font-black text-sm text-[#2DBA7D]">
                  <span>Estimasi Dana Bersih Ditransfer ke Rekening:</span>
                  <span>Rp {estimatedNetDisbursement.toLocaleString("id-ID")}</span>
                </div>
                <p className="text-[10.5px] text-[#6F6B88] pt-1">
                  Ditransfer ke Rekening {currentTenant.bankName} <strong>{currentTenant.bankAccountNumber}</strong> (a.n {currentTenant.bankAccountName}).
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-3 text-[11px] text-[#6F6B88] border-t border-[#E6E3F7]">
                <div>
                  <p>Pengelola Stand Kantin:</p>
                  <p className="font-bold text-[#1C1B3A] mt-8">{currentTenant.ownerName}</p>
                </div>
                <div className="text-right">
                  <p>Bendahara Kopkar PT BIT:</p>
                  <p className="font-bold text-[#4A3AFF] mt-8">Siti Aminah, S.E.</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-[#E6E3F7] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-[#E6E3F7] text-[#1C1B3A] text-xs font-bold hover:bg-[#FAFAFC] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintReportModal(false)}
                className="px-5 py-2 rounded-full bg-[#4A3AFF] text-white text-xs font-bold hover:bg-[#6B5CEB] transition-all cursor-pointer shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
