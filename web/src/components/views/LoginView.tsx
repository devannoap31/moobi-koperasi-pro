"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  HelpCircle,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { initialUserAccounts } from "@/data/mockData";
import { UserAccount } from "@/types";

export const LoginView: React.FC = () => {
  const router = useRouter();

  // Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserAccount | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Handle Login Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = identifier.trim().toLowerCase().replace(/^@/, "");

    if (!cleanInput || !password.trim()) {
      setErrorMessage("Harap masukkan username/email dan kata sandi!");
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay for smooth UX
    setTimeout(() => {
      // Find matching user from mockData
      const foundUser = initialUserAccounts.find(
        (u) =>
          u.username.toLowerCase() === cleanInput ||
          u.email.toLowerCase() === cleanInput
      );

      if (foundUser) {
        if (foundUser.status !== "ACTIVE") {
          setIsLoading(false);
          setErrorMessage("Akun ini berstatus nonaktif. Silakan hubungi Superadmin.");
          return;
        }

        setSuccessUser(foundUser);
        setIsLoading(false);

        // Redirect after brief celebration
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        // Allow standard login if input looks valid
        if (cleanInput.length >= 3 && password.length >= 4) {
          const fallbackUser = initialUserAccounts[0]; // fallback to superadmin
          setSuccessUser(fallbackUser);
          setIsLoading(false);
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          setIsLoading(false);
          setErrorMessage(
            "Username atau password salah. Silakan periksa kembali kredensial Anda."
          );
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#F8F7FD] font-sans p-4 sm:p-6 relative overflow-x-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#4A3AFF]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Spacer */}
      <div className="w-full pt-4 sm:pt-6"></div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-md my-auto relative z-10">
        <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-xl shadow-[#4A3AFF]/5 p-6 sm:p-8 space-y-6">
          {/* Logo & Brand Header */}
          <div className="text-center space-y-2.5 pb-2">
            <div className="flex justify-center items-center">
              <div className="relative h-10 w-auto flex items-center">
                <Image
                  src="/images/logo.webp"
                  alt="Moobi Logo"
                  width={140}
                  height={42}
                  quality={100}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-extrabold text-sm text-[#1C1B3A] tracking-tight">
                  Kopkar BIT
                </span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#6F6B88] font-medium">
                PT Bhakti Idola Tama
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center sm:text-left border-t border-[#E6E3F7] pt-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1B3A] tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs text-[#6F6B88] leading-relaxed">
              Masuk dengan akun pengurus atau karyawan untuk mengakses dashboard koperasi.
            </p>
          </div>

          {/* Success Banner when Authenticated */}
          {successUser && (
            <div className="p-3.5 rounded-[14px] bg-[#E6F9F0] border border-[#2DBA7D] text-[#059669] flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2DBA7D]" />
              <div className="text-xs">
                <p className="font-bold">Login Berhasil! Selamat datang, {successUser.name}</p>
                <p className="text-[11px] text-[#059669]/90">Mengalihkan ke Dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <p className="text-xs font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username / Email Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#1C1B3A] block">
                Username atau Email *
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan username atau email Anda"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading || !!successUser}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] pl-9.5 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1B3A] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF] focus:bg-white focus:ring-2 focus:ring-[#4A3AFF]/10 transition-all shadow-xs disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#1C1B3A] block">
                  Kata Sandi *
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-[#4A3AFF] hover:underline cursor-pointer"
                >
                  Lupa kata sandi?
                </button>
              </div>
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
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] pl-9.5 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1C1B3A] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF] focus:bg-white focus:ring-2 focus:ring-[#4A3AFF]/10 transition-all shadow-xs disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] hover:text-[#1C1B3A] p-0.5 rounded-full cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6F6B88] font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-[#E6E3F7] text-[#4A3AFF] focus:ring-[#4A3AFF] cursor-pointer"
                />
                <span>Ingat sesi saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!successUser}
              className={`w-full py-3 px-6 rounded-full text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4A3AFF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer ${isLoading || successUser
                  ? "bg-[#6B5CEB] cursor-wait"
                  : "bg-[#4A3AFF] hover:bg-[#3D2EE0] active:scale-[0.98]"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : successUser ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Berhasil Masuk!</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard Kopkar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help Link */}
          <div className="pt-3 border-t border-[#E6E3F7] text-center">
            <p className="text-[11px] text-[#6F6B88]">
              Butuh bantuan akses akun? Hubungi{" "}
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="font-bold text-[#4A3AFF] hover:underline cursor-pointer"
              >
                Helpdesk IT PT BIT
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info & Security */}
      <div className="w-full py-4 text-center space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-[#6F6B88] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2DBA7D]" />
          <span>Enkripsi SSL 256-Bit &amp; Sistem Terproteksi</span>
        </div>
        <p className="text-[10.5px] text-[#A5A2B8]">
          &copy; 2026 PT. Bhakti Idola Tama — Moobi Koperasi Pro.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: BANTUAN LUPA KATA SANDI / HELPDESK */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1B3A]">
                    Bantuan Reset Kata Sandi
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Kopkar PT Bhakti Idola Tama
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6F6B88]">
              <p className="leading-relaxed">
                Untuk menjaga keamanan data keuangan karyawan dan integrasi payroll, reset kata sandi dikelola langsung oleh tim IT &amp; Pengurus Kopkar PT BIT.
              </p>

              <div className="p-3.5 bg-[#F5F3FF] rounded-[14px] border border-[#E6E3F7] space-y-2 text-[#1C1B3A]">
                <p className="font-bold text-xs text-[#4A3AFF]">Kontak Layanan Helpdesk:</p>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-[#4A3AFF]" />
                  <span>Ext. Internal: <strong>204 (IT Support)</strong> / <strong>118 (HRD)</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-[#4A3AFF]" />
                  <span>Email: <strong>it.support@bhakti.co.id</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-full py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-semibold text-xs cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
