"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ReceiptText,
  Landmark,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Store,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  pendingLoansCount?: number;
  pendingCanteenRequestsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingLoansCount = 2,
  pendingCanteenRequestsCount = 1,
}) => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();

  // Resizable Sidebar Width State (VSCode-like manual resize)
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem("moobi_admin_sidebar_width");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (parsed >= 200 && parsed <= 500) {
          setSidebarWidth(parsed);
        }
      }
    } catch {
      // Ignore local storage errors in SSR
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(moveEvent.clientX, 200), 500);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setSidebarWidth((latestWidth) => {
        try {
          localStorage.setItem("moobi_admin_sidebar_width", latestWidth.toString());
        } catch {}
        return latestWidth;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard Utama",
      category: "Ringkasan Eksekutif & Kas",
      icon: LayoutDashboard,
      badgeCount: 0,
      isActive: pathname === "/" || pathname === "/dashboard",
    },
    {
      href: "/employees",
      label: "Data Karyawan BIT",
      category: "Anggota & Limit Dinamis",
      icon: Users,
      badgeCount: 0,
      isActive: pathname.startsWith("/employees"),
    },
    {
      href: "/savings-loans",
      label: "Simpan Pinjam",
      category: "Wajib/Sukarela & Approval",
      icon: Wallet,
      badgeCount: pendingLoansCount,
      isActive: pathname.startsWith("/savings-loans"),
    },
    {
      href: "/canteen",
      label: "Kelola Mitra Kantin",
      category: "Multi-Tenant & Arus Kas",
      icon: Store,
      badgeCount: pendingCanteenRequestsCount,
      isActive: pathname.startsWith("/canteen"),
    },
    {
      href: "/payroll",
      label: "Rekap Potong Gaji",
      category: "Integrasi Payroll HRD",
      icon: ReceiptText,
      badgeCount: 0,
      isActive: pathname.startsWith("/payroll"),
    },
    {
      href: "/bank-channeling",
      label: "Likuiditas & Bank Partner",
      category: "Bank Mandiri Channeling",
      icon: Landmark,
      badgeCount: 0,
      isActive: pathname.startsWith("/bank-channeling"),
    },
    {
      href: "/users",
      label: "Hak Akses & User",
      category: "Atur Akses Modul & Akun",
      icon: ShieldCheck,
      badgeCount: 0,
      isActive: pathname.startsWith("/users"),
    },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible only on desktop >= 1024px: hidden lg:flex)     */}
      {/* ========================================================================= */}
      <aside
        style={{
          width: isCollapsed ? "76px" : `${sidebarWidth}px`,
        }}
        className={`hidden lg:flex bg-white border-r border-[#E6E3F7] flex-col justify-between shrink-0 h-screen sticky top-0 z-40 relative ${
          isResizing ? "transition-none" : "transition-[width] duration-200 ease-in-out"
        } ${isCollapsed ? "overflow-visible" : "overflow-y-auto"}`}
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
                  const hasActionNotification = item.badgeCount > 0;

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
                        <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                          <Icon
                            className={`w-5 h-5 shrink-0 ${
                              isActive ? "text-white" : "text-[#6F6B88] group-hover:text-[#4A3AFF]"
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {/* Red Action-Required Number Badge (Only shown when action needed) */}
                        {!isCollapsed && hasActionNotification && (
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shrink-0 min-w-[20px] text-center shadow-xs animate-pulse">
                            {item.badgeCount}
                          </span>
                        )}

                        {/* Red dot indicator when collapsed */}
                        {isCollapsed && hasActionNotification && (
                          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </Link>

                      {/* Tooltip on Collapsed Desktop */}
                      {isCollapsed && (
                        <div className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 -translate-x-2 transition-all duration-150">
                          <div className="bg-[#1C1B3A] text-white py-2.5 px-4 rounded-[14px] shadow-2xl border border-white/10 flex items-center gap-3 whitespace-nowrap">
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1C1B3A] rotate-45 border-l border-b border-white/10"></div>
                            <div>
                              <p className="text-xs font-bold text-white tracking-wide">{item.label}</p>
                              <p className="text-[10.5px] text-white/70">{item.category}</p>
                            </div>
                            {hasActionNotification && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                                {item.badgeCount} tindakan
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

        {/* Desktop Footer (Clean User & Expand Action without Bank Mandiri card) */}
        <div className="p-3 border-t border-[#E6E3F7]/70 bg-white overflow-visible">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-1">
              <Link
                href="/users"
                className="flex items-center gap-2.5 text-left group min-w-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4A3AFF] to-[#8E79F5] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                  BIT
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1C1B3A] group-hover:text-[#4A3AFF] transition-colors leading-tight truncate">
                    Pengurus Kopkar
                  </p>
                  <p className="text-[10px] text-[#6F6B88] leading-tight truncate">Superadmin &amp; HR</p>
                </div>
              </Link>

              <Link
                href="/login"
                title="Keluar / Logout"
                className="p-2 rounded-full bg-white hover:bg-red-50 text-[#6F6B88] hover:text-[#EF4444] border border-[#E6E3F7] transition-colors shrink-0 aspect-square cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
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

        {/* Resizable Draggable Border Handle (VSCode-Style) */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            title="Tarik untuk mengatur lebar sidebar"
            className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#4A3AFF]/30 active:bg-[#4A3AFF] transition-colors z-50 group flex items-center justify-center ${
              isResizing ? "bg-[#4A3AFF]" : "bg-transparent"
            }`}
          >
            <div className="w-[2px] h-10 rounded-full bg-[#E6E3F7] group-hover:bg-[#4A3AFF] transition-colors" />
          </div>
        )}
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
              const hasActionNotification = item.badgeCount > 0;

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

                  {hasActionNotification && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shrink-0 min-w-[20px] text-center shadow-xs">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Footer User & Logout (Clean without Bank Mandiri card) */}
        <div className="p-4 border-t border-[#E6E3F7] space-y-3 bg-[#FAFAFC] shrink-0">
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
                <p className="text-[10px] text-[#6F6B88] leading-tight truncate">Superadmin &amp; HR</p>
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
