"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Factory,
  ChefHat,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  Clock,
  Boxes,
  Scale,
} from "lucide-react";

interface ProductionUserAccount {
  id: string;
  name: string;
  roleTitle: string;
  username: string;
  email: string;
  avatarText: string;
  badgeColor: string;
}

const demoAccounts: ProductionUserAccount[] = [
  {
    id: "usr-01",
    name: "Chef Suryanto",
    roleTitle: "Kepala Dapur & Perumusan Resep BOM",
    username: "chef.suryanto",
    email: "chef.dapur@bhakti.co.id",
    avatarText: "CS",
    badgeColor: "bg-[#2DBA7D] text-white",
  },
  {
    id: "usr-02",
    name: "Bambang Prakoso",
    roleTitle: "Staf Logistik & Gudang Bahan Baku",
    username: "bambang.gudang",
    email: "gudang.dapur@bhakti.co.id",
    avatarText: "BP",
    badgeColor: "bg-[#FFB547] text-[#1C1B3A]",
  },
  {
    id: "usr-03",
    name: "Nurul Hidayah, S.Gz",
    roleTitle: "Quality Control & Ahli Gizi SPPG",
    username: "nurul.gizi",
    email: "qc.gizi@bhakti.co.id",
    avatarText: "NH",
    badgeColor: "bg-[#4A3AFF] text-white",
  },
];

export default function ProductionLoginPage() {
  const router = useRouter();

  // Form State
  const [identifier, setIdentifier] = useState("chef.suryanto");
  const [password, setPassword] = useState("cheffnb2026");
  const [selectedShift, setSelectedShift] = useState<"SHIFT_1" | "SHIFT_2">("SHIFT_1");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<ProductionUserAccount | null>(null);

  const handleSelectQuickAccount = (acc: ProductionUserAccount) => {
    setIdentifier(acc.username);
    setPassword(acc.username === "chef.suryanto" ? "cheffnb2026" : "gudang2026");
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = identifier.trim().toLowerCase();
    if (!cleanInput || !password.trim()) {
      setErrorMessage("Harap masukkan username dan kata sandi petugas produksi!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const found = demoAccounts.find(
        (a) =>
          a.username.toLowerCase() === cleanInput ||
          a.email.toLowerCase() === cleanInput ||
          a.name.toLowerCase().includes(cleanInput)
      );

      if (found || (cleanInput.length >= 3 && password.length >= 4)) {
        const userToSet = found || {
          id: `usr-custom`,
          name: cleanInput,
          roleTitle: "Petugas Produksi Dapur BIT",
          username: cleanInput,
          email: `${cleanInput}@bhakti.co.id`,
          avatarText: cleanInput.substring(0, 2).toUpperCase(),
          badgeColor: "bg-[#2DBA7D] text-white",
        };

        setSuccessUser(userToSet);
        setIsLoading(false);

        setTimeout(() => {
          router.push("/production/recipes");
        }, 850);
      } else {
        setIsLoading(false);
        setErrorMessage("Kredensial login tidak valid. Silakan pilih akun demo di bawah.");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#F8F7FD] font-sans p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[360px] bg-gradient-to-b from-[#2DBA7D]/10 to-[#4A3AFF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#2DBA7D]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Back to Home */}
      <div className="w-full max-w-4xl flex items-center justify-between pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6B88] hover:text-[#2DBA7D] py-1.5 px-3.5 rounded-full bg-white border border-[#E6E3F7] transition-all hover:shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Portal Utama</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2DBA7D] py-1 px-3 rounded-full bg-[#EBFBF5] border border-[#B8F2D8]">
          <span className="w-2 h-2 rounded-full bg-[#2DBA7D] animate-pulse" />
          <span>Divisi Produksi F&amp;B Pabrik BIT</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto relative z-10 py-6">
        <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-xl shadow-[#2DBA7D]/5 p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center">
              <div className="w-13 h-13 rounded-[18px] bg-gradient-to-tr from-[#2DBA7D] to-[#25A26C] text-white flex items-center justify-center shadow-md shadow-[#2DBA7D]/25">
                <Factory className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-[#1C1B3A] tracking-tight">
                  Portal Produksi &amp; Bahan Baku
                </span>
                <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-[#EBFBF5] text-[#2DBA7D] border border-[#B8F2D8]">
                  Kopkar BIT
                </span>
              </div>
              <p className="text-[11px] text-[#6F6B88] font-medium">
                PT Bhakti Idola Tama &bull; Dapur Sentral
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center sm:text-left border-t border-[#E6E3F7] pt-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1B3A] tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>Masuk Manajemen Produksi</span>
            </h1>
            <p className="text-xs text-[#6F6B88] leading-relaxed">
              Akses khusus perumusan resep BOM, kalkulasi COGS/HPP, PO supplier, pencatatan pemakaian sesi masak, dan audit stok opname.
            </p>
          </div>

          {/* Success Banner */}
          {successUser && (
            <div className="p-3.5 rounded-[14px] bg-[#EBFBF5] border border-[#2DBA7D] text-[#059669] flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2DBA7D]" />
              <div className="text-xs">
                <p className="font-bold">Login Berhasil! Selamat Bertugas, {successUser.name}</p>
                <p className="text-[11px] text-[#059669]/90">Membuka Modul Produksi &amp; Bahan Baku...</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <p className="text-xs font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Shift Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#1C1B3A] block">
                Pilih Shift Operasional Dapur *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedShift("SHIFT_1")}
                  className={`py-2 px-3 rounded-[12px] border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedShift === "SHIFT_1"
                      ? "bg-[#EBFBF5] border-[#2DBA7D] text-[#2DBA7D] shadow-xs"
                      : "bg-[#FAFAFC] border-[#E6E3F7] text-[#6F6B88] hover:bg-white"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Shift 1 (Pagi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShift("SHIFT_2")}
                  className={`py-2 px-3 rounded-[12px] border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedShift === "SHIFT_2"
                      ? "bg-[#EBFBF5] border-[#2DBA7D] text-[#2DBA7D] shadow-xs"
                      : "bg-[#FAFAFC] border-[#E6E3F7] text-[#6F6B88] hover:bg-white"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Shift 2 (Siang)</span>
                </button>
              </div>
            </div>

            {/* Identifier */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#1C1B3A] block">
                Username / Email Petugas Produksi *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: chef.suryanto atau bambang.gudang"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading || !!successUser}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] pl-9.5 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1B3A] placeholder-[#6F6B88] focus:outline-none focus:border-[#2DBA7D] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#1C1B3A] block">
                Kata Sandi / PIN Dapur *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || !!successUser}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] pl-9.5 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1B3A] placeholder-[#6F6B88] focus:outline-none focus:border-[#2DBA7D] focus:bg-white transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] hover:text-[#1C1B3A] p-0.5 rounded-full cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !!successUser}
              className={`w-full py-3.5 px-6 rounded-full text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2DBA7D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || successUser
                  ? "bg-[#2DBA7D]/80 cursor-wait"
                  : "bg-gradient-to-r from-[#2DBA7D] to-[#25A26C] hover:opacity-95 active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Otoritas Dapur...</span>
                </>
              ) : successUser ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Berhasil Masuk!</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Modul Produksi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-2 border-t border-[#E6E3F7] space-y-2">
            <p className="text-[10.5px] font-bold text-[#6F6B88] uppercase tracking-wider text-center">
              Pilih Cepat Akun Petugas Produksi (Demo):
            </p>
            <div className="space-y-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectQuickAccount(acc)}
                  className={`w-full p-2.5 rounded-[12px] border text-left transition-all text-xs cursor-pointer ${
                    identifier === acc.username
                      ? "bg-[#EBFBF5] border-[#2DBA7D] text-[#2DBA7D] font-bold"
                      : "bg-[#FAFAFC] border-[#E6E3F7] hover:bg-white text-[#1C1B3A]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate block font-bold text-[#1C1B3A]">
                      {acc.name}
                    </span>
                    <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${acc.badgeColor}`}>
                      {acc.avatarText}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6F6B88] truncate mt-0.5">
                    {acc.roleTitle} &bull; User: <strong>{acc.username}</strong>
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#6F6B88] space-y-1">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2DBA7D]" />
          <span>Sistem Formula BOM &amp; HPP Terstandarisasi Dapur PT Bhakti Idola Tama</span>
        </div>
        <p className="text-[11px] text-[#A5A2B8]">
          &copy; 2026 PT. Bhakti Idola Tama — Moobi Koperasi Pro.
        </p>
      </footer>
    </div>
  );
}
