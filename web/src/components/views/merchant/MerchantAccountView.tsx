"use client";

import React, { useState } from "react";
import {
  UserCheck,
  ShieldCheck,
  Lock,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  Plus,
  Info,
  Check,
  CreditCard,
  User,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useMerchant } from "@/context/MerchantContext";
import { TenantUpdateRequest } from "@/types";

export const MerchantAccountView: React.FC = () => {
  const { currentTenant, updateCredentials, updateRequests, submitUpdateRequest, showToast } = useMerchant();

  // Credentials State
  const [username, setUsername] = useState(currentTenant.username || "kantin.sri");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credentialsSaved, setCredentialsSaved] = useState(false);

  // Update Request Form Modal / Accordion State
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(["bank"]);
  const [requestFormData, setRequestFormData] = useState({
    name: currentTenant.name || "",
    ownerName: currentTenant.ownerName || "",
    ownerNik: currentTenant.ownerNik || "3171029381920001",
    location: currentTenant.location || "",
    category: currentTenant.category || "",
    phone: currentTenant.phone || "",
    email: currentTenant.email || "",
    bankName: "Bank BCA",
    bankAccountNumber: "",
    bankAccountName: currentTenant.ownerName || "",
    reason: "",
  });

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast("Konfirmasi password baru tidak cocok!", "error");
      return;
    }
    if (newPassword && newPassword.length < 4) {
      showToast("Password minimal 4 karakter!", "error");
      return;
    }
    updateCredentials(username, newPassword || undefined);
    setCredentialsSaved(true);
    setTimeout(() => setCredentialsSaved(false), 3000);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleField = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((k) => k !== fieldKey) : [...prev, fieldKey]
    );
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFields.length === 0) {
      showToast("Pilihlah setidaknya satu data yang ingin diajukan untuk diperbarui!", "error");
      return;
    }
    if (!requestFormData.reason.trim()) {
      showToast("Harap isi alasan pengajuan pembaruan data!", "error");
      return;
    }

    const payload: TenantUpdateRequest["requestedFields"] = {};
    if (selectedFields.includes("name")) payload.name = requestFormData.name;
    if (selectedFields.includes("owner")) {
      payload.ownerName = requestFormData.ownerName;
      payload.ownerNik = requestFormData.ownerNik;
    }
    if (selectedFields.includes("bank")) {
      payload.bankName = requestFormData.bankName;
      payload.bankAccountNumber = requestFormData.bankAccountNumber;
      payload.bankAccountName = requestFormData.bankAccountName;
    }
    if (selectedFields.includes("location")) payload.location = requestFormData.location;
    if (selectedFields.includes("category")) payload.category = requestFormData.category;
    if (selectedFields.includes("contact")) {
      payload.phone = requestFormData.phone;
      payload.email = requestFormData.email;
    }

    submitUpdateRequest(payload, requestFormData.reason);
    setIsRequestFormOpen(false);
    setRequestFormData({
      ...requestFormData,
      reason: "",
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. INFORMASI PROFIL AKUN STAND */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[16px] bg-[#4A3AFF] text-white flex items-center justify-center font-bold text-base shadow-md shadow-[#4A3AFF]/20">
              {currentTenant.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#1C1B3A]">
                  {currentTenant.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                  ✓ Akun Aktif &amp; Terverifikasi
                </span>
              </div>
              <p className="text-[11px] text-[#6F6B88]">
                Stand ID: <strong>{currentTenant.id}</strong> • Terdaftar Sejak: <strong>{currentTenant.createdAt}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="p-2 rounded-[12px] bg-[#F5F3FF] text-[#4A3AFF] font-bold">
              Kantin PT Bhakti Idola Tama
            </span>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
            <p className="text-[11px] text-[#6F6B88]">Penanggung Jawab / Pemilik</p>
            <p className="font-bold text-[#1C1B3A]">{currentTenant.ownerName}</p>
            <p className="text-[10px] text-[#A5A2B8]">NIK: {currentTenant.ownerNik || "3171029381920001"}</p>
          </div>

          <div className="p-3 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
            <p className="text-[11px] text-[#6F6B88]">Lokasi Stand</p>
            <p className="font-bold text-[#1C1B3A]">{currentTenant.location}</p>
            <p className="text-[10px] text-[#A5A2B8]">{currentTenant.category}</p>
          </div>

          <div className="p-3 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
            <p className="text-[11px] text-[#6F6B88]">Rekening Pencairan Saat Ini</p>
            <p className="font-bold text-[#4A3AFF]">{currentTenant.bankName} - {currentTenant.bankAccountNumber}</p>
            <p className="text-[10px] text-[#6F6B88]">a.n {currentTenant.bankAccountName}</p>
          </div>
        </div>
      </div>

      {/* 2. KREDENSIAL LOGIN AKUN (EDIT LANGSUNG) */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1B3A]">Kredensial Login Stand</h3>
              <p className="text-[11px] text-[#6F6B88]">
                Username dan password privat untuk masuk ke portal kasir stand.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateCredentials} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#1C1B3A]">Username Login *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs font-mono focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1C1B3A]">Password Baru (Opsional)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin diubah"
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1C1B3A]">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#A5A2B8]">
              *Kredensial ini hanya diketahui oleh pengelola stand bersangkutan.
            </span>
            <div className="flex items-center gap-3">
              {credentialsSaved && (
                <span className="text-xs font-bold text-[#2DBA7D] flex items-center gap-1 animate-fadeIn">
                  <Check className="w-4 h-4" />
                  <span>Kredensial Diperbarui!</span>
                </span>
              )}
              <button
                type="submit"
                className="py-2.5 px-5 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Simpan Kredensial Login
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. PENGAJUAN PEMBARUAN DATA STAND (MENUNGGU PERSETUJUAN SUPERADMIN) */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1C1B3A]">
                Pengajuan Pembaruan Data Stand Resmi
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]">
                Verifikasi Superadmin
              </span>
            </div>
            <p className="text-[11px] text-[#6F6B88]">
              Perubahan data krusial (Rekening Bank, Nama Stand, NIK/Pemilik) memerlukan persetujuan Superadmin Koperasi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsRequestFormOpen(!isRequestFormOpen)}
            className="py-2 px-4 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Pengajuan Pembaruan</span>
          </button>
        </div>

        {/* REQUEST FORM MODAL / PANEL */}
        {isRequestFormOpen && (
          <form
            onSubmit={handleSubmitRequest}
            className="p-4.5 rounded-[18px] bg-[#F5F3FF]/50 border border-[#E6E3F7] space-y-4 text-xs animate-fadeIn"
          >
            <div className="space-y-1">
              <label className="font-bold text-[#1C1B3A] block">
                1. Pilih Data Mana Saja yang Ingin Diajukan untuk Diperbarui:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { key: "bank", label: "Rekening Bank Pencairan", icon: CreditCard },
                  { key: "name", label: "Nama Stand Kantin", icon: Building2 },
                  { key: "owner", label: "Nama Pemilik & NIK", icon: User },
                  { key: "location", label: "Lokasi Stand PT BIT", icon: MapPin },
                  { key: "category", label: "Kategori Usaha / Makanan", icon: FileText },
                  { key: "contact", label: "Kontak HP / Email", icon: Info },
                ].map((f) => {
                  const Icon = f.icon;
                  const isChecked = selectedFields.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => handleToggleField(f.key)}
                      className={`p-2.5 rounded-[12px] border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                          : "bg-white text-[#1C1B3A] border-[#E6E3F7] hover:border-[#4A3AFF]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? "text-white" : "text-[#4A3AFF]"}`} />
                      <span className="font-semibold text-[11px] truncate">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Inputs Based on Selected Fields */}
            <div className="space-y-3 pt-2 border-t border-[#E6E3F7]">
              <label className="font-bold text-[#1C1B3A] block">
                2. Masukkan Data Nilai Baru yang Diusulkan:
              </label>

              {selectedFields.includes("bank") && (
                <div className="p-3 rounded-[12px] bg-white border border-[#E6E3F7] space-y-2">
                  <p className="font-bold text-[#4A3AFF]">Pembaruan Rekening Bank:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[#6F6B88]">Nama Bank Baru *</label>
                      <select
                        value={requestFormData.bankName}
                        onChange={(e) => setRequestFormData({ ...requestFormData, bankName: e.target.value })}
                        className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                      >
                        <option value="Bank BCA">Bank BCA</option>
                        <option value="Bank Mandiri">Bank Mandiri</option>
                        <option value="Bank BRI">Bank BRI</option>
                        <option value="Bank BNI">Bank BNI</option>
                        <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#6F6B88]">Nomor Rekening Baru *</label>
                      <input
                        type="text"
                        value={requestFormData.bankAccountNumber}
                        onChange={(e) => setRequestFormData({ ...requestFormData, bankAccountNumber: e.target.value })}
                        required={selectedFields.includes("bank")}
                        placeholder="Contoh: 800-1283-911"
                        className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#6F6B88]">Atas Nama Rekening *</label>
                      <input
                        type="text"
                        value={requestFormData.bankAccountName}
                        onChange={(e) => setRequestFormData({ ...requestFormData, bankAccountName: e.target.value })}
                        required={selectedFields.includes("bank")}
                        placeholder="Sesuai buku tabungan"
                        className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedFields.includes("name") && (
                <div className="p-3 rounded-[12px] bg-white border border-[#E6E3F7] space-y-1">
                  <label className="text-[#6F6B88]">Nama Stand Baru *</label>
                  <input
                    type="text"
                    value={requestFormData.name}
                    onChange={(e) => setRequestFormData({ ...requestFormData, name: e.target.value })}
                    required={selectedFields.includes("name")}
                    placeholder="Contoh: Dapur Nusantara BIT Spesial Seafood"
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                  />
                </div>
              )}

              {selectedFields.includes("owner") && (
                <div className="p-3 rounded-[12px] bg-white border border-[#E6E3F7] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#6F6B88]">Nama Pemilik Baru *</label>
                    <input
                      type="text"
                      value={requestFormData.ownerName}
                      onChange={(e) => setRequestFormData({ ...requestFormData, ownerName: e.target.value })}
                      required={selectedFields.includes("owner")}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#6F6B88]">NIK Pemilik (KTP) *</label>
                    <input
                      type="text"
                      value={requestFormData.ownerNik}
                      onChange={(e) => setRequestFormData({ ...requestFormData, ownerNik: e.target.value })}
                      required={selectedFields.includes("owner")}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {selectedFields.includes("location") && (
                <div className="p-3 rounded-[12px] bg-white border border-[#E6E3F7] space-y-1">
                  <label className="text-[#6F6B88]">Lokasi Baru Stand *</label>
                  <input
                    type="text"
                    value={requestFormData.location}
                    onChange={(e) => setRequestFormData({ ...requestFormData, location: e.target.value })}
                    required={selectedFields.includes("location")}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                  />
                </div>
              )}

              {selectedFields.includes("category") && (
                <div className="p-3 rounded-[12px] bg-white border border-[#E6E3F7] space-y-1">
                  <label className="text-[#6F6B88]">Kategori Usaha Baru *</label>
                  <input
                    type="text"
                    value={requestFormData.category}
                    onChange={(e) => setRequestFormData({ ...requestFormData, category: e.target.value })}
                    required={selectedFields.includes("category")}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                  />
                </div>
              )}

              {selectedFields.includes("contact") && (
                <div className="p-3 rounded-[12px] bg-white border border-[#E6E3F7] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#6F6B88]">No. Telepon Baru *</label>
                    <input
                      type="text"
                      value={requestFormData.phone}
                      onChange={(e) => setRequestFormData({ ...requestFormData, phone: e.target.value })}
                      required={selectedFields.includes("contact")}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#6F6B88]">Email Baru *</label>
                    <input
                      type="email"
                      value={requestFormData.email}
                      onChange={(e) => setRequestFormData({ ...requestFormData, email: e.target.value })}
                      required={selectedFields.includes("contact")}
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[8px] p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">
                  3. Alasan / Penjelasan Pengajuan Pembaruan Data *
                </label>
                <textarea
                  rows={2}
                  value={requestFormData.reason}
                  onChange={(e) => setRequestFormData({ ...requestFormData, reason: e.target.value })}
                  required
                  placeholder="Jelaskan alasan pengajuan pembaruan data untuk evaluasi Superadmin Kopkar..."
                  className="w-full bg-white border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E3F7]">
              <button
                type="button"
                onClick={() => setIsRequestFormOpen(false)}
                className="py-2 px-4 rounded-full bg-white border border-[#E6E3F7] text-[#6F6B88] font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pengajuan ke Superadmin</span>
              </button>
            </div>
          </form>
        )}

        {/* UPDATE REQUESTS HISTORY TABLE */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-[#1C1B3A]">
            Riwayat Status Pengajuan Pembaruan Data ({updateRequests.length})
          </h4>

          {updateRequests.length === 0 ? (
            <div className="p-6 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7] text-center text-xs text-[#A5A2B8]">
              Belum ada riwayat pengajuan pembaruan data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
                  <tr>
                    <th className="py-2.5 px-3">Waktu Pengajuan</th>
                    <th className="py-2.5 px-3">Data yang Diajukan</th>
                    <th className="py-2.5 px-3">Alasan Mitra</th>
                    <th className="py-2.5 px-3">Status Superadmin</th>
                    <th className="py-2.5 px-3">Catatan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {updateRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#1C1B3A] whitespace-nowrap">
                        {req.submittedAt}
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {req.requestedFields.bankAccountNumber && (
                            <span className="flex items-center gap-1.5 text-[11px] text-[#4A3AFF] font-bold">
                              <CreditCard className="w-3.5 h-3.5 shrink-0" />
                              <span>Bank: {req.requestedFields.bankName} - {req.requestedFields.bankAccountNumber}</span>
                            </span>
                          )}
                          {req.requestedFields.name && (
                            <span className="flex items-center gap-1.5 text-[11px] text-[#1C1B3A]">
                              <Building2 className="w-3.5 h-3.5 shrink-0 text-[#6F6B88]" />
                              <span>Nama Stand: {req.requestedFields.name}</span>
                            </span>
                          )}
                          {req.requestedFields.ownerName && (
                            <span className="flex items-center gap-1.5 text-[11px] text-[#1C1B3A]">
                              <User className="w-3.5 h-3.5 shrink-0 text-[#6F6B88]" />
                              <span>Pemilik: {req.requestedFields.ownerName}</span>
                            </span>
                          )}
                          {req.requestedFields.location && (
                            <span className="flex items-center gap-1.5 text-[11px] text-[#6F6B88]">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#6F6B88]" />
                              <span>Lokasi: {req.requestedFields.location}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-[#1C1B3A] max-w-xs">
                        {req.reason}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                            req.status === "APPROVED"
                              ? "bg-[#E6F9F0] text-[#2DBA7D]"
                              : req.status === "PENDING_APPROVAL"
                              ? "bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {req.status === "APPROVED" ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Disetujui Superadmin</span>
                            </>
                          ) : req.status === "PENDING_APPROVAL" ? (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Menunggu Persetujuan</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Ditolak Superadmin</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[#6F6B88] text-[11px]">
                        {req.adminNotes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
