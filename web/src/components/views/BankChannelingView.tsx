"use client";

import React, { useState } from "react";
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Coins,
  FileText,
  Users,
  Calculator,
  Calendar,
  Layers,
  Search,
  Clock,
  Sparkles,
  Printer,
  X,
  Building2,
  Activity,
  Percent,
  FileSpreadsheet,
} from "lucide-react";
import {
  initialBankLiquidity,
  sampleBankPartners,
  sampleDrawdownTranches,
  sampleChannelingDebtors,
  sampleBankRepayments,
  sampleH2HGateways,
} from "@/data/mockData";
import {
  BankLiquidityStatus,
  BankPartnerProfile,
  BankDrawdownTranche,
  ChannelingLoanDebtor,
  BankRepaymentSchedule,
  H2HGatewayStatus,
} from "@/types";
import {
  buildBankChannelingReportConfig,
  exportToCsv,
  ReportConfig,
} from "@/utils/reportExporter";
import { ReportExportModal } from "@/components/common/ReportExportModal";

export const BankChannelingView: React.FC = () => {
  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "partners" | "drawdowns" | "debtors" | "simulator" | "repayments"
  >("overview");

  // Main Datasets (Interactive State)
  const [liquidity, setLiquidity] = useState<BankLiquidityStatus>(initialBankLiquidity);
  const [partners, setPartners] = useState<BankPartnerProfile[]>(sampleBankPartners);
  const [drawdowns, setDrawdowns] = useState<BankDrawdownTranche[]>(sampleDrawdownTranches);
  const [debtors] = useState<ChannelingLoanDebtor[]>(sampleChannelingDebtors);
  const [repayments] = useState<BankRepaymentSchedule[]>(sampleBankRepayments);
  const [gateways] = useState<H2HGatewayStatus[]>(sampleH2HGateways);

  // Form State for Top-Up / Drawdown
  const [selectedBankId, setSelectedBankId] = useState<string>("BANK-01");
  const [topUpAmount, setTopUpAmount] = useState<number>(100000000);
  const [drawdownPurpose, setDrawdownPurpose] = useState<string>(
    "Penyaluran Pinjaman Batch Darurat & Pendidikan Anggota Kopkar BIT"
  );
  const [disbursementChannel, setDisbursementChannel] = useState<
    "KAS_KOPERASI" | "DIRECT_PAYROLL_ACCOUNT"
  >("KAS_KOPERASI");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastExecutedTrx, setLastExecutedTrx] = useState<BankDrawdownTranche | null>(null);

  // Advice Slip Modal State
  const [selectedAdvice, setSelectedAdvice] = useState<BankDrawdownTranche | null>(null);

  // Report Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [currentExportConfig, setCurrentExportConfig] = useState<ReportConfig | null>(null);

  const handleOpenExportModal = () => {
    const config = buildBankChannelingReportConfig(debtors, liquidity, drawdowns);
    setCurrentExportConfig(config);
    setIsExportModalOpen(true);
  };

  const handleDirectCsvExport = () => {
    const config = buildBankChannelingReportConfig(debtors, liquidity, drawdowns);
    exportToCsv(config);
  };

  // Search & Filters
  const [drawdownSearch, setDrawdownSearch] = useState("");
  const [debtorSearch, setDebtorSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("ALL");

  // Simulator State
  const [simPlafon, setSimPlafon] = useState<number>(150000000);
  const [simBankRate, setSimBankRate] = useState<number>(5.25);
  const [simCoopRate, setSimCoopRate] = useState<number>(7.50);
  const [simTenorMonths, setSimTenorMonths] = useState<number>(24);

  // Selected Bank for Drawdown
  const currentBank = partners.find((p) => p.id === selectedBankId) || partners[0];
  const currentBankAvailableLimit = currentBank.creditLineLimit - currentBank.creditLineUsed;

  // Global calculations
  const totalPlafonAllBanks = partners.reduce((acc, p) => acc + p.creditLineLimit, 0);
  const totalPlafonUsedAllBanks = partners.reduce((acc, p) => acc + p.creditLineUsed, 0);
  const totalAvailableAllBanks = totalPlafonAllBanks - totalPlafonUsedAllBanks;
  const totalOutstandingDebtors = debtors.reduce((acc, d) => acc + d.outstandingBalance, 0);

  // Handler: Eksekusi Top Up Tranche
  const handleExecuteDrawdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount <= 0 || topUpAmount > currentBankAvailableLimit) return;

    const newTrx: BankDrawdownTranche = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      referenceNumber: `TRX-${currentBank.code}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
      bankId: currentBank.id,
      bankName: currentBank.bankName,
      drawdownDate: new Date().toISOString().split("T")[0],
      drawdownTime: `${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`,
      amount: topUpAmount,
      purpose: drawdownPurpose || "Penyaluran Likuiditas Kas Pinjaman Kopkar BIT",
      status: "SELESAI",
      picApproval: "Ketua Koperasi (Agus Setiawan)",
      disbursementChannel: disbursementChannel,
      interestRateAnnual: currentBank.wholesaleInterestRate,
      tenorMonths: 24,
      monthlyRepaymentToBank: Math.round(
        topUpAmount / 24 + (topUpAmount * (currentBank.wholesaleInterestRate / 100)) / 12
      ),
      notes: "Pencairan instan via API Gateway Host-to-Host (H2H) Direct Credit.",
    };

    // Update state
    setDrawdowns([newTrx, ...drawdowns]);
    setPartners((prev) =>
      prev.map((p) =>
        p.id === currentBank.id ? { ...p, creditLineUsed: p.creditLineUsed + topUpAmount } : p
      )
    );
    setLiquidity((prev) => ({
      ...prev,
      cooperativeCashReserve: prev.cooperativeCashReserve + topUpAmount,
      bankCreditLineUsed: prev.bankCreditLineUsed + topUpAmount,
      isLiquidityTight: false,
    }));

    setLastExecutedTrx(newTrx);
    setShowSuccess(true);
  };

  // Yield Simulation Formulas
  const simNimSpread = Number((simCoopRate - simBankRate).toFixed(2));
  const simMonthlyBankInterest = (simPlafon * (simBankRate / 100)) / 12;
  const simMonthlyCoopInterest = (simPlafon * (simCoopRate / 100)) / 12;
  const simMonthlyPrincipal = simPlafon / (simTenorMonths || 1);
  const simMonthlyMemberInstallment = Math.round(simMonthlyPrincipal + simMonthlyCoopInterest);
  const simMonthlyBankObligation = Math.round(simMonthlyPrincipal + simMonthlyBankInterest);
  const simTotalCoopIncome = Math.round(simMonthlyCoopInterest * simTenorMonths);
  const simTotalBankCost = Math.round(simMonthlyBankInterest * simTenorMonths);
  const simNetShuProfit = simTotalCoopIncome - simTotalBankCost;

  // Filtered Drawdowns
  const filteredDrawdowns = drawdowns.filter((item) => {
    const matchSearch =
      item.referenceNumber.toLowerCase().includes(drawdownSearch.toLowerCase()) ||
      item.purpose.toLowerCase().includes(drawdownSearch.toLowerCase()) ||
      item.bankName.toLowerCase().includes(drawdownSearch.toLowerCase());
    const matchPartner = partnerFilter === "ALL" || item.bankId === partnerFilter;
    return matchSearch && matchPartner;
  });

  // Filtered Debtors
  const filteredDebtors = debtors.filter((item) => {
    return (
      item.employeeName.toLowerCase().includes(debtorSearch.toLowerCase()) ||
      item.employeeNik.toLowerCase().includes(debtorSearch.toLowerCase()) ||
      item.department.toLowerCase().includes(debtorSearch.toLowerCase()) ||
      item.bankName.toLowerCase().includes(debtorSearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-[#1C1B3A]">
              Likuiditas Kas Pinjaman & Bank Channeling Ecosystem
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DBA7D] animate-pulse" />
              Host-to-Host H2H Live
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
              Kopkar PT Bhakti Idola Tama
            </span>
          </div>
          <p className="text-xs text-[#6F6B88]">
            Platform sindikasi likuiditas perbankan (Bank Mandiri, BSI Syariah, & BCA) untuk menjamin kelancaran pinjaman karyawan PT Bhakti Idola Tama dengan autodebet payroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDirectCsvExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#2DBA7D]/30 bg-[#E6F9F0] text-[#2DBA7D] hover:bg-[#2DBA7D] hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={handleOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Channeling</span>
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className="px-4 py-2 rounded-full border border-[#4A3AFF] text-[#4A3AFF] bg-[#F5F3FF] hover:bg-[#ECE8FF] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulasi Margin (NIM)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-[#4A3AFF] text-white shadow-md shadow-[#4A3AFF]/20"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#FAFAFC]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ikhtisar & Tarik Dana</span>
        </button>

        <button
          onClick={() => setActiveTab("partners")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "partners"
              ? "bg-[#4A3AFF] text-white shadow-md shadow-[#4A3AFF]/20"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#FAFAFC]"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Bank Mitra & PKS</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === "partners" ? "bg-white/20 text-white" : "bg-[#F5F3FF] text-[#4A3AFF]"
            }`}
          >
            {partners.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("drawdowns")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "drawdowns"
              ? "bg-[#4A3AFF] text-white shadow-md shadow-[#4A3AFF]/20"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#FAFAFC]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Riwayat Penarikan (Tranche)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === "drawdowns" ? "bg-white/20 text-white" : "bg-[#F5F3FF] text-[#4A3AFF]"
            }`}
          >
            {drawdowns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("debtors")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "debtors"
              ? "bg-[#4A3AFF] text-white shadow-md shadow-[#4A3AFF]/20"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#FAFAFC]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Portofolio Debitur Anggota</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === "debtors" ? "bg-white/20 text-white" : "bg-[#F5F3FF] text-[#4A3AFF]"
            }`}
          >
            {debtors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "simulator"
              ? "bg-[#4A3AFF] text-white shadow-md shadow-[#4A3AFF]/20"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#FAFAFC]"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Kalkulator Margin & NIM</span>
        </button>

        <button
          onClick={() => setActiveTab("repayments")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "repayments"
              ? "bg-[#4A3AFF] text-white shadow-md shadow-[#4A3AFF]/20"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#FAFAFC]"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal Angsuran & Rekonsiliasi</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === "repayments" ? "bg-white/20 text-white" : "bg-[#F5F3FF] text-[#4A3AFF]"
            }`}
          >
            {repayments.length}
          </span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: IKHTISAR & TARIK DANA */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Big Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Kas Internal Koperasi */}
            <div className="p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6B88] uppercase tracking-wider">
                  Kas Internal Kopkar
                </span>
                <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1C1B3A]">
                Rp {liquidity.cooperativeCashReserve.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#2DBA7D] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Simpanan Wajib & Sukarela BIT</span>
              </div>
            </div>

            {/* Permintaan Pinjaman Antre */}
            <div className="p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6B88] uppercase tracking-wider">
                  Permintaan Antre
                </span>
                <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#D97706]">
                Rp {liquidity.pendingLoanDemand.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6F6B88]">
                <Clock className="w-3.5 h-3.5" />
                <span>Pengajuan Karyawan Menunggu Cair</span>
              </div>
            </div>

            {/* Sisa Plafon Channeling Multi-Bank */}
            <div className="p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6B88] uppercase tracking-wider">
                  Total Sisa Plafon Bank
                </span>
                <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#2DBA7D]">
                Rp {totalAvailableAllBanks.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6F6B88]">
                <span>Dari Total Plafon: Rp {(totalPlafonAllBanks / 1000000000).toFixed(1)} Miliar</span>
              </div>
            </div>

            {/* Outstanding Pinjaman Channeling */}
            <div className="p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6F6B88] uppercase tracking-wider">
                  Outstanding Channeling
                </span>
                <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#7C3AED]">
                Rp {totalOutstandingDebtors.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#2DBA7D] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Autodebet Lancar (Kol-1 100%)</span>
              </div>
            </div>
          </div>

          {/* Form Tarik Likuiditas & Monitoring Gateway Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Tarik Dana Tranche */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1B3A]">
                      Tarik Tranche Likuiditas dari Bank Rekanan
                    </h3>
                    <p className="text-xs text-[#6F6B88]">
                      Eksekusi penarikan dana plafon secara instan ke rekening operasional kas Kopkar BIT.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30">
                  Direct Credit H2H
                </span>
              </div>

              <form onSubmit={handleExecuteDrawdown} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pilihan Bank Rekanan */}
                  <div>
                    <label className="block text-xs font-bold text-[#1C1B3A] mb-1.5">
                      Pilih Bank Rekanan
                    </label>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] font-semibold focus:outline-none focus:border-[#4A3AFF]"
                    >
                      {partners.map((p) => {
                        const sisa = p.creditLineLimit - p.creditLineUsed;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.bankName} (Sisa Plafon: Rp {(sisa / 1000000).toFixed(0)} Jt - Rate {p.wholesaleInterestRate}%)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Nominal Penarikan */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#1C1B3A]">
                        Nominal Penarikan (Rp)
                      </label>
                      <span className="text-[10px] text-[#6F6B88]">
                        Maks: Rp {currentBankAvailableLimit.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="10000000"
                      min="10000000"
                      max={currentBankAvailableLimit}
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] font-bold focus:outline-none focus:border-[#4A3AFF]"
                    />
                  </div>
                </div>

                {/* Tujuan Penarikan */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1B3A] mb-1.5">
                    Tujuan Alokasi Likuiditas
                  </label>
                  <input
                    type="text"
                    value={drawdownPurpose}
                    onChange={(e) => setDrawdownPurpose(e.target.value)}
                    placeholder="Contoh: Pencairan Pinjaman Karyawan Batch Shift A & B..."
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                    required
                  />
                </div>

                {/* Kanal Penyaluran */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1B3A] mb-1.5">
                      Rekening Tujuan Penampung
                    </label>
                    <select
                      value={disbursementChannel}
                      onChange={(e) =>
                        setDisbursementChannel(
                          e.target.value as "KAS_KOPERASI" | "DIRECT_PAYROLL_ACCOUNT"
                        )
                      }
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                    >
                      <option value="KAS_KOPERASI">
                        Rekening Escrow Operasional Kopkar BIT (MCM 2.0)
                      </option>
                      <option value="DIRECT_PAYROLL_ACCOUNT">
                        Disbursement Langsung ke Rekening Payroll Karyawan
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={topUpAmount <= 0 || topUpAmount > currentBankAvailableLimit}
                      className="w-full py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>
                        Eksekusi Penarikan (+Rp {(topUpAmount / 1000000).toFixed(0)} Jt)
                      </span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Success Alert with Advice Quick View */}
              {showSuccess && lastExecutedTrx && (
                <div className="p-4 rounded-[14px] bg-[#E6F9F0] border border-[#2DBA7D]/40 text-[#1C1B3A] text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#2DBA7D] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Penarikan Tranche Berhasil Dieksekusi via H2H Direct Debit!</span>
                    </div>
                    <span className="text-[10px] text-[#6F6B88] font-mono">
                      Ref: {lastExecutedTrx.referenceNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6F6B88]">
                    Dana sebesar <b>Rp {lastExecutedTrx.amount.toLocaleString("id-ID")}</b> telah berhasil ditambahkan ke kas koperasi dari <b>{lastExecutedTrx.bankName}</b>.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAdvice(lastExecutedTrx)}
                      className="px-3 py-1.5 rounded-full bg-[#2DBA7D] text-white text-[11px] font-bold hover:bg-[#259b67] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Lihat & Cetak Bukti Advice Bank</span>
                    </button>
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#E6E3F7] text-[#6F6B88] text-[11px] font-semibold hover:text-[#1C1B3A] transition-all"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Live API H2H & Open Banking */}
            <div className="bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#4A3AFF]" />
                  <h3 className="font-bold text-sm text-[#1C1B3A]">Gateway API Perbankan</h3>
                </div>
                <span className="text-[10px] text-[#2DBA7D] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30">
                  Semua Online
                </span>
              </div>

              <p className="text-xs text-[#6F6B88]">
                Monitoring konektivitas Host-to-Host (H2H), BI-FAST, dan transfer kliring autodebet.
              </p>

              <div className="space-y-3">
                {gateways.map((gw) => (
                  <div
                    key={gw.id}
                    className="p-3.5 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-2 hover:border-[#4A3AFF]/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1C1B3A]">{gw.serviceName}</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#2DBA7D]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2DBA7D] animate-ping" />
                        {gw.latencyMs}ms
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#6F6B88]">
                      <span>{gw.provider}</span>
                      <span className="font-mono text-[#4A3AFF]">{gw.lastPingTime}</span>
                    </div>

                    <div className="w-full bg-[#E6E3F7] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#4A3AFF] h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (gw.dailyTransactionUsed / gw.dailyTransactionQuota) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#6F6B88]">
                      <span>Limit Kuota Harian</span>
                      <span className="font-semibold text-[#1C1B3A]">
                        Rp {(gw.dailyTransactionUsed / 1000000).toFixed(0)} Jt / Rp {(gw.dailyTransactionQuota / 1000000000).toFixed(1)} M
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: BANK MITRA & PORTOFOLIO PKS */}
      {activeTab === "partners" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm">
            <h2 className="text-base font-bold text-[#1C1B3A] mb-1">
              Daftar Bank Rekanan & Perjanjian Kerjasama (PKS)
            </h2>
            <p className="text-xs text-[#6F6B88]">
              Sindikasi perbankan yang memberikan fasilitas plafon kredit channeling untuk pembiayaan anggota koperasi karyawan PT Bhakti Idola Tama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((partner) => {
              const usedPercentage = Math.round(
                (partner.creditLineUsed / partner.creditLineLimit) * 100
              );
              const remainingLimit = partner.creditLineLimit - partner.creditLineUsed;

              return (
                <div
                  key={partner.id}
                  className={`p-6 rounded-[20px] bg-white border transition-all space-y-4 shadow-sm relative overflow-hidden ${
                    partner.isPrimary ? "border-[#4A3AFF] ring-2 ring-[#4A3AFF]/20" : "border-[#E6E3F7]"
                  }`}
                >
                  {partner.isPrimary && (
                    <div className="absolute top-0 right-0 bg-[#4A3AFF] text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-[12px]">
                      Mitra Utama Payroll
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[14px] bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold text-base border border-[#E6E3F7]">
                      {partner.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1C1B3A]">{partner.bankName}</h3>
                      <span className="text-[11px] font-semibold text-[#6F6B88]">
                        {partner.scheme === "SYARIAH_MURABAHAH" ? "Syariah Murabahah" : "Konvensional"}
                      </span>
                    </div>
                  </div>

                  {/* Plafon Status Progress */}
                  <div className="p-3.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1C1B3A]">
                      <span>Plafon Terpakai</span>
                      <span className="text-[#4A3AFF]">{usedPercentage}%</span>
                    </div>
                    <div className="w-full bg-[#E6E3F7] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#4A3AFF] h-full rounded-full transition-all duration-500"
                        style={{ width: `${usedPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6F6B88]">
                      <span>Terpakai: Rp {(partner.creditLineUsed / 1000000).toFixed(0)} Jt</span>
                      <span className="font-bold text-[#2DBA7D]">
                        Sisa: Rp {(remainingLimit / 1000000).toFixed(0)} Jt
                      </span>
                    </div>
                  </div>

                  {/* Detail PKS & Suku Bunga */}
                  <div className="space-y-2 text-xs border-t border-[#E6E3F7] pt-3 text-[#1C1B3A]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6F6B88]">Total Plafon Disetujui:</span>
                      <span className="font-bold">Rp {partner.creditLineLimit.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6F6B88]">Bunga Wholesale (Cost of Fund):</span>
                      <span className="font-bold text-[#2DBA7D]">{partner.wholesaleInterestRate}% p.a.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6F6B88]">Tenor Maksimal:</span>
                      <span className="font-semibold">{partner.maxTenorMonths} Bulan</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6F6B88]">Nomor PKS:</span>
                      <span className="font-mono text-[11px]">{partner.pksNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6F6B88]">Masa Berlaku PKS:</span>
                      <span className="font-semibold">{partner.pksExpiryDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6F6B88]">Status H2H Direct:</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                        {partner.h2hStatus}
                      </span>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div className="p-3 rounded-[12px] bg-[#F5F3FF] text-[11px] text-[#1C1B3A] flex items-center justify-between">
                    <div>
                      <p className="font-bold">{partner.contactPerson}</p>
                      <p className="text-[#6F6B88]">{partner.contactPhone}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBankId(partner.id);
                        setActiveTab("overview");
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#4A3AFF] text-white text-[10px] font-bold hover:bg-[#6B5CEB] transition-all cursor-pointer"
                    >
                      Tarik Dana
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: RIWAYAT PENARIKAN (DRAWDOWN TRANCHES) */}
      {activeTab === "drawdowns" && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#6F6B88] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari no. ref / keperluan / bank..."
                  value={drawdownSearch}
                  onChange={(e) => setDrawdownSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAFAFC] border border-[#E6E3F7] rounded-full text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3.5 py-2 text-xs text-[#1C1B3A] font-semibold focus:outline-none focus:border-[#4A3AFF]"
              >
                <option value="ALL">Semua Bank Mitra</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-[#6F6B88] font-medium">
              Menampilkan <b>{filteredDrawdowns.length}</b> transaksi penarikan tranche
            </div>
          </div>

          {/* Table Tranches */}
          <div className="bg-white rounded-[20px] border border-[#E6E3F7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1C1B3A]">
                <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-b border-[#E6E3F7]">
                  <tr>
                    <th className="py-3.5 px-4">No. Referensi Bank</th>
                    <th className="py-3.5 px-4">Bank Mitra</th>
                    <th className="py-3.5 px-4">Waktu Penarikan</th>
                    <th className="py-3.5 px-4">Nominal Tranche</th>
                    <th className="py-3.5 px-4">Tujuan Alokasi</th>
                    <th className="py-3.5 px-4">Cost of Fund</th>
                    <th className="py-3.5 px-4">Approval PIC</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {filteredDrawdowns.map((tranche) => (
                    <tr key={tranche.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#4A3AFF]">
                        {tranche.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{tranche.bankName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold">{tranche.drawdownDate}</div>
                        <div className="text-[10px] text-[#6F6B88]">{tranche.drawdownTime}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1C1B3A]">
                        Rp {tranche.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-[#6F6B88]">
                        {tranche.purpose}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#2DBA7D]">
                        {tranche.interestRateAnnual}% p.a.
                      </td>
                      <td className="py-3.5 px-4 text-[#6F6B88]">{tranche.picApproval}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30">
                          {tranche.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedAdvice(tranche)}
                          className="px-3 py-1 rounded-full bg-[#F5F3FF] border border-[#E6E3F7] text-[#4A3AFF] hover:bg-[#4A3AFF] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Advice Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 4: PORTOFOLIO PINJAMAN ANGGOTA (CHANNELING) */}
      {activeTab === "debtors" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#1C1B3A]">
                Portofolio Debitur Pinjaman Karyawan (Bank Channeling)
              </h2>
              <p className="text-xs text-[#6F6B88]">
                Daftar pinjaman anggota bernilai besar yang didanai melalui skema sindikasi bank rekanan dengan autodebet pemotongan gaji PT Bhakti Idola Tama.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#6F6B88] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama karyawan / NIK..."
                value={debtorSearch}
                onChange={(e) => setDebtorSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAFAFC] border border-[#E6E3F7] rounded-full text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E6E3F7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1C1B3A]">
                <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-b border-[#E6E3F7]">
                  <tr>
                    <th className="py-3.5 px-4">Karyawan & NIK</th>
                    <th className="py-3.5 px-4">Departemen / Jabatan</th>
                    <th className="py-3.5 px-4">Bank Pendana</th>
                    <th className="py-3.5 px-4">Plafon Awal</th>
                    <th className="py-3.5 px-4">Sisa Pokok (Outstanding)</th>
                    <th className="py-3.5 px-4">Tenor & Progress</th>
                    <th className="py-3.5 px-4">Cicilan / Bulan</th>
                    <th className="py-3.5 px-4">Margin Koperasi (NIM)</th>
                    <th className="py-3.5 px-4">Status Autodebet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {filteredDebtors.map((deb) => (
                    <tr key={deb.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1C1B3A]">{deb.employeeName}</div>
                        <div className="text-[10px] font-mono text-[#6F6B88]">{deb.employeeNik}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold">{deb.position}</div>
                        <div className="text-[10px] text-[#6F6B88]">{deb.department}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#4A3AFF]">{deb.bankName}</td>
                      <td className="py-3.5 px-4 font-bold text-[#1C1B3A]">
                        Rp {deb.approvedAmount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#7C3AED]">
                        Rp {deb.outstandingBalance.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold">
                          {deb.paidMonths} / {deb.tenorMonths} Bln
                        </div>
                        <div className="w-20 bg-[#E6E3F7] rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-[#2DBA7D] h-full rounded-full"
                            style={{
                              width: `${(deb.paidMonths / deb.tenorMonths) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1C1B3A]">
                        Rp {deb.monthlyInstallment.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[#2DBA7D] font-bold">+{deb.coopNetMarginRate}% p.a.</div>
                        <div className="text-[10px] text-[#6F6B88]">
                          (Bunga: {deb.coopInterestRate}% - Bank: {deb.bankWholesaleRate}%)
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30">
                          {deb.collectibilityScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. SUB-TAB 5: KALKULATOR SIMULASI MARGIN & NIM */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm">
            <h2 className="text-base font-bold text-[#1C1B3A] mb-1">
              Kalkulator Simulasi Margin & Net Interest Margin (NIM) Koperasi
            </h2>
            <p className="text-xs text-[#6F6B88]">
              Hitung potensi proyeksi SHU Koperasi dari selisih suku bunga wholesale bank rekanan dengan suku bunga penyaluran pinjaman ke anggota.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-5">
              <h3 className="font-bold text-sm text-[#1C1B3A] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#4A3AFF]" />
                <span>Parameter Simulasi Channeling</span>
              </h3>

              {/* Plafon Penarikan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C1B3A]">
                  <span>Plafon Penarikan Dana</span>
                  <span className="text-[#4A3AFF] text-sm">Rp {simPlafon.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min="20000000"
                  max="1000000000"
                  step="10000000"
                  value={simPlafon}
                  onChange={(e) => setSimPlafon(Number(e.target.value))}
                  className="w-full accent-[#4A3AFF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6F6B88]">
                  <span>Rp 20 Jt</span>
                  <span>Rp 500 Jt</span>
                  <span>Rp 1 Miliar</span>
                </div>
              </div>

              {/* Suku Bunga Bank Wholesale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C1B3A]">
                  <span>Cost of Fund Bank (Bunga Wholesale)</span>
                  <span className="text-[#D97706] text-sm">{simBankRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="4.50"
                  max="9.00"
                  step="0.25"
                  value={simBankRate}
                  onChange={(e) => setSimBankRate(Number(e.target.value))}
                  className="w-full accent-[#D97706] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6F6B88]">
                  <span>4.50%</span>
                  <span>6.75%</span>
                  <span>9.00%</span>
                </div>
              </div>

              {/* Suku Bunga Penyaluran Koperasi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C1B3A]">
                  <span>Suku Bunga Koperasi ke Anggota</span>
                  <span className="text-[#2DBA7D] text-sm">{simCoopRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="5.00"
                  max="12.00"
                  step="0.25"
                  value={simCoopRate}
                  onChange={(e) => setSimCoopRate(Number(e.target.value))}
                  className="w-full accent-[#2DBA7D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6F6B88]">
                  <span>5.00%</span>
                  <span>8.50%</span>
                  <span>12.00%</span>
                </div>
              </div>

              {/* Tenor Pinjaman */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#1C1B3A]">
                  <span>Tenor Pembiayaan</span>
                  <span className="text-[#7C3AED] text-sm">{simTenorMonths} Bulan</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[12, 24, 36, 48].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSimTenorMonths(t)}
                      className={`py-2 rounded-[10px] text-xs font-bold transition-all cursor-pointer ${
                        simTenorMonths === t
                          ? "bg-[#4A3AFF] text-white shadow-sm"
                          : "bg-[#FAFAFC] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#1C1B3A]"
                      }`}
                    >
                      {t} Bulan
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulation Results */}
            <div className="lg:col-span-7 space-y-5">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Net Spread Margin (NIM) */}
                <div className="p-5 rounded-[18px] bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#E6E3F7] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4A3AFF] uppercase">
                      Spread Margin (NIM)
                    </span>
                    <Percent className="w-4 h-4 text-[#4A3AFF]" />
                  </div>
                  <p className="text-3xl font-bold text-[#4A3AFF]">
                    {simNimSpread >= 0 ? `+${simNimSpread}%` : `${simNimSpread}%`}
                  </p>
                  <p className="text-[11px] text-[#6F6B88]">
                    Selisih margin bersih koperasi per tahun
                  </p>
                </div>

                {/* Proyeksi Total SHU Bersih Koperasi */}
                <div className="p-5 rounded-[18px] bg-gradient-to-br from-[#E6F9F0] to-[#DCFCE7] border border-[#2DBA7D]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2DBA7D] uppercase">
                      Proyeksi SHU Bersih
                    </span>
                    <Sparkles className="w-4 h-4 text-[#2DBA7D]" />
                  </div>
                  <p className="text-3xl font-bold text-[#2DBA7D]">
                    Rp {simNetShuProfit.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[11px] text-[#2DBA7D]/80">
                    Akumulasi margin selama {simTenorMonths} bulan
                  </p>
                </div>
              </div>

              {/* Breakdown Cashflow Card */}
              <div className="bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-4">
                <h4 className="font-bold text-xs text-[#1C1B3A] uppercase tracking-wider">
                  Rincian Arus Kas & Angsuran Bulanan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
                    <span className="text-[11px] text-[#6F6B88]">Cicilan Anggota / Bulan</span>
                    <p className="text-base font-bold text-[#1C1B3A]">
                      Rp {simMonthlyMemberInstallment.toLocaleString("id-ID")}
                    </p>
                    <span className="text-[10px] text-[#2DBA7D]">Potong Gaji Autodebet</span>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
                    <span className="text-[11px] text-[#6F6B88]">Setor ke Bank / Bulan</span>
                    <p className="text-base font-bold text-[#D97706]">
                      Rp {simMonthlyBankObligation.toLocaleString("id-ID")}
                    </p>
                    <span className="text-[10px] text-[#6F6B88]">Pokok + Bunga Wholesale</span>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-1">
                    <span className="text-[11px] text-[#4A3AFF]">Keuntungan SHU / Bulan</span>
                    <p className="text-base font-bold text-[#4A3AFF]">
                      Rp {Math.round(simNetShuProfit / simTenorMonths).toLocaleString("id-ID")}
                    </p>
                    <span className="text-[10px] text-[#4A3AFF]">Net Cashflow Bersih</span>
                  </div>
                </div>

                <div className="border-t border-[#E6E3F7] pt-3 text-xs space-y-2 text-[#6F6B88]">
                  <div className="flex justify-between">
                    <span>Total Bunga Diterima dari Anggota:</span>
                    <span className="font-bold text-[#1C1B3A]">Rp {simTotalCoopIncome.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Beban Bunga Disetor ke Bank:</span>
                    <span className="font-bold text-[#D97706]">- Rp {simTotalBankCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1C1B3A] pt-1 border-t border-dashed border-[#E6E3F7]">
                    <span>Total Net Margin Koperasi (SHU):</span>
                    <span className="text-[#2DBA7D]">Rp {simNetShuProfit.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. SUB-TAB 6: JADWAL ANGSURAN & REKONSILIASI */}
      {activeTab === "repayments" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[20px] border border-[#E6E3F7] shadow-sm">
            <h2 className="text-base font-bold text-[#1C1B3A] mb-1">
              Jadwal Pembayaran Angsuran Bank & Rekonsiliasi Payroll
            </h2>
            <p className="text-xs text-[#6F6B88]">
              Pemantauan penyetoran angsuran pooling dari hasil potongan gaji payroll karyawan tgl 25 ke rekening bank mitra sebelum jatuh tempo tgl 28.
            </p>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E6E3F7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1C1B3A]">
                <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-b border-[#E6E3F7]">
                  <tr>
                    <th className="py-3.5 px-4">Periode Tagihan</th>
                    <th className="py-3.5 px-4">Bank Rekanan</th>
                    <th className="py-3.5 px-4">Jatuh Tempo</th>
                    <th className="py-3.5 px-4">Pokok Angsuran</th>
                    <th className="py-3.5 px-4">Bunga Wholesale</th>
                    <th className="py-3.5 px-4">Total Kewajiban Bank</th>
                    <th className="py-3.5 px-4">Hasil Potongan Payroll</th>
                    <th className="py-3.5 px-4">Rekonsiliasi</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {repayments.map((rep) => (
                    <tr key={rep.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#1C1B3A]">{rep.period}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#4A3AFF]">{rep.bankName}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{rep.dueDate}</td>
                      <td className="py-3.5 px-4">Rp {rep.principalAmount.toLocaleString("id-ID")}</td>
                      <td className="py-3.5 px-4 text-[#D97706]">
                        Rp {rep.interestAmount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1C1B3A]">
                        Rp {rep.totalDue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#2DBA7D]">
                        Rp {rep.collectedFromPayroll.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3.5 px-4">
                        {rep.reconciliationMatch ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#2DBA7D]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>100% Klop</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#EF4444]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Selisih</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rep.status === "LUNAS"
                              ? "bg-[#E6F9F0] text-[#2DBA7D] border border-[#2DBA7D]/30"
                              : "bg-[#FFF4E5] text-[#D97706] border border-[#D97706]/30"
                          }`}
                        >
                          {rep.status === "LUNAS" ? "LUNAS VIA MCM" : "SIAP DISETOR"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: ADVICE SLIP PENARIKAN BANK RESMI */}
      {selectedAdvice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[24px] border border-[#E6E3F7] shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-[#1C1B3A] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-[#4A3AFF]" />
                </div>
                <div>
                  <h3 className="font-bold text-base">BUKTI DEBIT ADVICE TRANCHE RESMI</h3>
                  <p className="text-xs text-white/70">
                    Host-to-Host (H2H) Electronic Debit Advice Slip
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdvice(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Official Slip Styling */}
            <div className="p-6 space-y-6 bg-[#FAFAFC]">
              {/* Bank Title & Status Stamp */}
              <div className="flex items-start justify-between border-b border-[#E6E3F7] pb-4">
                <div>
                  <h4 className="font-bold text-sm text-[#1C1B3A]">{selectedAdvice.bankName}</h4>
                  <p className="text-xs text-[#6F6B88]">Divisi Commercial Banking & Channeling Syndication</p>
                  <p className="text-[11px] font-mono text-[#4A3AFF] mt-1">
                    Ref ID: {selectedAdvice.referenceNumber}
                  </p>
                </div>

                <div className="p-2 border-2 border-[#2DBA7D] rounded-[10px] text-center text-[#2DBA7D]">
                  <span className="text-[10px] font-black uppercase tracking-widest block">
                    H2H SETTLED
                  </span>
                  <span className="text-[9px] font-mono block">{selectedAdvice.drawdownDate}</span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#6F6B88] block text-[11px]">Rekening Debet Penyalur:</span>
                  <span className="font-bold text-[#1C1B3A]">{selectedAdvice.bankName} (Facility)</span>
                </div>
                <div>
                  <span className="text-[#6F6B88] block text-[11px]">Rekening Kredit Penerima:</span>
                  <span className="font-bold text-[#1C1B3A]">
                    KOPKAR PT BHAKTI IDOLA TAMA (ESCROW)
                  </span>
                </div>
                <div>
                  <span className="text-[#6F6B88] block text-[11px]">Waktu Eksekusi:</span>
                  <span className="font-semibold text-[#1C1B3A]">
                    {selectedAdvice.drawdownDate} ({selectedAdvice.drawdownTime})
                  </span>
                </div>
                <div>
                  <span className="text-[#6F6B88] block text-[11px]">Suku Bunga Wholesale:</span>
                  <span className="font-bold text-[#2DBA7D]">
                    {selectedAdvice.interestRateAnnual}% p.a. (Fixed)
                  </span>
                </div>
              </div>

              {/* Nominal Highlight Box */}
              <div className="p-4 rounded-[16px] bg-white border border-[#E6E3F7] shadow-sm text-center space-y-1">
                <span className="text-xs font-bold text-[#6F6B88] uppercase">
                  Jumlah Dana Tranche Ditarik
                </span>
                <p className="text-3xl font-black text-[#1C1B3A]">
                  Rp {selectedAdvice.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] italic text-[#6F6B88]">
                  Keperluan: &quot;{selectedAdvice.purpose}&quot;
                </p>
              </div>

              {/* Footer Signature Simulation */}
              <div className="grid grid-cols-2 gap-6 pt-2 text-[11px] text-[#6F6B88] border-t border-[#E6E3F7]">
                <div>
                  <p>Petugas Approval Koperasi:</p>
                  <p className="font-bold text-[#1C1B3A] mt-8">{selectedAdvice.picApproval}</p>
                </div>
                <div className="text-right">
                  <p>Sistem Otorisasi Perbankan:</p>
                  <p className="font-bold text-[#2DBA7D] mt-8 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>DIGITALLY SIGNED MCM 2.0</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-[#E6E3F7] flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-[#E6E3F7] text-[#1C1B3A] text-xs font-bold hover:bg-[#FAFAFC] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Advice</span>
              </button>
              <button
                onClick={() => setSelectedAdvice(null)}
                className="px-5 py-2 rounded-full bg-[#4A3AFF] text-white text-xs font-bold hover:bg-[#6B5CEB] transition-all cursor-pointer shadow-sm"
              >
                Selesai
              </button>
            </div>
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
