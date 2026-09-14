"use client";

import React, { useState } from "react";
import {
  UtensilsCrossed,
  Wrench,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Receipt,
  Search,
  Tag,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { sampleProducts, sampleEmployees } from "@/data/mockData";
import { CanteenProduct, ProductCategory } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface CartItem {
  product: CanteenProduct;
  quantity: number;
}

export const CanteenView: React.FC = () => {
  const [products, setProducts] = useState<CanteenProduct[]>(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Selected Employee Buyer
  const [selectedBuyerId, setSelectedBuyerId] = useState(sampleEmployees[0].id);
  const [paymentMethod, setPaymentMethod] = useState<"PAYROLL_DEDUCTION" | "SALDO_KOPERASI">("PAYROLL_DEDUCTION");
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  const selectedBuyer =
    sampleEmployees.find((e) => e.id === selectedBuyerId) || sampleEmployees[0];

  const categories = [
    { id: "ALL", label: "Semua Produk" },
    { id: "ALAT_KERJA", label: "🔧 Perkakas & Safety BIT" },
    { id: "MAKANAN", label: "🍱 Makanan Kantin" },
    { id: "MINUMAN", label: "🥤 Minuman" },
    { id: "KEBUTUHAN_HARIAN", label: "🧼 Sembako & Harian" },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: CanteenProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Pricing calculations
  const isMember = selectedBuyer.isCoopMember;
  const subtotal = cart.reduce((acc, item) => {
    const price = isMember ? item.product.memberPrice : item.product.regularPrice;
    return acc + price * item.quantity;
  }, 0);

  const regularSubtotal = cart.reduce((acc, item) => {
    return acc + item.product.regularPrice * item.quantity;
  }, 0);

  const totalMemberSavings = regularSubtotal - subtotal;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckoutSuccess(true);
    setCart([]);
    setTimeout(() => setShowCheckoutSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-[18px] border border-[#E6E3F7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#1C1B3A]">
              Toko Perkakas & Kantin Karyawan PT. Bhakti Idola Tama
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
              Harga Khusus Karyawan BIT
            </span>
          </div>
          <p className="text-xs text-[#6F6B88]">
            Menyediakan <strong>Perkakas Mesin, Hand Tools, APD Safety, dan Makan Siang Shift</strong> dengan potongan harga pabrik & autodebet payroll.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="p-3 bg-[#F5F3FF] rounded-[12px] border border-[#E6E3F7]">
            <span className="text-[#6F6B88] block text-[10px]">Total Item BIT Tersedia</span>
            <strong className="text-[#4A3AFF] text-sm">{products.length} Katalog Produk</strong>
          </div>
        </div>
      </div>

      {/* 2. Main POS Layout: Left Catalog Grid, Right Order Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 cols): Catalog & Filters */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] shadow-sm space-y-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari perkakas mesin, kunci, safety gear, atau makanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9 pr-4 py-2 text-xs text-[#212529] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#4A3AFF] text-white shadow-sm"
                      : "bg-[#F5F3FF] text-[#6F6B88] hover:text-[#1C1B3A] border border-[#E6E3F7]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] hover:border-[#4A3AFF]/50 shadow-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                      {p.category.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-[#6F6B88]">
                      Stok: {p.stock} {p.unit}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#1C1B3A] line-clamp-2">{p.name}</h4>
                </div>

                {/* Price Display */}
                <div>
                  <div className="p-2.5 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7]/80 mb-3 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#6F6B88]">Harga Umum:</span>
                      <span className="text-[#6F6B88] line-through">
                        Rp {p.regularPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#4A3AFF]">Harga Karyawan BIT:</span>
                      <span className="font-bold text-[#4A3AFF]">
                        Rp {p.memberPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(p)}
                    className="w-full py-2 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white border border-[#E6E3F7] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah ke Kasir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): POS Cashier Cart & Employee Selector */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 rounded-[18px] border border-[#E6E3F7] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E3F7]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#4A3AFF]" />
                <h3 className="font-bold text-sm text-[#1C1B3A]">Kasir & Keranjang BIT</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                {cart.reduce((a, b) => a + b.quantity, 0)} Item
              </span>
            </div>

            {/* Buyer Employee Selector */}
            <div className="mt-4 p-3 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-2">
              <label className="block text-[11px] font-bold text-[#1C1B3A]">
                Pilih Karyawan PT Bhakti Idola Tama
              </label>
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className="w-full bg-white border border-[#E6E3F7] rounded-[10px] px-3 py-2 text-xs text-[#1C1B3A]"
              >
                {sampleEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.nik} - {emp.department})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[#6F6B88]">Status Keanggotaan:</span>
                <span className="font-bold text-[#2DBA7D]">Anggota Kopkar BIT</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-3 space-y-1.5">
              <label className="block text-[11px] font-bold text-[#1C1B3A]">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PAYROLL_DEDUCTION")}
                  className={`p-2 rounded-[12px] border text-left cursor-pointer transition-all ${
                    paymentMethod === "PAYROLL_DEDUCTION"
                      ? "bg-[#4A3AFF] text-white border-[#4A3AFF] font-semibold"
                      : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7]"
                  }`}
                >
                  <p className="font-bold text-xs">Potong Gaji</p>
                  <p className="text-[10px] opacity-80">Auto Payroll HR</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("SALDO_KOPERASI")}
                  className={`p-2 rounded-[12px] border text-left cursor-pointer transition-all ${
                    paymentMethod === "SALDO_KOPERASI"
                      ? "bg-[#4A3AFF] text-white border-[#4A3AFF] font-semibold"
                      : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7]"
                  }`}
                >
                  <p className="font-bold text-xs">Potong Saldo</p>
                  <p className="text-[10px] opacity-80">Dompet Digital</p>
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#6F6B88]">
                  Keranjang belanja kosong. Pilih perkakas atau makanan di samping.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1C1B3A] truncate">{item.product.name}</p>
                      <p className="text-[11px] text-[#4A3AFF] font-semibold">
                        Rp {item.product.memberPrice.toLocaleString("id-ID")} x {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-full bg-white border border-[#E6E3F7] flex items-center justify-center text-[#1C1B3A] hover:bg-[#F5F3FF]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-full bg-white border border-[#E6E3F7] flex items-center justify-center text-[#1C1B3A] hover:bg-[#F5F3FF]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-6 h-6 rounded-full bg-[#FFEBEB] text-[#E5484D] flex items-center justify-center hover:bg-[#E5484D] hover:text-white transition-colors ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Total & Checkout Button */}
          {cart.length > 0 && (
            <div className="pt-3 border-t border-[#E6E3F7] space-y-3">
              <div className="space-y-1 text-xs">
                {totalMemberSavings > 0 && (
                  <div className="flex justify-between items-center text-[#2DBA7D] font-semibold text-[11px]">
                    <span>Hemat Diskon Karyawan BIT:</span>
                    <span>- Rp {totalMemberSavings.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-[#1C1B3A]">
                  <span>Total Tagihan:</span>
                  <span className="text-[#4A3AFF] text-base">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Proses Tagihan ({paymentMethod === "PAYROLL_DEDUCTION" ? "Potong Gaji BIT" : "Saldo"})</span>
              </button>
            </div>
          )}

          {showCheckoutSuccess && (
            <div className="p-3 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Transaksi berhasil! Tagihan belanja otomatis tercatat di slip potong gaji karyawan PT Bhakti Idola Tama.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
