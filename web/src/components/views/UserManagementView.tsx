"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit3,
  SlidersHorizontal,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LayoutDashboard,
  Users,
  Wallet,
  UtensilsCrossed,
  ReceiptText,
  Landmark,
  Shield,
  Loader2,
  Info,
  X,
  ShoppingBag,
} from "lucide-react";
import { initialUserAccounts, SYSTEM_MODULE_LIST } from "@/data/mockData";
import { UserAccount, UserRole, SystemModuleKey, ModuleAccessLevel } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export const UserManagementView: React.FC = () => {
  // Main State
  const [users, setUsers] = useState<UserAccount[]>(initialUserAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Debounced search for smooth real-time querying
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "ADMIN_KOPERASI" as UserRole,
    department: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    permissions: {
      dashboard: "READ" as ModuleAccessLevel,
      employees: "READ" as ModuleAccessLevel,
      savings_loans: "NONE" as ModuleAccessLevel,
      canteen: "NONE" as ModuleAccessLevel,
      store: "NONE" as ModuleAccessLevel,
      payroll: "NONE" as ModuleAccessLevel,
      bank_channeling: "NONE" as ModuleAccessLevel,
      user_management: "NONE" as ModuleAccessLevel,
    } as Record<SystemModuleKey, ModuleAccessLevel>,
  });

  // Temporary permissions state during Permission Modal editing
  const [tempPermissions, setTempPermissions] = useState<Record<SystemModuleKey, ModuleAccessLevel>>({
    dashboard: "NONE",
    employees: "NONE",
    savings_loans: "NONE",
    canteen: "NONE",
    store: "NONE",
    payroll: "NONE",
    bank_channeling: "NONE",
    user_management: "NONE",
  });

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const query = debouncedSearch.toLowerCase().trim();
    const matchSearch =
      query === "" ||
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.department.toLowerCase().includes(query);

    const matchRole = selectedRole === "ALL" || u.role === selectedRole;
    const matchStatus = selectedStatus === "ALL" || u.status === selectedStatus;

    return matchSearch && matchRole && matchStatus;
  });

  // Role Default Permissions Preset Helper
  const getRolePresetPermissions = (role: UserRole): Record<SystemModuleKey, ModuleAccessLevel> => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          dashboard: "FULL",
          employees: "FULL",
          savings_loans: "FULL",
          canteen: "FULL",
          store: "FULL",
          payroll: "FULL",
          bank_channeling: "FULL",
          user_management: "FULL",
        };
      case "ADMIN_KOPERASI":
        return {
          dashboard: "FULL",
          employees: "FULL",
          savings_loans: "FULL",
          canteen: "FULL",
          store: "FULL",
          payroll: "FULL",
          bank_channeling: "FULL",
          user_management: "NONE",
        };
      case "HR_PAYROLL":
        return {
          dashboard: "READ",
          employees: "FULL",
          savings_loans: "READ",
          canteen: "NONE",
          store: "READ",
          payroll: "FULL",
          bank_channeling: "NONE",
          user_management: "NONE",
        };
      case "PENGELOLA_KANTIN":
        return {
          dashboard: "NONE",
          employees: "READ",
          savings_loans: "NONE",
          canteen: "FULL",
          store: "NONE",
          payroll: "NONE",
          bank_channeling: "NONE",
          user_management: "NONE",
        };
      case "FINANCE_AUDIT":
        return {
          dashboard: "READ",
          employees: "READ",
          savings_loans: "READ",
          canteen: "READ",
          store: "READ",
          payroll: "READ",
          bank_channeling: "READ",
          user_management: "NONE",
        };
      default:
        return {
          dashboard: "READ",
          employees: "READ",
          savings_loans: "NONE",
          canteen: "NONE",
          store: "NONE",
          payroll: "NONE",
          bank_channeling: "NONE",
          user_management: "NONE",
        };
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const defaultRole: UserRole = "ADMIN_KOPERASI";
    setFormData({
      name: "",
      username: "",
      email: "",
      role: defaultRole,
      department: "Operasional Kopkar BIT",
      status: "ACTIVE",
      permissions: getRolePresetPermissions(defaultRole),
    });
    setIsAddModalOpen(true);
  };

  // Handle Role Change in Add Modal to auto-fill preset
  const handleAddRoleChange = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: getRolePresetPermissions(role),
    }));
  };

  // Save New User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      showToast("Harap lengkapi Nama, Username, dan Email!", "error");
      return;
    }

    const usernameClean = formData.username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "");
    const emailClean = formData.email.toLowerCase().trim();

    if (users.some((u) => u.username.toLowerCase() === usernameClean)) {
      showToast(`Username @${usernameClean} sudah digunakan oleh akun lain!`, "error");
      return;
    }

    const newUser: UserAccount = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: formData.name.trim(),
      username: usernameClean,
      email: emailClean,
      role: formData.role,
      department: formData.department || "Karyawan PT Bhakti Idola Tama",
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: "Belum pernah login",
      isRootSuperadmin: false,
      permissions: formData.permissions,
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Akun @${newUser.username} (${newUser.email}) berhasil dibuat!`, "success");
  };

  // Open Edit User Modal
  const handleOpenEditModal = (user: UserAccount) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      permissions: user.permissions,
    });
    setIsEditModalOpen(true);
  };

  // Save Edited User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const usernameClean = formData.username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "");
    const emailClean = formData.email.toLowerCase().trim();

    if (
      usernameClean !== selectedUser.username.toLowerCase() &&
      users.some((u) => u.username.toLowerCase() === usernameClean)
    ) {
      showToast(`Username @${usernameClean} sudah digunakan oleh akun lain!`, "error");
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: formData.name.trim(),
              username: usernameClean,
              email: emailClean,
              role: formData.role,
              department: formData.department,
              status: formData.status,
            }
          : u
      )
    );

    setIsEditModalOpen(false);
    showToast(`Data akun @${usernameClean} berhasil diperbarui!`, "success");
  };

  // Open Permission Modal
  const handleOpenPermissionModal = (user: UserAccount) => {
    setSelectedUser(user);
    setTempPermissions({ ...user.permissions });
    setIsPermissionModalOpen(true);
  };

  // Update permission for a single module
  const handleToggleModulePermission = (modKey: SystemModuleKey, level: ModuleAccessLevel) => {
    setTempPermissions((prev) => ({
      ...prev,
      [modKey]: level,
    }));
  };

  // Apply batch preset in permission modal
  const handleApplyPresetInModal = (level: ModuleAccessLevel) => {
    const updated = {} as Record<SystemModuleKey, ModuleAccessLevel>;
    SYSTEM_MODULE_LIST.forEach((m) => {
      if (m.key === "user_management" && selectedUser?.role !== "SUPER_ADMIN" && level === "FULL") {
        updated[m.key] = "NONE";
      } else {
        updated[m.key] = level;
      }
    });
    setTempPermissions(updated);
  };

  // Save Module Permissions
  const handleSavePermissions = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              permissions: tempPermissions,
            }
          : u
      )
    );

    setIsPermissionModalOpen(false);
    showToast(`Hak akses modul untuk @${selectedUser.username} berhasil disimpan!`, "success");
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (user: UserAccount) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedUser) return;

    if (selectedUser.isRootSuperadmin) {
      showToast("Akun Superadmin Utama terlindungi dan tidak dapat dihapus!", "error");
      setIsDeleteModalOpen(false);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    showToast(`Akun @${selectedUser.username} (${selectedUser.email}) berhasil dihapus dari sistem.`, "info");
  };

  // Helper for Module Icon
  const getModuleIcon = (key: SystemModuleKey) => {
    switch (key) {
      case "dashboard":
        return LayoutDashboard;
      case "employees":
        return Users;
      case "savings_loans":
        return Wallet;
      case "canteen":
        return UtensilsCrossed;
      case "store":
        return ShoppingBag;
      case "payroll":
        return ReceiptText;
      case "bank_channeling":
        return Landmark;
      case "user_management":
        return ShieldCheck;
      default:
        return Shield;
    }
  };

  // Format Role Label & Badge
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
            <Sparkles className="w-3 h-3 text-[#4A3AFF]" />
            Superadmin
          </span>
        );
      case "ADMIN_KOPERASI":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EBF3FE] text-[#2563EB] border border-[#BFDBFE]">
            <Building2 className="w-3 h-3" />
            Admin Koperasi
          </span>
        );
      case "HR_PAYROLL":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F9F0] text-[#059669] border border-[#A7F3D0]">
            <ReceiptText className="w-3 h-3" />
            HR & Payroll
          </span>
        );
      case "PENGELOLA_KANTIN":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#FDE68A]">
            <UtensilsCrossed className="w-3 h-3" />
            Kasir Stand Kantin
          </span>
        );
      case "FINANCE_AUDIT":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
            <Landmark className="w-3 h-3" />
            Finance & Audit
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fadeIn">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-[16px] shadow-xl border text-xs font-semibold text-white ${
              toastMessage.type === "success"
                ? "bg-[#2DBA7D] border-[#2DBA7D]"
                : toastMessage.type === "error"
                ? "bg-[#EF4444] border-[#EF4444]"
                : "bg-[#1C1B3A] border-white/20"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {toastMessage.type === "info" && <Info className="w-4 h-4 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. Header & Summary Section */}
      <div className="bg-white p-6 sm:p-7 rounded-[18px] border border-[#E6E3F7] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1B3A] tracking-tight">
              Manajemen Pengguna & Hak Akses Modul
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Superadmin Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6F6B88] leading-relaxed">
            Kelola akun internal PT. Bhakti Idola Tama, pantau <strong>Username & Email</strong>, atur perizinan per modul sistem (Akses Penuh / Hanya Lihat / Ditutup), serta tambah atau hapus akun pengguna.
          </p>
        </div>

        {/* Action: Add User Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#4A3AFF]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6F6B88]">Total Akun Terdaftar</span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#1C1B3A]">{users.length} Akun</p>
          <p className="text-[11px] text-[#2DBA7D] font-medium mt-1">Kopkar PT Bhakti Idola Tama</p>
        </div>

        <div className="p-4 sm:p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6F6B88]">Akun Aktif</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#2DBA7D]">
            {users.filter((u) => u.status === "ACTIVE").length} Akun
          </p>
          <p className="text-[11px] text-[#6F6B88] font-medium mt-1">Siap login & bertransaksi</p>
        </div>

        <div className="p-4 sm:p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6F6B88]">Super Admin</span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#4A3AFF]">
            {users.filter((u) => u.role === "SUPER_ADMIN").length} Akun
          </p>
          <p className="text-[11px] text-[#6F6B88] font-medium mt-1">Hak akses penuh (Protected)</p>
        </div>

        <div className="p-4 sm:p-5 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6F6B88]">Modul RBAC Sistem</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF4E5] text-[#FFB547] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#1C1B3A]">{SYSTEM_MODULE_LIST.length} Modul</p>
          <p className="text-[11px] text-[#6F6B88] font-medium mt-1">Perizinan granular aktif</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar (Debounced) */}
      <div className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Search with Debounce */}
        <div className="relative w-full md:w-96">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none">
            {searchTerm !== debouncedSearch ? (
              <Loader2 className="w-4 h-4 text-[#4A3AFF] animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            placeholder="Cari Username, Email, Nama, atau Divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9.5 pr-9 py-2.5 text-xs text-[#212529] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF] focus:bg-white transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B88] hover:text-[#1C1B3A] p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Role & Status Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-[#6F6B88] shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5 text-[#4A3AFF]" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-2 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
          >
            <option value="ALL">Semua Role</option>
            <option value="SUPER_ADMIN">Superadmin</option>
            <option value="ADMIN_KOPERASI">Admin Koperasi</option>
            <option value="HR_PAYROLL">HR & Payroll</option>
            <option value="PENGELOLA_KANTIN">Pengelola Stand Kantin</option>
            <option value="FINANCE_AUDIT">Finance & Audit</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-2 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>

          {(searchTerm || selectedRole !== "ALL" || selectedStatus !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedRole("ALL");
                setSelectedStatus("ALL");
              }}
              className="text-xs font-semibold text-[#4A3AFF] hover:underline px-2 cursor-pointer shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* 4. User Accounts Table */}
      <div className="bg-white rounded-[18px] border border-[#E6E3F7] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E6E3F7] bg-[#FAFAFC]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1C1B3A] uppercase tracking-wider">
              Daftar Akun Pengguna & Matriks Hak Akses
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
              {filteredUsers.length} Pengguna
            </span>
          </div>
          <span className="text-[11px] text-[#6F6B88]">
            Sistem Role Based Access Control (RBAC) PT BIT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3FF]/40 border-b border-[#E6E3F7] text-[11px] font-bold text-[#6F6B88] uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Pengguna & Akun (Username & Email)</th>
                <th className="py-3.5 px-4">Role & Departemen</th>
                <th className="py-3.5 px-4">Hak Akses Modul (7 Modul)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right pr-6">Aksi Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E3F7] text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6F6B88]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-[#A5A2B8] mx-auto" />
                      <p className="font-semibold text-[#1C1B3A]">Tidak ada akun yang sesuai</p>
                      <p className="text-[11px]">Coba ubah kata kunci pencarian atau reset filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const fullCount = Object.values(user.permissions).filter((p) => p === "FULL").length;
                  const readCount = Object.values(user.permissions).filter((p) => p === "READ").length;

                  return (
                    <tr key={user.id} className="hover:bg-[#F5F3FF]/30 transition-colors group">
                      {/* 1. Pengguna (Avatar, Name, Username, Email) */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs ${
                              user.role === "SUPER_ADMIN"
                                ? "bg-gradient-to-tr from-[#4A3AFF] to-[#8E79F5]"
                                : user.role === "ADMIN_KOPERASI"
                                ? "bg-gradient-to-tr from-[#2563EB] to-[#60A5FA]"
                                : user.role === "HR_PAYROLL"
                                ? "bg-gradient-to-tr from-[#059669] to-[#34D399]"
                                : user.role === "PENGELOLA_KANTIN"
                                ? "bg-gradient-to-tr from-[#D97706] to-[#FBBF24]"
                                : "bg-gradient-to-tr from-[#7C3AED] to-[#C084FC]"
                            }`}
                          >
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#1C1B3A] text-xs sm:text-sm">
                                {user.name}
                              </span>
                              {user.isRootSuperadmin && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                                  ROOT
                                </span>
                              )}
                            </div>

                            {/* Username with badge */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-[#4A3AFF] bg-[#F5F3FF] px-1.5 py-0.2 rounded-md font-mono">
                                @{user.username}
                              </span>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-1 text-[11px] text-[#6F6B88]">
                              <Mail className="w-3 h-3 text-[#6F6B88] shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role & Departemen */}
                      <td className="py-4 px-4 align-middle">
                        <div className="space-y-1">
                          {getRoleBadge(user.role)}
                          <p className="text-[11px] text-[#6F6B88] font-medium truncate max-w-[180px]">
                            {user.department}
                          </p>
                        </div>
                      </td>

                      {/* 3. Hak Akses Modul Matriks */}
                      <td className="py-4 px-4 align-middle">
                        <div className="space-y-2">
                          {/* Summary Access Pill */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10.5px] font-bold text-[#1C1B3A]">
                              {fullCount === 7
                                ? "Akses Penuh Semua Modul"
                                : `${fullCount} Full, ${readCount} Read-Only`}
                            </span>
                          </div>

                          {/* Quick Module Icons Strip */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {SYSTEM_MODULE_LIST.map((mod) => {
                              const level = user.permissions[mod.key] || "NONE";
                              const Icon = getModuleIcon(mod.key);

                              return (
                                <div
                                  key={mod.key}
                                  title={`${mod.name}: ${
                                    level === "FULL"
                                      ? "Akses Penuh (Read/Write)"
                                      : level === "READ"
                                      ? "Hanya Lihat (Read-Only)"
                                      : "Tidak Ada Akses"
                                  }`}
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all cursor-help border ${
                                    level === "FULL"
                                      ? "bg-[#E6F9F0] border-[#2DBA7D] text-[#059669]"
                                      : level === "READ"
                                      ? "bg-[#EBF3FE] border-[#93C5FD] text-[#2563EB]"
                                      : "bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF] opacity-40"
                                  }`}
                                >
                                  <Icon className="w-3 h-3" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="py-4 px-4 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            user.status === "ACTIVE"
                              ? "bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0]"
                              : "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === "ACTIVE" ? "bg-[#2DBA7D]" : "bg-[#9CA3AF]"
                            }`}
                          ></span>
                          {user.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                        </span>
                        <p className="text-[10px] text-[#6F6B88] mt-1">{user.lastLogin}</p>
                      </td>

                      {/* 5. Aksi Superadmin */}
                      <td className="py-4 px-4 text-right pr-6 align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Atur Hak Akses Modul Button */}
                          <button
                            onClick={() => handleOpenPermissionModal(user)}
                            title="Atur Hak Akses Per Modul"
                            className="px-2.5 py-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white border border-[#E6E3F7] text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hak Akses</span>
                          </button>

                          {/* Edit User Details */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit Data Akun"
                            className="w-8 h-8 rounded-full bg-white hover:bg-[#F5F3FF] text-[#6F6B88] hover:text-[#4A3AFF] border border-[#E6E3F7] flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User (Protected if root superadmin) */}
                          <button
                            onClick={() => handleOpenDeleteModal(user)}
                            title={
                              user.isRootSuperadmin
                                ? "Akun Superadmin Utama Terlindungi"
                                : "Hapus Akun Pengguna"
                            }
                            disabled={user.isRootSuperadmin}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                              user.isRootSuperadmin
                                ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                                : "bg-white hover:bg-red-50 text-[#6F6B88] hover:text-[#EF4444] border-[#E6E3F7] hover:border-red-200 cursor-pointer"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH AKUN PENGGUNA BARU */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1C1B3A]">
                    Tambah Akun Pengguna Baru
                  </h2>
                  <p className="text-xs text-[#6F6B88]">
                    Daftarkan akun baru ke sistem Kopkar PT Bhakti Idola Tama.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-[#1C1B3A]">Nama Lengkap Pengguna *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rian Hidayat, S.T."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Username * (Untuk Login)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6B88] font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="rian.hidayat"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""),
                        })
                      }
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] pl-7 pr-3 py-2.5 text-xs font-mono text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Email Pengguna *</label>
                  <input
                    type="email"
                    placeholder="rian.h@bhakti.co.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Pilih Role Akun *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleAddRoleChange(e.target.value as UserRole)}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
                  >
                    <option value="ADMIN_KOPERASI">Admin Koperasi</option>
                    <option value="HR_PAYROLL">HR & Payroll Verifikator</option>
                    <option value="PENGELOLA_KANTIN">Pengelola Stand Kantin</option>
                    <option value="FINANCE_AUDIT">Finance & Internal Audit</option>
                    <option value="SUPER_ADMIN">Superadmin</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Departemen / Divisi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Logistik / Keuangan"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                  />
                </div>
              </div>

              {/* Initial Permission Preview */}
              <div className="p-3.5 bg-[#F5F3FF] rounded-[14px] border border-[#E6E3F7] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1C1B3A] text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    Preset Hak Akses Modul ({formData.role})
                  </span>
                  <span className="text-[10px] text-[#4A3AFF] font-medium">Auto-assigned</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SYSTEM_MODULE_LIST.map((m) => {
                    const level = formData.permissions[m.key] || "NONE";
                    return (
                      <div
                        key={m.key}
                        className={`p-2 rounded-[8px] text-[10.5px] border ${
                          level === "FULL"
                            ? "bg-white border-[#2DBA7D] text-[#059669] font-bold"
                            : level === "READ"
                            ? "bg-white border-[#93C5FD] text-[#2563EB] font-semibold"
                            : "bg-gray-100 border-gray-200 text-gray-400 opacity-60"
                        }`}
                      >
                        <p className="truncate">{m.name}</p>
                        <p className="text-[9px] font-normal">
                          {level === "FULL" ? "Akses Penuh" : level === "READ" ? "Hanya Lihat" : "Tidak Ada"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E3F7]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#6F6B88] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Simpan Akun Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ATUR HAK AKSES PER MODUL */}
      {/* ========================================================================= */}
      {isPermissionModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold shrink-0">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1C1B3A]">
                    Pengaturan Hak Akses Modul Sistem
                  </h2>
                  <p className="text-xs text-[#6F6B88]">
                    Konfigurasi izin per modul untuk akun <strong>@{selectedUser.username}</strong> ({selectedUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Details Banner */}
            <div className="p-3.5 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold text-xs">
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#1C1B3A]">{selectedUser.name}</p>
                  <p className="text-[11px] text-[#6F6B88]">
                    @{selectedUser.username} • {selectedUser.email}
                  </p>
                </div>
              </div>
              <div>{getRoleBadge(selectedUser.role)}</div>
            </div>

            {/* Quick Action Preset Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs bg-[#FAFAFC] p-2.5 rounded-[12px] border border-[#E6E3F7]">
              <span className="font-bold text-[#1C1B3A] text-[11px]">Tindakan Cepat:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyPresetInModal("FULL")}
                  className="px-2.5 py-1 rounded-full bg-[#E6F9F0] hover:bg-[#2DBA7D] text-[#059669] hover:text-white border border-[#A7F3D0] text-[10.5px] font-bold transition-all cursor-pointer"
                >
                  Set Semua Full Access
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetInModal("READ")}
                  className="px-2.5 py-1 rounded-full bg-[#EBF3FE] hover:bg-[#2563EB] text-[#2563EB] hover:text-white border border-[#93C5FD] text-[10.5px] font-bold transition-all cursor-pointer"
                >
                  Set Semua Read-Only
                </button>
                <button
                  type="button"
                  onClick={() => setTempPermissions(getRolePresetPermissions(selectedUser.role))}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7] text-[10.5px] font-bold transition-all cursor-pointer"
                >
                  Reset ke Default Role
                </button>
              </div>
            </div>

            {/* Module Matrix List */}
            <div className="space-y-3">
              {SYSTEM_MODULE_LIST.map((module) => {
                const currentLevel = tempPermissions[module.key] || "NONE";
                const Icon = getModuleIcon(module.key);

                return (
                  <div
                    key={module.key}
                    className={`p-3.5 rounded-[14px] border transition-all ${
                      currentLevel === "FULL"
                        ? "bg-[#E6F9F0]/20 border-[#2DBA7D]/40"
                        : currentLevel === "READ"
                        ? "bg-[#EBF3FE]/20 border-[#3B82F6]/30"
                        : "bg-white border-[#E6E3F7]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Module Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            currentLevel === "FULL"
                              ? "bg-[#E6F9F0] text-[#059669]"
                              : currentLevel === "READ"
                              ? "bg-[#EBF3FE] text-[#2563EB]"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs sm:text-sm text-[#1C1B3A]">
                              {module.name}
                            </h3>
                            <span className="text-[10px] font-medium text-[#6F6B88] bg-[#F5F3FF] px-2 py-0.5 rounded-full border border-[#E6E3F7]">
                              {module.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6F6B88] mt-0.5 leading-relaxed">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* 3-State Permission Toggle */}
                      <div className="flex items-center gap-1 bg-[#FAFAFC] p-1 rounded-full border border-[#E6E3F7] shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleModulePermission(module.key, "FULL")}
                          className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                            currentLevel === "FULL"
                              ? "bg-[#2DBA7D] text-white shadow-xs"
                              : "text-[#6F6B88] hover:text-[#1C1B3A]"
                          }`}
                        >
                          Akses Penuh
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleModulePermission(module.key, "READ")}
                          className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                            currentLevel === "READ"
                              ? "bg-[#2563EB] text-white shadow-xs"
                              : "text-[#6F6B88] hover:text-[#1C1B3A]"
                          }`}
                        >
                          Hanya Lihat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleModulePermission(module.key, "NONE")}
                          className={`px-3 py-1.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                            currentLevel === "NONE"
                              ? "bg-[#6B7280] text-white shadow-xs"
                              : "text-[#6F6B88] hover:text-[#1C1B3A]"
                          }`}
                        >
                          Tutup Akses
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E3F7]">
              <button
                type="button"
                onClick={() => setIsPermissionModalOpen(false)}
                className="px-4 py-2.5 rounded-full border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#6F6B88] font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
              >
                Simpan Perubahan Hak Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT DATA AKUN */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-lg p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1C1B3A]">
                    Edit Informasi Akun
                  </h2>
                  <p className="text-xs text-[#6F6B88]">
                    Ubah data profil, username, atau email pengguna.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Nama Lengkap Pengguna *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Username *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6B88] font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""),
                        })
                      }
                      required
                      className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] pl-7 pr-3 py-2.5 text-xs font-mono text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Email Pengguna *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Role Akun</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3 py-2.5 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
                  >
                    <option value="ADMIN_KOPERASI">Admin Koperasi</option>
                    <option value="HR_PAYROLL">HR & Payroll</option>
                    <option value="PENGELOLA_KANTIN">Pengelola Stand Kantin</option>
                    <option value="FINANCE_AUDIT">Finance & Audit</option>
                    <option value="SUPER_ADMIN">Superadmin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3 py-2.5 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Departemen / Divisi</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E3F7]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#6F6B88] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KONFIRMASI HAPUS AKUN */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-[#EF4444] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#1C1B3A]">Hapus Akun Pengguna?</h3>
              <p className="text-xs text-[#6F6B88]">
                Tindakan ini akan menghapus akun dan mencabut semua hak akses modul sistem untuk:
              </p>
            </div>

            <div className="p-3.5 bg-red-50/50 rounded-[14px] border border-red-100 text-xs text-center space-y-1">
              <p className="font-bold text-[#1C1B3A]">{selectedUser.name}</p>
              <p className="font-mono text-[#4A3AFF] text-[11.5px]">@{selectedUser.username}</p>
              <p className="text-[#6F6B88] text-[11px]">{selectedUser.email}</p>
            </div>

            {selectedUser.isRootSuperadmin ? (
              <div className="p-3 bg-amber-50 rounded-[12px] border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Akun Superadmin Utama terlindungi dan tidak boleh dihapus.</span>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#6F6B88] font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={selectedUser.isRootSuperadmin}
                className={`flex-1 py-2.5 rounded-full text-white font-semibold text-xs transition-all ${
                  selectedUser.isRootSuperadmin
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#EF4444] hover:bg-red-600 shadow-sm shadow-red-500/20 cursor-pointer"
                }`}
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
