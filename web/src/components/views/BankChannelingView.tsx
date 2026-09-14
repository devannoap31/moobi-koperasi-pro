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
  ArrowRight,
} from "lucide-react";
import { initialBankLiquidity } from "@/data/mockData";
import { BankLiquidityStatus } from "@/types";

export const BankChannelingView: React.FC = () => {
  const [liquidity, setLiquidity] = useState<BankLiquidityStatus>(initialBankLiquidity);
  const [topUpAmount, setTopUpAmount] = useState<number>(200000000);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableBankLimit = liquidity.bankCreditLineLimit - liquidity.bankCreditLineUsed;

  const handleTopUp = () => {
    if (topUpAmount > availableBankLimit) return;
    setLiquidity((prev) => ({
      ...prev,
      cooperativeCashReserve: prev.cooperativeCashReserve + topUpAmount,
      bankCreditLineUsed: prev.bankCreditLineUsed + topUpAmount,
      isLiquidityTight: false,
    }));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#1C1B3A]">
              Likuiditas Kas Pinjaman & Integrasi Bank Mandiri — PT. Bhakti Idola Tama
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
              Payroll BIT Terkoneksi
            </span>
          </div>
          <p className="text-xs text-[#6F6B88]">
            Fitur channeling perbankan: Menjaga ketersediaan dana pinjaman ketika kas internal Kopkar BIT habis atau permintaan pinjaman karyawan tinggi.
          </p>
        </div>
      </div>

      {/* 2. Big Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kas Internal Koperasi */}
        <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6F6B88] uppercase">
              Kas Internal Kopkar BIT
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1C1B3A]">
            Rp {liquidity.cooperativeCashReserve.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#6F6B88]">
            Dari simpanan wajib & sukarela anggota BIT
          </p>
        </div>

        {/* Permintaan Pinjaman Masuk */}
        <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6F6B88] uppercase">
              Permintaan Pinjaman Antre
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#D97706]">
            Rp {liquidity.pendingLoanDemand.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#6F6B88]">
            Karyawan menunggu pencairan
          </p>
        </div>

        {/* Sisa Plafon Bank Mandiri */}
        <div className="p-6 rounded-[18px] bg-white border border-[#E6E3F7] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6F6B88] uppercase">
              Sisa Plafon Channeling Bank
            </span>
            <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2DBA7D]">
            Rp {availableBankLimit.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-[#6F6B88]">
            Total Plafon Disetujui: Rp {liquidity.bankCreditLineLimit.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* 3. Top-Up Liquidity Action Form */}
      <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1C1B3A]">
              Tarik Likuiditas Pinjaman dari Bank Mitra
            </h3>
            <p className="text-xs text-[#6F6B88]">
              Dana akan langsung ditambahkan ke kas pinjaman Kopkar BIT dan dicairkan ke rekening karyawan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#1C1B3A] mb-1">
              Bank Mitra Rekanan
            </label>
            <input
              type="text"
              readOnly
              value={liquidity.bankPartnerName}
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1B3A] mb-1">
              Nominal Penarikan Top-Up (Rp)
            </label>
            <input
              type="number"
              step="50000000"
              max={availableBankLimit}
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(Number(e.target.value))}
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#1C1B3A]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTopUp}
              className="w-full py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Eksekusi Top-Up Kas (+Rp {(topUpAmount / 1000000).toFixed(0)} Jt)</span>
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="p-3 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Berhasil menarik dana likuiditas dari Bank Mandiri! Kas Kopkar BIT bertambah sebesar Rp {topUpAmount.toLocaleString("id-ID")}.</span>
          </div>
        )}
      </div>
    </div>
  );
};
