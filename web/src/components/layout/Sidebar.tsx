"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  UtensilsCrossed,
  ReceiptText,
  Landmark,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  LogOut,
  Store,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  pendingLoansCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingLoansCount = 2,
}) => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard Utama",
      category: "Ringkasan Eksekutif & Kas",
      icon: LayoutDashboard,
      badge: null,
      isActive: pathname === "/" || pathname === "/dashboard",
    },
    {
      href: "/employees",
      label: "Data Karyawan BIT",
      category: "Anggota & Limit Dinamis",
      icon: Users,
      badge: "Karyawan BIT",
      badgeType: "primary",
      isActive: pathname.startsWith("/employees"),
    },
    {
      href: "/savings-loans",
      label: "Simpan Pinjam",
      category: "Wajib/Sukarela & Approval",
      icon: Wallet,
      badge: pendingLoansCount > 0 ? `${pendingLoansCount} Pengajuan` : null,
      badgeType: "warning",
      isActive: pathname.startsWith("/savings-loans"),
    },
    {
      href: "/canteen",
      label: "Kelola Mitra Kantin",
      category: "Multi-Tenant & Arus Kas",
      icon: Store,
      badge: "Multi-Tenant",
      badgeType: "primary",
      isActive: pathname.startsWith("/canteen"),
    },
    {
      href: "/payroll",
      label: "Rekap Potong Gaji",
      category: "Integrasi Payroll HRD",
      icon: ReceiptText,
      badge: "Auto Payroll",
      badgeType: "success",
      isActive: pathname.startsWith("/payroll"),
    },
    {
      href: "/bank-channeling",
      label: "Likuiditas & Bank Partner",
      category: "Bank Mandiri Channeling",
      icon: Landmark,
      badge: "Top-Up Ready",
      badgeType: "primary",
      isActive: pathname.startsWith("/bank-channeling"),
    },
    {
      href: "/users",
      label: "Hak Akses & User",
      category: "Atur Akses Modul & Akun",
      icon: ShieldCheck,
      badge: "Superadmin",
      badgeType: "primary",
      isActive: pathname.startsWith("/users"),
    },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible only on desktop >= 1024px: hidden lg:flex)     */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex bg-white border-r border-[#E6E3F7] flex-col justify-between shrink-0 h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? "w-[76px] overflow-visible" : "w-72 overflow-y-auto"
        }`}
      >
        {/* Brand Header & Desktop Collapse / Expand Toggle */}
        <div className="flex flex-col overflow-visible">
          <div
            className={`p-4 border-b border-[#E6E3F7]/70 sticky top-0 bg-white z-20 flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {/* Logo / Brand Area */}
            {!isCollapsed ? (
              <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
                <div className="relative h-9 w-auto flex items-center shrink-0">
                  <Image
                    src="/images/logo.webp"
                    alt="Moobi Logo"
                    width={110}
                    height={34}
                    quality={100}
                    className="h-7.5 w-auto object-contain"
                    priority
                  />
                </div>
                <div className="border-l border-[#E6E3F7] pl-2.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-[#1C1B3A] tracking-tight truncate">
                      Kopkar BIT
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7] shrink-0">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6F6B88] font-medium truncate">
                    PT Bhakti Idola Tama
                  </p>
                </div>
              </Link>
            ) : (
              <div className="relative group">
                {/* Clickable BIT Avatar to Toggle Open */}
                <button
                  onClick={toggleSidebar}
                  title="Klik untuk membuka sidebar"
                  className="w-11 h-11 rounded-[14px] bg-[#4A3AFF] hover:bg-[#6B5CEB] transition-all flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-[#4A3AFF]/20 cursor-pointer aspect-square"
                >
                  BIT
                </button>

                {/* Tooltip on Top Avatar */}
                <div className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                  <div className="bg-[#1C1B3A] text-white py-1.5 px-3 rounded-[10px] shadow-xl text-xs font-semibold whitespace-nowrap border border-white/10">
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1C1B3A] rotate-45 border-l border-b border-white/10"></div>
                    Buka / Lebarkan Menu (Kopkar BIT)
                  </div>
                </div>
              </div>
            )}

            {/* Toggle Button when Expanded */}
            {!isCollapsed && (
              <button
                onClick={toggleSidebar}
                title="Tutup / Kecilkan Sidebar"
                className="w-7 h-7 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white border border-[#E6E3F7] text-[#6F6B88] flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Menu List */}
          <div className={`py-5 ${isCollapsed ? "px-2 overflow-visible" : "px-4"} space-y-6`}>
            <div className="overflow-visible">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#6F6B88] mb-2.5">
                  Menu Utama
                </p>
              )}

              <nav className="space-y-2 overflow-visible">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.isActive;
                  return (
                    <div key={item.href} className="relative group overflow-visible">
                      <Link
                        href={item.href}
                        className={`w-full flex items-center rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                          isCollapsed
                            ? "justify-center w-11 h-11 mx-auto p-0"
                            : "justify-between px-3.5 py-3"
                        } ${
                          isActive
                            ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25 font-semibold"
                            : "text-[#212529] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
                        }`}
                      >
                        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                          <Icon
                            className={`w-5 h-5 shrink-0 ${
                              isActive ? "text-white" : "text-[#6F6B88] group-hover:text-[#4A3AFF]"
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : item.badgeType === "warning"
                                ? "bg-[#FFF4E5] text-[#D97706]"
                                : item.badgeType === "success"
                                ? "bg-[#E6F9F0] text-[#2DBA7D]"
                                : item.badgeType === "primary"
                                ? "bg-[#F5F3FF] text-[#4A3AFF]"
                                : "bg-[#F5F3FF] text-[#6F6B88]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {/* SIAKAD Hover Flyout Tooltip on Collapsed Desktop */}
                      {isCollapsed && (
                        <div className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 -translate-x-2 transition-all duration-150">
                          <div className="bg-[#1C1B3A] text-white py-2.5 px-4 rounded-[14px] shadow-2xl border border-white/10 flex items-center gap-3 whitespace-nowrap">
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1C1B3A] rotate-45 border-l border-b border-white/10"></div>
                            <div>
                              <p className="text-xs font-bold text-white tracking-wide">{item.label}</p>
                              <p className="text-[10.5px] text-white/70">{item.category}</p>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                                  item.badgeType === "warning"
                                    ? "bg-[#FFB547] text-[#1C1B3A]"
                                    : item.badgeType === "success"
                                    ? "bg-[#2DBA7D] text-white"
                                    : "bg-[#4A3AFF] text-white"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Desktop Footer Card / Status */}
        <div className="p-3 overflow-visible">
          {!isCollapsed ? (
            <div className="p-4 rounded-[18px] bg-[#F5F3FF] border border-[#E6E3F7]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2DBA7D] animate-pulse"></div>
                  <span className="text-xs font-semibold text-[#1C1B3A]">Bank Mandiri</span>
                </div>
                <span className="text-[10px] font-bold text-[#4A3AFF]">Ready</span>
              </div>
              <p className="text-[11px] text-[#6F6B88] leading-relaxed mb-2.5">
                Terkoneksi ke payroll PT Bhakti Idola Tama untuk top-up dana.
              </p>
              <Link
                href="/bank-channeling"
                className="w-full text-xs font-semibold text-[#4A3AFF] flex items-center justify-between py-1.5 px-2.5 rounded-full bg-white border border-[#E6E3F7] hover:bg-[#4A3AFF] hover:text-white transition-colors cursor-pointer"
              >
                <span>Cek Likuiditas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="relative group flex justify-center overflow-visible">
              <button
                onClick={toggleSidebar}
                title="Buka / Lebarkan Sidebar"
                className="w-11 h-11 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white border border-[#E6E3F7] text-[#4A3AFF] flex items-center justify-center transition-all cursor-pointer shadow-xs aspect-square"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                <div className="bg-[#1C1B3A] text-white py-1.5 px-3 rounded-[10px] shadow-xl text-xs font-bold whitespace-nowrap border border-white/10">
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1C1B3A] rotate-45 border-l border-b border-white/10"></div>
                  Buka / Lebarkan Menu Sidebar
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER OVERLAY & SIDEBAR (Visible only when triggered on mobile) */}
      {/* ========================================================================= */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#1C1B3A]/40 backdrop-blur-xs z-50 transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Mobile Drawer Slide-in Panel */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[290px] sm:w-[320px] bg-white z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 border-b border-[#E6E3F7] flex items-center justify-between bg-white shrink-0">
          <Link href="/dashboard" onClick={closeMobileSidebar} className="flex items-center gap-2.5">
            <div className="relative h-8 w-auto flex items-center shrink-0">
              <Image
                src="/images/logo.webp"
                alt="Moobi Logo"
                width={100}
                height={30}
                quality={100}
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="border-l border-[#E6E3F7] pl-2 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-[#1C1B3A] tracking-tight truncate">
                  Kopkar BIT
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7] shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-[#6F6B88] font-medium truncate">
                PT Bhakti Idola Tama
              </p>
            </div>
          </Link>

          <button
            onClick={closeMobileSidebar}
            title="Tutup Menu"
            className="w-8 h-8 rounded-full bg-[#F5F3FF] hover:bg-[#E6E3F7] text-[#6F6B88] hover:text-[#1C1B3A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#6F6B88]">
            Menu Utama
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25 font-semibold"
                      : "text-[#212529] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-[#6F6B88]"}`} />
                    <div className="text-left min-w-0">
                      <span className="block text-xs font-semibold leading-tight truncate">
                        {item.label}
                      </span>
                      <span
                        className={`block text-[10px] leading-tight truncate ${
                          isActive ? "text-white/80" : "text-[#6F6B88]"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeType === "warning"
                          ? "bg-[#FFF4E5] text-[#D97706]"
                          : item.badgeType === "success"
                          ? "bg-[#E6F9F0] text-[#2DBA7D]"
                          : "bg-[#F5F3FF] text-[#4A3AFF]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Footer Status & User */}
        <div className="p-4 border-t border-[#E6E3F7] space-y-3 bg-[#FAFAFC] shrink-0">
          <div className="p-3 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#2DBA7D] animate-pulse"></div>
                <span className="text-[11px] font-bold text-[#1C1B3A]">Bank Mandiri Ready</span>
              </div>
              <span className="text-[9px] font-bold text-[#4A3AFF] px-1.5 py-0.5 bg-white rounded-full">
                Top-Up
              </span>
            </div>
            <p className="text-[10px] text-[#6F6B88] leading-tight">
              Terkoneksi payroll PT Bhakti Idola Tama.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/users"
              onClick={closeMobileSidebar}
              className="flex items-center gap-2 text-left group min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4A3AFF] to-[#8E79F5] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                BIT
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1C1B3A] group-hover:text-[#4A3AFF] transition-colors leading-tight truncate">
                  Pengurus Kopkar
                </p>
                <p className="text-[10px] text-[#6F6B88] leading-tight truncate">Superadmin & HR</p>
              </div>
            </Link>

            <Link
              href="/login"
              onClick={closeMobileSidebar}
              title="Keluar"
              className="p-2 rounded-full bg-white hover:bg-red-50 text-[#6F6B88] hover:text-[#EF4444] border border-[#E6E3F7] transition-colors shrink-0 aspect-square"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
