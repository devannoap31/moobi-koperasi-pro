"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Landmark,
  X,
  Loader2,
  LogOut,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { sampleEmployees } from "@/data/mockData";
import { EmployeeMember } from "@/types";
import { useSidebar } from "@/context/SidebarContext";

interface HeaderProps {
  onSearch?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<EmployeeMember[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Apply debounce: Delay search processing by 350ms
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger search logic when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      // Simulate debounced search processing
      const results = sampleEmployees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          emp.nik.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );

      setSearchResults(results);
      setShowDropdown(true);

      if (onSearch) {
        onSearch(debouncedSearchTerm);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      if (onSearch) {
        onSearch("");
      }
    }
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <header className="h-18 sm:h-20 bg-white border-b border-[#E6E3F7] px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 gap-2.5 sm:gap-6">
      {/* Left: Mobile Hamburger Toggle + Debounced Global Search Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 relative">
        {/* Dynamic Hamburger to X Button (Visible only on mobile/tablet screens: lg:hidden) */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label={isMobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          title={isMobileOpen ? "Tutup menu" : "Buka menu"}
          className="lg:hidden relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5F3FF] hover:bg-[#E6E3F7] active:scale-95 text-[#4A3AFF] flex items-center justify-center transition-all focus:outline-none cursor-pointer shrink-0 border border-[#E6E3F7]"
        >
          <div className="w-4.5 h-3.5 relative flex flex-col justify-between items-center pointer-events-none">
            <span
              className={`w-4.5 h-0.5 bg-[#4A3AFF] rounded-full transition-all duration-300 ease-in-out transform origin-center ${
                isMobileOpen ? "rotate-45 translate-y-[6px]" : ""
              }`}
            />
            <span
              className={`w-4.5 h-0.5 bg-[#4A3AFF] rounded-full transition-all duration-200 ease-in-out ${
                isMobileOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
              }`}
            />
            <span
              className={`w-4.5 h-0.5 bg-[#4A3AFF] rounded-full transition-all duration-300 ease-in-out transform origin-center ${
                isMobileOpen ? "-rotate-45 -translate-y-[6px]" : ""
              }`}
            />
          </div>
        </button>

        {/* Search Container */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md" ref={searchContainerRef}>
          {/* Left Icon (Search / Spinner when typing/debouncing) */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none flex items-center justify-center">
            {searchTerm !== debouncedSearchTerm ? (
              <Loader2 className="w-4 h-4 text-[#4A3AFF] animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-[#6F6B88]" />
            )}
          </div>

          <input
            type="text"
            placeholder="Cari NIK BIT, nama karyawan, atau divisi..."
            value={searchTerm}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9 pr-9 py-2 sm:py-2.5 text-xs text-[#212529] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF] focus:bg-white transition-all shadow-xs"
          />

          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B88] hover:text-[#1C1B3A] p-0.5 rounded-full hover:bg-[#F5F3FF] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Debounced Search Results Popover */}
        {showDropdown && debouncedSearchTerm.trim() && (
          <div className="absolute left-0 top-[calc(100%+8px)] w-full max-w-md bg-white border border-[#E6E3F7] rounded-[18px] shadow-2xl p-3 z-50 animate-fadeIn space-y-2">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-[#E6E3F7]">
              <span className="text-[11px] font-bold text-[#6F6B88] uppercase">
                Hasil Pencarian ({searchResults.length})
              </span>
              <span className="text-[10px] text-[#4A3AFF] font-medium">Debounce 350ms</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#6F6B88]">
                Tidak ditemukan data karyawan yang cocok dengan &quot;{debouncedSearchTerm}&quot;
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {searchResults.map((emp) => (
                  <Link
                    key={emp.id}
                    href="/employees"
                    onClick={() => setShowDropdown(false)}
                    className="p-2.5 rounded-[12px] hover:bg-[#F5F3FF] border border-transparent hover:border-[#E6E3F7] flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#F5F3FF] group-hover:bg-[#4A3AFF] group-hover:text-white text-[#4A3AFF] flex items-center justify-center text-xs font-bold shrink-0 transition-colors">
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1C1B3A] truncate">{emp.name}</p>
                        <p className="text-[10.5px] text-[#6F6B88] truncate">
                          NIK: <strong>{emp.nik}</strong> | {emp.position} ({emp.department})
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="text-[11px] font-bold text-[#4A3AFF] block">
                        Limit: Rp {(emp.calculatedLoanLimit / 1000000).toFixed(1)} Jt
                      </span>
                      <span className="text-[10px] text-[#2DBA7D] font-semibold">
                        Kopkar BIT
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Bank Status, Notifications, & Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Bank Partner Status Ticker */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3FF] border border-[#E6E3F7] text-xs shrink-0 whitespace-nowrap">
          <Landmark className="w-3.5 h-3.5 text-[#4A3AFF] shrink-0" />
          <span className="text-[#6F6B88]">Koneksi Bank:</span>
          <span className="font-semibold text-[#1C1B3A]">Bank Mandiri (Plafon Rp 1.5 M)</span>
        </div>

        {/* Notifications */}
        <button
          title="Notifikasi"
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#1C1B3A] flex items-center justify-center transition-colors cursor-pointer shrink-0 aspect-square"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 h-2 bg-[#FFB547] rounded-full"></span>
        </button>

        {/* User Profile Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#E6E3F7] shrink-0">
          <Link
            href="/users"
            title="Kelola Profil & Hak Akses"
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#4A3AFF] to-[#8E79F5] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 aspect-square group-hover:ring-2 group-hover:ring-[#4A3AFF]/30 transition-all">
              BIT
            </div>
            <div className="hidden sm:block text-left whitespace-nowrap">
              <p className="text-xs font-bold text-[#1C1B3A] group-hover:text-[#4A3AFF] transition-colors leading-tight">
                Pengurus Kopkar BIT
              </p>
              <p className="text-[10px] text-[#6F6B88] leading-tight mt-0.5">
                Superadmin &amp; HR
              </p>
            </div>
          </Link>

          {/* Logout Button */}
          <Link
            href="/login"
            title="Keluar / Ganti Akun"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-red-50 text-[#6F6B88] hover:text-[#EF4444] border border-[#E6E3F7] hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 aspect-square"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
