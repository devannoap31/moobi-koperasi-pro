"use client";

import React, { useState } from "react";
import {
  Menu,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useProduction } from "@/context/ProductionContext";
import { ReportExportModal } from "@/components/common/ReportExportModal";
import { FormalReportConfig } from "@/utils/reportExporter";

export const ProductionHeader: React.FC = () => {
  const { toggleMobileSidebar } = useSidebar();
  const {
    rawMaterials,
    recipes,
    totalInventoryValue,
    reorderMaterialsCount,
  } = useProduction();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const reportConfig: FormalReportConfig = {
    title: "LAPORAN RESMI MANAJEMEN PRODUKSI & BAHAN BAKU",
    documentNumber: "BIT-KOP/REP-PROD/2026/09",
    date: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    period: "September 2026 (Shift 1 & 2)",
    departmentOrUnit: "Unit Usaha Dapur & Pengolahan F&B Kantin Kopkar BIT",
    summaries: [
      {
        label: "Total Nilai Persediaan",
        value: formatRupiah(totalInventoryValue),
      },
      {
        label: "Item Bahan Baku Aktif",
        value: `${rawMaterials.length} Bahan`,
      },
      {
        label: "Resep Menu Olahan",
        value: `${recipes.length} Menu Standar`,
      },
      {
        label: "Bahan Perlu Reorder",
        value: `${reorderMaterialsCount} Item`,
      },
    ],
    columns: [
      { header: "No", key: "no", width: "5%" },
      { header: "Kode & Nama Bahan Baku", key: "name", width: "25%" },
      { header: "Kategori", key: "category", width: "15%" },
      { header: "Stok Sistem", key: "currentStock", width: "15%" },
      { header: "Harga Satuan Pakai", key: "price", width: "18%" },
      { header: "Total Nilai Stok", key: "totalValue", width: "22%" },
    ],
    data: rawMaterials.map((item, idx) => ({
      no: idx + 1,
      name: `${item.code} - ${item.name}`,
      category: item.categoryName,
      currentStock: `${item.currentStock.toLocaleString("id-ID")} ${item.usageUnit}`,
      price: formatRupiah(item.usageUnitPrice),
      totalValue: formatRupiah(item.currentStock * item.usageUnitPrice),
    })),
    totalRow: {
      name: "GRAND TOTAL NILAI PERSEDIAAN",
      totalValue: formatRupiah(totalInventoryValue),
    },
    notes: [
      "Laporan persediaan bahan baku divalidasi berdasarkan konversi satuan pakai (gram/ml) dari satuan beli (Kg/Jerigen/Sak).",
      "Perhitungan HPP resep menggunakan formula Bill of Materials (BOM) standar Dapur Kantin PT Bhakti Idola Tama.",
      "Seluruh transaksi pemakaian bahan baku telah diverifikasi berdasarkan sesi masak porsi aktual harian.",
    ],
    signatures: [
      { role: "Dibuat Oleh,", titleOrNik: "Kepala Dapur & Produksi BIT", name: "Chef Suryanto" },
      { role: "Diperiksa Oleh,", titleOrNik: "Bagian Akuntansi & Persediaan", name: "Dewi Lestari, S.Ak" },
      { role: "Disetujui Oleh,", titleOrNik: "Ketua Koperasi / GA Manager", name: "Budi Santoso, S.T." },
    ],
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const csvRows = [
        ["NO", "KODE", "NAMA BAHAN BAKU", "KATEGORI", "STOK SAAT INI", "SATUAN PAKAI", "HARGA SATUAN", "TOTAL NILAI (RP)"],
        ...rawMaterials.map((m, idx) => [
          idx + 1,
          m.code,
          `"${m.name}"`,
          `"${m.categoryName}"`,
          m.currentStock,
          m.usageUnit,
          m.usageUnitPrice,
          m.currentStock * m.usageUnitPrice,
        ]),
        ["", "", "GRAND TOTAL", "", "", "", "", totalInventoryValue],
      ];

      const csvContent = "\uFEFF" + csvRows.map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Persediaan_Produksi_BIT_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E3F7] py-3.5 px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Drawer Button & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 rounded-full hover:bg-[#F5F3FF] text-[#1C1B3A] border border-[#E6E3F7] transition-colors shrink-0 cursor-pointer"
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-[#1C1B3A] tracking-tight truncate">
                  Manajemen Produksi &amp; Bahan Baku
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBFBF5] text-[#2DBA7D] border border-[#B8F2D8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DBA7D] animate-pulse" />
                  Kantin Utama PT BIT
                </span>
              </div>
              <p className="text-[11px] text-[#6F6B88] truncate hidden sm:block">
                Standarisasi Resep BOM, Kalkulasi HPP/COGS, PO Pembelian &amp; Stok Opname
              </p>
            </div>
          </div>

          {/* Right: Actions & Report Export */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-xs font-bold text-[#1C1B3A] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2DBA7D]" />
              <span>Export Excel</span>
            </button>

            {/* Cetak PDF Formal */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#2DBA7D] to-[#25A26C] hover:opacity-95 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-[#2DBA7D]/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF Laporan</span>
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E6E3F7]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2DBA7D] to-[#4A3AFF] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                KB
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PDF Export Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={reportConfig}
      />
    </>
  );
};
