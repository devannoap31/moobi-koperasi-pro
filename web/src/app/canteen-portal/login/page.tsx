"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Clock,
  Ban,
} from "lucide-react";
import { sampleCanteenTenants } from "@/data/mockData";
import { CanteenTenant } from "@/types";

export default function CanteenLoginPage() {
  const router = useRouter();

  // Form State
  const [identifier, setIdentifier] = useState("kantin.sri");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<{ title: string; desc: string; type: "pending" | "suspended" } | null>(null);
  const [successTenant, setSuccessTenant] = useState<CanteenTenant | null>(null);

  // Quick Account Select for demonstration / pair testing
  const handleSelectQuickAccount = (tenant: CanteenTenant) => {
    setIdentifier(tenant.username);
    setPassword("password123");
    setErrorMessage(null);
    setWarningMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const cleanInput = identifier.trim().toLowerCase();
    if (!cleanInput || !password.trim()) {
      setErrorMessage("Harap masukkan username/email stand dan kata sandi!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find tenant from mockData
      const found = sampleCanteenTenants.find(
        (t) =>
          t.username.toLowerCase() === cleanInput ||
          t.email.toLowerCase() === cleanInput ||
          t.name.toLowerCase().includes(cleanInput)
      );

      if (found) {
        if (found.status === "PENDING_APPROVAL") {
          setIsLoading(false);
          setWarningMessage({
            title: "Pendaftaran Sedang Menunggu Verifikasi",
            desc: `Akun stand "${found.name}" saat ini masih dalam antrean peninjauan oleh Superadmin Kopkar BIT. Anda akan dapat mengakses POS kasir setelah akun disetujui.`,
            type: "pending",
          });
          return;
        }

        if (found.status === "SUSPENDED") {
          setIsLoading(false);
          setWarningMessage({
            title: "Akun Mitra Kantin Dibekukan Sementara",
            desc: `Akun stand "${found.name}" sedang dibekukan oleh Superadmin Kopkar BIT (${found.notes || "evaluasi operasional"}). Silakan hubungi pengurus koperasi untuk reaktivasi.`,
            type: "suspended",
          });
          return;
        }

        if (found.status === "REJECTED") {
          setIsLoading(false);
          setErrorMessage("Pengajuan akun kantin ini telah ditolak oleh Superadmin.");
          return;
        }

        // Active Tenant Success
        setSuccessTenant(found);
        setIsLoading(false);

        setTimeout(() => {
          router.push(`/canteen-portal/merchant?tenantId=${found.id}`);
        }, 1000);
      } else {
        // Fallback for custom username
        if (cleanInput.length >= 3 && password.length >= 4) {
          const fallbackTenant = sampleCanteenTenants[0];
          setSuccessTenant(fallbackTenant);
          setIsLoading(false);
          setTimeout(() => {
            router.push(`/canteen-portal/merchant?tenantId=${fallbackTenant.id}`);
          }, 1000);
        } else {
          setIsLoading(false);
          setErrorMessage("Kredensial login tidak ditemukan. Silakan cek kembali atau daftarkan stand Anda.");
        }
      }
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#F8F7FD] font-sans p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FFB547]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Back to Home */}
      <div className="w-full max-w-4xl flex items-center justify-between pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6B88] hover:text-[#4A3AFF] py-1.5 px-3 rounded-full bg-white border border-[#E6E3F7] transition-all hover:shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Portal Utama</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2DBA7D] py-1 px-2.5 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2DBA7D] animate-pulse" />
          <span>Kantin Utama Shift 1 &amp; Shift 2</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto relative z-10 py-6">
        <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-xl shadow-[#4A3AFF]/5 p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 rounded-[16px] bg-[#FFF4E5] text-[#D97706] flex items-center justify-center border border-[#FFE0B2] shadow-xs">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-extrabold text-sm text-[#1C1B3A] tracking-tight">
                  Portal Kasir &amp; Dapur Kantin
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]">
                  Kantin Utama
                </span>
              </div>
              <p className="text-[11px] text-[#6F6B88] font-medium">
                Kopkar PT Bhakti Idola Tama
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center sm:text-left border-t border-[#E6E3F7] pt-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1B3A] tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>Masuk Kasir Kantin BIT</span>
            </h1>
            <p className="text-xs text-[#6F6B88] leading-relaxed">
              Masuk untuk melayani kasir POS antrean karyawan, display pesanan dapur (KDS), dan laporan kas harian shift pabrik.
            </p>
          </div>

          {/* Warning / Pending / Suspended Banner */}
          {warningMessage && (
            <div
              className={`p-3.5 rounded-[16px] border flex items-start gap-3 animate-fadeIn text-xs ${warningMessage.type === "pending"
                  ? "bg-[#FFF8E6] border-[#FFD280] text-[#8C5200]"
                  : "bg-red-50 border-red-200 text-red-700"
                }`}
            >
              {warningMessage.type === "pending" ? (
                <Clock className="w-5 h-5 text-[#FF9800] shrink-0 mt-0.5" />
              ) : (
                <Ban className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{warningMessage.title}</p>
                <p className="text-[11px] leading-relaxed">{warningMessage.desc}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successTenant && (
            <div className="p-3.5 rounded-[14px] bg-[#E6F9F0] border border-[#2DBA7D] text-[#059669] flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2DBA7D]" />
              <div className="text-xs">
                <p className="font-bold">Login Berhasil! {successTenant.name}</p>
                <p className="text-[11px] text-[#059669]/90">Membuka Kasir POS Kantin...</p>
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
            {/* Identifier */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#1C1B3A] block">
                Username Petugas Kasir *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: kantin.sri atau kasir.kantin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading || !!successTenant}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] pl-9.5 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1B3A] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#1C1B3A] block">
                Kata Sandi *
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
                  disabled={isLoading || !!successTenant}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] pl-9.5 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1B3A] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF] focus:bg-white transition-all shadow-xs"
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
              disabled={isLoading || !!successTenant}
              className={`w-full py-3.5 px-6 rounded-full text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${isLoading || successTenant
                  ? "bg-[#1C1B3A]/80 cursor-wait"
                  : "bg-[#1C1B3A] hover:bg-[#2D2B56] active:scale-[0.98]"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun Kasir...</span>
                </>
              ) : successTenant ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Berhasil Masuk!</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Kasir Kantin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Petugas Switcher */}
          <div className="pt-2 border-t border-[#E6E3F7] space-y-2">
            <p className="text-[10.5px] font-bold text-[#6F6B88] uppercase tracking-wider text-center">
              Pilih Cepat Akun Petugas Kantin (Demo):
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {sampleCanteenTenants.slice(0, 1).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectQuickAccount(t)}
                  className={`p-2.5 rounded-[12px] border text-left transition-all text-xs cursor-pointer ${identifier === t.username
                      ? "bg-[#F5F3FF] border-[#4A3AFF] text-[#4A3AFF] font-bold"
                      : "bg-[#FAFAFC] border-[#E6E3F7] hover:bg-white text-[#1C1B3A]"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate block font-semibold">{t.ownerName} (Petugas Kasir)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#E6F9F0] text-[#2DBA7D]">
                      Kantin Utama
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#6F6B88]">{t.name} &bull; Username: <strong>{t.username}</strong></p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#6F6B88]">
        <p className="text-[11px] text-[#A5A2B8]">
          &copy; 2026 PT. Bhakti Idola Tama — Kantin Utama Koperasi Kopkar BIT.
        </p>
      </footer>
    </div>
  );
}
