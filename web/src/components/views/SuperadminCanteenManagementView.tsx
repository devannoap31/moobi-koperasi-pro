"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  ExternalLink,
  Plus,
  Edit3,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Send,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  sampleCanteenTenants,
  sampleEmployeeCanteenActivities,
  sampleCanteenSettlements,
  sampleProducts,
} from "@/data/mockData";
import {
  CanteenTenant,
  TenantStatus,
  EmployeeCanteenActivity,
  CanteenSettlement,
} from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export const SuperadminCanteenManagementView: React.FC = () => {
  // Active Tab: "TENANTS" | "ACTIVITIES" | "SETTLEMENT" | "SETTINGS"
  const [activeTab, setActiveTab] = useState<"TENANTS" | "ACTIVITIES" | "SETTLEMENT" | "SETTINGS">("TENANTS");

  // Tenants State
  const [tenants, setTenants] = useState<CanteenTenant[]>(sampleCanteenTenants);
  const [tenantStatusFilter, setTenantStatusFilter] = useState<string>("ALL");
  const [tenantSearchTerm, setTenantSearchTerm] = useState("");
  const debouncedTenantSearch = useDebounce(tenantSearchTerm, 300);

  // Modal States
  const [selectedTenantForAction, setSelectedTenantForAction] = useState<CanteenTenant | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE" | "DELETE" | "DETAIL" | null>(null);
  const [actionNote, setActionNote] = useState("");

  // Employee Activities State
  const [activities, setActivities] = useState<EmployeeCanteenActivity[]>(sampleEmployeeCanteenActivities);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const debouncedActivitySearch = useDebounce(activitySearchTerm, 300);
  const [activityPaymentFilter, setActivityPaymentFilter] = useState<string>("ALL");
  const [activityTenantFilter, setActivityTenantFilter] = useState<string>("ALL");

  // Settlements State
  const [settlements, setSettlements] = useState<CanteenSettlement[]>(sampleCanteenSettlements);

  // Broadcast Message State (Ide Tambahan)
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics Calculation
  const totalTenantsCount = tenants.length;
  const activeTenantsCount = tenants.filter((t) => t.status === "ACTIVE").length;
  const pendingTenantsCount = tenants.filter((t) => t.status === "PENDING_APPROVAL").length;
  const suspendedTenantsCount = tenants.filter((t) => t.status === "SUSPENDED").length;

  const totalCanteenRevenue = tenants.reduce((acc, t) => acc + t.totalRevenue, 0);
  const totalPendingSettlement = tenants.reduce((acc, t) => acc + t.pendingSettlement, 0);

  // Filter Tenants
  const filteredTenants = tenants.filter((t) => {
    const matchStatus = tenantStatusFilter === "ALL" || t.status === tenantStatusFilter;
    const matchSearch =
      !debouncedTenantSearch.trim() ||
      t.name.toLowerCase().includes(debouncedTenantSearch.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(debouncedTenantSearch.toLowerCase()) ||
      t.location.toLowerCase().includes(debouncedTenantSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(debouncedTenantSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filter Activities
  const filteredActivities = activities.filter((act) => {
    const matchPayment = activityPaymentFilter === "ALL" || act.paymentMethod === activityPaymentFilter;
    const matchTenant = activityTenantFilter === "ALL" || act.tenantId === activityTenantFilter;
    const matchSearch =
      !debouncedActivitySearch.trim() ||
      act.employeeName.toLowerCase().includes(debouncedActivitySearch.toLowerCase()) ||
      act.employeeNik.toLowerCase().includes(debouncedActivitySearch.toLowerCase()) ||
      act.tenantName.toLowerCase().includes(debouncedActivitySearch.toLowerCase()) ||
      act.itemsSummary.toLowerCase().includes(debouncedActivitySearch.toLowerCase());
    return matchPayment && matchTenant && matchSearch;
  });

  // Handle Tenant Actions
  const handleOpenActionModal = (
    tenant: CanteenTenant,
    type: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE" | "DELETE" | "DETAIL"
  ) => {
    setSelectedTenantForAction(tenant);
    setActionType(type);
    setActionNote("");
  };

  const handleExecuteTenantAction = () => {
    if (!selectedTenantForAction || !actionType) return;

    if (actionType === "APPROVE") {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === selectedTenantForAction.id
            ? { ...t, status: "ACTIVE", notes: actionNote || "Disetujui oleh Superadmin Kopkar BIT" }
            : t
        )
      );
      showToast(`Stand "${selectedTenantForAction.name}" berhasil disetujui & aktif!`);
    } else if (actionType === "REJECT") {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === selectedTenantForAction.id
            ? { ...t, status: "REJECTED", notes: actionNote || "Pengajuan ditolak oleh Superadmin" }
            : t
        )
      );
      showToast(`Pengajuan "${selectedTenantForAction.name}" telah ditolak.`, "info");
    } else if (actionType === "SUSPEND") {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === selectedTenantForAction.id
            ? { ...t, status: "SUSPENDED", notes: actionNote || "Dibekukan sementara oleh Superadmin" }
            : t
        )
      );
      showToast(`Akun stand "${selectedTenantForAction.name}" telah dibekukan sementara.`, "error");
    } else if (actionType === "REACTIVATE") {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === selectedTenantForAction.id
            ? { ...t, status: "ACTIVE", notes: "Diaktifkan kembali oleh Superadmin" }
            : t
        )
      );
      showToast(`Akun stand "${selectedTenantForAction.name}" telah diaktifkan kembali!`);
    } else if (actionType === "DELETE") {
      setTenants((prev) => prev.filter((t) => t.id !== selectedTenantForAction.id));
      showToast(`Data stand "${selectedTenantForAction.name}" berhasil dihapus dari sistem.`, "info");
    }

    setActionType(null);
    setSelectedTenantForAction(null);
  };

  // Handle Process Settlement Batch
  const handleProcessSettlement = (settlementId: string) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === settlementId
          ? {
              ...s,
              status: "PROCESSED",
              processedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            }
          : s
      )
    );
    showToast("Settlement dana ke rekening pemilik kantin berhasil diproses!");
  };

  // Handle Send Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    showToast("Pengumuman berhasil disiarkan ke seluruh stand mitra kantin!");
    setTimeout(() => {
      setBroadcastMessage("");
      setBroadcastSent(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div
            className={`py-3 px-4 rounded-[14px] shadow-2xl border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-[#1C1B3A] text-white border-white/10"
                : toastMessage.type === "error"
                ? "bg-red-600 text-white border-red-700"
                : "bg-[#4A3AFF] text-white border-[#4A3AFF]"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#2DBA7D]" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-white" />}
            {toastMessage.type === "info" && <AlertCircle className="w-4 h-4 text-white" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. HEADER & EXECUTIVE METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1B3A] tracking-tight">
              Kelola Mitra Kantin &amp; Monitoring Payroll
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
              Multi-Tenant Kopkar
            </span>
          </div>
          <p className="text-xs text-[#6F6B88] mt-0.5">
            Pusat persetujuan akun stand kantin, pengawasan arus kas belanja karyawan, dan jadwal settlement potong gaji.
          </p>
        </div>

        {/* Quick Portal Switch Link */}
        <Link
          href="/canteen-portal/login"
          target="_blank"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#4A3AFF] font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Buka Portal Mitra Kantin</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total & Active Tenants */}
        <div className="bg-white p-4.5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Total Mitra Stand</span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#1C1B3A]">
            {activeTenantsCount}{" "}
            <span className="text-xs font-normal text-[#6F6B88]">/ {totalTenantsCount} Stand</span>
          </p>
          <div className="flex items-center gap-1.5 text-[10.5px]">
            <span className="text-[#2DBA7D] font-bold">{activeTenantsCount} Stand Aktif</span>
            {suspendedTenantsCount > 0 && (
              <span className="text-red-500 font-medium">• {suspendedTenantsCount} Dibekukan</span>
            )}
          </div>
        </div>

        {/* Card 2: Pending Approval */}
        <div className="bg-white p-4.5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Menunggu Persetujuan</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#D97706]">{pendingTenantsCount} Pengajuan</p>
          <p className="text-[10.5px] text-[#6F6B88]">
            {pendingTenantsCount > 0
              ? "Perlu diverifikasi oleh Superadmin"
              : "Semua pengajuan telah diproses"}
          </p>
        </div>

        {/* Card 3: Total Omzet Seluruh Kantin */}
        <div className="bg-white p-4.5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Omzet Seluruh Stand</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#1C1B3A]">
            Rp {(totalCanteenRevenue / 1000000).toFixed(1)} Jt
          </p>
          <p className="text-[10.5px] text-[#2DBA7D]">Akumulasi omzet mitra kantin</p>
        </div>

        {/* Card 4: Tanggal Cutoff & Pending Settlement */}
        <div className="bg-white p-4.5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F6B88]">Jatuh Tempo Cutoff</span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#4A3AFF]">25 Setiap Bulan</p>
          <p className="text-[10.5px] text-[#6F6B88]">
            Pending Settlement: <strong>Rp {(totalPendingSettlement / 1000000).toFixed(1)} Jt</strong>
          </p>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E6E3F7] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("TENANTS")}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "TENANTS"
              ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Daftar Akun Mitra Kantin ({tenants.length})</span>
          {pendingTenantsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#FFB547] text-[#1C1B3A] text-[9px] font-bold flex items-center justify-center">
              {pendingTenantsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ACTIVITIES")}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ACTIVITIES"
              ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Monitoring Transaksi Karyawan</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTLEMENT")}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "SETTLEMENT"
              ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Arus Kas &amp; Settlement Payroll</span>
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "SETTINGS"
              ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
              : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bagi Hasil &amp; Broadcast Mitra</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KELOLA AKUN MITRA KANTIN (MULTI-TENANT APPROVAL & MANAGEMENT)      */}
      {/* ========================================================================= */}
      {activeTab === "TENANTS" && (
        <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-sm space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-3.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setTenantStatusFilter("ALL")}
                className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                  tenantStatusFilter === "ALL"
                    ? "bg-[#4A3AFF] text-white"
                    : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                }`}
              >
                Semua ({tenants.length})
              </button>
              <button
                onClick={() => setTenantStatusFilter("PENDING_APPROVAL")}
                className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                  tenantStatusFilter === "PENDING_APPROVAL"
                    ? "bg-[#FFB547] text-[#1C1B3A]"
                    : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                }`}
              >
                Menunggu Persetujuan ({pendingTenantsCount})
              </button>
              <button
                onClick={() => setTenantStatusFilter("ACTIVE")}
                className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                  tenantStatusFilter === "ACTIVE"
                    ? "bg-[#2DBA7D] text-white"
                    : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                }`}
              >
                Aktif ({activeTenantsCount})
              </button>
              <button
                onClick={() => setTenantStatusFilter("SUSPENDED")}
                className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                  tenantStatusFilter === "SUSPENDED"
                    ? "bg-red-600 text-white"
                    : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                }`}
              >
                Dibekukan ({suspendedTenantsCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#6F6B88] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari stand, pemilik, lokasi..."
                value={tenantSearchTerm}
                onChange={(e) => setTenantSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
                <tr>
                  <th className="py-3 px-3">Nama Stand &amp; Kategori</th>
                  <th className="py-3 px-3">Pemilik &amp; Kontak</th>
                  <th className="py-3 px-3">Lokasi Stand</th>
                  <th className="py-3 px-3">Rekening Pencairan</th>
                  <th className="py-3 px-3">Status Akun</th>
                  <th className="py-3 px-3 text-right">Aksi Superadmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E3F7]">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] overflow-hidden relative shrink-0 flex items-center justify-center">
                          {t.avatarUrl ? (
                            <Image
                              src={t.avatarUrl}
                              alt={t.name}
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <Store className="w-5 h-5 text-[#4A3AFF]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1C1B3A]">{t.name}</p>
                          <p className="text-[10.5px] text-[#6F6B88]">{t.category}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-[#1C1B3A]">{t.ownerName}</p>
                      <p className="text-[10px] text-[#6F6B88]">{t.phone}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-[#1C1B3A]">
                        <MapPin className="w-3 h-3 text-[#4A3AFF]" />
                        {t.location}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-[#1C1B3A]">{t.bankName}</p>
                      <p className="text-[10px] text-[#6F6B88]">{t.bankAccountNumber}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.status === "ACTIVE"
                            ? "bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0]"
                            : t.status === "PENDING_APPROVAL"
                            ? "bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]"
                            : t.status === "SUSPENDED"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.status === "ACTIVE"
                          ? "✓ Aktif"
                          : t.status === "PENDING_APPROVAL"
                          ? "⏳ Menunggu Approval"
                          : t.status === "SUSPENDED"
                          ? "🚫 Dibekukan"
                          : "Ditolak"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approval Buttons for PENDING */}
                        {t.status === "PENDING_APPROVAL" && (
                          <>
                            <button
                              onClick={() => handleOpenActionModal(t, "APPROVE")}
                              title="Setujui Pengajuan Stand"
                              className="py-1 px-2.5 rounded-full bg-[#2DBA7D] hover:bg-[#259b67] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(t, "REJECT")}
                              title="Tolak Pengajuan Stand"
                              className="py-1 px-2.5 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>Tolak</span>
                            </button>
                          </>
                        )}

                        {/* Actions for ACTIVE */}
                        {t.status === "ACTIVE" && (
                          <button
                            onClick={() => handleOpenActionModal(t, "SUSPEND")}
                            title="Bekukan Akun Stand (Nonaktifkan Sementara)"
                            className="py-1 px-2.5 rounded-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Bekukan</span>
                          </button>
                        )}

                        {/* Actions for SUSPENDED */}
                        {t.status === "SUSPENDED" && (
                          <button
                            onClick={() => handleOpenActionModal(t, "REACTIVATE")}
                            title="Aktifkan Kembali Akun Stand"
                            className="py-1 px-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Aktifkan</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleOpenActionModal(t, "DELETE")}
                          title="Hapus Data Akun Stand"
                          className="p-1.5 rounded-full hover:bg-red-50 text-[#A5A2B8] hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONITORING AKTIVITAS TRANSAKSI KARYAWAN                            */}
      {/* ========================================================================= */}
      {activeTab === "ACTIVITIES" && (
        <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-3.5">
            <div>
              <h2 className="text-sm font-bold text-[#1C1B3A]">
                Log Transaksi &amp; Arus Kas Belanja Karyawan
              </h2>
              <p className="text-xs text-[#6F6B88]">
                Pantau seluruh aktivitas belanja karyawan di berbagai mitra kantin secara transparan.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={activityTenantFilter}
                onChange={(e) => setActivityTenantFilter(e.target.value)}
                className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-1.5 text-xs text-[#1C1B3A]"
              >
                <option value="ALL">Semua Stand Kantin</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={activityPaymentFilter}
                onChange={(e) => setActivityPaymentFilter(e.target.value)}
                className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-1.5 text-xs text-[#1C1B3A]"
              >
                <option value="ALL">Semua Metode Pembayaran</option>
                <option value="POTONG_GAJI">Potong Gaji Payroll</option>
                <option value="SALDO_KOPERASI">Saldo Koperasi</option>
                <option value="QRIS_TUNAI">QRIS / Tunai</option>
              </select>
            </div>
          </div>

          {/* Activities Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
                <tr>
                  <th className="py-3 px-3">Waktu Belanja</th>
                  <th className="py-3 px-3">Identitas Karyawan</th>
                  <th className="py-3 px-3">Stand Kantin</th>
                  <th className="py-3 px-3">Item yang Dibeli</th>
                  <th className="py-3 px-3">Total Belanja</th>
                  <th className="py-3 px-3">Metode Bayar</th>
                  <th className="py-3 px-3">Jatuh Tempo Cutoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E3F7]">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                    <td className="py-3 px-3 text-[#6F6B88] whitespace-nowrap">
                      {act.transactionTime}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-[#1C1B3A]">{act.employeeName}</p>
                      <p className="text-[10px] text-[#6F6B88]">
                        NIK: {act.employeeNik} • {act.department}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-semibold text-[#1C1B3A]">
                      {act.tenantName}
                    </td>

                    <td className="py-3 px-3 text-[#1C1B3A] max-w-xs truncate">
                      {act.itemsSummary}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-[#4A3AFF]">
                        Rp {act.totalAmount.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[10px] text-[#2DBA7D] block">
                        Hemat: Rp {act.memberSavings.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          act.paymentMethod === "POTONG_GAJI"
                            ? "bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]"
                            : act.paymentMethod === "SALDO_KOPERASI"
                            ? "bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0]"
                            : "bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]"
                        }`}
                      >
                        {act.paymentMethod === "POTONG_GAJI"
                          ? "Auto Payroll"
                          : act.paymentMethod === "SALDO_KOPERASI"
                          ? "Saldo Simpanan"
                          : "QRIS/Tunai"}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-[#4A3AFF]" />
                        <span className="font-semibold text-[#1C1B3A]">{act.payrollCutoffDate}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ARUS KAS & SETTLEMENT PAYROLL KE MITRA KANTIN                      */}
      {/* ========================================================================= */}
      {activeTab === "SETTLEMENT" && (
        <div className="space-y-6">
          {/* Explanation Box of Fund Flow */}
          <div className="bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] rounded-[20px] border border-[#E6E3F7] p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4A3AFF]">
              <ShieldCheck className="w-4 h-4" />
              <span>Mekanisme Arus Kas &amp; Settlement Potong Gaji Kopkar BIT</span>
            </div>
            <p className="text-xs text-[#1C1B3A] leading-relaxed">
              1. <strong>Karyawan Belanja</strong>: Transaksi dicatat sebagai piutang tagihan payroll anggota.<br />
              2. <strong>Cutoff Payroll (Tgl 25)</strong>: Sistem otomatis memotong tagihan belanja kantin dari gaji bulanan karyawan.<br />
              3. <strong>Settlement ke Mitra Stand</strong>: Koperasi mencairkan dana hasil penjualan ke rekening bank masing-masing pemilik stand setelah dikurangi iuran platform 1%.
            </p>
          </div>

          {/* Settlement Batches Table */}
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1C1B3A]">
                  Rekapitulasi Settlement Dana ke Pemilik Stand
                </h3>
                <p className="text-xs text-[#6F6B88]">
                  Pencairan dana hasil penjualan dari rekening kas Koperasi ke rekening bank pemilik kantin.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
                  <tr>
                    <th className="py-3 px-3">Periode &amp; Stand</th>
                    <th className="py-3 px-3">Rekening Bank Tujuan</th>
                    <th className="py-3 px-3">Total Transaksi</th>
                    <th className="py-3 px-3">Omzet Kotor</th>
                    <th className="py-3 px-3">Iuran Kopkar (1%)</th>
                    <th className="py-3 px-3">Dana Bersih Ditransfer</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Eksekusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {settlements.map((stl) => (
                    <tr key={stl.id} className="hover:bg-[#F5F3FF]/40">
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#1C1B3A]">{stl.tenantName}</p>
                        <p className="text-[10.5px] text-[#6F6B88]">{stl.period}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-[#1C1B3A]">{stl.bankName}</p>
                        <p className="text-[10px] text-[#6F6B88]">
                          {stl.bankAccountNumber} (a.n {stl.bankAccountName})
                        </p>
                      </td>

                      <td className="py-3 px-3">{stl.totalTransactions} Transaksi</td>

                      <td className="py-3 px-3 font-semibold text-[#1C1B3A]">
                        Rp {stl.grossRevenue.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3 px-3 text-red-500 font-semibold">
                        -Rp {stl.platformFee.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3 px-3 font-extrabold text-[#4A3AFF]">
                        Rp {stl.netDisbursement.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            stl.status === "PROCESSED"
                              ? "bg-[#E6F9F0] text-[#2DBA7D]"
                              : "bg-[#FFF4E5] text-[#D97706]"
                          }`}
                        >
                          {stl.status === "PROCESSED"
                            ? `✓ Ditransfer (${stl.processedAt})`
                            : "⏳ Siap Ditransfer (Cutoff 25)"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {stl.status === "PENDING" ? (
                          <button
                            onClick={() => handleProcessSettlement(stl.id)}
                            className="py-1.5 px-3 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Transfer Dana
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#2DBA7D] font-bold">Lunas</span>
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

      {/* ========================================================================= */}
      {/* TAB 4: BAGI HASIL & BROADCAST MITRA (IDE TAMBAHAN)                        */}
      {/* ========================================================================= */}
      {activeTab === "SETTINGS" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Broadcast Pengumuman ke Seluruh Mitra Kantin */}
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A3AFF]">
                <Send className="w-4 h-4" />
                <span>Broadcast Pengumuman ke Mitra Stand</span>
              </div>
              <h3 className="text-base font-bold text-[#1C1B3A]">
                Kirim Notifikasi Massal ke Semua Stand
              </h3>
              <p className="text-xs text-[#6F6B88]">
                Kirimkan pengumuman operasional penting (misal: jadwal libur pabrik, maintenance listrik, atau jadwal kebersihan stand).
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Isi Pesan Pengumuman:</label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Contoh: Diberitahukan kepada seluruh pemilik stand kantin bahwa tanggal 17 September operasional pabrik libur nasional..."
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] p-3 text-xs focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <button
                type="submit"
                disabled={!broadcastMessage.trim() || broadcastSent}
                className="py-2.5 px-5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer disabled:bg-gray-300"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Siaran ke {activeTenantsCount} Stand Aktif</span>
              </button>
            </form>
          </div>

          {/* Card 2: Pengaturan Bagi Hasil & Iuran Kas Koperasi */}
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2DBA7D]">
                <DollarSign className="w-4 h-4" />
                <span>Pengaturan Iuran &amp; Bagi Hasil</span>
              </div>
              <h3 className="text-base font-bold text-[#1C1B3A]">
                Iuran Kas Koperasi &amp; Kebersihan Stand
              </h3>
              <p className="text-xs text-[#6F6B88]">
                Pengaturan potongan platform / iuran kebersihan yang otomatis disisihkan untuk kas Kopkar BIT.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1C1B3A]">Persentase Platform Fee / Iuran</p>
                  <p className="text-[10.5px] text-[#6F6B88]">Dipotong dari omzet kotor saat settlement</p>
                </div>
                <span className="font-extrabold text-sm text-[#4A3AFF] bg-[#F5F3FF] px-3 py-1 rounded-full border border-[#E6E3F7]">
                  1.0 %
                </span>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1C1B3A]">Siklus Cutoff Pemotongan Gaji</p>
                  <p className="text-[10.5px] text-[#6F6B88]">Sinkron dengan sistem payroll HRD BIT</p>
                </div>
                <span className="font-bold text-xs text-[#2DBA7D] bg-[#E6F9F0] px-3 py-1 rounded-full border border-[#A7F3D0]">
                  Tgl 25 / Bulan
                </span>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1C1B3A]">Limit Transaksi Kasir POS Tanpa PIN</p>
                  <p className="text-[10.5px] text-[#6F6B88]">Untuk kenyamanan jam makan siang cepat</p>
                </div>
                <span className="font-bold text-xs text-[#1C1B3A]">
                  Rp 100.000 / Transaksi
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTION MODAL (APPROVE / REJECT / SUSPEND / REACTIVATE / DELETE)           */}
      {/* ========================================================================= */}
      {actionType && selectedTenantForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-md p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <div className="flex items-center gap-2">
                {actionType === "APPROVE" && <CheckCircle2 className="w-5 h-5 text-[#2DBA7D]" />}
                {actionType === "REJECT" && <X className="w-5 h-5 text-red-500" />}
                {actionType === "SUSPEND" && <Ban className="w-5 h-5 text-red-500" />}
                {actionType === "REACTIVATE" && <RefreshCw className="w-5 h-5 text-[#4A3AFF]" />}
                {actionType === "DELETE" && <Trash2 className="w-5 h-5 text-red-500" />}
                <h3 className="text-sm font-bold text-[#1C1B3A]">
                  {actionType === "APPROVE" && "Setujui Pendaftaran Stand Kantin"}
                  {actionType === "REJECT" && "Tolak Pendaftaran Stand Kantin"}
                  {actionType === "SUSPEND" && "Bekukan Akun Stand Kantin"}
                  {actionType === "REACTIVATE" && "Aktifkan Kembali Akun Stand"}
                  {actionType === "DELETE" && "Hapus Data Stand Kantin"}
                </h3>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="w-7 h-7 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Tenant Info */}
            <div className="p-3 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-1 text-xs">
              <p className="font-bold text-[#1C1B3A]">{selectedTenantForAction.name}</p>
              <p className="text-[11px] text-[#6F6B88]">
                Pemilik: <strong>{selectedTenantForAction.ownerName}</strong> ({selectedTenantForAction.phone})
              </p>
              <p className="text-[11px] text-[#6F6B88]">
                Lokasi: {selectedTenantForAction.location} • Rekening: {selectedTenantForAction.bankName}{" "}
                {selectedTenantForAction.bankAccountNumber}
              </p>
            </div>

            {/* Confirmation Text / Note input */}
            <div className="space-y-2 text-xs">
              {actionType === "APPROVE" && (
                <p className="text-[#6F6B88]">
                  Setelah disetujui, pemilik stand dapat langsung login dengan username <strong>{selectedTenantForAction.username}</strong> untuk mulai melayani kasir POS dan mengunggah menu makanan.
                </p>
              )}
              {actionType === "SUSPEND" && (
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Alasan Pembekuan Stand:</label>
                  <input
                    type="text"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Contoh: Evaluasi kebersihan stand / evaluasi jam buka"
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2 text-xs"
                  />
                </div>
              )}
              {actionType === "DELETE" && (
                <p className="text-red-600 font-semibold">
                  Peringatan: Tindakan ini akan menghapus seluruh data stand dan produk terkait dari sistem koperasi.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="flex-1 py-2.5 rounded-full bg-white border border-[#E6E3F7] text-[#6F6B88] font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteTenantAction}
                className={`flex-1 py-2.5 rounded-full text-white font-bold text-xs cursor-pointer ${
                  actionType === "APPROVE"
                    ? "bg-[#2DBA7D] hover:bg-[#259b67]"
                    : actionType === "REACTIVATE"
                    ? "bg-[#4A3AFF] hover:bg-[#3D2EE0]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionType === "APPROVE" && "Ya, Setujui Stand"}
                {actionType === "REJECT" && "Ya, Tolak Pengajuan"}
                {actionType === "SUSPEND" && "Ya, Bekukan Akun"}
                {actionType === "REACTIVATE" && "Ya, Aktifkan Kembali"}
                {actionType === "DELETE" && "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
