"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  ShoppingBag,
  User,
  UserX,
  Loader2,
  AlertCircle,
  QrCode,
  UtensilsCrossed,
  ChevronRight,
  Printer,
  Sparkles,
  Banknote,
  Coins,
} from "lucide-react";
import { useMerchant } from "@/context/MerchantContext";
import { sampleEmployees } from "@/data/mockData";
import {
  CanteenProduct,
  ProductCategory,
  CanteenOrder,
  CanteenPaymentMethod,
  EmployeeMember,
} from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface CartItem {
  product: CanteenProduct;
  quantity: number;
}

export const MerchantPosView: React.FC = () => {
  const { currentTenant, products, addCompletedOrder, showToast, activeQris } = useMerchant();

  // Catalog search & category filter
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Cart & Checkout state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<CanteenPaymentMethod>("POTONG_GAJI");
  const [cashReceivedInput, setCashReceivedInput] = useState<string>("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showQrisPaymentModal, setShowQrisPaymentModal] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<CanteenOrder | null>(null);
  const [receiptPaperSize, setReceiptPaperSize] = useState<"58mm" | "80mm">("58mm");

  // Debounced Employee & Non-Employee Buyer State
  const [buyerType, setBuyerType] = useState<"MEMBER" | "NON_MEMBER">("MEMBER");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMember | null>(sampleEmployees[0]);
  const [buyerSearchQuery, setBuyerSearchQuery] = useState(sampleEmployees[0].name);
  const debouncedBuyerSearch = useDebounce(buyerSearchQuery, 300);
  const [isBuyerDropdownOpen, setIsBuyerDropdownOpen] = useState(false);
  const [buyerValidationError, setBuyerValidationError] = useState<string | null>(null);
  const buyerDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buyerDropdownRef.current &&
        !buyerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBuyerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories: { id: string; label: string }[] = [
    { id: "ALL", label: "Semua Kategori" },
    { id: "MAKANAN", label: "Makanan Kantin" },
    { id: "MINUMAN", label: "Minuman" },
    { id: "ELEKTRONIK_BIT", label: "Elektronik & Perkakas BIT" },
    { id: "ALAT_KERJA", label: "Alat Kerja & Safety" },
    { id: "KEBUTUHAN_HARIAN", label: "Cookware & Harian" },
  ];

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchSearch =
      !debouncedSearch.trim() ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Filter Matching Employees for Debounced Search
  const matchingEmployees = sampleEmployees.filter((emp) => {
    if (!debouncedBuyerSearch.trim()) return true;
    const query = debouncedBuyerSearch.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.nik.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query)
    );
  });

  // Buyer selection handlers
  const handleSelectEmployee = (emp: EmployeeMember) => {
    setBuyerType("MEMBER");
    setSelectedEmployee(emp);
    setBuyerSearchQuery(emp.name);
    setBuyerValidationError(null);
    setIsBuyerDropdownOpen(false);
    showToast(`Pembeli diatur ke ${emp.name} (Harga Diskon Anggota Aktif)`);
  };

  const handleSelectNonEmployee = () => {
    setBuyerType("NON_MEMBER");
    setSelectedEmployee(null);
    setBuyerSearchQuery("Non-Karyawan (Tamu / Pengunjung Umum)");
    setBuyerValidationError(null);
    setIsBuyerDropdownOpen(false);
    if (paymentMethod === "POTONG_GAJI" || paymentMethod === "SALDO_KOPERASI") {
      setPaymentMethod("QRIS_TUNAI");
    }
    showToast("Pembeli diatur ke Non-Karyawan (Dikenakan Tarif Harga Umum)", "info");
  };

  // Cart Calculations
  const effectiveSubtotal = cart.reduce((acc, item) => {
    const unitPrice =
      buyerType === "MEMBER" ? item.product.memberPrice : item.product.regularPrice;
    return acc + unitPrice * item.quantity;
  }, 0);

  const totalMemberSavings =
    buyerType === "MEMBER"
      ? cart.reduce(
        (acc, item) =>
          acc + (item.product.regularPrice - item.product.memberPrice) * item.quantity,
        0
      )
      : 0;

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cash calculation
  const numericCashReceived = parseFloat(cashReceivedInput.replace(/\D/g, "")) || 0;
  const cashChange = numericCashReceived - effectiveSubtotal;
  const isCashSufficient = numericCashReceived >= effectiveSubtotal;

  // Cart Handlers
  const handleAddToCart = (product: CanteenProduct) => {
    if (product.stock <= 0) {
      showToast(`Stok ${product.name} telah habis!`, "error");
      return;
    }
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Jumlah pesanan mencapai batas stok (${product.stock})`, "error");
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    showToast(`+1 ${product.name} dimasukkan ke keranjang kasir`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              showToast(`Maksimum stok tersedia: ${item.product.stock}`, "error");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCashReceivedInput("");
    setIsMobileCartOpen(false);
  };

  // Finalize Order Execution
  const finalizeOrder = (chosenMethod: CanteenPaymentMethod) => {
    const buyerName =
      buyerType === "MEMBER"
        ? selectedEmployee?.name || "Karyawan BIT"
        : "Non-Karyawan (Tamu / Umum)";
    const buyerNik = buyerType === "MEMBER" ? selectedEmployee?.nik || "-" : "-";
    const buyerDept =
      buyerType === "MEMBER"
        ? selectedEmployee?.department || "-"
        : "Umum / Non-Karyawan";

    const completedOrder: CanteenOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      orderNumber: `ORD-POS-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: buyerType === "MEMBER" ? selectedEmployee?.id || "EMP-GUEST" : "NON-EMP",
      employeeNik: buyerNik,
      employeeName: buyerName,
      department: buyerDept,
      items: cart.map((c) => {
        const unitPrice =
          buyerType === "MEMBER" ? c.product.memberPrice : c.product.regularPrice;
        return {
          productId: c.product.id,
          productName: c.product.name,
          price: unitPrice,
          regularPrice: c.product.regularPrice,
          quantity: c.quantity,
          subtotal: unitPrice * c.quantity,
          imageUrl: c.product.imageUrl,
        };
      }),
      totalAmount: effectiveSubtotal,
      totalSaved: totalMemberSavings,
      paymentMethod: chosenMethod,
      cashReceived: chosenMethod === "CASH_TUNAI" ? numericCashReceived : undefined,
      cashChange: chosenMethod === "CASH_TUNAI" ? Math.max(0, cashChange) : undefined,
      status: "SELESAI",
      orderType: "KANTIN_MAKANAN",
      pickupTime: "Langsung di Kasir",
      notes:
        chosenMethod === "CASH_TUNAI"
          ? (buyerType === "MEMBER"
            ? `Transaksi Tunai POS (Diterima: Rp ${numericCashReceived.toLocaleString("id-ID")}, Kembalian: Rp ${Math.max(0, cashChange).toLocaleString("id-ID")})`
            : `Transaksi Tunai Non-Karyawan (Diterima: Rp ${numericCashReceived.toLocaleString("id-ID")}, Kembalian: Rp ${Math.max(0, cashChange).toLocaleString("id-ID")})`)
          : chosenMethod === "QRIS_TUNAI"
            ? (buyerType === "MEMBER"
              ? "Transaksi POS via QRIS Stand Kopkar (Harga Anggota)"
              : "Transaksi POS via QRIS Stand Kopkar (Tarif Umum)")
            : (buyerType === "MEMBER"
              ? "Transaksi POS Kasir Stand (Harga Anggota)"
              : "Transaksi POS Kasir Stand (Non-Karyawan / Tarif Umum)"),
      createdAt: "Baru saja",
    };

    addCompletedOrder(completedOrder);
    setLastCompletedOrder(completedOrder);
    setShowQrisPaymentModal(false);
    setIsMobileCartOpen(false);
    setShowReceiptModal(true);
    setCart([]);
    setCashReceivedInput("");

    if (chosenMethod === "CASH_TUNAI") {
      showToast(`Transaksi Tunai Berhasil! Kembalian: Rp ${Math.max(0, cashChange).toLocaleString("id-ID")}`);
    }
  };

  // Checkout Button Trigger
  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("Keranjang belanja masih kosong!", "error");
      return;
    }

    if (!buyerSearchQuery.trim()) {
      setBuyerValidationError("Nama pembeli wajib diisi! Pilih dari daftar saran karyawan atau tentukan sebagai 'Non-Karyawan'.");
      setIsBuyerDropdownOpen(true);
      showToast("Harap tentukan nama karyawan pembeli atau pilih 'Non-Karyawan'!", "error");
      return;
    }

    if (buyerType === "MEMBER" && !selectedEmployee) {
      setBuyerValidationError("Karyawan belum dipilih secara valid. Silakan klik salah satu saran karyawan atau pilih 'Non-Karyawan'.");
      setIsBuyerDropdownOpen(true);
      showToast("Harap klik salah satu nama karyawan atau pilih 'Non-Karyawan'!", "error");
      return;
    }

    if (paymentMethod === "QRIS_TUNAI") {
      setShowQrisPaymentModal(true);
      return;
    }

    if (paymentMethod === "CASH_TUNAI") {
      if (!numericCashReceived || numericCashReceived < effectiveSubtotal) {
        showToast(
          `Nominal uang tunai kurang Rp ${(effectiveSubtotal - numericCashReceived).toLocaleString("id-ID")}. Harap masukkan uang yang cukup!`,
          "error"
        );
        return;
      }
      finalizeOrder("CASH_TUNAI");
      return;
    }

    finalizeOrder(paymentMethod);
  };

  const renderCartContent = () => (
    <>
      {/* Debounced Buyer Search Bar */}
      <div className="space-y-1.5 text-xs relative" ref={buyerDropdownRef}>
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#1C1B3A] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#4A3AFF]" />
            <span>Cari Karyawan / Pembeli:</span>
          </label>
          <span
            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
              buyerType === "MEMBER"
                ? "bg-[#E6F9F0] text-[#2DBA7D]"
                : "bg-[#FFF4E5] text-[#D97706]"
            }`}
          >
            {buyerType === "MEMBER" ? "✓ Harga Anggota Aktif" : "Tarif Harga Umum"}
          </span>
        </div>

        {/* Input Box */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none">
            {buyerSearchQuery !== debouncedBuyerSearch ? (
              <Loader2 className="w-3.5 h-3.5 text-[#4A3AFF] animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-[#6F6B88]" />
            )}
          </div>

          <input
            type="text"
            value={buyerSearchQuery}
            onFocus={() => setIsBuyerDropdownOpen(true)}
            onChange={(e) => {
              const val = e.target.value;
              setBuyerSearchQuery(val);
              setIsBuyerDropdownOpen(true);
              if (!val.trim()) {
                setSelectedEmployee(null);
                setBuyerValidationError("Nama pembeli wajib diisi! Silakan pilih saran karyawan atau Non-Karyawan.");
              } else if (selectedEmployee && selectedEmployee.name.toLowerCase() !== val.toLowerCase()) {
                setSelectedEmployee(null);
                setBuyerValidationError("Silakan klik salah satu nama karyawan dari saran atau pilih 'Non-Karyawan'.");
              }
            }}
            placeholder="Ketik nama karyawan, NIK, atau divisi..."
            className={`w-full border rounded-[14px] pl-8.5 pr-8 py-2.5 text-xs text-[#1C1B3A] placeholder-[#A5A2B8] focus:outline-none transition-all ${
              buyerValidationError
                ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                : "border-[#E6E3F7] bg-[#FAFAFC] focus:border-[#4A3AFF] focus:bg-white"
            }`}
          />

          {buyerSearchQuery && (
            <button
              type="button"
              onClick={() => {
                setBuyerSearchQuery("");
                setSelectedEmployee(null);
                setBuyerValidationError("Nama pembeli wajib diisi! Silakan pilih karyawan atau Non-Karyawan.");
                setIsBuyerDropdownOpen(true);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A5A2B8] hover:text-[#1C1B3A] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Validation Error Message */}
        {buyerValidationError && (
          <div className="flex items-center gap-1.5 text-[10.5px] text-red-600 font-semibold px-1 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span>{buyerValidationError}</span>
          </div>
        )}

        {/* Live Suggestions Dropdown Popover */}
        {isBuyerDropdownOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-[#E6E3F7] rounded-[18px] shadow-2xl p-2.5 z-50 animate-fadeIn space-y-1.5 max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-[#E6E3F7]">
              <span className="text-[10.5px] font-bold text-[#6F6B88] uppercase">
                Saran Karyawan ({matchingEmployees.length})
              </span>
              <span className="text-[9.5px] text-[#4A3AFF] font-medium">Debounce 300ms</span>
            </div>

            {matchingEmployees.length > 0 && (
              <div className="space-y-1">
                {matchingEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleSelectEmployee(emp)}
                    className={`w-full p-2 rounded-[12px] flex items-center justify-between text-left transition-all cursor-pointer ${
                      buyerType === "MEMBER" && selectedEmployee?.id === emp.id
                        ? "bg-[#F5F3FF] border border-[#4A3AFF]"
                        : "hover:bg-[#FAFAFC] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold text-[10.5px] shrink-0">
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1C1B3A] truncate">{emp.name}</p>
                        <p className="text-[10px] text-[#6F6B88] truncate">
                          NIK: <strong>{emp.nik}</strong> • {emp.department}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] shrink-0">
                      Diskon Member
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Non-Employee Suggestion */}
            <div className="pt-1 border-t border-[#E6E3F7]">
              <button
                type="button"
                onClick={handleSelectNonEmployee}
                className={`w-full p-2.5 rounded-[12px] flex items-center justify-between text-left transition-all cursor-pointer ${
                  buyerType === "NON_MEMBER"
                    ? "bg-[#FFF8E6] border border-[#FFD280]"
                    : "bg-[#FAFAFC] hover:bg-[#FFF8E6] border border-[#E6E3F7]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#FFF4E5] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0">
                    <UserX className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#1C1B3A]">
                        Non Karyawan (Tamu / Pengunjung Umum)
                      </p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FFF4E5] text-[#D97706]">
                        Tarif Umum
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6F6B88]">
                      Tanpa diskon anggota koperasi &amp; tanpa potong gaji
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6F6B88] shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Item List */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
        {cart.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#A5A2B8] space-y-1">
            <ShoppingBag className="w-8 h-8 mx-auto text-gray-300" />
            <p>Keranjang masih kosong</p>
            <p className="text-[10.5px]">Pilih menu makanan/minuman untuk menambahkan</p>
          </div>
        ) : (
          cart.map((c) => {
            const unitPrice =
              buyerType === "MEMBER" ? c.product.memberPrice : c.product.regularPrice;
            return (
              <div
                key={c.product.id}
                className="p-2.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-[#1C1B3A] truncate">{c.product.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10.5px] text-[#6F6B88]">
                      Rp {unitPrice.toLocaleString("id-ID")} x {c.quantity}
                    </span>
                    {buyerType === "NON_MEMBER" && (
                      <span className="text-[9px] font-semibold text-[#D97706] bg-[#FFF4E5] px-1 rounded">
                        Tarif Umum
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#4A3AFF] block">
                      Rp {(unitPrice * c.quantity).toLocaleString("id-ID")}
                    </span>
                    {buyerType === "MEMBER" && (
                      <span className="text-[9.5px] text-[#2DBA7D] block">
                        Diskon: Rp {((c.product.regularPrice - c.product.memberPrice) * c.quantity).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(c.product.id)}
                    className="p-1 text-[#A5A2B8] hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-1.5 text-xs pt-2 border-t border-[#E6E3F7]">
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#1C1B3A]">Metode Pembayaran:</label>
          {buyerType === "NON_MEMBER" && (
            <span className="text-[10px] text-[#D97706] font-semibold">
              *Non-karyawan hanya QRIS / Tunai
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            disabled={buyerType === "NON_MEMBER"}
            onClick={() => setPaymentMethod("POTONG_GAJI")}
            className={`p-2 rounded-[10px] text-[11px] font-bold border transition-all cursor-pointer text-center ${
              paymentMethod === "POTONG_GAJI" && buyerType === "MEMBER"
                ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                : buyerType === "NON_MEMBER"
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7] hover:bg-white"
            }`}
          >
            Potong Gaji
          </button>

          <button
            type="button"
            disabled={buyerType === "NON_MEMBER"}
            onClick={() => setPaymentMethod("SALDO_KOPERASI")}
            className={`p-2 rounded-[10px] text-[11px] font-bold border transition-all cursor-pointer text-center ${
              paymentMethod === "SALDO_KOPERASI" && buyerType === "MEMBER"
                ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                : buyerType === "NON_MEMBER"
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7] hover:bg-white"
            }`}
          >
            Saldo Koperasi
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("QRIS_TUNAI")}
            className={`p-2 rounded-[10px] text-[11px] font-bold border transition-all cursor-pointer text-center ${
              paymentMethod === "QRIS_TUNAI"
                ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7] hover:bg-white"
            }`}
          >
            QRIS Stand
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMethod("CASH_TUNAI");
              if (!cashReceivedInput && effectiveSubtotal > 0) {
                setCashReceivedInput(effectiveSubtotal.toString());
              }
            }}
            className={`p-2 rounded-[10px] text-[11px] font-bold border transition-all cursor-pointer text-center ${
              paymentMethod === "CASH_TUNAI"
                ? "bg-[#2DBA7D] text-white border-[#2DBA7D] shadow-xs"
                : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7] hover:bg-white"
            }`}
          >
            Tunai (Cash)
          </button>
        </div>
      </div>

      {/* QRIS Active Status Banner */}
      {paymentMethod === "QRIS_TUNAI" && (
        <div className="p-3 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 bg-white rounded-[8px] border border-[#E6E3F7] p-1 shrink-0 overflow-hidden shadow-xs">
              <Image
                src={activeQris?.imageUrl || currentTenant.qrisImageUrl || "/images/qris-example.jpg"}
                alt={activeQris?.label || "QRIS Stand"}
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#1C1B3A] truncate">
                  {activeQris?.label || "QRIS Stand Aktif"}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#E6F9F0] text-[#2DBA7D] shrink-0">
                  {activeQris?.bankOrProvider || "NMID Valid"}
                </span>
              </div>
              <p className="text-[10px] text-[#6F6B88] font-mono truncate">
                NMID: {activeQris?.nmid || currentTenant.qrisNmid || "ID1020039281920"}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-[#4A3AFF] bg-white/80 py-1 px-2.5 rounded-[8px] border border-[#E6E3F7] font-medium text-center">
            Klik tombol <strong>&quot;Tampilkan QRIS &amp; Bayar&quot;</strong> di bawah untuk membuka barcode QRIS bagi pembeli.
          </p>
        </div>
      )}

      {/* CASH / TUNAI CALCULATOR PANEL */}
      {paymentMethod === "CASH_TUNAI" && (
        <div className="p-3.5 rounded-[16px] bg-[#F4FAF6] border border-[#2DBA7D]/30 space-y-3 animate-fadeIn">
          {/* Cash Box Header */}
          <div className="flex items-center justify-between pb-1 border-b border-[#2DBA7D]/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center font-bold">
                <Banknote className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#1C1B3A]">
                Kalkulator Pembayaran Tunai (Cash)
              </span>
            </div>
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
              Hitung Kembalian Otomatis
            </span>
          </div>

          {/* Cash Input Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-[#1C1B3A]">Uang Diterima dari Pembeli:</label>
              {numericCashReceived > 0 && (
                <span className="text-[#6F6B88] font-mono text-[10.5px]">
                  Rp {numericCashReceived.toLocaleString("id-ID")}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#6F6B88]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={
                  cashReceivedInput
                    ? Number(cashReceivedInput.replace(/\D/g, "")).toLocaleString("id-ID")
                    : ""
                }
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/\D/g, "");
                  setCashReceivedInput(rawVal);
                }}
                className="w-full bg-white border border-[#2DBA7D]/40 rounded-[12px] pl-9 pr-8 py-2 text-sm font-bold text-[#1C1B3A] focus:outline-none focus:border-[#2DBA7D] focus:ring-2 focus:ring-[#2DBA7D]/20 shadow-2xs"
              />
              {cashReceivedInput && (
                <button
                  type="button"
                  onClick={() => setCashReceivedInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A5A2B8] hover:text-red-500 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-[#6F6B88]">Pilihan Cepat / Pecahan Uang:</p>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setCashReceivedInput(effectiveSubtotal.toString())}
                className="px-2 py-1 rounded-[8px] bg-white border border-[#2DBA7D]/40 text-[#2DBA7D] hover:bg-[#E6F9F0] text-[10.5px] font-bold cursor-pointer transition-all shadow-2xs"
              >
                Uang Pas (Rp {effectiveSubtotal.toLocaleString("id-ID")})
              </button>
              {[10000, 20000, 50000, 100000].map((nominal) => (
                <button
                  key={nominal}
                  type="button"
                  onClick={() => setCashReceivedInput(nominal.toString())}
                  className={`px-2 py-1 rounded-[8px] border text-[10.5px] font-semibold cursor-pointer transition-all shadow-2xs ${
                    numericCashReceived === nominal
                      ? "bg-[#2DBA7D] text-white border-[#2DBA7D]"
                      : "bg-white border-[#E6E3F7] text-[#1C1B3A] hover:bg-gray-50"
                  }`}
                >
                  Rp {nominal.toLocaleString("id-ID")}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const roundedUp = Math.ceil(effectiveSubtotal / 50000) * 50000 || 50000;
                  setCashReceivedInput(roundedUp.toString());
                }}
                className="px-2 py-1 rounded-[8px] bg-white border border-[#E6E3F7] text-[#4A3AFF] hover:bg-[#F5F3FF] text-[10.5px] font-semibold cursor-pointer transition-all shadow-2xs"
              >
                Bulatkan 50k
              </button>
            </div>
          </div>

          {/* Live Change Calculation Status */}
          {numericCashReceived > 0 ? (
            isCashSufficient ? (
              <div className="p-2.5 rounded-[12px] bg-[#E6F9F0] border border-[#2DBA7D] text-[#059669] flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-[10.5px] font-medium text-[#059669]/80">
                    {cashChange === 0 ? "Uang Pas Diterima:" : "Uang Kembalian Pembeli:"}
                  </p>
                  <p className="text-base font-black text-[#059669]">
                    Rp {cashChange.toLocaleString("id-ID")}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white text-[#059669] border border-[#2DBA7D]/30 shadow-2xs">
                  {cashChange === 0 ? "✓ Pas (Tanpa Kembalian)" : "✓ Kembalikan ke Pembeli"}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-[12px] bg-red-50 border border-red-200 text-red-700 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-[10.5px] font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Uang Tunai Kurang:</span>
                  </p>
                  <p className="text-sm font-black text-red-700">
                    -Rp {(effectiveSubtotal - numericCashReceived).toLocaleString("id-ID")}
                  </p>
                </div>
                <span className="text-[9.5px] font-bold px-2 py-1 rounded-full bg-white text-red-600 border border-red-200">
                  Uang Kurang
                </span>
              </div>
            )
          ) : (
            <div className="p-2 rounded-[10px] bg-white/80 border border-[#E6E3F7] text-[10.5px] text-[#6F6B88] text-center">
              Masukkan jumlah uang tunai yang diberikan pembeli di atas.
            </div>
          )}
        </div>
      )}

      {/* Summary Totals */}
      <div className="p-3 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-1.5 text-xs">
        <div className="flex justify-between text-[#6F6B88]">
          <span>Total Item:</span>
          <span className="font-bold text-[#1C1B3A]">{totalItemsCount} pcs</span>
        </div>

        <div className="flex justify-between text-[#6F6B88]">
          <span>Tipe Pembeli:</span>
          <span
            className={`font-bold ${
              buyerType === "MEMBER" ? "text-[#2DBA7D]" : "text-[#D97706]"
            }`}
          >
            {buyerType === "MEMBER"
              ? "Anggota Kopkar (Diskon Aktif)"
              : "Non-Karyawan (Tarif Umum)"}
          </span>
        </div>

        {buyerType === "MEMBER" ? (
          <div className="flex justify-between text-[#2DBA7D]">
            <span>Hemat Diskon Anggota:</span>
            <span className="font-bold">-Rp {totalMemberSavings.toLocaleString("id-ID")}</span>
          </div>
        ) : (
          <div className="flex justify-between text-[#6F6B88]">
            <span>Benefit Diskon:</span>
            <span className="text-[10.5px] text-[#A5A2B8] italic">
              Tidak berlaku untuk Non-Karyawan
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm font-extrabold text-[#1C1B3A] pt-1.5 border-t border-[#E6E3F7]">
          <span>Total Tagihan:</span>
          <span className="text-[#4A3AFF]">
            Rp {effectiveSubtotal.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={
          cart.length === 0 ||
          (paymentMethod === "CASH_TUNAI" && numericCashReceived > 0 && !isCashSufficient)
        }
        className={`w-full py-3 px-4 rounded-full text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
          cart.length === 0
            ? "bg-gray-300 cursor-not-allowed"
            : paymentMethod === "CASH_TUNAI" && numericCashReceived > 0 && !isCashSufficient
            ? "bg-red-500 cursor-not-allowed opacity-90"
            : paymentMethod === "CASH_TUNAI"
            ? "bg-[#2DBA7D] hover:bg-[#259b67] active:scale-[0.98]"
            : "bg-[#4A3AFF] hover:bg-[#3D2EE0] active:scale-[0.98]"
        }`}
      >
        {paymentMethod === "QRIS_TUNAI" ? (
          <>
            <QrCode className="w-4 h-4" />
            <span>Tampilkan QRIS &amp; Bayar (Rp {effectiveSubtotal.toLocaleString("id-ID")})</span>
          </>
        ) : paymentMethod === "CASH_TUNAI" ? (
          numericCashReceived > 0 && !isCashSufficient ? (
            <>
              <AlertCircle className="w-4 h-4 text-white" />
              <span>Uang Kurang Rp {(effectiveSubtotal - numericCashReceived).toLocaleString("id-ID")}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>
                Bayar Tunai &amp; Cetak Struk {isCashSufficient && cashChange > 0 ? `(Kembalian Rp ${cashChange.toLocaleString("id-ID")})` : `(Rp ${effectiveSubtotal.toLocaleString("id-ID")})`}
              </span>
            </>
          )
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Bayar &amp; Cetak Struk (Rp {effectiveSubtotal.toLocaleString("id-ID")})</span>
          </>
        )}
      </button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 pb-28 lg:pb-0">
          {/* Search & Categories */}
          <div className="bg-white p-4 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari makanan atau produk di stand ini..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9 pr-4 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-1.5 px-3 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#4A3AFF] text-white"
                      : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#F5F3FF] hover:text-[#4A3AFF] border border-[#E6E3F7]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map((p) => {
              const inCartItem = cart.find((c) => c.product.id === p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[18px] border border-[#E6E3F7] p-3 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="space-y-2">
                    {/* Image Preview */}
                    <div className="relative h-28 w-full bg-[#FAFAFC] rounded-[12px] overflow-hidden flex items-center justify-center">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <UtensilsCrossed className="w-8 h-8 text-[#A5A2B8]" />
                      )}
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-[#1C1B3A] border border-[#E6E3F7]">
                        Stok: {p.stock}
                      </span>
                    </div>

                    {/* Title & Prices */}
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-bold text-[#1C1B3A] line-clamp-2 leading-tight">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#4A3AFF]">
                          Rp {p.memberPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[10px] text-[#A5A2B8] line-through">
                          Rp {p.regularPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add / Quantity Button */}
                  <div className="pt-2.5">
                    {!inCartItem ? (
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={p.stock <= 0}
                        className={`w-full py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          p.stock > 0
                            ? "bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white border border-[#E6E3F7]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{p.stock > 0 ? "Pilih" : "Habis"}</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-[#F5F3FF] rounded-full p-0.5 border border-[#E6E3F7]">
                        <button
                          onClick={() => handleUpdateQuantity(p.id, -1)}
                          className="w-6 h-6 rounded-full bg-white hover:bg-red-50 text-[#6F6B88] hover:text-red-600 flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#4A3AFF]">
                          {inCartItem.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(p.id, 1)}
                          className="w-6 h-6 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Desktop Walk-in Cart & Checkout (Desktop only, hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-lg space-y-4.5 sticky top-20">
          <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#4A3AFF]" />
              <h2 className="text-sm font-bold text-[#1C1B3A]">Keranjang Kasir Stand</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-[11px] text-red-500 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          {renderCartContent()}
        </div>
      </div>

      {/* Floating Bottom Cart Bar (GoFood Style for Mobile) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-6 lg:hidden z-40 animate-slideUp">
          <div
            onClick={() => setIsMobileCartOpen(true)}
            className="bg-[#1C1B3A] text-white p-3 sm:p-3.5 rounded-[22px] shadow-2xl border border-white/10 flex items-center justify-between gap-3 backdrop-blur-md cursor-pointer active:scale-[0.98] transition-all hover:bg-[#25244C]"
          >
            {/* Left: Summary info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#2DBA7D] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1C1B3A]">
                  {totalItemsCount}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {totalItemsCount} Menu Dipilih
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      buyerType === "MEMBER"
                        ? "bg-[#2DBA7D]/20 text-[#2DBA7D]"
                        : "bg-[#D97706]/20 text-[#FFB547]"
                    }`}
                  >
                    {buyerType === "MEMBER" ? "Member" : "Umum"}
                  </span>
                </div>
                <p className="text-sm font-black text-[#2DBA7D]">
                  Rp {effectiveSubtotal.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Right: Action Button */}
            <div className="py-2 px-3.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0">
              <span>Lihat Keranjang</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cart Bottom Sheet (GoFood / Food Delivery Style) */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop dismiss touch area */}
          <div
            className="flex-1 w-full"
            onClick={() => setIsMobileCartOpen(false)}
          />

          {/* Bottom Sheet Card */}
          <div className="bg-white rounded-t-[28px] border-t border-[#E6E3F7] shadow-2xl w-full max-h-[88vh] flex flex-col animate-slideUp overflow-hidden">
            {/* Sheet Handle & Header */}
            <div className="p-4 pb-3 border-b border-[#E6E3F7] shrink-0 bg-white space-y-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1C1B3A]">Keranjang Kasir Stand</h2>
                    <p className="text-[10.5px] text-[#6F6B88]">{totalItemsCount} item dipilih</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-[11px] font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileCartOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 text-[#6F6B88] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Cart Content */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {renderCartContent()}
            </div>
          </div>
        </div>
      )}

      {/* QRIS PAYMENT MODAL */}
      {showQrisPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-xs border border-red-200">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1B3A]">
                    {activeQris?.label || "QRIS Pembayaran Stand"}
                  </h3>
                  <p className="text-[10.5px] text-[#6F6B88]">Scan via m-Banking / e-Wallet apa saja</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrisPaymentModal(false)}
                className="w-7 h-7 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1 bg-[#F5F3FF] p-3 rounded-[16px] border border-[#E6E3F7]">
              <p className="text-xs font-bold text-[#1C1B3A]">{currentTenant.name}</p>
              <p className="text-[10.5px] text-[#6F6B88]">
                {currentTenant.location} • NMID: <strong>{activeQris?.nmid || currentTenant.qrisNmid || "ID1020039281920"}</strong>
              </p>
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                  ✓ Merchant Resmi Koperasi BIT ({activeQris?.bankOrProvider || "BCA"})
                </span>
              </div>
            </div>

            <div className="relative bg-[#FAFAFC] rounded-[20px] border-2 border-dashed border-[#4A3AFF]/30 p-4 text-center space-y-3 shadow-inner">
              <div className="relative w-60 h-72 mx-auto bg-white rounded-[14px] p-2 shadow-sm border border-[#E6E3F7] flex items-center justify-center overflow-hidden">
                <Image
                  src={activeQris?.imageUrl || currentTenant.qrisImageUrl || "/images/qris-example.jpg"}
                  alt={activeQris?.label || "QRIS Pembayaran Kantin"}
                  fill
                  sizes="260px"
                  className="object-contain p-1"
                  priority
                />
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] text-[#6F6B88]">Total Tagihan yang Harus Di-scan:</p>
                <p className="text-2xl font-black text-[#4A3AFF]">
                  Rp {effectiveSubtotal.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-[#6F6B88]">
                  Pembeli: <strong>{buyerType === "MEMBER" ? selectedEmployee?.name : "Non-Karyawan (Tamu / Umum)"}</strong>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Menunggu Pembeli Scan &amp; Konfirmasi Bank...</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-[#A5A2B8]">
              Mendukung BCA Mobile, Livin by Mandiri, BRImo, BNI Mobile, GoPay, OVO, ShopeePay, DANA, LinkAja
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => finalizeOrder("QRIS_TUNAI")}
                className="w-full py-3 px-4 rounded-full bg-[#2DBA7D] hover:bg-[#259b67] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>✓ Pembayaran QRIS Diterima &amp; Cetak Struk</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrisPaymentModal(false)}
                className="w-full py-2.5 rounded-full bg-white hover:bg-gray-50 border border-[#E6E3F7] text-[#6F6B88] font-semibold text-xs transition-all cursor-pointer"
              >
                Batal / Ganti Metode Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS RECEIPT MODAL */}
      {showReceiptModal && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4 max-h-[96vh] flex flex-col my-auto">
            {/* Modal Header & Paper Size Switcher (Hidden when printing) */}
            <div className="no-print space-y-3 pb-3 border-b border-[#E6E3F7] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center font-bold">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1B3A]">Struk Transaksi POS</h3>
                    <p className="text-[10.5px] text-[#6F6B88]">Format Cetak Thermal Kasir</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 text-[#6F6B88] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thermal Paper Size Selector */}
              <div className="flex items-center justify-between bg-[#FAFAFC] p-1.5 rounded-[12px] border border-[#E6E3F7]">
                <span className="text-[11px] font-bold text-[#6F6B88] pl-1.5">
                  Ukuran Kertas Thermal:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setReceiptPaperSize("58mm")}
                    className={`px-3 py-1 rounded-[8px] text-[11px] font-bold transition-all cursor-pointer ${
                      receiptPaperSize === "58mm"
                        ? "bg-[#4A3AFF] text-white shadow-xs"
                        : "text-[#6F6B88] hover:text-[#1C1B3A] hover:bg-white"
                    }`}
                  >
                    58mm (Mini POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptPaperSize("80mm")}
                    className={`px-3 py-1 rounded-[8px] text-[11px] font-bold transition-all cursor-pointer ${
                      receiptPaperSize === "80mm"
                        ? "bg-[#4A3AFF] text-white shadow-xs"
                        : "text-[#6F6B88] hover:text-[#1C1B3A] hover:bg-white"
                    }`}
                  >
                    80mm (Standar)
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Receipt Preview Container */}
            <div className="flex-1 overflow-y-auto py-1 flex justify-center bg-[#F8F7FD] rounded-[16px] p-3 border border-[#E6E3F7]">
              {/* Authentic Thermal Printable Receipt Card */}
              <div
                id="pos-receipt-print-area"
                className="thermal-receipt-paper bg-white text-black p-4 space-y-2 border border-dashed border-gray-300 shadow-sm text-left select-text"
                style={{
                  width: receiptPaperSize === "58mm" ? "58mm" : "80mm",
                  maxWidth: "100%",
                  fontSize: receiptPaperSize === "58mm" ? "10px" : "11.5px",
                  lineHeight: "1.28",
                  fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
                }}
              >
                {/* 1. Thermal Header */}
                <div className="text-center space-y-0.5 pb-1.5">
                  <p className="font-bold text-[10.5px] uppercase tracking-wider">
                    *** KOPERASI KARYAWAN PT BIT ***
                  </p>
                  <h4 className="font-black text-xs sm:text-sm uppercase leading-tight pt-0.5">
                    {currentTenant.name}
                  </h4>
                  <p className="text-[9.5px] text-gray-700">{currentTenant.location}</p>
                  <div className="border-b border-dashed border-black pt-1.5" />
                </div>

                {/* 2. Transaction Metadata */}
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>No. Struk :</span>
                    <span className="font-bold">{lastCompletedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu     :</span>
                    <span>{lastCompletedOrder.createdAt === "Baru saja" ? new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : lastCompletedOrder.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir     :</span>
                    <span>Stand Kasir 01</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan :</span>
                    <span className="font-bold truncate max-w-[130px]">{lastCompletedOrder.employeeName}</span>
                  </div>
                  {lastCompletedOrder.employeeNik && lastCompletedOrder.employeeNik !== "-" && (
                    <div className="flex justify-between">
                      <span>NIK/Div   :</span>
                      <span className="truncate max-w-[130px]">{lastCompletedOrder.employeeNik} ({lastCompletedOrder.department})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tipe      :</span>
                    <span className="font-bold">
                      {lastCompletedOrder.employeeId === "NON-EMP"
                        ? "[TARIF UMUM]"
                        : "[MEMBER KOPKAR]"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode    :</span>
                    <span className="font-bold">
                      {lastCompletedOrder.paymentMethod === "CASH_TUNAI"
                        ? "CASH (TUNAI)"
                        : lastCompletedOrder.paymentMethod === "QRIS_TUNAI"
                        ? "QRIS STAND"
                        : lastCompletedOrder.paymentMethod === "POTONG_GAJI"
                        ? "POTONG GAJI (PAYROLL)"
                        : "SALDO KOPERASI"}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-black pt-1" />
                </div>

                {/* 3. Items Breakdown */}
                <div className="space-y-1 py-0.5">
                  <div className="flex justify-between font-bold text-[9.5px] border-b border-dotted border-gray-400 pb-0.5">
                    <span>MENU / ITEM</span>
                    <span>SUBTOTAL</span>
                  </div>

                  {lastCompletedOrder.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.2">
                      <div className="flex justify-between items-start font-bold">
                        <span className="break-words pr-1">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="shrink-0 text-right">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="text-[9px] text-gray-600 pl-2.5">
                        @Rp {(item.subtotal / item.quantity).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                  <div className="border-b border-dashed border-black pt-1" />
                </div>

                {/* 4. Payment Totals & Calculator */}
                <div className="space-y-0.5 text-[10.5px]">
                  {lastCompletedOrder.totalSaved && lastCompletedOrder.totalSaved > 0 ? (
                    <div className="flex justify-between text-[9.5px]">
                      <span>Hemat Diskon Member:</span>
                      <span>-Rp {lastCompletedOrder.totalSaved.toLocaleString("id-ID")}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between font-black text-xs sm:text-sm border-y border-double border-black py-1 my-0.5">
                    <span>TOTAL TAGIHAN:</span>
                    <span>Rp {lastCompletedOrder.totalAmount.toLocaleString("id-ID")}</span>
                  </div>

                  {lastCompletedOrder.paymentMethod === "CASH_TUNAI" && (
                    <>
                      <div className="flex justify-between pt-0.5">
                        <span>Tunai Diterima:</span>
                        <span>
                          Rp {(lastCompletedOrder.cashReceived || lastCompletedOrder.totalAmount).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between font-black text-xs">
                        <span>UANG KEMBALIAN:</span>
                        <span>
                          Rp {(lastCompletedOrder.cashChange || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </>
                  )}

                  {lastCompletedOrder.paymentMethod === "QRIS_TUNAI" && (
                    <div className="flex justify-between text-[9.5px]">
                      <span>Ref QRIS:</span>
                      <span className="font-bold font-mono">
                        QRIS-BIT-{lastCompletedOrder.id.replace("ORD-", "")}
                      </span>
                    </div>
                  )}

                  {lastCompletedOrder.paymentMethod === "POTONG_GAJI" && (
                    <div className="flex justify-between text-[9.5px]">
                      <span>Payroll Cutoff:</span>
                      <span>Tgl 25 Setiap Bulan</span>
                    </div>
                  )}
                  <div className="border-b border-dashed border-black pt-1" />
                </div>

                {/* 5. Thermal Receipt Footer */}
                <div className="text-center pt-1 space-y-0.5 text-[9.5px]">
                  <p className="font-bold text-[10px]">*** LUNAS ***</p>
                  <p className="font-semibold">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
                  <p className="text-[8.5px] text-gray-700">
                    Selamat Menikmati Hidangan Kantin
                  </p>
                  <div className="py-0.5 tracking-widest text-[8.5px] select-none font-mono text-center">
                    ||| | ||||| | ||| |||| | ||||| |||
                  </div>
                  <p className="text-[8px] text-gray-500">
                    Kopkar PT BIT POS System • {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons (Hidden when printing) */}
            <div className="no-print space-y-2 pt-2 border-t border-[#E6E3F7] shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 px-4 rounded-full bg-[#1C1B3A] hover:bg-[#25244C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.98]"
              >
                <Printer className="w-4 h-4 text-[#2DBA7D]" />
                <span>Cetak Struk Thermal ({receiptPaperSize})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-full py-2.5 rounded-full bg-white hover:bg-gray-50 border border-[#E6E3F7] text-[#1C1B3A] font-bold text-xs transition-all cursor-pointer"
              >
                Tutup Struk &amp; Siap Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
