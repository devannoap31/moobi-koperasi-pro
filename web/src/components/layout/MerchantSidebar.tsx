"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Smartphone,
  Package,
  TrendingUp,
  Settings,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  X,
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useMerchant } from "@/context/MerchantContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

export const MerchantSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { currentTenant, pendingOrdersCount } = useMerchant();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      name: "POS Kasir Stand",
      href: "/canteen-portal/merchant/pos",
      icon: ShoppingBag,
    },
    {
      name: "Pesanan App Karyawan",
      href: "/canteen-portal/merchant/orders",
      icon: Smartphone,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: "bg-[#FFB547] text-[#1C1B3A]",
    },
    {
      name: "Kelola Menu & Stok",
      href: "/canteen-portal/merchant/menu",
      icon: Package,
    },
    {
      name: "Pendapatan & Settlement",
      href: "/canteen-portal/merchant/finance",
      icon: TrendingUp,
    },
    {
      name: "Pengaturan & Info Stand Kantin",
      href: "/canteen-portal/merchant/store-settings",
      icon: Settings,
    },
    {
      name: "Informasi Akun & Update",
      href: "/canteen-portal/merchant/account",
      icon: UserCheck,
    },
  ];

  const renderNavList = (isMobileView: boolean = false) => (
    <ul className="space-y-1.5 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href === "/canteen-portal/merchant/pos" &&
            (pathname === "/canteen-portal/merchant" || pathname === "/canteen-portal/merchant/"));

        const itemHref = currentTenant?.id ? `${item.href}?tenantId=${currentTenant.id}` : item.href;

        return (
          <li key={item.name} className="relative">
            <Link
              href={itemHref}
              onClick={() => {
                if (isMobileView) closeMobileSidebar();
              }}
              onMouseEnter={() => setHoveredNav(item.name)}
              onMouseLeave={() => setHoveredNav(null)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-[14px] text-xs font-bold transition-all relative group cursor-pointer ${
                isActive
                  ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/30"
                  : "text-[#6F6B88] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
              } ${isCollapsed && !isMobileView ? "justify-center px-2" : ""}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-[#6F6B88] group-hover:text-[#4A3AFF]"
                }`}
              />

              {(!isCollapsed || isMobileView) && (
                <span className="truncate flex-1 font-semibold text-xs tracking-tight">
                  {item.name}
                </span>
              )}

              {/* Dynamic Badge */}
              {item.badge !== undefined && item.badge > 0 && (!isCollapsed || isMobileView) && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor || "bg-[#FFB547] text-[#1C1B3A]"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Dot badge on collapsed mode */}
              {item.badge !== undefined && item.badge > 0 && isCollapsed && !isMobileView && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FFB547] ring-2 ring-white" />
              )}
            </Link>

            {/* Desktop Collapsed Tooltip */}
            {isCollapsed && !isMobileView && hoveredNav === item.name && (
              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-[#1C1B3A] text-white text-xs font-semibold px-3 py-1.5 rounded-[10px] shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fadeIn flex items-center gap-2">
                <span>{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-[#FFB547] text-[#1C1B3A]">
                    {item.badge}
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
        className={`hidden lg:flex bg-white border-r border-[#E6E3F7] flex-col justify-between shrink-0 h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[78px] overflow-visible" : "w-72 overflow-y-auto"
        }`}
      >
        <div className="flex flex-col overflow-visible">
          {/* Stand Branding Header */}
          <div
            className={`p-4.5 border-b border-[#E6E3F7]/70 sticky top-0 bg-white z-20 flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[14px] bg-[#4A3AFF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4A3AFF]/20">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-[#1C1B3A] truncate">
                      {currentTenant.name}
                    </h2>
                  </div>
                  <p className="text-[10.5px] text-[#6F6B88] truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#4A3AFF]" />
                    <span>{currentTenant.location}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-[14px] bg-[#4A3AFF] text-white flex items-center justify-center shadow-md shadow-[#4A3AFF]/20">
                <Store className="w-5 h-5" />
              </div>
            )}

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={toggleSidebar}
              title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
              className={`w-7 h-7 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#4A3AFF] flex items-center justify-center shadow-xs transition-all cursor-pointer ${
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

          {/* Stand Status Pill Banner */}
          {!isCollapsed && (
            <div className="px-4 py-2.5">
              <div className="p-2.5 rounded-[12px] bg-[#F5F3FF] border border-[#E6E3F7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2DBA7D] animate-pulse" />
                  <span className="text-[11px] font-bold text-[#1C1B3A]">Stand Buka (Melayani)</span>
                </div>
                <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                  Mitra Kopkar
                </span>
              </div>
            </div>
          )}

          {/* Navigation Section Title */}
          {!isCollapsed && (
            <div className="px-4.5 pt-2 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A2B8]">
                Menu Merchant Kantin
              </span>
            </div>
          )}

          {/* Nav Items List */}
          <nav className="py-1">{renderNavList(false)}</nav>
        </div>

        {/* Footer: Payroll Cutoff Info & Logout */}
        <div className="p-3 border-t border-[#E6E3F7]/70 bg-white space-y-2">
          {!isCollapsed && (
            <div className="p-2.5 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-[#6F6B88] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#4A3AFF]" />
                  <span>Jadwal Cutoff:</span>
                </span>
                <span className="font-bold text-[#1C1B3A]">Tgl 25 / Bulan</span>
              </div>
              <p className="text-[9.5px] text-[#A5A2B8]">
                Settlement ditransfer otomatis ke Rek. {currentTenant.bankName}
              </p>
            </div>
          )}

          <Link
            href="/canteen-portal/login"
            title="Keluar dari Stand"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Keluar Portal Kantin</span>}
          </Link>
        </div>
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
                  <div className="w-10 h-10 rounded-[14px] bg-[#4A3AFF] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-bold text-[#1C1B3A] truncate">
                      {currentTenant.name}
                    </h2>
                    <p className="text-[10px] text-[#6F6B88] truncate">{currentTenant.location}</p>
                  </div>
                </div>

                <button
                  onClick={closeMobileSidebar}
                  className="w-8 h-8 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stand Status */}
              <div className="p-3">
                <div className="p-2.5 rounded-[12px] bg-[#F5F3FF] border border-[#E6E3F7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2DBA7D]" />
                    <span className="text-[11px] font-bold text-[#1C1B3A]">Stand Buka (Melayani)</span>
                  </div>
                  <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                    Mitra Kopkar
                  </span>
                </div>
              </div>

              {/* Navigation Section Title */}
              <div className="px-4 pt-2 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A2B8]">
                  Menu Merchant Kantin
                </span>
              </div>

              {/* Mobile Nav List */}
              <nav className="py-1">{renderNavList(true)}</nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-[#E6E3F7] space-y-2 bg-white">
              <Link
                href="/canteen-portal/login"
                onClick={closeMobileSidebar}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Portal Stand</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
