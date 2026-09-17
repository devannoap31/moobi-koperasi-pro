"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Receipt,
  AlertTriangle,
  Landmark,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Calculator,
  ChevronRight,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  sampleEmployees,
  sampleLoans,
  sampleProducts,
  initialBankLiquidity,
} from "@/data/mockData";

export const DashboardView: React.FC = () => {
  const [loans, setLoans] = useState(sampleLoans);
  const [bankLiquidity, setBankLiquidity] = useState(initialBankLiquidity);
  const [showTopUpSuccess, setShowTopUpSuccess] = useState(false);

  // Simulation of salary deduction for 10jt case
  const exampleSalary = 10000000;
  const exampleSimpananWajib = 100000;
  const exampleCicilan = 750000;
  const exampleKantin = 250000;
  const exampleTotalDeductions = exampleSimpananWajib + exampleCicilan + exampleKantin;
  const exampleTakeHomePay = exampleSalary - exampleTotalDeductions;

  const handleApproveLoan = (loanId: string) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: "APPROVED" } : l))
    );
  };

  const handleRejectLoan = (loanId: string) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: "REJECTED" } : l))
    );
  };

  const handleTopUpBankLimit = () => {
    setBankLiquidity((prev) => ({
      ...prev,
      cooperativeCashReserve: prev.cooperativeCashReserve + 200000000,
      bankCreditLineUsed: prev.bankCreditLineUsed + 200000000,
      isLiquidityTight: false,
    }));
    setShowTopUpSuccess(true);
    setTimeout(() => setShowTopUpSuccess(false), 4000);
  };

  const pendingLoans = loans.filter((l) => l.status.startsWith("PENDING"));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Top Section / Hero Banner */}
      <div className="bg-gradient-to-r from-[#4A3AFF] via-[#6B5CEB] to-[#8E79F5] rounded-[18px] p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Koperasi Karyawan PT. Bhakti Idola Tama (Kopkar BIT)</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Selamat Datang di Portal Kopkar BIT
          </h1>
          <p className="text-white/90 text-sm leading-relaxed mb-6">
            Melayani <strong>Karyawan PT Bhakti Idola Tama</strong> (Warehouse, Service Center, Logistik, & Office) dengan Simpan Pinjam otomatis, Stand Kantin harga khusus karyawan, serta integrasi Payroll terpusat.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/savings-loans"
              className="px-5 py-2.5 rounded-full bg-white text-[#4A3AFF] text-xs font-bold hover:bg-[#F5F3FF] transition-all cursor-pointer shadow-sm inline-block"
            >
              Kelola Simpan Pinjam
            </Link>
            <Link
              href="/canteen"
              className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all cursor-pointer inline-block"
            >
              Buka POS Stand Kantin
            </Link>
            <Link
              href="/payroll"
              className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all cursor-pointer inline-block"
            >
              Rekap Potong Gaji (Payroll HR)
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Bank Liquidity Alert (If cash is tight -> Bank Channeling Top-Up) */}
      <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] flex items-center justify-center text-[#4A3AFF] shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm text-[#1C1B3A]">
                  Channeling Likuiditas Pinjaman (Bank Mandiri Payroll BIT)
                </h3>
                {bankLiquidity.isLiquidityTight ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Kas Koperasi Menipis
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Likuiditas Aman
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6F6B88] leading-relaxed">
                Kas Internal Kopkar: <strong className="text-[#1C1B3A]">Rp {bankLiquidity.cooperativeCashReserve.toLocaleString("id-ID")}</strong> | Permintaan Masuk: <strong className="text-[#1C1B3A]">Rp {bankLiquidity.pendingLoanDemand.toLocaleString("id-ID")}</strong> | Plafon Bank Mandiri Tersedia: <strong className="text-[#4A3AFF]">Rp {(bankLiquidity.bankCreditLineLimit - bankLiquidity.bankCreditLineUsed).toLocaleString("id-ID")}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTopUpBankLimit}
              className="px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Tarik Top-Up Dana Bank (+Rp 200 Jt)</span>
            </button>
          </div>
        </div>

        {showTopUpSuccess && (
          <div className="mt-4 p-3 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Berhasil melakukan top-up likuiditas pinjaman dari Bank Mandiri sebesar Rp 200.000.000 untuk Kopkar BIT!</span>
          </div>
        )}
      </div>

      {/* 3. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Kas & Simpanan */}
        <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6F6B88] uppercase tracking-wider">
              Total Kas Kopkar BIT
            </span>
            <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C1B3A] mb-1">
            Rp {bankLiquidity.cooperativeCashReserve.toLocaleString("id-ID")}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#2DBA7D] font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+Rp 50 Jt dari Simpanan Wajib</span>
          </div>
        </div>

        {/* Card 2: Pinjaman Aktif */}
        <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6F6B88] uppercase tracking-wider">
              Pinjaman Aktif Karyawan
            </span>
            <div className="w-9 h-9 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C1B3A] mb-1">
            Rp {bankLiquidity.totalActiveLoans.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-[#6F6B88]">
            Dipotong otomatis saat payroll bulanan
          </p>
        </div>

        {/* Card 3: Omset Stand Kantin */}
        <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6F6B88] uppercase tracking-wider">
              Omzet Stand Kantin Karyawan
            </span>
            <div className="w-9 h-9 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C1B3A] mb-1">
            Rp 18.950.000
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#4A3AFF] font-semibold">
            <span>Harga diskon khusus karyawan aktif</span>
          </div>
        </div>

        {/* Card 4: Potongan Payroll Bulan Ini */}
        <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6F6B88] uppercase tracking-wider">
              Estimasi Potong Gaji HR
            </span>
            <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C1B3A] mb-1">
            Rp 185.400.000
          </p>
          <p className="text-xs text-[#6F6B88]">
            Karyawan PT Bhakti Idola Tama
          </p>
        </div>
      </div>

      {/* 4. Two Columns: Interactive Payroll Simulator & Pending Loan Approval */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Payroll Deduction Simulator (Gaji 10 Juta Contoh Kasus) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1C1B3A]">
                    Simulasi Potong Gaji Karyawan BIT
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Contoh Alur Pemotongan (Budi Santoso - NIK BIT-2021-089)
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown box */}
            <div className="space-y-3 p-4 rounded-[14px] bg-[#F5F3FF]/70 border border-[#E6E3F7] text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6F6B88] font-medium">Gaji Pokok Karyawan</span>
                <span className="font-bold text-[#1C1B3A]">
                  Rp {exampleSalary.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="border-t border-[#E6E3F7]/80 my-1"></div>
              
              <div className="flex justify-between items-center py-1 text-[#D97706]">
                <span>1. Simpanan Wajib Kopkar BIT</span>
                <span className="font-semibold">- Rp {exampleSimpananWajib.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-[#D97706]">
                <span>2. Cicilan Pinjaman Koperasi</span>
                <span className="font-semibold">- Rp {exampleCicilan.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-[#D97706]">
                <span>3. Tagihan Kantin Karyawan</span>
                <span className="font-semibold">- Rp {exampleKantin.toLocaleString("id-ID")}</span>
              </div>

              <div className="border-t border-[#E6E3F7] pt-2 flex justify-between items-center">
                <span className="font-bold text-[#6F6B88]">Total Potongan Payroll</span>
                <span className="font-bold text-[#E5484D]">
                  - Rp {exampleTotalDeductions.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-[14px] bg-[#E6F9F0] border border-[#2DBA7D]/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#2DBA7D] uppercase tracking-wider">
                  Gaji Bersih Diterima (Take Home Pay)
                </p>
                <p className="text-xl font-bold text-[#1C1B3A]">
                  Rp {exampleTakeHomePay.toLocaleString("id-ID")}
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-[#2DBA7D]" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6E3F7] flex items-center justify-between">
            <span className="text-xs text-[#6F6B88]">Integrasi Payroll PT Bhakti Idola Tama</span>
            <Link
              href="/payroll"
              className="text-xs font-bold text-[#4A3AFF] hover:text-[#6B5CEB] flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Rekap Payroll Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Pending Loan Approvals */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#1C1B3A]">
                Persetujuan Pengajuan Pinjaman ({pendingLoans.length} Menunggu)
              </h3>
              <p className="text-xs text-[#6F6B88]">
                Limit dicek otomatis berdasarkan Jabatan & Masa Kerja di PT Bhakti Idola Tama
              </p>
            </div>
            <Link
              href="/savings-loans"
              className="text-xs font-semibold text-[#4A3AFF] hover:underline cursor-pointer"
            >
              Lihat Semua
            </Link>
          </div>

          {pendingLoans.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#6F6B88]">
              Tidak ada pengajuan pinjaman yang menunggu persetujuan saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1C1B3A]">{loan.employeeName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] font-semibold border border-[#E6E3F7]">
                        {loan.position} ({loan.department})
                      </span>
                    </div>
                    <p className="text-xs text-[#6F6B88]">
                      Nominal: <strong className="text-[#1C1B3A]">Rp {loan.amount.toLocaleString("id-ID")}</strong> ({loan.tenorMonths} bln @ Rp {loan.monthlyInstallment.toLocaleString("id-ID")}/bln)
                    </p>
                    <p className="text-[11px] text-[#6F6B88] italic">
                      Tujuan: {loan.purpose}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#D97706]">
                        {loan.status}
                      </span>
                      {loan.fundingSource === "BANK_CHANNELING" && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center gap-1">
                          <Landmark className="w-2.5 h-2.5" />
                          Bank Mandiri Channeling
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveLoan(loan.id)}
                      className="px-3.5 py-1.5 rounded-full bg-[#2DBA7D] hover:bg-[#259b68] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                    <button
                      onClick={() => handleRejectLoan(loan.id)}
                      className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5484D] text-[#E5484D] hover:bg-[#E5484D] hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Canteen & Hardware Store Dual Pricing Spotlight */}
      <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#1C1B3A]">
                Stand Kantin Karyawan PT Bhakti Idola Tama
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                Dual Pricing: Diskon Karyawan BIT
              </span>
            </div>
            <p className="text-xs text-[#6F6B88]">
              Karyawan mendapatkan diskon harga khusus anggota untuk perkakas teknik BIT, APD safety, dan makan siang kantin.
            </p>
          </div>
          <Link
            href="/canteen"
            className="px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all cursor-pointer shrink-0 inline-block"
          >
            Buka Transaksi POS Kasir
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sampleProducts.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] hover:border-[#4A3AFF]/50 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                  {product.category.replace("_", " ")}
                </span>
                <span className="text-[11px] text-[#6F6B88]">Stok: {product.stock} {product.unit}</span>
              </div>
              <h4 className="font-bold text-xs text-[#1C1B3A] line-clamp-1">{product.name}</h4>
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6F6B88] line-through">
                    Rp {product.regularPrice.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                    Hemat Rp {(product.regularPrice - product.memberPrice).toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#4A3AFF]">
                  Rp {product.memberPrice.toLocaleString("id-ID")} <span className="text-[10px] font-normal text-[#6F6B88]">(Kopkar BIT)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
