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
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  pendingLoansCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingLoansCount = 2,
}) => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

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
      category: "500 Anggota & Limit Dinamis",
      icon: Users,
      badge: "500 Karyawan",
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
      label: "Kantin & Toko BIT",
      category: "POS Kasir & Dual Pricing",
      icon: UtensilsCrossed,
      badge: "Dual Price",
      badgeType: "info",
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
    <aside
      className={`bg-white border-r border-[#E6E3F7] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-[76px] overflow-visible" : "w-72 overflow-y-auto"
      }`}
    >
      {/* 1. Brand Header & Collapse / Expand Toggle */}
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

        {/* 2. Navigation Menu List (overflow-visible when collapsed so tooltips are never clipped) */}
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

                    {/* 3. Hover Flyout Tooltip (SIAKAD Style) - Positioned with zero clipping */}
                    {isCollapsed && (
                      <div className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 -translate-x-2 transition-all duration-150">
                        <div className="bg-[#1C1B3A] text-white py-2.5 px-4 rounded-[14px] shadow-2xl border border-white/10 flex items-center gap-3 whitespace-nowrap">
                          {/* Triangle Pointer Arrow */}
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

      {/* 4. Footer Card / Status Ticker */}
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
            {/* Quick Expand Toggle Button at Bottom */}
            <button
              onClick={toggleSidebar}
              title="Buka / Lebarkan Sidebar"
              className="w-11 h-11 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white border border-[#E6E3F7] text-[#4A3AFF] flex items-center justify-center transition-all cursor-pointer shadow-xs aspect-square"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Tooltip for Expand button */}
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
  );
};
