"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Store,
  MapPin,
  Clock,
  Phone,
  QrCode,
  Check,
  Smartphone,
  Save,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Upload,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { useMerchant } from "@/context/MerchantContext";
import { CanteenQrisProfile } from "@/types";

export const MerchantStoreSettingsView: React.FC = () => {
  const {
    currentTenant,
    updateStoreInfo,
    showToast,
    qrisProfiles,
    activeQris,
    addQrisProfile,
    updateQrisProfile,
    deleteQrisProfile,
    setActiveQris,
  } = useMerchant();

  // 1. General Store Form State
  const [formData, setFormData] = useState({
    name: currentTenant.name || "",
    category: currentTenant.category || "",
    description:
      currentTenant.notes ||
      currentTenant.description ||
      "Stand kantin resmi PT Bhakti Idola Tama, menyajikan makanan dan minuman higienis.",
    location: currentTenant.location || "",
    openingHours: currentTenant.openingHours || "07:30 - 16:30 WIB",
    phone: currentTenant.phone || "",
    whatsappContact:
      currentTenant.whatsappContact || currentTenant.phone || "0812-8921-3341",
    isOpen: currentTenant.isOpen !== undefined ? currentTenant.isOpen : true,
  });

  const [isStoreInfoSaved, setIsStoreInfoSaved] = useState(false);

  // 2. Multi-QRIS Management State
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [editingQris, setEditingQris] = useState<CanteenQrisProfile | null>(null);
  const [qrisToDelete, setQrisToDelete] = useState<CanteenQrisProfile | null>(null);
  const [zoomedQris, setZoomedQris] = useState<CanteenQrisProfile | null>(null);

  // QRIS Form State (for Add / Edit)
  const [qrisForm, setQrisForm] = useState({
    label: "",
    bankOrProvider: "BCA",
    nmid: "ID1020039281920",
    imageSourceType: "UPLOAD" as "UPLOAD" | "PRESET",
    imageUrl: "/images/qris-example.jpg",
    uploadedFileName: "",
    isActive: false,
  });

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableQrisPresets = [
    {
      label: "QRIS Stand Standard (BCA / Kopkar)",
      bank: "BCA",
      url: "/images/qris-example.jpg",
    },
    {
      label: "QRIS Nobu Mitra Kopkar BIT",
      bank: "Nobu Kopkar",
      url: "/images/qris-example.jpg",
    },
    {
      label: "QRIS Mandiri Merchant Stand",
      bank: "Mandiri",
      url: "/images/qris-example.jpg",
    },
  ];

  const bankOptions = [
    "BCA",
    "Bank Mandiri",
    "BRI",
    "BNI",
    "Nobu Kopkar",
    "Bank Syariah Indonesia (BSI)",
    "GoPay / Merchant",
    "Lainnya",
  ];

  // Store Info Submit
  const handleStoreInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreInfo({
      name: formData.name,
      category: formData.category,
      notes: formData.description,
      description: formData.description,
      location: formData.location,
      openingHours: formData.openingHours,
      phone: formData.phone,
      whatsappContact: formData.whatsappContact,
      isOpen: formData.isOpen,
    });
    setIsStoreInfoSaved(true);
    setTimeout(() => setIsStoreInfoSaved(false), 3000);
  };

  // QRIS File Upload Handler (with FileReader to Base64)
  const processUploadedFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Harap pilih file gambar (JPG, PNG, atau WEBP)", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran file gambar maksimal 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setQrisForm((prev) => ({
          ...prev,
          imageUrl: result,
          uploadedFileName: file.name,
        }));
        showToast(`File gambar "${file.name}" berhasil diunggah!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Open Add QRIS Modal
  const handleOpenAddQris = () => {
    if (qrisProfiles.length >= 3) {
      showToast(
        "Maksimal 3 barcode QRIS telah tercapai. Hapus salah satu QRIS untuk menambahkan yang baru.",
        "error"
      );
      return;
    }

    setEditingQris(null);
    setQrisForm({
      label: `QRIS Stand - ${qrisProfiles.length === 0 ? "Utama" : `Cadangan ${qrisProfiles.length + 1}`}`,
      bankOrProvider: "BCA",
      nmid: `ID10200${Math.floor(1000000 + Math.random() * 9000000)}`,
      imageSourceType: "UPLOAD",
      imageUrl: "/images/qris-example.jpg",
      uploadedFileName: "",
      isActive: qrisProfiles.length === 0, // Auto active if first QRIS
    });
    setIsQrisModalOpen(true);
  };

  // Open Edit QRIS Modal
  const handleOpenEditQris = (qris: CanteenQrisProfile) => {
    setEditingQris(qris);
    setQrisForm({
      label: qris.label,
      bankOrProvider: qris.bankOrProvider || "BCA",
      nmid: qris.nmid,
      imageSourceType: "UPLOAD",
      imageUrl: qris.imageUrl,
      uploadedFileName: qris.imageUrl.startsWith("data:") ? "Gambar Terupload" : "",
      isActive: qris.isActive,
    });
    setIsQrisModalOpen(true);
  };

  // Save Add/Edit QRIS
  const handleSaveQris = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrisForm.label.trim()) {
      showToast("Label nama QRIS wajib diisi", "error");
      return;
    }
    if (!qrisForm.nmid.trim()) {
      showToast("Nomor NMID QRIS wajib diisi", "error");
      return;
    }
    if (!qrisForm.imageUrl) {
      showToast("Gambar barcode QRIS wajib diunggah atau dipilih", "error");
      return;
    }

    if (editingQris) {
      updateQrisProfile(editingQris.id, {
        label: qrisForm.label,
        bankOrProvider: qrisForm.bankOrProvider,
        nmid: qrisForm.nmid,
        imageUrl: qrisForm.imageUrl,
        isActive: qrisForm.isActive,
      });
    } else {
      addQrisProfile({
        label: qrisForm.label,
        bankOrProvider: qrisForm.bankOrProvider,
        nmid: qrisForm.nmid,
        imageUrl: qrisForm.imageUrl,
        isActive: qrisForm.isActive,
      });
    }

    setIsQrisModalOpen(false);
  };

  // Confirm Delete QRIS
  const handleConfirmDeleteQris = () => {
    if (!qrisToDelete) return;
    deleteQrisProfile(qrisToDelete.id);
    setQrisToDelete(null);
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      {/* Top Banner: Employee App Connection Notice */}
      <div className="bg-gradient-to-r from-[#4A3AFF]/10 via-[#F5F3FF] to-[#E6F9F0] p-4.5 rounded-[22px] border border-[#E6E3F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#4A3AFF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4A3AFF]/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#1C1B3A]">
                Sinkronisasi Langsung ke Aplikasi Karyawan
              </h3>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                ✓ Terhubung Mobile App
              </span>
            </div>
            <p className="text-[11px] text-[#6F6B88] mt-0.5">
              Informasi profil stand kantin, status buka/tutup, dan barcode QRIS aktif di halaman ini akan otomatis muncul di menu kantin aplikasi karyawan PT BIT dan kasir POS.
            </p>
          </div>
        </div>
      </div>

      {/* 1. STATUS BUKA / TUTUP STAND */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#1C1B3A]">Status Operasional Stand</h3>
            <p className="text-[11px] text-[#6F6B88]">
              Atur apakah stand sedang aktif menerima pesanan karyawan saat ini.
            </p>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              formData.isOpen
                ? "bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0]"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {formData.isOpen ? "🟢 Stand Sedang Buka" : "🔴 Stand Tutup Sementara"}
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#FAFAFC] border border-[#E6E3F7]">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#1C1B3A]">Terima Pesanan Masuk (Buka)</p>
            <p className="text-[11px] text-[#6F6B88]">
              Jika dinonaktifkan, karyawan tidak dapat membuat pesanan baru ke stand ini di aplikasi mereka.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isOpen}
              onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2DBA7D]"></div>
          </label>
        </div>
      </div>

      {/* 2. INFORMASI PROFIL & KONTAK STAND */}
      <form onSubmit={handleStoreInfoSubmit} className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#1C1B3A]">Informasi &amp; Profil Stand Kantin</h3>
            <p className="text-[11px] text-[#6F6B88]">
              Data identitas stand yang ditampilkan kepada pembeli.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isStoreInfoSaved && (
              <span className="text-xs font-bold text-[#2DBA7D] flex items-center gap-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>Tersimpan!</span>
              </span>
            )}
            <button
              type="submit"
              className="py-2 px-4 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1C1B3A]">Nama Stand Kantin *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1C1B3A]">Kategori Usaha / Kuliner *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              placeholder="Contoh: Masakan Nusantara & Aneka Nasi"
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-bold text-[#1C1B3A]">Deskripsi / Slogan Stand Kantin</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tuliskan deskripsi singkat mengenai menu andalan atau keunggulan stand Anda..."
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1C1B3A] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4A3AFF]" />
              <span>Lokasi Stand di Area PT BIT *</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="Contoh: Kantin Utama - Stand 01 (Lantai 1)"
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1C1B3A] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4A3AFF]" />
              <span>Jam Operasional Stand *</span>
            </label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              required
              placeholder="Contoh: 07:30 - 16:30 WIB"
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1C1B3A] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2DBA7D]" />
              <span>No. WhatsApp Stand (Untuk Karyawan)</span>
            </label>
            <input
              type="text"
              value={formData.whatsappContact}
              onChange={(e) => setFormData({ ...formData, whatsappContact: e.target.value })}
              placeholder="0812-xxxx-xxxx"
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1C1B3A]">No. Telepon / HP Utama</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0812-xxxx-xxxx"
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>
        </div>
      </form>

      {/* 3. MANAJEMEN MULTI-QRIS STAND (MAKSIMAL 3 QRIS, UPLOAD & ACTIVE SWITCHER) */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs space-y-4">
        {/* Header with Counter & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-xs border border-red-200">
                <QrCode className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1B3A]">
                Manajemen Barcode QRIS Stand
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  qrisProfiles.length >= 3
                    ? "bg-[#FFF4E5] text-[#D97706] border-[#FDE68A]"
                    : "bg-[#E6F9F0] text-[#2DBA7D] border-[#A7F3D0]"
                }`}
              >
                {qrisProfiles.length} / 3 Barcode Terdaftar
              </span>
            </div>
            <p className="text-[11px] text-[#6F6B88] mt-1">
              Daftarkan hingga <strong>maksimal 3 barcode QRIS</strong> untuk stand Anda. Pilih 1 barcode yang berstatus <strong>AKTIF</strong> untuk ditampilkan saat transaksi kasir POS &amp; aplikasi karyawan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddQris}
            disabled={qrisProfiles.length >= 3}
            className={`py-2 px-4 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              qrisProfiles.length >= 3
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white shadow-xs active:scale-[0.98]"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah QRIS Baru</span>
          </button>
        </div>

        {/* Multi-QRIS Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrisProfiles.map((qris) => {
            const isCurrentlyActive = qris.isActive;

            return (
              <div
                key={qris.id}
                className={`rounded-[20px] border p-4 transition-all flex flex-col justify-between space-y-3.5 ${
                  isCurrentlyActive
                    ? "bg-gradient-to-b from-[#F5F3FF]/70 to-white border-[#4A3AFF] shadow-md shadow-[#4A3AFF]/10 ring-2 ring-[#4A3AFF]/20"
                    : "bg-[#FAFAFC] border-[#E6E3F7] hover:border-[#4A3AFF]/40"
                }`}
              >
                {/* Card Top: Status Badge & Actions */}
                <div className="flex items-center justify-between gap-2">
                  {isCurrentlyActive ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2DBA7D] animate-pulse" />
                      <span>Aktif di POS &amp; App</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      Non-Aktif
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setZoomedQris(qris)}
                      title="Lihat Layar Penuh"
                      className="w-7 h-7 rounded-full bg-white hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#4A3AFF] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditQris(qris)}
                      title="Edit QRIS"
                      className="w-7 h-7 rounded-full bg-white hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#4A3AFF] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrisToDelete(qris)}
                      disabled={qrisProfiles.length <= 1}
                      title={
                        qrisProfiles.length <= 1
                          ? "Stand harus memiliki minimal 1 QRIS"
                          : "Hapus QRIS"
                      }
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                        qrisProfiles.length <= 1
                          ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                          : "bg-white hover:bg-red-50 text-[#6F6B88] hover:text-red-600 border-[#E6E3F7] cursor-pointer"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* QRIS Image Thumbnail */}
                <div
                  onClick={() => setZoomedQris(qris)}
                  className="relative w-full h-44 bg-white rounded-[14px] p-2 border border-[#E6E3F7] shadow-2xs flex items-center justify-center overflow-hidden cursor-pointer group"
                >
                  <Image
                    src={qris.imageUrl || "/images/qris-example.jpg"}
                    alt={qris.label}
                    fill
                    sizes="220px"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs backdrop-blur-2xs">
                    <Eye className="w-4 h-4" />
                    <span>Klik Perbesar</span>
                  </div>
                </div>

                {/* Details info */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-[#1C1B3A] truncate">{qris.label}</p>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7] shrink-0">
                      {qris.bankOrProvider || "BCA"}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-[#4A3AFF]">
                    NMID: {qris.nmid}
                  </p>
                </div>

                {/* Card Bottom: Switcher Button */}
                <div className="pt-1">
                  {isCurrentlyActive ? (
                    <div className="w-full py-2 px-3 rounded-full bg-[#E6F9F0] border border-[#A7F3D0] text-[#2DBA7D] font-bold text-[11px] flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Sedang Aktif Digunakan</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveQris(qris.id)}
                      className="w-full py-2 px-3 rounded-full bg-white hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white border border-[#4A3AFF] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pilih Sebagai QRIS Aktif</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage Guidance Note */}
        <div className="p-3.5 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] flex items-start gap-2.5 text-xs text-[#6F6B88]">
          <ShieldCheck className="w-4 h-4 text-[#4A3AFF] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#1C1B3A]">
              Pencairan Dana Otomatis &amp; Validasi Settlement:
            </p>
            <p className="text-[11px]">
              Pastikan barcode QRIS yang Anda upload terdaftar resmi di Bank Indonesia (NMID Valid). Rekening penampungan QRIS sebaiknya sinkron dengan rekening pencairan stand di koperasi agar memudahkan rekonsiliasi kasir.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH / EDIT BARCODE QRIS (UPLOAD FILE & PRESET)               */}
      {/* ========================================================================= */}
      {isQrisModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Fixed) */}
            <div className="flex items-center justify-between border-b border-[#E6E3F7] px-5 py-3.5 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1B3A]">
                    {editingQris ? "Edit Barcode QRIS Stand" : "Tambah Barcode QRIS Baru"}
                  </h3>
                  <p className="text-[10.5px] text-[#6F6B88]">
                    Unggah file gambar barcode atau pilih preset standar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrisModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable Form) */}
            <form
              id="qris-modal-form"
              onSubmit={handleSaveQris}
              className="px-5 py-4 overflow-y-auto flex-1 space-y-3.5 text-xs"
            >
              {/* Row 1: Label & Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Label / Nama QRIS *</label>
                  <input
                    type="text"
                    value={qrisForm.label}
                    onChange={(e) => setQrisForm({ ...qrisForm, label: e.target.value })}
                    required
                    placeholder="Contoh: QRIS Utama BCA"
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Bank / Penyedia QRIS *</label>
                  <select
                    value={qrisForm.bankOrProvider}
                    onChange={(e) => setQrisForm({ ...qrisForm, bankOrProvider: e.target.value })}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
                  >
                    {bankOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: NMID */}
              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Nomor NMID Resmi Stand *</label>
                <input
                  type="text"
                  value={qrisForm.nmid}
                  onChange={(e) => setQrisForm({ ...qrisForm, nmid: e.target.value })}
                  required
                  placeholder="Contoh: ID1020039281920"
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs font-mono font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              {/* Row 3: Image Source Tabs (Upload & Preset Only) */}
              <div className="space-y-2">
                <label className="font-bold text-[#1C1B3A]">Pilih Sumber Gambar QRIS:</label>
                <div className="flex rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setQrisForm({ ...qrisForm, imageSourceType: "UPLOAD" })}
                    className={`flex-1 py-1.5 px-3 rounded-[8px] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      qrisForm.imageSourceType === "UPLOAD"
                        ? "bg-[#4A3AFF] text-white shadow-xs"
                        : "text-[#6F6B88] hover:text-[#1C1B3A]"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File Gambar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrisForm({ ...qrisForm, imageSourceType: "PRESET" })}
                    className={`flex-1 py-1.5 px-3 rounded-[8px] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      qrisForm.imageSourceType === "PRESET"
                        ? "bg-[#4A3AFF] text-white shadow-xs"
                        : "text-[#6F6B88] hover:text-[#1C1B3A]"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Preset Bawaan</span>
                  </button>
                </div>

                {/* Option 1: File Upload (Drag and drop / File Picker) */}
                {qrisForm.imageSourceType === "UPLOAD" && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-[16px] border-2 border-dashed text-center cursor-pointer transition-all space-y-2 ${
                      isDraggingFile
                        ? "border-[#4A3AFF] bg-[#F5F3FF]"
                        : "border-[#E6E3F7] bg-[#FAFAFC] hover:border-[#4A3AFF]/50 hover:bg-[#F5F3FF]/40"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                    />
                    <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] mx-auto flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#1C1B3A]">
                        Klik untuk memilih file gambar atau tarik ke sini
                      </p>
                      <p className="text-[10.5px] text-[#6F6B88] mt-0.5">
                        Mendukung format PNG, JPG, JPEG, atau WEBP (Maksimal 5MB)
                      </p>
                    </div>
                    {qrisForm.uploadedFileName && (
                      <span className="inline-block text-[10.5px] font-bold text-[#2DBA7D] bg-[#E6F9F0] px-3 py-1 rounded-full border border-[#A7F3D0]">
                        ✓ File dipilih: {qrisForm.uploadedFileName}
                      </span>
                    )}
                  </div>
                )}

                {/* Option 2: Preset Picker */}
                {qrisForm.imageSourceType === "PRESET" && (
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {availableQrisPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setQrisForm({
                            ...qrisForm,
                            imageUrl: preset.url,
                            bankOrProvider: preset.bank,
                          })
                        }
                        className={`p-2.5 rounded-[12px] border text-left flex items-center justify-between transition-all cursor-pointer ${
                          qrisForm.imageUrl === preset.url
                            ? "bg-[#F5F3FF] border-[#4A3AFF] text-[#4A3AFF]"
                            : "bg-[#FAFAFC] border-[#E6E3F7] text-[#1C1B3A] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <QrCode className="w-4 h-4 text-[#4A3AFF]" />
                          <div>
                            <p className="text-xs font-bold">{preset.label}</p>
                            <p className="text-[10px] text-[#6F6B88]">Bank: {preset.bank}</p>
                          </div>
                        </div>
                        {qrisForm.imageUrl === preset.url && (
                          <CheckCircle2 className="w-4 h-4 text-[#4A3AFF]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Box */}
              <div className="bg-[#FAFAFC] rounded-[16px] border border-[#E6E3F7] p-3 flex items-center gap-3">
                <div className="relative w-14 h-16 bg-white rounded-[10px] border border-[#E6E3F7] p-1 shrink-0 overflow-hidden">
                  <Image
                    src={qrisForm.imageUrl || "/images/qris-example.jpg"}
                    alt="Preview QRIS"
                    fill
                    sizes="70px"
                    className="object-contain p-0.5"
                  />
                </div>
                <div className="text-xs space-y-0.5 min-w-0 flex-1">
                  <p className="font-bold text-[#1C1B3A] truncate">
                    {qrisForm.label || "Nama QRIS"}
                  </p>
                  <p className="text-[10.5px] font-mono font-bold text-[#4A3AFF]">
                    NMID: {qrisForm.nmid || "ID10200..."}
                  </p>
                  <p className="text-[10px] text-[#6F6B88]">Penyedia: {qrisForm.bankOrProvider}</p>
                </div>
              </div>

              {/* Toggle: Make Active Immediately */}
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F3FF] border border-[#E6E3F7]">
                <div>
                  <p className="font-bold text-[#1C1B3A]">Jadikan QRIS Aktif</p>
                  <p className="text-[10.5px] text-[#6F6B88]">
                    Tampilkan barcode ini saat transaksi kasir POS &amp; aplikasi karyawan
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qrisForm.isActive}
                    onChange={(e) => setQrisForm({ ...qrisForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2DBA7D]"></div>
                </label>
              </div>
            </form>

            {/* Modal Footer Actions (Fixed at bottom) */}
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-t border-[#E6E3F7] bg-[#FAFAFC] shrink-0">
              <button
                type="button"
                onClick={() => setIsQrisModalOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-white border border-[#E6E3F7] hover:bg-gray-100 text-[#6F6B88] font-bold text-xs cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="qris-modal-form"
                className="flex-1 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-[0.98]"
              >
                {editingQris ? "Simpan Perubahan" : "Tambahkan QRIS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KONFIRMASI HAPUS QRIS                                           */}
      {/* ========================================================================= */}
      {qrisToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-sm p-5 space-y-3.5">
            <div className="flex items-center gap-2.5 text-red-600">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[#1C1B3A]">Hapus Barcode QRIS</h3>
            </div>

            <p className="text-xs text-[#6F6B88]">
              Apakah Anda yakin ingin menghapus barcode QRIS <strong>&ldquo;{qrisToDelete.label}&rdquo;</strong> (NMID: {qrisToDelete.nmid})?
            </p>

            {qrisToDelete.isActive && (
              <p className="text-[11px] text-[#D97706] bg-[#FFF4E5] p-2.5 rounded-[10px] border border-[#FDE68A]">
                ⚠️ QRIS ini sedang aktif. Jika dihapus, barcode lain yang tersisa akan otomatis dijadikan aktif.
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQrisToDelete(null)}
                className="flex-1 py-2 rounded-full bg-white border border-[#E6E3F7] text-[#6F6B88] font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQris}
                className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ZOOM PRATINJAU QRIS LAYAR PENUH                                  */}
      {/* ========================================================================= */}
      {zoomedQris && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col p-5 sm:p-6 space-y-3.5 text-center overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3 shrink-0">
              <div className="text-left">
                <h3 className="text-sm font-bold text-[#1C1B3A]">{zoomedQris.label}</h3>
                <p className="text-[10.5px] text-[#6F6B88]">{currentTenant.name} • {zoomedQris.bankOrProvider}</p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedQris(null)}
                className="w-7 h-7 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-56 sm:w-64 h-72 sm:h-80 mx-auto bg-white rounded-[16px] p-2 shadow-inner border border-[#E6E3F7] flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src={zoomedQris.imageUrl || "/images/qris-example.jpg"}
                alt={zoomedQris.label}
                fill
                sizes="280px"
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="space-y-0.5 shrink-0">
              <p className="text-xs font-mono font-bold text-[#4A3AFF]">NMID: {zoomedQris.nmid}</p>
              <p className="text-[10px] text-[#A5A2B8]">
                Mendukung pembayaran dari seluruh aplikasi m-Banking &amp; e-Wallet nasional.
              </p>
            </div>

            <div className="pt-1 shrink-0">
              <button
                type="button"
                onClick={() => setZoomedQris(null)}
                className="w-full py-2.5 rounded-full bg-[#1C1B3A] hover:bg-black text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
