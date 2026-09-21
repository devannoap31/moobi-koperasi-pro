"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  Package,
  FileText,
  ShoppingCart,
  Flame,
  Scale,
  Layers,
  Building2,
  Factory,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  Store,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useProduction } from "@/context/ProductionContext";

interface NavItem {
  name: string;
  category: string;
  href: string;
  icon: React.ElementType;
  badgeCount?: number;
  badgeColor?: string;
}

export const ProductionSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { reorderMaterialsCount, pendingPOCount, totalInventoryValue } = useProduction();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Resizable Sidebar Width State (VSCode-like manual resize)
  const [sidebarWidth, setSidebarWidth] = useState<number>(275);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem("moobi_production_sidebar_width");
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
          localStorage.setItem("moobi_production_sidebar_width", latestWidth.toString());
        } catch {}
        return latestWidth;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const navItems: NavItem[] = [
    {
      name: "Setting Resep & BOM",
      category: "Formula, COGS & Gizi SPPG",
      href: "/production/recipes",
      icon: ChefHat,
    },
    {
      name: "Bahan Baku & COGS",
      category: "Katalog & Konversi Satuan",
      href: "/production/raw-materials",
      icon: Package,
      badgeCount: reorderMaterialsCount > 0 ? reorderMaterialsCount : undefined,
      badgeColor: "bg-[#FFB547] text-[#1C1B3A]",
    },
    {
      name: "PO Pembelian Bahan",
      category: "Pemesanan ke Vendor Supplier",
      href: "/production/purchase-orders",
      icon: FileText,
      badgeCount: pendingPOCount > 0 ? pendingPOCount : undefined,
      badgeColor: "bg-[#4A3AFF] text-white",
    },
    {
      name: "Pembelian Bahan Masuk",
      category: "Faktur Masuk & Tambah Stok",
      href: "/production/purchases",
      icon: ShoppingCart,
    },
    {
      name: "Penggunaan / Masak Batch",
      category: "Sesi Masak & Potong Stok",
      href: "/production/usage",
      icon: Flame,
    },
    {
      name: "Stok Opname Bahan",
      category: "Audit Fisik vs Sistem",
      href: "/production/stock-opname",
      icon: Scale,
    },
    {
      name: "Kartu Mutasi Stok",
      category: "Buku Besar In/Out/Opname",
      href: "/production/mutations",
      icon: Layers,
    },
    {
      name: "Kategori & Supplier",
      category: "Akun COA & Data Vendor",
      href: "/production/categories-suppliers",
      icon: Building2,
    },
  ];

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderNavList = (isMobileView: boolean = false) => (
    <ul className="space-y-1.5 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href === "/production/recipes" && (pathname === "/production" || pathname === "/production/"));

        return (
          <li key={item.name} className="relative">
            <Link
              href={item.href}
              onClick={() => {
                if (isMobileView) closeMobileSidebar();
              }}
              onMouseEnter={() => setHoveredNav(item.name)}
              onMouseLeave={() => setHoveredNav(null)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-[14px] text-xs font-bold transition-all relative group cursor-pointer ${
                isActive
                  ? "bg-[#2DBA7D] text-white shadow-sm shadow-[#2DBA7D]/30"
                  : "text-[#6F6B88] hover:bg-[#F5F3FF] hover:text-[#2DBA7D]"
              } ${isCollapsed && !isMobileView ? "justify-center px-2" : ""}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-[#6F6B88] group-hover:text-[#2DBA7D]"
                }`}
              />

              {(!isCollapsed || isMobileView) && (
                <div className="flex-1 min-w-0">
                  <span className="truncate block font-semibold text-xs tracking-tight">
                    {item.name}
                  </span>
                  <span
                    className={`truncate block text-[10px] ${
                      isActive ? "text-white/80" : "text-[#A5A2B8]"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              )}

              {/* Action/Alert Badge */}
              {item.badgeCount && (!isCollapsed || isMobileView) && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 min-w-[20px] text-center shadow-xs ${
                    item.badgeColor || "bg-red-500 text-white"
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}

              {/* Collapsed dot badge */}
              {item.badgeCount && isCollapsed && !isMobileView && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FFB547] ring-2 ring-white" />
              )}
            </Link>

            {/* Desktop Collapsed Tooltip */}
            {isCollapsed && !isMobileView && hoveredNav === item.name && (
              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[#1C1B3A] text-white text-xs font-semibold px-3 py-2 rounded-[12px] shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fadeIn flex flex-col gap-0.5">
                <span className="font-bold text-white">{item.name}</span>
                <span className="text-[10px] text-white/70">{item.category}</span>
                {item.badgeCount && (
                  <span className="text-[9.5px] font-extrabold text-[#FFB547] mt-0.5">
                    {item.badgeCount} item perhatian
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible only on desktop >= 1024px: hidden lg:flex)     */}
      {/* ========================================================================= */}
      <aside
        style={{
          width: isCollapsed ? "78px" : `${sidebarWidth}px`,
        }}
        className={`hidden lg:flex bg-white border-r border-[#E6E3F7] flex-col justify-between shrink-0 h-screen sticky top-0 z-40 relative ${
          isResizing ? "transition-none" : "transition-[width] duration-200 ease-in-out"
        } ${isCollapsed ? "overflow-visible" : "overflow-y-auto"}`}
      >
        <div className="flex flex-col overflow-visible">
          {/* Brand Header */}
          <div
            className={`p-4 border-b border-[#E6E3F7]/70 sticky top-0 bg-white z-20 flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed ? (
              <Link href="/production" className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#2DBA7D] to-[#25A26C] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#2DBA7D]/20">
                  <Factory className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-[#1C1B3A] tracking-tight truncate">
                      Produksi &amp; Dapur
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#EBFBF5] text-[#2DBA7D] border border-[#B8F2D8] shrink-0">
                      BIT
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6F6B88] font-medium truncate">
                    PT Bhakti Idola Tama
                  </p>
                </div>
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#2DBA7D] to-[#25A26C] text-white flex items-center justify-center shadow-md shadow-[#2DBA7D]/20">
                <Factory className="w-5 h-5" />
              </div>
            )}

            {/* Collapse Toggle */}
            <button
              onClick={toggleSidebar}
              title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
              className={`w-7 h-7 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#2DBA7D] flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                isCollapsed ? "absolute -right-3.5 top-5 bg-white z-30" : ""
              }`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Mini Live KPI Banner */}
          {!isCollapsed && (
            <div className="px-4 py-2.5">
              <div className="p-3 rounded-[14px] bg-gradient-to-br from-[#F5F3FF] to-[#EBFBF5] border border-[#E6E3F7] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6B88]">
                    Nilai Persediaan
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#2DBA7D] animate-pulse" />
                </div>
                <p className="text-xs font-black text-[#1C1B3A]">
                  {formatRupiah(totalInventoryValue)}
                </p>
                <div className="flex items-center justify-between text-[9.5px] text-[#6F6B88] pt-1 border-t border-[#E6E3F7]">
                  <span>10 Resep Standar BIT</span>
                  {reorderMaterialsCount > 0 ? (
                    <span className="font-bold text-[#D97706]">
                      {reorderMaterialsCount} Perlu Restok
                    </span>
                  ) : (
                    <span className="font-bold text-[#2DBA7D]">Stok Aman</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Section Title */}
          {!isCollapsed && (
            <div className="px-4.5 pt-2 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A2B8]">
                Menu Manajemen Produksi
              </span>
            </div>
          )}

          {/* Nav Items List */}
          <nav className="py-1">{renderNavList(false)}</nav>
        </div>

        {/* Footer: User & Switch Portal */}
        <div className={`border-t border-[#E6E3F7]/70 bg-white ${isCollapsed ? "p-2 space-y-2" : "p-3 space-y-2"}`}>
          {!isCollapsed && (
            <div className="p-2.5 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#2DBA7D] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  KB
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1C1B3A] truncate leading-tight">
                    Kepala Dapur BIT
                  </p>
                  <p className="text-[9.5px] text-[#6F6B88] truncate leading-tight">
                    Produksi &amp; HPP F&amp;B
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Return to Portal Selector & Logout */}
          {!isCollapsed ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/"
                title="Kembali ke Pintu Masuk Portal"
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[12px] text-xs font-bold text-[#6F6B88] bg-[#FAFAFC] hover:bg-[#F5F3FF] hover:text-[#4A3AFF] border border-[#E6E3F7] transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="truncate">Pilih Portal Lain</span>
              </Link>

              <Link
                href="/production/login"
                title="Keluar / Logout Portal Produksi"
                className="p-2.5 rounded-[12px] text-red-500 bg-red-50/60 hover:bg-red-50 hover:text-red-600 border border-red-100 transition-all cursor-pointer flex items-center justify-center shrink-0 aspect-square shadow-xs"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* Collapsed Back to Portal Button */}
              <div className="relative group w-full flex justify-center">
                <Link
                  href="/"
                  className="w-10 h-10 rounded-[12px] bg-[#FAFAFC] hover:bg-[#F5F3FF] hover:text-[#4A3AFF] border border-[#E6E3F7] text-[#6F6B88] flex items-center justify-center transition-all cursor-pointer shadow-xs aspect-square"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                  <div className="bg-[#1C1B3A] text-white py-1.5 px-3 rounded-[10px] shadow-xl text-xs font-bold whitespace-nowrap border border-white/10 flex items-center gap-2">
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1C1B3A] rotate-45 border-l border-b border-white/10"></div>
                    <span>Kembali ke Pintu Masuk Portal</span>
                  </div>
                </div>
              </div>

              {/* Collapsed Logout Button */}
              <div className="relative group w-full flex justify-center">
                <Link
                  href="/production/login"
                  className="w-10 h-10 rounded-[12px] bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border border-red-200 flex items-center justify-center transition-all cursor-pointer shadow-xs aspect-square"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
                <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                  <div className="bg-[#1C1B3A] text-white py-1.5 px-3 rounded-[10px] shadow-xl text-xs font-bold whitespace-nowrap border border-white/10 flex items-center gap-2">
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1C1B3A] rotate-45 border-l border-b border-white/10"></div>
                    <span>Keluar Portal Produksi</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resizable Border Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            title="Tarik untuk mengatur lebar sidebar"
            className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#2DBA7D]/30 active:bg-[#2DBA7D] transition-colors z-50 group flex items-center justify-center ${
              isResizing ? "bg-[#2DBA7D]" : "bg-transparent"
            }`}
          >
            <div className="w-[2px] h-10 rounded-full bg-[#E6E3F7] group-hover:bg-[#2DBA7D] transition-colors" />
          </div>
        )}
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE SIDEBAR DRAWER (Visible on mobile < 1024px when hamburger on)   */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-xs transition-opacity animate-fadeIn"
          onClick={closeMobileSidebar}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col justify-between shadow-2xl z-50 animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Mobile Drawer Header */}
              <div className="p-4.5 border-b border-[#E6E3F7] flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#2DBA7D] to-[#25A26C] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Factory className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-bold text-[#1C1B3A] truncate">
                      Produksi &amp; Dapur BIT
                    </h2>
                    <p className="text-[10px] text-[#6F6B88] truncate">PT Bhakti Idola Tama</p>
                  </div>
                </div>

                <button
                  onClick={closeMobileSidebar}
                  className="w-8 h-8 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status */}
              <div className="p-3">
                <div className="p-2.5 rounded-[12px] bg-[#EBFBF5] border border-[#B8F2D8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2DBA7D] animate-pulse" />
                    <span className="text-[11px] font-bold text-[#1C1B3A]">Dapur Shift 1 &amp; 2 Aktif</span>
                  </div>
                  <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#2DBA7D] text-white">
                    Ready
                  </span>
                </div>
              </div>

              {/* Navigation Section Title */}
              <div className="px-4 pt-2 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A2B8]">
                  Menu Produksi &amp; Bahan Baku
                </span>
              </div>

              {/* Mobile Nav List */}
              <nav className="py-1">{renderNavList(true)}</nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-[#E6E3F7] space-y-2 bg-white">
              <Link
                href="/"
                onClick={closeMobileSidebar}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#F5F3FF] hover:bg-[#E6E3F7] text-[#4A3AFF] font-bold text-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Pilih Modul / Portal Lain</span>
              </Link>
              <Link
                href="/production/login"
                onClick={closeMobileSidebar}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Portal Produksi</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
