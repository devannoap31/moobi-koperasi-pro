"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  User,
  Store,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { sampleCanteenTenants } from "@/data/mockData";
import { CanteenTenant } from "@/types";

export default function CanteenRegisterPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    username: "",
    email: "",
    phone: "",
    location: "Kantin Utama - Stand 03",
    category: "Masakan Nusantara & Aneka Nasi",
    bankName: "Bank Mandiri",
    bankAccountNumber: "",
    bankAccountName: "",
    password: "",
    confirmPassword: "",
    notes: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTenant, setSubmittedTenant] = useState<CanteenTenant | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !formData.name.trim() ||
      !formData.ownerName.trim() ||
      !formData.username.trim() ||
      !formData.phone.trim() ||
      !formData.bankAccountNumber.trim()
    ) {
      setErrorMessage("Harap lengkapi semua kolom wajib yang bertanda bintang (*)");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    const newTenant: CanteenTenant = {
      id: `tenant-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      ownerName: formData.ownerName.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim() || `${formData.username.trim().toLowerCase()}@kantinbit.id`,
      phone: formData.phone.trim(),
      location: formData.location,
      category: formData.category,
      bankName: formData.bankName,
      bankAccountNumber: formData.bankAccountNumber.trim(),
      bankAccountName: formData.bankAccountName.trim() || formData.ownerName.trim(),
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString().split("T")[0],
      totalRevenue: 0,
      pendingSettlement: 0,
      activeProductsCount: 0,
      rating: 5.0,
      notes: formData.notes.trim() || "Pendaftaran stand kantin baru secara mandiri.",
    };

    // Push into runtime mock array
    sampleCanteenTenants.unshift(newTenant);
    setSubmittedTenant(newTenant);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-[#F8F7FD] font-sans p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-[#4A3AFF]/6 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between pt-2">
        <Link
          href="/canteen-portal/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6B88] hover:text-[#4A3AFF] py-1.5 px-3 rounded-full bg-white border border-[#E6E3F7] transition-all hover:shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Login Kantin</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-[#6F6B88] hover:text-[#4A3AFF]"
        >
          <span>Portal Utama Kopkar</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl my-6 relative z-10">
        {!isSubmitted ? (
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-xl p-6 sm:p-8 space-y-6">
            {/* Header Title */}
            <div className="space-y-2 border-b border-[#E6E3F7] pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A3AFF]">
                <Sparkles className="w-4 h-4" />
                <span>Pendaftaran Mitra Usaha Kantin PT BIT</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1B3A] tracking-tight">
                Registrasi Akun Stand Kantin Baru
              </h1>
              <p className="text-xs text-[#6F6B88] leading-relaxed">
                Daftarkan usaha kantin atau katering Anda untuk berjualan di ekosistem Kopkar PT Bhakti Idola Tama dan melayani ratusan karyawan secara digital.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 animate-fadeIn text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* SECTION 1: Informasi Usaha */}
              <div className="space-y-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A3AFF] flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>1. Informasi Stand / Usaha</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Nama Stand / Usaha *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Dapur Mama Rendang"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Kategori Menu / Barang *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    >
                      <option value="Masakan Nusantara & Aneka Nasi">Masakan Nusantara &amp; Aneka Nasi</option>
                      <option value="Olahan Ayam, Soto & Bebek">Olahan Ayam, Soto &amp; Bebek</option>
                      <option value="Minuman, Kopi & Camilan">Minuman, Kopi &amp; Camilan</option>
                      <option value="Kue Basah, Snack Box & Roti">Kue Basah, Snack Box &amp; Roti</option>
                      <option value="Peralatan Rumah Tangga & Harian">Peralatan Rumah Tangga &amp; Harian</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Rencana Lokasi Stand di PT BIT *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kantin Utama Stand 04 / Gedung Barat"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Nama Lengkap Pemilik *
                    </label>
                    <input
                      type="text"
                      placeholder="Nama sesuai KTP"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Kontak & Akun Login */}
              <div className="space-y-3.5 pt-2 border-t border-[#E6E3F7]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A3AFF] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>2. Kontak &amp; Kredensial Akun</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      No. WhatsApp / HP Aktif *
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 0812-3456-7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Username Stand yang Diinginkan *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: dapur.mama (huruf kecil)"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Kata Sandi *
                    </label>
                    <input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Konfirmasi Kata Sandi *
                    </label>
                    <input
                      type="password"
                      placeholder="Ulangi kata sandi"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Rekening Bank Pencairan Settlement */}
              <div className="space-y-3.5 pt-2 border-t border-[#E6E3F7]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A3AFF] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>3. Rekening Bank untuk Settlement Pendapatan</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Nama Bank *
                    </label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    >
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="Bank BCA">Bank BCA</option>
                      <option value="Bank BRI">Bank BRI</option>
                      <option value="Bank BNI">Bank BNI</option>
                      <option value="Bank BSI">Bank Syariah Indonesia (BSI)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Nomor Rekening *
                    </label>
                    <input
                      type="text"
                      placeholder="Nomor rekening bank"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1C1B3A]">
                      Atas Nama Rekening *
                    </label>
                    <input
                      type="text"
                      placeholder="Nama pemilik buku tabungan"
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4A3AFF]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Kirim Pendaftaran Stand Kantin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10.5px] text-[#6F6B88] text-center mt-2">
                  Setelah dikirim, permohonan stand akan ditinjau oleh Superadmin &amp; Pengurus Kopkar BIT.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS SUBMITTED STATE */
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-xl p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2] flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]">
                Status: Menunggu Persetujuan Superadmin
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B3A]">
                Pendaftaran Stand Berhasil Dikirim!
              </h2>
              <p className="text-xs text-[#6F6B88] max-w-md mx-auto leading-relaxed">
                Terima kasih <strong>{submittedTenant?.ownerName}</strong>. Pengajuan untuk stand <strong>&quot;{submittedTenant?.name}&quot;</strong> telah diterima oleh sistem Kopkar PT Bhakti Idola Tama.
              </p>
            </div>

            <div className="p-4 rounded-[18px] bg-[#F5F3FF] border border-[#E6E3F7] text-left space-y-2 text-xs">
              <p className="font-bold text-[#4A3AFF]">Langkah Selanjutnya:</p>
              <ul className="space-y-1.5 text-[#1C1B3A] list-disc list-inside">
                <li>Superadmin Kopkar BIT akan meninjau berkas pendaftaran dan lokasi stand Anda.</li>
                <li>Setelah disetujui (Approved), Anda dapat langsung login menggunakan username <strong>{submittedTenant?.username}</strong>.</li>
                <li>Anda dapat mulai mengunggah menu makanan dan melayani pesanan karyawan.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/canteen-portal/login"
                className="flex-1 py-3 px-5 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Halaman Login Mitra Kantin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="py-3 px-5 rounded-full bg-white border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#6F6B88] font-bold text-xs flex items-center justify-center"
              >
                <span>Kembali ke Beranda Utama</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#6F6B88]">
        <p className="text-[11px] text-[#A5A2B8]">
          &copy; 2026 PT. Bhakti Idola Tama — Portal Mitra Multi-Tenant Kopkar.
        </p>
      </footer>
    </div>
  );
}
