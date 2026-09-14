"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Unlock,
  Coins,
  TrendingUp,
  Info,
  Building2,
  Briefcase,
} from "lucide-react";
import { sampleEmployees, calculateDynamicLoanLimit } from "@/data/mockData";
import { EmployeeMember, PositionLevel } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export const EmployeesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");

  const debouncedSearch = useDebounce(searchTerm, 300);

  const departments = [
    "ALL",
    "Logistik & Central Warehouse",
    "Technical Service & QC",
    "Assembly & Packaging",
    "Sales & Distribusi Nasional",
    "HR & General Affairs",
  ];

  const positions = ["ALL", "Operator", "Staff", "Supervisor", "Manager"];

  const filteredEmployees = sampleEmployees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      emp.nik.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchDept = selectedDept === "ALL" || emp.department === selectedDept;
    const matchPos = selectedPosition === "ALL" || emp.position === selectedPosition;
    return matchSearch && matchDept && matchPos;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Summary Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#1C1B3A]">
              Master Data Karyawan PT. Bhakti Idola Tama
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
              Tersinkronisasi HRD BIT
            </span>
          </div>
          <p className="text-xs text-[#6F6B88]">
            Limit pinjaman dihitung otomatis berdasarkan <strong>Jabatan</strong> dan <strong>Masa Kerja di PT Bhakti Idola Tama</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#6F6B88]">Status Anggota Kopkar BIT</p>
            <p className="text-lg font-bold text-[#4A3AFF]">Semua Karyawan Terdaftar</p>
          </div>
        </div>
      </div>

      {/* 2. Formula Card Explanation */}
      <div className="p-5 rounded-[18px] bg-[#F5F3FF] border border-[#E6E3F7] text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#4A3AFF] font-bold">
          <Info className="w-4 h-4" />
          <span>Matriks Aturan Limit Pinjaman Dinamis — PT. Bhakti Idola Tama</span>
        </div>
        <p className="text-[#6F6B88] leading-relaxed">
          Limit pinjaman maksimal yang dapat diajukan karyawan dihitung otomatis dari sistem:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-white rounded-[12px] border border-[#E6E3F7]">
            <p className="font-bold text-[#1C1B3A]">Operator (Gudang/QC)</p>
            <p className="text-[11px] text-[#6F6B88]">&lt; 3 Thn: <strong>2x Gaji</strong> | &ge; 3 Thn: <strong>3.5x Gaji</strong></p>
          </div>
          <div className="p-3 bg-white rounded-[12px] border border-[#E6E3F7]">
            <p className="font-bold text-[#1C1B3A]">Staff (Teknis/Admin)</p>
            <p className="text-[11px] text-[#6F6B88]">&lt; 3 Thn: <strong>3x Gaji</strong> | &ge; 3 Thn: <strong>4.5x Gaji</strong></p>
          </div>
          <div className="p-3 bg-white rounded-[12px] border border-[#E6E3F7]">
            <p className="font-bold text-[#1C1B3A]">Supervisor</p>
            <p className="text-[11px] text-[#6F6B88]">&lt; 3 Thn: <strong>4.5x Gaji</strong> | &ge; 3 Thn: <strong>6x Gaji</strong></p>
          </div>
          <div className="p-3 bg-white rounded-[12px] border border-[#E6E3F7]">
            <p className="font-bold text-[#1C1B3A]">Manager</p>
            <p className="text-[11px] text-[#6F6B88]">&lt; 3 Thn: <strong>6x Gaji</strong> | &ge; 3 Thn: <strong>8x Gaji</strong></p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIK BIT atau Nama Karyawan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9 pr-4 py-2 text-xs text-[#212529] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Dept Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6F6B88] font-medium">Departemen:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-1.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6F6B88] font-medium">Jabatan:</span>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-1.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Employees Data Table */}
      <div className="bg-white rounded-[18px] border border-[#E6E3F7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5F3FF]/60 border-b border-[#E6E3F7] text-[#6F6B88] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Karyawan BIT</th>
                <th className="py-3.5 px-4">Jabatan & Masa Kerja</th>
                <th className="py-3.5 px-4">Gaji Pokok</th>
                <th className="py-3.5 px-4">Limit Pinjaman Dinamis</th>
                <th className="py-3.5 px-4">Pinjaman Aktif / Sisa</th>
                <th className="py-3.5 px-4">Simpanan Wajib & Status</th>
                <th className="py-3.5 px-4">Simpanan Sukarela</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E3F7]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F5F3FF]/30 transition-colors">
                  {/* Name & NIK */}
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-bold text-[#1C1B3A] text-sm">{emp.name}</p>
                      <p className="text-[11px] text-[#6F6B88]">NIK: {emp.nik}</p>
                      <span className="inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded-full bg-[#F5F3FF] text-[#4A3AFF] font-medium border border-[#E6E3F7]">
                        {emp.department}
                      </span>
                    </div>
                  </td>

                  {/* Position & Tenure */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <span className="font-semibold text-[#1C1B3A] block">{emp.position}</span>
                      <span className="text-[11px] text-[#6F6B88] block">
                        Masa Kerja: <strong>{emp.tenureYears} Tahun</strong>
                      </span>
                    </div>
                  </td>

                  {/* Salary */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-[#1C1B3A]">
                      Rp {emp.monthlySalary.toLocaleString("id-ID")}
                    </span>
                  </td>

                  {/* Calculated Dynamic Loan Limit */}
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-bold text-[#4A3AFF] text-sm block">
                        Rp {emp.calculatedLoanLimit.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[10px] text-[#6F6B88]">
                        ({emp.position === "Operator" && emp.tenureYears >= 3 ? "3.5x Gaji" : emp.position === "Supervisor" && emp.tenureYears >= 3 ? "6x Gaji" : emp.position === "Manager" ? "8x Gaji" : "Standar Formula"})
                      </span>
                    </div>
                  </td>

                  {/* Active Loan & Remaining */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <p className="text-xs text-[#D97706] font-semibold">
                        Terpakai: Rp {emp.activeLoanAmount.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-[#2DBA7D] font-semibold">
                        Sisa: Rp {emp.remainingLoanLimit.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </td>

                  {/* Simpanan Wajib & Withdrawal status */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="font-bold text-[#1C1B3A]">
                        Rp {emp.simpananWajib.toLocaleString("id-ID")}
                      </p>
                      {emp.isSimpananWajibWithdrawable ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                          <Unlock className="w-2.5 h-2.5" />
                          Eligible Ditarik (&gt; 2 Thn)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#D97706]">
                          <Lock className="w-2.5 h-2.5" />
                          Terkunci (&lt; 2 Thn)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Simpanan Sukarela */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="font-bold text-[#1C1B3A]">
                        Rp {emp.simpananSukarela.toLocaleString("id-ID")}
                      </p>
                      {emp.simpananSukarelaLockedUntil && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#6F6B88] px-2 py-0.5 rounded-full bg-[#FAFAFC] border border-[#E6E3F7]">
                          <Lock className="w-2.5 h-2.5 text-[#6F6B88]" />
                          Lock s/d {emp.simpananSukarelaLockedUntil}
                        </span>
                      )}
                    </div>
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
