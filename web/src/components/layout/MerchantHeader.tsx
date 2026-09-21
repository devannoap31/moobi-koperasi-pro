"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Calendar,
  ShoppingBag,
  Smartphone,
  Package,
  TrendingUp,
  Settings,
  UserCheck,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useMerchant } from "@/context/MerchantContext";

export const MerchantHeader: React.FC = () => {
  const pathname = usePathname();
  const { toggleMobileSidebar } = useSidebar();
  const { currentTenant, pendingOrdersCount } = useMerchant();

  const getPageInfo = () => {
    if (pathname.includes("/orders")) {
      return {
        title: "Pesanan Masuk App Karyawan",
        subtitle: "Kelola dan proses pesanan yang masuk dari aplikasi mobile karyawan",
        icon: Smartphone,
      };
    }
    if (pathname.includes("/menu")) {
      return {
        title: "Kelola Menu & Stok Stand",
        subtitle: "Atur katalog produk, harga anggota vs umum, dan persediaan makanan/minuman",
        icon: Package,
      };
    }
    if (pathname.includes("/finance")) {
      return {
        title: "Pendapatan & Settlement Dana",
        subtitle: "Laporan omzet, QRIS stand resmi, dan riwayat transfer pencairan dari koperasi",
        icon: TrendingUp,
      };
    }
    if (pathname.includes("/store-settings")) {
      return {
        title: "Pengaturan & Info Stand Kantin",
        subtitle: "Kelola profil stand kantin, status buka/tutup, jam operasional, kontak, dan barcode QRIS stand",
        icon: Settings,
      };
    }
    if (pathname.includes("/account")) {
      return {
        title: "Informasi Akun & Pengajuan Pembaruan",
        subtitle: "Kelola kredensial login dan ajukan pembaruan data rekening/profil ke Superadmin",
        icon: UserCheck,
      };
    }
    return {
      title: "POS Kasir Stand Kantin",
      subtitle: "Lakukan transaksi langsung dengan karyawan BIT (Potong Gaji/Saldo) atau umum (QRIS)",
      icon: ShoppingBag,
    };
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  return (
    <header className="bg-white border-b border-[#E6E3F7] sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          aria-label="Toggle Mobile Menu"
          className="lg:hidden p-2 rounded-[12px] bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#4A3AFF] transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-[#1C1B3A] truncate flex items-center gap-1.5">
              <PageIcon className="w-4 h-4 text-[#4A3AFF] hidden sm:inline shrink-0" />
              <span>{pageInfo.title}</span>
            </h1>
            {pendingOrdersCount > 0 && pathname.includes("/orders") && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFB547] text-[#1C1B3A] shrink-0 animate-pulse">
                {pendingOrdersCount} Baru
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6F6B88] truncate hidden md:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Stand Info, Payroll Schedule, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Payroll Cutoff Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F3FF] border border-[#E6E3F7] text-[11px] text-[#4A3AFF] font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Cutoff Payroll: Tgl 25 / Bulan</span>
        </div>

        {/* Stand Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAFAFC] border border-[#E6E3F7]">
          <span className="w-2 h-2 rounded-full bg-[#2DBA7D]" />
          <span className="text-xs font-bold text-[#1C1B3A] truncate max-w-[140px]">
            {currentTenant.name}
          </span>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-1.5 sm:pl-2 border-l border-[#E6E3F7]">
          <div className="w-8 h-8 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentTenant.ownerName.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-[#1C1B3A] leading-tight">
              {currentTenant.ownerName}
            </p>
            <p className="text-[10px] text-[#6F6B88] leading-tight">Pengelola Stand</p>
          </div>
        </div>
      </div>
    </header>
  );
};
