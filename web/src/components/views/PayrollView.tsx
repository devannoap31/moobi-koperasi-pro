"use client";

import React, { useState } from "react";
import {
  ReceiptText,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  Search,
} from "lucide-react";
import { samplePayrollDeductions } from "@/data/mockData";
import { PayrollDeductionRecord } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export const PayrollView: React.FC = () => {
  const [deductions, setDeductions] = useState<PayrollDeductionRecord[]>(samplePayrollDeductions);
  const [selectedPeriod, setSelectedPeriod] = useState("September 2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filtered = deductions.filter(
    (d) =>
      d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.nik.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const totalBaseSalary = filtered.reduce((acc, d) => acc + d.baseSalary, 0);
  const totalSimpananWajib = filtered.reduce((acc, d) => acc + d.simpananWajibDeduction, 0);
  const totalCicilan = filtered.reduce((acc, d) => acc + d.loanInstallmentDeduction, 0);
  const totalKantin = filtered.reduce((acc, d) => acc + d.canteenBillDeduction, 0);
  const totalAllDeductions = filtered.reduce((acc, d) => acc + d.totalDeductions, 0);
  const totalTakeHomePay = filtered.reduce((acc, d) => acc + d.netTakeHomePay, 0);

  const handleExport = (format: "EXCEL" | "PDF") => {
    setExportNotice(`Berhasil mengekspor Laporan Rekap Potong Gaji (${format}) untuk Tim HRD & Finance PT. Bhakti Idola Tama Periode ${selectedPeriod}!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#1C1B3A]">
              Rekap Pemotongan Gaji Terpusat — PT. Bhakti Idola Tama
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
              Tersinkron HRD BIT
            </span>
          </div>
          <p className="text-xs text-[#6F6B88]">
            Menggabungkan <strong>Simpanan Wajib Kopkar BIT + Cicilan Pinjaman + Tagihan Toko Perkakas & Kantin</strong> langsung dari slip gaji karyawan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("EXCEL")}
            className="px-4 py-2 rounded-full bg-[#2DBA7D] hover:bg-[#239962] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (HRD BIT)</span>
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Slip</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2. Summary Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[14px] bg-white border border-[#E6E3F7] shadow-sm">
          <span className="text-[11px] font-bold text-[#6F6B88] uppercase">Total Gaji Bruto BIT</span>
          <p className="text-lg font-bold text-[#1C1B3A] mt-0.5">
            Rp {totalBaseSalary.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="p-4 rounded-[14px] bg-white border border-[#E6E3F7] shadow-sm">
          <span className="text-[11px] font-bold text-[#6F6B88] uppercase">Potongan Simpanan Wajib</span>
          <p className="text-lg font-bold text-[#4A3AFF] mt-0.5">
            Rp {totalSimpananWajib.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="p-4 rounded-[14px] bg-white border border-[#E6E3F7] shadow-sm">
          <span className="text-[11px] font-bold text-[#6F6B88] uppercase">Potongan Cicilan Pinjaman</span>
          <p className="text-lg font-bold text-[#D97706] mt-0.5">
            Rp {totalCicilan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="p-4 rounded-[14px] bg-[#E6F9F0] border border-[#2DBA7D]/30 shadow-sm">
          <span className="text-[11px] font-bold text-[#2DBA7D] uppercase">Gaji Bersih Diterima</span>
          <p className="text-lg font-bold text-[#1C1B3A] mt-0.5">
            Rp {totalTakeHomePay.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* 3. Search & Period Filter */}
      <div className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIK BIT atau Nama Karyawan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9 pr-4 py-2 text-xs text-[#212529] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-[#6F6B88]" />
          <span className="text-[#6F6B88] font-medium">Periode Payroll:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-1.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
          >
            <option value="September 2026">September 2026</option>
            <option value="Agustus 2026">Agustus 2026</option>
            <option value="Juli 2026">Juli 2026</option>
          </select>
        </div>
      </div>

      {/* 4. Payroll Table */}
      <div className="bg-white rounded-[18px] border border-[#E6E3F7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F3FF]/60 border-b border-[#E6E3F7] text-[#6F6B88] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Karyawan BIT</th>
                <th className="py-3.5 px-4">Gaji Pokok (Bruto)</th>
                <th className="py-3.5 px-4 text-[#4A3AFF]">1. Simpanan Wajib</th>
                <th className="py-3.5 px-4 text-[#D97706]">2. Cicilan Pinjaman</th>
                <th className="py-3.5 px-4 text-[#D97706]">3. Tagihan Toko/Kantin</th>
                <th className="py-3.5 px-4 text-[#E5484D]">Total Potongan</th>
                <th className="py-3.5 px-4 text-[#2DBA7D]">Gaji Bersih (Take Home)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E3F7]">
              {filtered.map((d) => (
                <tr key={d.employeeId} className="hover:bg-[#F5F3FF]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-bold text-[#1C1B3A]">{d.name}</p>
                      <p className="text-[11px] text-[#6F6B88]">NIK: {d.nik}</p>
                      <span className="text-[10px] text-[#4A3AFF]">{d.department}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-[#1C1B3A]">
                    Rp {d.baseSalary.toLocaleString("id-ID")}
                  </td>

                  <td className="py-4 px-4 text-[#4A3AFF] font-semibold">
                    - Rp {d.simpananWajibDeduction.toLocaleString("id-ID")}
                  </td>

                  <td className="py-4 px-4 text-[#D97706] font-semibold">
                    - Rp {d.loanInstallmentDeduction.toLocaleString("id-ID")}
                  </td>

                  <td className="py-4 px-4 text-[#D97706] font-semibold">
                    - Rp {d.canteenBillDeduction.toLocaleString("id-ID")}
                  </td>

                  <td className="py-4 px-4 text-[#E5484D] font-bold">
                    - Rp {d.totalDeductions.toLocaleString("id-ID")}
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-[#1C1B3A] text-sm px-2.5 py-1 rounded-full bg-[#E6F9F0] text-[#2DBA7D] inline-block">
                      Rp {d.netTakeHomePay.toLocaleString("id-ID")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
