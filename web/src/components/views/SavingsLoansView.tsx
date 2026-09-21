"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Wallet,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Landmark,
  Calculator,
  AlertCircle,
  Search,
  Loader2,
  Check,
  X,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  sampleLoans,
  sampleEmployees,
} from "@/data/mockData";
import { LoanApplication, LoanStatus } from "@/types";
import {
  exportToCsv,
  buildSavingsLoansReportConfig,
  ReportConfig,
} from "@/utils/reportExporter";
import { ReportExportModal } from "@/components/common/ReportExportModal";

export const SavingsLoansView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"loans" | "savings">("loans");
  const [loans, setLoans] = useState<LoanApplication[]>(sampleLoans);

  // Form State for new loan application
  const [selectedEmpId, setSelectedEmpId] = useState(sampleEmployees[0].id);
  const [employeeSearchInput, setEmployeeSearchInput] = useState(
    `${sampleEmployees[0].name} (${sampleEmployees[0].nik} - ${sampleEmployees[0].position})`
  );
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedEmpSearch = useDebounce(employeeSearchInput, 250);

  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [tenorMonths, setTenorMonths] = useState<number>(12);
  const [loanPurpose, setLoanPurpose] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State for new Sukarela savings deposit
  const [savingsAmount, setSavingsAmount] = useState<number>(5000000);
  const [savingsLockPeriod, setSavingsLockPeriod] = useState<"6_BULAN" | "1_TAHUN">("1_TAHUN");
  const [showSavingsSuccess, setShowSavingsSuccess] = useState(false);

  // Report Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [currentExportConfig, setCurrentExportConfig] = useState<ReportConfig | null>(null);

  const handleOpenExportModal = () => {
    const config = buildSavingsLoansReportConfig(loans, sampleEmployees);
    setCurrentExportConfig(config);
    setIsExportModalOpen(true);
  };

  const handleDirectCsvExport = () => {
    const config = buildSavingsLoansReportConfig(loans, sampleEmployees);
    exportToCsv(config);
  };

  const selectedEmployee =
    sampleEmployees.find((e) => e.id === selectedEmpId) || sampleEmployees[0];

  // Dynamic loan limit for selected employee
  const currentLimit = selectedEmployee.calculatedLoanLimit;
  const availableLimit = selectedEmployee.remainingLoanLimit;

  // Filtered employees based on debounced search query
  const filteredEmployees = sampleEmployees.filter((emp) => {
    if (!debouncedEmpSearch.trim()) return true;
    const query = debouncedEmpSearch.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.nik.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query)
    );
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEmpDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectEmployee = (emp: (typeof sampleEmployees)[0]) => {
    setSelectedEmpId(emp.id);
    setEmployeeSearchInput(`${emp.name} (${emp.nik} - ${emp.position})`);
    setIsEmpDropdownOpen(false);
  };

  // Monthly Installment calculation (Bunga flat koperasi 6% per tahun)
  const interestRate = 0.06;
  const monthlyInterest = (loanAmount * (interestRate / 12));
  const monthlyPrincipal = loanAmount / (tenorMonths || 1);
  const estimatedMonthlyInstallment = Math.round(monthlyPrincipal + monthlyInterest);

  const isTenureEligible = selectedEmployee.tenureYears >= 1;

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTenureEligible) {
      alert("Pengajuan tidak dapat diproses: Masa kerja karyawan belum mencapai minimal 1 tahun.");
      return;
    }

    if (loanAmount > availableLimit) {
      alert(`Nominal pinjaman melebihi sisa plafon yang tersedia (Maks: Rp ${availableLimit.toLocaleString("id-ID")})`);
      return;
    }

    const newLoan: LoanApplication = {
      id: `LOAN-2026-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmployee.id,
      employeeNik: selectedEmployee.nik,
      employeeName: selectedEmployee.name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      amount: Number(loanAmount),
      tenorMonths: Number(tenorMonths),
      monthlyInstallment: estimatedMonthlyInstallment,
      interestRateAnnual: 6.0,
      purpose: loanPurpose || "Kebutuhan Darurat Karyawan",
      status: "PENDING_HR", // Sesuai aturan PM: Wajib melalui verifikasi HRD terlebih dahulu
      appliedDate: new Date().toISOString().split("T")[0],
      fundingSource: loanAmount > 25000000 ? "BANK_CHANNELING" : "KAS_KOPERASI",
      bankPartnerName: loanAmount > 25000000 ? "Bank Mandiri Channeling" : undefined,
    };

    setLoans([newLoan, ...loans]);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3500);
    setLoanPurpose("");
  };

  const handleStatusChange = (loanId: string, status: LoanStatus) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status } : l))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#1C1B3A]">
            Modul Simpan Pinjam Koperasi Pabrik
          </h1>
          <p className="text-xs text-[#6F6B88]">
            Simpanan Wajib & Sukarela berjangka, serta pengajuan pinjaman autodebet potong gaji (DSR 30% x 12 Bln).
          </p>
        </div>

        {/* Sub-tab Switcher Pill */}
        <div className="flex items-center p-1 bg-[#F5F3FF] rounded-full border border-[#E6E3F7]">
          <button
            onClick={() => setActiveSubTab("loans")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "loans"
                ? "bg-[#4A3AFF] text-white shadow-sm"
                : "text-[#6F6B88] hover:text-[#1C1B3A]"
            }`}
          >
            Pinjaman & Approval
          </button>
          <button
            onClick={() => setActiveSubTab("savings")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "savings"
                ? "bg-[#4A3AFF] text-white shadow-sm"
                : "text-[#6F6B88] hover:text-[#1C1B3A]"
            }`}
          >
            Simpanan (Wajib & Sukarela)
          </button>
        </div>
      </div>

      {/* TAB 1: PINJAMAN */}
      {activeSubTab === "loans" && (
        <div className="space-y-6">
          {/* Top: Instant Loan Calculator & Application Form */}
          <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1C1B3A]">
                    Formulir Pengajuan Pinjaman Karyawan & Simulasi Cicilan
                  </h3>
                  <p className="text-xs text-[#6F6B88]">
                    Plafon Maksimal: <strong>30% Gaji Pokok x 12 Bulan</strong> (Tanpa Agunan • Autodebet Payroll)
                  </p>
                </div>
              </div>

              {/* Eligibility Badge */}
              <div className="hidden sm:block">
                {isTenureEligible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F9F0] text-[#2DBA7D] text-xs font-bold border border-[#2DBA7D]/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Eligible (Masa Kerja {selectedEmployee.tenureYears} Tahun)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEBEB] text-[#E5484D] text-xs font-bold border border-[#E5484D]/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Belum Eligible (Masa Kerja &lt; 1 Tahun)
                  </span>
                )}
              </div>
            </div>

            {/* Ineligible Alert Banner if tenure < 1 year */}
            {!isTenureEligible && (
              <div className="mb-4 p-3.5 rounded-[12px] bg-[#FFEBEB] border border-[#E5484D]/30 text-[#E5484D] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ketentuan Masa Kerja Koperasi Belum Terpenuhi</p>
                  <p className="text-[11.5px] mt-0.5 text-[#E5484D]/90">
                    Karyawan <strong>{selectedEmployee.name}</strong> baru bekerja selama <strong>{Math.round(selectedEmployee.tenureYears * 12)} bulan</strong>. Sesuai aturan PM & Koperasi, pengajuan pinjaman hanya diizinkan bagi karyawan dengan masa kerja minimal <strong>1 tahun (12 bulan)</strong>.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Employee Searchable Selector with Debounce */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-xs font-bold text-[#1C1B3A] mb-1.5">
                    Pilih Karyawan
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6B88]">
                      {employeeSearchInput !== debouncedEmpSearch ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#4A3AFF] animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5 text-[#6F6B88]" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Ketik nama karyawan, NIK, jabatan..."
                      value={employeeSearchInput}
                      onChange={(e) => {
                        setEmployeeSearchInput(e.target.value);
                        setIsEmpDropdownOpen(true);
                      }}
                      onFocus={() => setIsEmpDropdownOpen(true)}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] pl-9 pr-8 py-2.5 text-xs text-[#1C1B3A] font-semibold focus:outline-none focus:border-[#4A3AFF] focus:bg-white transition-all"
                      required
                    />
                    {employeeSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmployeeSearchInput("");
                          setIsEmpDropdownOpen(true);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A5A2B8] hover:text-[#1C1B3A] p-0.5 rounded-full cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Auto-suggest Dropdown */}
                  {isEmpDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white border border-[#E6E3F7] rounded-[14px] shadow-xl max-h-60 overflow-y-auto divide-y divide-[#E6E3F7]/60 animate-fadeIn">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((emp) => {
                          const isSelected = emp.id === selectedEmpId;
                          const isEmpEligible = emp.tenureYears >= 1;
                          return (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => handleSelectEmployee(emp)}
                              className={`w-full text-left p-3 hover:bg-[#F5F3FF] transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected ? "bg-[#F5F3FF]/70" : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-[#1C1B3A] truncate">{emp.name}</span>
                                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                                    {emp.position}
                                  </span>
                                  {!isEmpEligible && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FFEBEB] text-[#E5484D]">
                                      &lt; 1 Thn
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10.5px] text-[#6F6B88] truncate">
                                  NIK: <span className="font-mono">{emp.nik}</span> • {emp.department} • Gaji: Rp {emp.monthlySalary.toLocaleString("id-ID")}
                                </p>
                                <p className={`text-[10px] font-medium ${isEmpEligible ? "text-[#4A3AFF]" : "text-[#E5484D]"}`}>
                                  {isEmpEligible
                                    ? `Sisa Plafon: Rp ${emp.remainingLoanLimit.toLocaleString("id-ID")}`
                                    : "Belum Berhak Mengajukan Pinjaman"}
                                </p>
                              </div>

                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-[#6F6B88]">
                          Tidak ada karyawan yang cocok dengan &quot;{debouncedEmpSearch}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1B3A] mb-1.5">
                    Nominal Pinjaman (Rp)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    min="1000000"
                    max={availableLimit || 1000000}
                    disabled={!isTenureEligible}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                  <span className="text-[10px] text-[#6F6B88] mt-1 block">
                    {isTenureEligible ? (
                      <>Maks. Sisa Plafon (30% Gaji x 12): <strong>Rp {availableLimit.toLocaleString("id-ID")}</strong></>
                    ) : (
                      <span className="text-[#E5484D] font-medium">Plafon dinonaktifkan (Masa kerja &lt; 1 tahun)</span>
                    )}
                  </span>
                </div>

                {/* Tenor */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1B3A] mb-1.5">
                    Tenor (Bulan)
                  </label>
                  <select
                    value={tenorMonths}
                    disabled={!isTenureEligible}
                    onChange={(e) => setTenorMonths(Number(e.target.value))}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value={6}>6 Bulan</option>
                    <option value={10}>10 Bulan</option>
                    <option value={12}>12 Bulan (1 Tahun)</option>
                    <option value={18}>18 Bulan</option>
                    <option value={24}>24 Bulan (2 Tahun)</option>
                    <option value={36}>36 Bulan (3 Tahun)</option>
                  </select>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-[#1C1B3A] mb-1.5">
                  Keperluan / Tujuan Pinjaman
                </label>
                <input
                  type="text"
                  disabled={!isTenureEligible}
                  placeholder="Contoh: Renovasi Rumah, Biaya Masuk Sekolah, Kebutuhan Kesehatan"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Calculation Summary Box */}
              <div className="p-4 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[#6F6B88] block text-[11px]">Plafon Pinjaman (30% x 12)</span>
                    <span className="font-bold text-[#1C1B3A]">
                      Rp {currentLimit.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6F6B88] block text-[11px]">Bunga Koperasi</span>
                    <span className="font-bold text-[#2DBA7D]">6% Flat / Thn (Payroll)</span>
                  </div>
                  <div>
                    <span className="text-[#6F6B88] block text-[11px]">Estimasi Cicilan / Bln</span>
                    <span className="font-bold text-[#4A3AFF] text-sm">
                      Rp {estimatedMonthlyInstallment.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6F6B88] block text-[11px]">Sumber Pendanaan</span>
                    <span className="font-bold text-[#1C1B3A]">
                      {loanAmount > 25000000 ? "Bank Mandiri Channeling" : "Kas Koperasi BIT"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isTenureEligible || loanAmount > availableLimit || loanAmount <= 0}
                  className="px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 disabled:bg-[#A5A2B8] disabled:cursor-not-allowed"
                >
                  Ajukan Pinjaman
                </button>
              </div>
            </form>

            {showSuccessModal && (
              <div className="mt-4 p-3 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengajuan pinjaman berhasil dibuat dan diteruskan ke <strong>Verifikasi HRD</strong>!</span>
              </div>
            )}
          </div>

          {/* Loan List Table */}
          <div className="bg-white rounded-[18px] border border-[#E6E3F7] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E6E3F7] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-[#1C1B3A]">
                  Daftar Pengajuan & Status Persetujuan Pinjaman Karyawan
                </h3>
                <p className="text-xs text-[#6F6B88]">
                  Alur: Pengajuan Karyawan ➡️ Verifikasi HRD ➡️ Approval Koperasi ➡️ Pencairan
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#6F6B88] mr-2">
                  Total: <strong>{loans.length} Pengajuan</strong>
                </span>
                <button
                  type="button"
                  onClick={handleDirectCsvExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2DBA7D]/30 bg-[#E6F9F0] text-[#2DBA7D] hover:bg-[#2DBA7D] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenExportModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF Laporan</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F3FF]/60 border-b border-[#E6E3F7] text-[#6F6B88] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">No. Pinjaman & Karyawan</th>
                    <th className="py-3.5 px-4">Nominal Pinjaman</th>
                    <th className="py-3.5 px-4">Tenor & Cicilan/Bln</th>
                    <th className="py-3.5 px-4">Tujuan</th>
                    <th className="py-3.5 px-4">Sumber Dana</th>
                    <th className="py-3.5 px-4">Tahapan Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-[#F5F3FF]/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-[#1C1B3A]">{loan.employeeName}</p>
                          <p className="text-[11px] text-[#6F6B88]">
                            {loan.id} | NIK: {loan.employeeNik}
                          </p>
                          <span className="text-[10px] text-[#4A3AFF]">{loan.department}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-[#1C1B3A] text-sm">
                          Rp {loan.amount.toLocaleString("id-ID")}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-[#1C1B3A] block">
                          {loan.tenorMonths} Bulan
                        </span>
                        <span className="text-[11px] text-[#4A3AFF] font-bold">
                          Rp {loan.monthlyInstallment.toLocaleString("id-ID")}/bln
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-[#6F6B88] text-xs">{loan.purpose}</span>
                      </td>

                      <td className="py-4 px-4">
                        {loan.fundingSource === "BANK_CHANNELING" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                            <Landmark className="w-2.5 h-2.5" />
                            Bank Mandiri
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                            Kas Koperasi
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {loan.status === "PENDING_HR" && (
                          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#D97706]/30 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            1. Menunggu HRD
                          </span>
                        )}
                        {loan.status === "PENDING_KOPERASI" && (
                          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#4A3AFF]/30 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            2. Menunggu Koperasi
                          </span>
                        )}
                        {(loan.status === "APPROVED" || loan.status === "ACTIVE" || loan.status === "DISBURSED") && (
                          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {loan.status === "DISBURSED" ? "Dana Dicairkan" : "Disetujui"}
                          </span>
                        )}
                        {loan.status === "REJECTED" && (
                          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-[#FFEBEB] text-[#E5484D] border border-[#E5484D]/30 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Ditolak
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {loan.status === "PENDING_HR" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStatusChange(loan.id, "PENDING_KOPERASI")}
                              className="px-2.5 py-1 rounded-full bg-[#4A3AFF] hover:bg-[#3828d1] text-white text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Verifikasi HRD
                            </button>
                            <button
                              onClick={() => handleStatusChange(loan.id, "REJECTED")}
                              className="px-2 py-1 rounded-full bg-white border border-[#E5484D] text-[#E5484D] hover:bg-[#FFEBEB] text-[10.5px] font-bold transition-all cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        )}

                        {loan.status === "PENDING_KOPERASI" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStatusChange(loan.id, "APPROVED")}
                              className="px-2.5 py-1 rounded-full bg-[#2DBA7D] hover:bg-[#239962] text-white text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Setujui Koperasi
                            </button>
                            <button
                              onClick={() => handleStatusChange(loan.id, "REJECTED")}
                              className="px-2 py-1 rounded-full bg-white border border-[#E5484D] text-[#E5484D] hover:bg-[#FFEBEB] text-[10.5px] font-bold transition-all cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        )}

                        {loan.status === "APPROVED" && (
                          <button
                            onClick={() => handleStatusChange(loan.id, "DISBURSED")}
                            className="px-3 py-1 rounded-full bg-[#F5F3FF] border border-[#4A3AFF] text-[#4A3AFF] hover:bg-[#4A3AFF] hover:text-white text-[10.5px] font-bold transition-all cursor-pointer"
                          >
                            Cairkan Dana
                          </button>
                        )}

                        {(loan.status === "DISBURSED" || loan.status === "ACTIVE" || loan.status === "REJECTED") && (
                          <span className="text-[11px] text-[#6F6B88]">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIMPANAN (WAJIB & SUKARELA) */}
      {activeSubTab === "savings" && (
        <div className="space-y-6">
          {/* Savings Policy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simpanan Wajib Card */}
            <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1C1B3A]">
                    1. Simpanan Wajib Karyawan
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                  Auto Payroll
                </span>
              </div>
              <p className="text-xs text-[#6F6B88] leading-relaxed">
                Dipotong otomatis setiap bulan saat penggajian (<strong>Rp 100.000 / bulan</strong> per karyawan).
              </p>
              <div className="p-4 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#1C1B3A] font-semibold">
                  <Unlock className="w-3.5 h-3.5 text-[#2DBA7D]" />
                  <span>Aturan Penarikan Simpanan Wajib:</span>
                </div>
                <p className="text-[11px] text-[#6F6B88]">
                  Sesuai aturan PM & Koperasi: Simpanan wajib <strong>dapat diambil/dicairkan</strong> jika karyawan telah menjadi anggota aktif koperasi selama minimal <strong>2 hingga 3 tahun</strong> atau saat purna tugas.
                </p>
              </div>
            </div>

            {/* Simpanan Sukarela Card */}
            <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1C1B3A]">
                    2. Simpanan Sukarela (Berjangka)
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#D97706]">
                  Lock-in Period
                </span>
              </div>
              <p className="text-xs text-[#6F6B88] leading-relaxed">
                Simpanan investasi anggota dengan bagi hasil kompetitif (<strong>7.5% per tahun</strong>).
              </p>
              <div className="p-4 rounded-[14px] bg-[#FFF4E5]/50 border border-[#FFB547]/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#1C1B3A] font-semibold">
                  <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Aturan Periode Penguncian (Lock-in):</span>
                </div>
                <p className="text-[11px] text-[#6F6B88]">
                  Sesuai aturan PM: Simpanan sukarela <strong>tidak boleh diambil selama masa penguncian (6 Bulan atau 1 Tahun)</strong> untuk menjaga kestabilan kas koperasi.
                </p>
              </div>
            </div>
          </div>

          {/* Deposit Simpanan Sukarela Form */}
          <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm">
            <h3 className="font-bold text-sm text-[#1C1B3A] mb-4">
              Pendaftaran / Setor Simpanan Sukarela Baru
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1B3A] mb-1">
                  Pilih Karyawan
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A]"
                >
                  {sampleEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.nik})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B3A] mb-1">
                  Nominal Setoran (Rp)
                </label>
                <input
                  type="number"
                  step="500000"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(Number(e.target.value))}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B3A] mb-1">
                  Pilihan Lock-in Period
                </label>
                <select
                  value={savingsLockPeriod}
                  onChange={(e) => setSavingsLockPeriod(e.target.value as any)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A]"
                >
                  <option value="6_BULAN">6 Bulan (Terkunci s/d Maret 2027)</option>
                  <option value="1_TAHUN">1 Tahun (Terkunci s/d September 2027)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSavingsSuccess(true);
                  setTimeout(() => setShowSavingsSuccess(false), 3500);
                }}
                className="px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Konfirmasi Setor Simpanan Sukarela
              </button>
            </div>

            {showSavingsSuccess && (
              <div className="mt-4 p-3 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpanan sukarela berhasil disetorkan dengan lock-in period aktif!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formal Cooperative Report Export Modal */}
      {isExportModalOpen && currentExportConfig && (
        <ReportExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          config={currentExportConfig}
        />
      )}
    </div>
  );
};
