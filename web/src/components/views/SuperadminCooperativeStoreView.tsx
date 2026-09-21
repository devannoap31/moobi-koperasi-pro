"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  QrCode,
  Printer,
  Sparkles,
  CreditCard,
  Building2,
  Clock,
  User,
  X,
  Edit3,
  Package,
  Layers,
  Check,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Coins,
  Banknote,
  Receipt,
  FileText,
  BadgePercent,
  SlidersHorizontal,
  ArrowRight,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import {
  sampleStoreProducts,
  sampleStoreTransactions,
  sampleEmployees,
} from "@/data/mockData";
import {
  StoreProduct,
  StoreTransaction,
  StoreCategory,
  StorePaymentMethod,
  EmployeeMember,
} from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import {
  FormalReportConfig,
  buildStoreReportConfig,
  exportToCsv,
} from "@/utils/reportExporter";
import { ReportExportModal } from "@/components/common/ReportExportModal";

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export const SuperadminCooperativeStoreView: React.FC = () => {
  // Tabs: "CATALOG" | "POS_CASHIER" | "TRANSACTIONS"
  const [activeTab, setActiveTab] = useState<"CATALOG" | "POS_CASHIER" | "TRANSACTIONS">("CATALOG");

  // ==========================================
  // CATALOG STATE
  // ==========================================
  const [products, setProducts] = useState<StoreProduct[]>(sampleStoreProducts);
  const [catalogSearch, setCatalogSearch] = useState("");
  const debouncedCatalogSearch = useDebounce(catalogSearch, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [productFormData, setProductFormData] = useState<Partial<StoreProduct>>({
    code: "",
    name: "",
    category: "ELEKTRONIK_RUMAH",
    brand: "",
    cashPrice: 0,
    memberPrice: 0,
    installmentAvailable: true,
    maxInstallmentMonths: 12,
    stock: 10,
    unit: "Unit",
    imageUrl: "/images/products/rice-cooker(1).png",
    description: "",
    warrantyPeriod: "1 Tahun Resmi",
  });

  // Restock Quick Modal
  const [restockProduct, setRestockProduct] = useState<StoreProduct | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // ==========================================
  // POS & CHECKOUT STATE
  // ==========================================
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMember | null>(sampleEmployees[0]);
  const [buyerSearchQuery, setBuyerSearchQuery] = useState(sampleEmployees[0].name);
  const debouncedBuyerSearch = useDebounce(buyerSearchQuery, 300);
  const [isBuyerDropdownOpen, setIsBuyerDropdownOpen] = useState(false);
  const buyerDropdownRef = useRef<HTMLDivElement>(null);

  const [paymentMethod, setPaymentMethod] = useState<StorePaymentMethod>("TUNAI");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastCompletedTx, setLastCompletedTx] = useState<StoreTransaction | null>(null);
  const [receiptPaperSize, setReceiptPaperSize] = useState<"58mm" | "80mm">("58mm");

  // ==========================================
  // TRANSACTIONS HISTORY STATE
  // ==========================================
  const [transactions, setTransactions] = useState<StoreTransaction[]>(sampleStoreTransactions);
  const [txSearch, setTxSearch] = useState("");
  const debouncedTxSearch = useDebounce(txSearch, 300);
  const [txStatusFilter, setTxStatusFilter] = useState<string>("ALL");
  const [txPaymentFilter, setTxPaymentFilter] = useState<string>("ALL");
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<StoreTransaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState<FormalReportConfig | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close employee search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (buyerDropdownRef.current && !buyerDropdownRef.current.contains(e.target as Node)) {
        setIsBuyerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products for Catalog & Mini POS Catalog
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchSearch =
      !debouncedCatalogSearch.trim() ||
      p.name.toLowerCase().includes(debouncedCatalogSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(debouncedCatalogSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(debouncedCatalogSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Filtered Employees for Buyer Selector
  const filteredEmployees = sampleEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(debouncedBuyerSearch.toLowerCase()) ||
      emp.nik.toLowerCase().includes(debouncedBuyerSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(debouncedBuyerSearch.toLowerCase())
  );

  // Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      !debouncedTxSearch.trim() ||
      tx.invoiceNumber.toLowerCase().includes(debouncedTxSearch.toLowerCase()) ||
      tx.employeeName.toLowerCase().includes(debouncedTxSearch.toLowerCase()) ||
      tx.employeeNik.toLowerCase().includes(debouncedTxSearch.toLowerCase());
    const matchStatus = txStatusFilter === "ALL" || tx.status === txStatusFilter;
    const matchPayment = txPaymentFilter === "ALL" || tx.paymentMethod === txPaymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.memberPrice * item.quantity, 0);
  const cartCashTotal = cart.reduce((sum, item) => sum + item.product.cashPrice * item.quantity, 0);
  const cartTotalSavings = cartCashTotal - cartSubtotal;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart operations
  const addToCart = (product: StoreProduct) => {
    if (product.stock <= 0) {
      showToast(`Stok produk "${product.name}" habis!`, "error");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Stok maksimal tercapai (${product.stock} ${product.unit})`, "info");
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              showToast(`Stok maksimal ${item.product.stock} ${item.product.unit}`, "info");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Handle Product Save (Add / Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name || !productFormData.cashPrice || !productFormData.memberPrice) {
      showToast("Harap isi semua kolom wajib produk!", "error");
      return;
    }

    if (editingProduct) {
      // Edit Product
      const updated: StoreProduct = {
        ...editingProduct,
        ...productFormData,
        name: productFormData.name!,
        cashPrice: Number(productFormData.cashPrice),
        memberPrice: Number(productFormData.memberPrice),
        stock: Number(productFormData.stock || 0),
        brand: productFormData.brand || "BIT Pro",
        category: productFormData.category || "ELEKTRONIK_RUMAH",
        code: productFormData.code || editingProduct.code,
        unit: productFormData.unit || "Unit",
        imageUrl: productFormData.imageUrl || editingProduct.imageUrl,
        description: productFormData.description || "",
        warrantyPeriod: productFormData.warrantyPeriod || "1 Tahun Resmi",
      };

      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      showToast(`Produk "${updated.name}" berhasil diperbarui!`, "success");
    } else {
      // Add Product
      const newProd: StoreProduct = {
        id: `ST-PRD-${Date.now().toString().slice(-4)}`,
        code: productFormData.code || `ELK-${Math.floor(100 + Math.random() * 900)}`,
        name: productFormData.name!,
        category: productFormData.category || "ELEKTRONIK_RUMAH",
        brand: productFormData.brand || "BIT Pro",
        cashPrice: Number(productFormData.cashPrice),
        memberPrice: Number(productFormData.memberPrice),
        installmentAvailable: productFormData.installmentAvailable !== false,
        maxInstallmentMonths: Number(productFormData.maxInstallmentMonths || 12),
        stock: Number(productFormData.stock || 10),
        unit: productFormData.unit || "Unit",
        imageUrl: productFormData.imageUrl || "/images/products/rice-cooker(1).png",
        description: productFormData.description || "Produk toko koperasi resmi garansi pabrik.",
        warrantyPeriod: productFormData.warrantyPeriod || "1 Tahun Resmi",
        rating: 5.0,
        soldCount: 0,
      };

      setProducts((prev) => [newProd, ...prev]);
      showToast(`Produk baru "${newProd.name}" berhasil ditambahkan ke katalog!`, "success");
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Handle Quick Restock
  const handleQuickRestockSubmit = () => {
    if (!restockProduct || restockAmount <= 0) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === restockProduct.id ? { ...p, stock: p.stock + restockAmount } : p
      )
    );
    showToast(`Stok "${restockProduct.name}" berhasil ditambah +${restockAmount} ${restockProduct.unit}`, "success");
    setRestockProduct(null);
    setRestockAmount(10);
  };

  // Handle Product Delete
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}" dari katalog toko?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`Produk "${productName}" telah dihapus`, "info");
    }
  };

  // Complete Order / Checkout
  const handleProcessCheckout = () => {
    if (cart.length === 0) {
      showToast("Keranjang belanja masih kosong!", "error");
      return;
    }

    if (!selectedEmployee) {
      showToast("Harap pilih data karyawan pembeli terlebih dahulu!", "error");
      return;
    }

    const cashNum = parseInt(cashReceived.replace(/\D/g, ""), 10) || 0;
    if (paymentMethod === "TUNAI" && cashNum < cartSubtotal) {
      showToast("Nominal uang tunai diterima kurang dari total belanja!", "error");
      return;
    }

    const newTx: StoreTransaction = {
      id: `ST-TRX-${Date.now().toString().slice(-4)}`,
      invoiceNumber: `INV-STORE-2026-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmployee.id,
      employeeNik: selectedEmployee.nik,
      employeeName: selectedEmployee.name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      items: cart.map((item) => ({
        productId: item.product.id,
        productCode: item.product.code,
        productName: item.product.name,
        price: item.product.memberPrice,
        quantity: item.quantity,
        subtotal: item.product.memberPrice * item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      totalAmount: cartSubtotal,
      totalSaved: cartTotalSavings,
      paymentMethod: paymentMethod,
      payrollCutoffDay: 25,
      status: "LUNAS",
      cashReceived: paymentMethod === "TUNAI" ? cashNum : undefined,
      cashChange: paymentMethod === "TUNAI" ? cashNum - cartSubtotal : undefined,
      transactionDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      notes:
        paymentMethod === "QRIS_MANDIRI"
          ? "Pembayaran lunas instan via QRIS Bank Mandiri Kopkar BIT."
          : "Pembayaran tunai lunas kasir toko koperasi.",
    };

    // Deduct stock in products
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((item) => item.product.id === p.id);
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity), soldCount: (p.soldCount || 0) + inCart.quantity };
        }
        return p;
      })
    );

    // Add transaction to history
    setTransactions((prev) => [newTx, ...prev]);
    setLastCompletedTx(newTx);
    setCart([]);
    setCashReceived("");
    setShowReceiptModal(true);
    showToast(`Transaksi ${newTx.invoiceNumber} berhasil diproses!`, "success");
  };

  // Metrics
  const totalCatalogCount = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalSalesRevenue = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const activeInstallmentCount = transactions.filter((t) => t.status === "CICILAN_BERJALAN").length;

  const categories = [
    { id: "ALL", label: "Semua Kategori" },
    { id: "ELEKTRONIK_RUMAH", label: "Elektronik Rumah Tangga" },
    { id: "PERALATAN_DAPUR", label: "Peralatan Dapur & Masak" },
    { id: "PERKAKAS_KERJA", label: "Perkakas Kerja & Safety" },
    { id: "KESEHATAN_SAFETY", label: "Kesehatan & Perawatan" },
  ];

  const presetImages = [
    { label: "Rice Cooker", url: "/images/products/rice-cooker(1).png" },
    { label: "Blender Glass", url: "/images/products/blender(1).png" },
    { label: "Food Chopper", url: "/images/products/chopper(1).png" },
    { label: "Kipas Tornado", url: "/images/products/kipas-angin(1).png" },
    { label: "Kompor Gas", url: "/images/products/kompor(1).png" },
    { label: "Regulator Gas", url: "/images/products/regulator(1).png" },
    { label: "Setrika Ceramic", url: "/images/products/setrika(1).png" },
    { label: "Dispenser Galon", url: "/images/products/dispenser(1).png" },
    { label: "Stand Mixer", url: "/images/products/mixer(1).png" },
    { label: "Electric Oven", url: "/images/products/oven.png" },
    { label: "Slow Cooker", url: "/images/products/slow-cooker(1).png" },
    { label: "Sandwich Toaster", url: "/images/products/sandwich.png" },
    { label: "Vacuum Cleaner", url: "/images/products/vacum.png" },
    { label: "Hair Dryer", url: "/images/products/hair-dryer.png" },
    { label: "Slow Juicer", url: "/images/products/juicer.png" },
    { label: "Cookware Set", url: "/images/products/cookware(1).png" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Formal Report Export Modal */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        config={reportConfig}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-[16px] shadow-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn border ${
            toastMessage.type === "success"
              ? "bg-[#E6F9F0] text-[#2DBA7D] border-[#2DBA7D]/30"
              : toastMessage.type === "error"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-[#F5F3FF] text-[#4A3AFF] border-[#E6E3F7]"
          }`}
        >
          {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#2DBA7D] shrink-0" />}
          {toastMessage.type === "error" && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {toastMessage.type === "info" && <Sparkles className="w-4 h-4 text-[#4A3AFF] shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FF] border border-[#E6E3F7] text-xs font-semibold text-[#4A3AFF]">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Unit Bisnis Komersial Koperasi PT Bhakti Idola Tama</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1B3A] tracking-tight">
              Toko Koperasi &amp; Penjualan Barang Elektronik
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6B88] max-w-3xl leading-relaxed">
              Pusat penjualan barang elektronik rumah tangga, perlengkapan dapur, dan perkakas kerja pabrik khusus karyawan dengan skema <strong>Harga Khusus Anggota</strong> serta metode pembayaran <strong>Uang Tunai &amp; QRIS Statis Bank Mandiri</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductFormData({
                  code: `ELK-${Math.floor(100 + Math.random() * 900)}`,
                  name: "",
                  category: "ELEKTRONIK_RUMAH",
                  brand: "",
                  cashPrice: 0,
                  memberPrice: 0,
                  installmentAvailable: false,
                  maxInstallmentMonths: 1,
                  stock: 10,
                  unit: "Unit",
                  imageUrl: "/images/products/rice-cooker(1).png",
                  description: "",
                  warrantyPeriod: "1 Tahun Resmi",
                });
                setIsProductModalOpen(true);
              }}
              className="py-3 px-5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4A3AFF]/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY STAT TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E6E3F7]">
          <div className="p-4 rounded-[18px] bg-[#FAFAFC] border border-[#E6E3F7]">
            <p className="text-[11px] text-[#6F6B88] font-medium">Total Katalog Produk</p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#1C1B3A] mt-1">{totalCatalogCount} Item</p>
            <p className="text-[10px] text-[#4A3AFF] mt-0.5">Total Stok: {totalStockCount} Unit</p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#FAFAFC] border border-[#E6E3F7]">
            <p className="text-[11px] text-[#6F6B88] font-medium">Total Omzet Penjualan</p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#2DBA7D] mt-1">
              Rp {(totalSalesRevenue / 1000000).toFixed(2)} Jt
            </p>
            <p className="text-[10px] text-[#6F6B88] mt-0.5">{transactions.length} Transaksi Tercatat</p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#FAFAFC] border border-[#E6E3F7]">
            <p className="text-[11px] text-[#6F6B88] font-medium">Metode Pembayaran</p>
            <p className="text-base sm:text-lg font-extrabold text-[#4A3AFF] mt-1">Tunai &amp; QRIS Statis</p>
            <p className="text-[10px] text-[#6F6B88] mt-0.5">Bank Mandiri &amp; Kasir Toko</p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#FAFAFC] border border-[#E6E3F7]">
            <p className="text-[11px] text-[#6F6B88] font-medium">Keuntungan Anggota</p>
            <p className="text-base sm:text-lg font-extrabold text-[#2DBA7D] mt-1">Diskon Khusus</p>
            <p className="text-[10px] text-[#2DBA7D] font-semibold mt-0.5">Lebih Hemat s.d. 25%</p>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLLER NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-[#E6E3F7] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("CATALOG")}
          className={`py-3 px-5 rounded-t-[14px] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "CATALOG"
              ? "bg-white text-[#4A3AFF] border-t-2 border-[#4A3AFF] shadow-xs"
              : "text-[#6F6B88] hover:text-[#1C1B3A] hover:bg-white/50"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Katalog &amp; Stok Barang ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("POS_CASHIER")}
          className={`py-3 px-5 rounded-t-[14px] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "POS_CASHIER"
              ? "bg-white text-[#4A3AFF] border-t-2 border-[#4A3AFF] shadow-xs"
              : "text-[#6F6B88] hover:text-[#1C1B3A] hover:bg-white/50"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Kasir Toko (Tunai &amp; QRIS) {cart.length > 0 && `(${cartItemCount})`}</span>
        </button>

        <button
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`py-3 px-5 rounded-t-[14px] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "TRANSACTIONS"
              ? "bg-white text-[#4A3AFF] border-t-2 border-[#4A3AFF] shadow-xs"
              : "text-[#6F6B88] hover:text-[#1C1B3A] hover:bg-white/50"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Riwayat Transaksi Toko ({transactions.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: KATALOG & STOK BARANG ELEKTRONIK                                    */}
      {/* ========================================================================= */}
      {activeTab === "CATALOG" && (
        <div className="space-y-6">
          {/* Filter Bar & Search */}
          <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama barang, brand, kode..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9.5 pr-4 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white transition-all"
              />
              {catalogSearch && (
                <button
                  onClick={() => setCatalogSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B88] hover:text-[#1C1B3A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#4A3AFF] text-white shadow-xs"
                      : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#F5F3FF] hover:text-[#4A3AFF] border border-[#E6E3F7]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-[20px] border border-[#E6E3F7] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Product Image Box */}
                  <div className="relative w-full h-44 bg-[#F8F7FD] flex items-center justify-center p-4 border-b border-[#E6E3F7] overflow-hidden">
                    <div className="relative w-32 h-32 group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 200px"
                      />
                    </div>

                    {/* Stock Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          p.stock > 10
                            ? "bg-[#E6F9F0] text-[#2DBA7D] border-[#2DBA7D]/30"
                            : p.stock > 0
                            ? "bg-[#FFF4E5] text-[#D97706] border-[#FFE0B2]"
                            : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {p.stock > 0 ? `Stok: ${p.stock} ${p.unit}` : "Habis"}
                      </span>
                    </div>

                    {/* Warranty Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#E6E3F7] text-[#1C1B3A]">
                        {p.warrantyPeriod}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[10.5px] text-[#6F6B88]">
                      <span className="font-bold text-[#4A3AFF]">{p.code}</span>
                      <span className="truncate max-w-[120px]">{p.brand}</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-[#1C1B3A] line-clamp-2 leading-snug group-hover:text-[#4A3AFF] transition-colors">
                      {p.name}
                    </h3>

                    <p className="text-[11px] text-[#6F6B88] line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Price Tag with Dual Pricing */}
                    <div className="pt-2 border-t border-[#E6E3F7] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] text-[#6F6B88]">Harga Anggota:</span>
                        <span className="text-sm font-extrabold text-[#4A3AFF]">
                          Rp {p.memberPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] text-[#A5A2B8]">
                        <span>Harga Umum:</span>
                        <span className="line-through">Rp {p.cashPrice.toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    {/* Payment Availability Pill */}
                    <div className="p-2 rounded-[10px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between text-[10px]">
                      <span className="text-[#6F6B88]">Metode Bayar:</span>
                      <span className="font-bold text-[#2DBA7D]">Uang Tunai / QRIS Statis</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setRestockProduct(p);
                      setRestockAmount(10);
                    }}
                    title="Tambah Stok"
                    className="py-2 px-2 rounded-[12px] bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#4A3AFF] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Stok</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setProductFormData({ ...p });
                      setIsProductModalOpen(true);
                    }}
                    title="Edit Data Produk"
                    className="py-2 px-2 rounded-[12px] bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] hover:text-[#4A3AFF] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    title="Hapus Produk"
                    className="py-2 px-2 rounded-[12px] bg-[#FAFAFC] hover:bg-red-50 border border-[#E6E3F7] text-[#6F6B88] hover:text-red-600 font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KASIR TOKO KOPERASI & SIMULASI CICILAN PAYROLL                      */}
      {/* ========================================================================= */}
      {activeTab === "POS_CASHIER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: PRODUCT SELECTOR CATALOG */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Category Tabs */}
            <div className="bg-white p-4 rounded-[20px] border border-[#E6E3F7] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari barang untuk dimasukkan ke keranjang..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9.5 pr-4 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`py-1 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      selectedCategory === cat.id
                        ? "bg-[#4A3AFF] text-white"
                        : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#F5F3FF] border border-[#E6E3F7]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Product List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 bg-white rounded-[18px] border border-[#E6E3F7] hover:border-[#4A3AFF] hover:shadow-sm transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 bg-[#F8F7FD] rounded-[12px] p-1 shrink-0 flex items-center justify-center border border-[#E6E3F7]">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        width={48}
                        height={48}
                        className="object-contain max-h-12 w-auto"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#4A3AFF] font-bold">{p.code} &bull; {p.brand}</p>
                      <h4 className="font-bold text-xs text-[#1C1B3A] truncate group-hover:text-[#4A3AFF]">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-[#1C1B3A]">
                          Rp {p.memberPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9.5px] text-[#6F6B88]">Stok: {p.stock}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={p.stock <= 0}
                    className="w-8 h-8 rounded-full bg-[#F5F3FF] group-hover:bg-[#4A3AFF] text-[#4A3AFF] group-hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 5 COLS: CART, BUYER & CHECKOUT */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-5 sm:p-6 shadow-xl shadow-[#4A3AFF]/5 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#4A3AFF]" />
                  <h3 className="font-bold text-sm sm:text-base text-[#1C1B3A]">
                    Keranjang Toko &amp; Kasir
                  </h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-red-500 hover:underline font-semibold"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* 1. SELECT EMPLOYEE BUYER */}
              <div className="space-y-2 relative" ref={buyerDropdownRef}>
                <label className="font-bold text-xs text-[#1C1B3A] block">
                  Pilih Karyawan Pembeli (Anggota PT BIT) *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Ketik nama karyawan atau NIK..."
                    value={buyerSearchQuery}
                    onFocus={() => setIsBuyerDropdownOpen(true)}
                    onChange={(e) => {
                      setBuyerSearchQuery(e.target.value);
                      setIsBuyerDropdownOpen(true);
                    }}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[14px] pl-9.5 pr-4 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                  />
                </div>

                {/* Dropdown suggestions */}
                {isBuyerDropdownOpen && filteredEmployees.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-[16px] border border-[#E6E3F7] shadow-xl z-50 max-h-48 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
                    {filteredEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setBuyerSearchQuery(emp.name);
                          setIsBuyerDropdownOpen(false);
                        }}
                        className="p-2 rounded-[10px] hover:bg-[#F5F3FF] cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#1C1B3A]">{emp.name}</p>
                          <p className="text-[10.5px] text-[#6F6B88]">
                            NIK: {emp.nik} &bull; {emp.department} ({emp.position})
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-[#4A3AFF]">
                          Gaji: Rp {(emp.monthlySalary / 1000000).toFixed(1)}Jt
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Employee Info Box */}
                {selectedEmployee && (
                  <div className="p-3 rounded-[16px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1C1B3A]">{selectedEmployee.name}</span>
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                        Anggota Kopkar BIT (Harga Khusus)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] text-[#6F6B88] pt-1 border-t border-[#E6E3F7]/70">
                      <div>
                        NIK: <strong>{selectedEmployee.nik}</strong>
                      </div>
                      <div>
                        Departemen: <strong>{selectedEmployee.department}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CART ITEMS LIST */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-[#1C1B3A] block">
                  Daftar Barang Belanja ({cartItemCount})
                </label>

                {cart.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-[#E6E3F7] rounded-[16px] space-y-1 text-xs text-[#6F6B88]">
                    <ShoppingBag className="w-8 h-8 text-[#A5A2B8] mx-auto" />
                    <p className="font-semibold">Belum ada barang di keranjang</p>
                    <p className="text-[11px]">Pilih barang dari katalog di sebelah kiri.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-2.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-[#1C1B3A] truncate">{item.product.name}</p>
                          <p className="text-[10.5px] text-[#4A3AFF]">
                            Rp {item.product.memberPrice.toLocaleString("id-ID")} &times; {item.quantity} = <strong>Rp {(item.product.memberPrice * item.quantity).toLocaleString("id-ID")}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-full bg-white border border-[#E6E3F7] flex items-center justify-center text-[#6F6B88] hover:text-red-600 hover:bg-red-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="w-6 h-6 rounded-full bg-white border border-[#E6E3F7] flex items-center justify-center text-[#6F6B88] hover:text-[#4A3AFF] hover:bg-[#F5F3FF]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-6 h-6 rounded-full bg-white border border-[#E6E3F7] flex items-center justify-center text-[#6F6B88] hover:text-red-600 hover:bg-red-50 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. PAYMENT METHOD SELECTION */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#E6E3F7]">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#1C1B3A] block">
                      Pilih Metode Pembayaran *
                    </label>
                    <span className="text-[10px] text-[#2DBA7D] font-semibold">
                      *Tersedia: Tunai &amp; QRIS Statis
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("TUNAI")}
                      className={`p-2.5 rounded-[12px] border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === "TUNAI"
                          ? "bg-[#2DBA7D] text-white border-[#2DBA7D] font-bold shadow-xs"
                          : "bg-[#FAFAFC] border-[#E6E3F7] text-[#6F6B88] hover:bg-white"
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span className="text-xs">Uang Tunai (Cash)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("QRIS_MANDIRI")}
                      className={`p-2.5 rounded-[12px] border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === "QRIS_MANDIRI"
                          ? "bg-[#4A3AFF] text-white border-[#4A3AFF] font-bold shadow-xs"
                          : "bg-[#FAFAFC] border-[#E6E3F7] text-[#6F6B88] hover:bg-white"
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-xs">QRIS Statis Mandiri</span>
                    </button>
                  </div>

                  {/* Payment Sub-Options */}
                  {paymentMethod === "TUNAI" && (
                    <div className="space-y-1.5 text-xs">
                      <label className="font-bold text-[#1C1B3A]">Nominal Uang Tunai Diterima (Rp) *</label>
                      <input
                        type="number"
                        placeholder="Contoh: 500000"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      />
                      {parseInt(cashReceived || "0", 10) >= cartSubtotal && (
                        <p className="text-[11px] text-[#2DBA7D] font-bold">
                          Kembalian: Rp {(parseInt(cashReceived, 10) - cartSubtotal).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  )}

                  {paymentMethod === "QRIS_MANDIRI" && (
                    <div className="p-3 rounded-[14px] bg-[#E6F9F0] border border-[#2DBA7D]/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-[#2DBA7D]" />
                        <div>
                          <p className="font-bold text-[#1C1B3A]">QRIS Statis Bank Mandiri Kopkar BIT</p>
                          <p className="text-[10px] text-[#2DBA7D]">NMID: ID1020039281920 (Siap Scan)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQrisModal(true)}
                        className="py-1 px-2.5 rounded-full bg-[#2DBA7D] text-white font-bold text-[10.5px]"
                      >
                        Buka Barcode
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Price Box */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-[#E6E3F7] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#6F6B88]">
                    <span>Total Harga Normal:</span>
                    <span className="line-through">Rp {cartCashTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#2DBA7D] font-bold">
                    <span>Hemat Khusus Anggota:</span>
                    <span>- Rp {cartTotalSavings.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-[#1C1B3A] pt-1 border-t border-[#E6E3F7]">
                    <span>Total Bayar:</span>
                    <span className="text-[#4A3AFF]">Rp {cartSubtotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}

              {/* Submit Checkout Button */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleProcessCheckout}
                className="w-full py-3.5 px-6 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4A3AFF]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Proses Transaksi &amp; Cetak Nota</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RIWAYAT PENJUALAN & CICILAN PAYROLL                                */}
      {/* ========================================================================= */}
      {activeTab === "TRANSACTIONS" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#E6E3F7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari no. invoice, nama karyawan, NIK..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-9.5 pr-4 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto">
              <select
                value={txStatusFilter}
                onChange={(e) => setTxStatusFilter(e.target.value)}
                className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3.5 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
              >
                <option value="ALL">Semua Status</option>
                <option value="LUNAS">Lunas</option>
                <option value="CICILAN_BERJALAN">Cicilan Berjalan (Payroll)</option>
              </select>

              <select
                value={txPaymentFilter}
                onChange={(e) => setTxPaymentFilter(e.target.value)}
                className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3.5 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
              >
                <option value="ALL">Semua Metode Bayar</option>
                <option value="TUNAI">Tunai / Cash</option>
                <option value="QRIS_MANDIRI">QRIS Bank Mandiri</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const cfg = buildStoreReportConfig(filteredTransactions, products, "September 2026");
                  exportToCsv({
                    filename: "Laporan-Penjualan-Toko-Koperasi-September-2026",
                    columns: cfg.columns,
                    data: cfg.data,
                    totalRow: cfg.totalRow,
                    reportTitle: cfg.title,
                    period: cfg.period,
                  });
                }}
                className="px-3.5 py-2 rounded-full bg-[#E6F9F0] border border-[#2DBA7D]/30 text-[#2DBA7D] hover:bg-[#2DBA7D] hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                title="Unduh Spreadsheet Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const cfg = buildStoreReportConfig(filteredTransactions, products, "September 2026");
                  setReportConfig(cfg);
                  setIsReportModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                title="Buka Pratinjau & Cetak PDF Resmi"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cetak PDF Laporan</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-[20px] border border-[#E6E3F7] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7FD] border-b border-[#E6E3F7] text-[#6F6B88] font-bold">
                  <tr>
                    <th className="py-3.5 px-4">No. Invoice &amp; Waktu</th>
                    <th className="py-3.5 px-4">Karyawan Pembeli</th>
                    <th className="py-3.5 px-4">Daftar Barang</th>
                    <th className="py-3.5 px-4">Total Belanja</th>
                    <th className="py-3.5 px-4">Metode Bayar</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FAFAFC] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#1C1B3A]">{tx.invoiceNumber}</p>
                        <p className="text-[10.5px] text-[#6F6B88] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{tx.transactionDate}</span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#1C1B3A]">{tx.employeeName}</p>
                        <p className="text-[10.5px] text-[#6F6B88]">
                          {tx.employeeNik} &bull; {tx.department}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {tx.items.map((item, idx) => (
                            <p key={idx} className="truncate text-[11px] text-[#1C1B3A]">
                              &bull; {item.quantity}x {item.productName}
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-[#4A3AFF]">
                          Rp {tx.totalAmount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-[#2DBA7D]">
                          Hemat Rp {tx.totalSaved.toLocaleString("id-ID")}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {tx.paymentMethod === "QRIS_MANDIRI" ? (
                          <span className="font-bold text-[#4A3AFF]">QRIS Mandiri</span>
                        ) : (
                          <span className="font-bold text-[#2DBA7D]">Tunai / Cash</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                          Lunas
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedTxForDetail(tx);
                            setLastCompletedTx(tx);
                            setShowReceiptModal(true);
                          }}
                          className="p-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white transition-all cursor-pointer"
                          title="Cetak Nota / Lihat Rincian"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT PRODUK BARANG                                        */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-[#1C1B3A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-fadeIn my-8">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#4A3AFF]" />
                <h3 className="font-bold text-lg text-[#1C1B3A]">
                  {editingProduct ? "Edit Data Barang" : "Tambah Produk Barang Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F3FF] flex items-center justify-center text-[#6F6B88]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-[#1C1B3A]">Nama Barang *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rice Cooker Digital Smart 1.8L"
                    value={productFormData.name || ""}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Kode Barang *</label>
                  <input
                    type="text"
                    placeholder="ELK-001"
                    value={productFormData.code || ""}
                    onChange={(e) => setProductFormData({ ...productFormData, code: e.target.value })}
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Kategori *</label>
                  <select
                    value={productFormData.category || "ELEKTRONIK_RUMAH"}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, category: e.target.value as StoreCategory })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  >
                    <option value="ELEKTRONIK_RUMAH">Elektronik Rumah Tangga</option>
                    <option value="PERALATAN_DAPUR">Peralatan Dapur &amp; Masak</option>
                    <option value="PERKAKAS_KERJA">Perkakas Kerja &amp; Safety</option>
                    <option value="KESEHATAN_SAFETY">Kesehatan &amp; Perawatan</option>
                    <option value="MERCHANDISE_BIT">Merchandise Kopkar BIT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Merk / Brand</label>
                  <input
                    type="text"
                    placeholder="Contoh: Philips / Cosmos / Bosch"
                    value={productFormData.brand || ""}
                    onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Harga Anggota Koperasi (Rp) *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 310000"
                    value={productFormData.memberPrice || ""}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, memberPrice: Number(e.target.value) })
                    }
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Harga Normal / Umum (Rp) *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 385000"
                    value={productFormData.cashPrice || ""}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, cashPrice: Number(e.target.value) })
                    }
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Jumlah Stok *</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={productFormData.stock || ""}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, stock: Number(e.target.value) })
                    }
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Satuan</label>
                  <input
                    type="text"
                    placeholder="Unit / Set / Pcs"
                    value={productFormData.unit || "Unit"}
                    onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Garansi</label>
                  <input
                    type="text"
                    placeholder="1 Tahun Resmi"
                    value={productFormData.warrantyPeriod || "1 Tahun Resmi"}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, warrantyPeriod: e.target.value })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] px-3.5 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              {/* Preset Image Chooser */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#1C1B3A] block">Pilih Gambar Preset Produk:</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 bg-[#FAFAFC] rounded-[14px] border border-[#E6E3F7] max-h-36 overflow-y-auto">
                  {presetImages.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, imageUrl: img.url })}
                      className={`p-1.5 rounded-[10px] border flex flex-col items-center justify-center transition-all ${
                        productFormData.imageUrl === img.url
                          ? "bg-[#F5F3FF] border-[#4A3AFF] ring-2 ring-[#4A3AFF]"
                          : "bg-white border-[#E6E3F7] hover:border-[#4A3AFF]"
                      }`}
                    >
                      <Image src={img.url} alt={img.label} width={36} height={36} className="object-contain h-9 w-auto" />
                      <span className="text-[8.5px] font-semibold text-[#1C1B3A] truncate w-full text-center mt-1">
                        {img.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan spesifikasi barang, fitur utama, dan kelengkapan garansi..."
                  value={productFormData.description || ""}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] p-3 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold shadow-md shadow-[#4A3AFF]/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK RESTOCK                                                      */}
      {/* ========================================================================= */}
      {restockProduct && (
        <div className="fixed inset-0 bg-[#1C1B3A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <h3 className="font-bold text-sm text-[#1C1B3A]">Restock Cepat Barang</h3>
              <button onClick={() => setRestockProduct(null)} className="text-[#6F6B88]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#1C1B3A]">{restockProduct.name}</p>
              <p className="text-[#6F6B88]">
                Stok saat ini: <strong>{restockProduct.stock} {restockProduct.unit}</strong>
              </p>

              <label className="font-bold text-[#1C1B3A] block pt-2">Tambah Jumlah Unit:</label>
              <div className="flex items-center gap-2">
                {[5, 10, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRestockAmount(amt)}
                    className={`px-3 py-1.5 rounded-[10px] font-bold text-xs transition-all ${
                      restockAmount === amt ? "bg-[#4A3AFF] text-white" : "bg-[#FAFAFC] border border-[#E6E3F7] text-[#6F6B88]"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] p-2.5 text-xs text-[#1C1B3A] mt-2 font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRestockProduct(null)}
                className="flex-1 py-2.5 rounded-full bg-[#FAFAFC] border border-[#E6E3F7] text-[#6F6B88] font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleQuickRestockSubmit}
                className="flex-1 py-2.5 rounded-full bg-[#4A3AFF] text-white font-bold text-xs"
              >
                Simpan Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QRIS BANK MANDIRI SCAN POPUP                                       */}
      {/* ========================================================================= */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-[#1C1B3A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <span className="font-bold text-xs text-[#4A3AFF]">QRIS Bank Mandiri Kopkar BIT</span>
              <button onClick={() => setShowQrisModal(false)} className="text-[#6F6B88]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-48 h-48 mx-auto bg-white p-2 rounded-[16px] border border-[#E6E3F7] shadow-inner">
              <Image src="/images/qris-example.jpg" alt="QRIS Mandiri" fill className="object-contain p-2" />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#1C1B3A]">
                Total: Rp {cartSubtotal.toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-[#6F6B88] mt-0.5">NMID: ID1020039281920 &bull; PT Bhakti Idola Tama</p>
            </div>

            <button
              onClick={() => {
                setShowQrisModal(false);
                showToast("Pembayaran QRIS telah diverifikasi!", "success");
              }}
              className="w-full py-2.5 rounded-full bg-[#2DBA7D] text-white font-bold text-xs shadow-md"
            >
              Verifikasi Pembayaran Selesai
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STRUK / NOTA PENJUALAN TOKO KOPERASI                               */}
      {/* ========================================================================= */}
      {showReceiptModal && lastCompletedTx && (
        <div className="fixed inset-0 bg-[#1C1B3A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] shadow-2xl max-w-md w-full p-6 space-y-5 animate-fadeIn">
            {/* Header / Paper size switcher */}
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#4A3AFF]" />
                <span className="font-bold text-xs text-[#1C1B3A]">Nota Toko Koperasi</span>
              </div>
              <div className="flex items-center gap-1 bg-[#FAFAFC] p-1 rounded-full border border-[#E6E3F7]">
                <button
                  type="button"
                  onClick={() => setReceiptPaperSize("58mm")}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    receiptPaperSize === "58mm" ? "bg-[#4A3AFF] text-white" : "text-[#6F6B88]"
                  }`}
                >
                  58mm
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptPaperSize("80mm")}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    receiptPaperSize === "80mm" ? "bg-[#4A3AFF] text-white" : "text-[#6F6B88]"
                  }`}
                >
                  80mm
                </button>
              </div>
            </div>

            {/* Thermal Slip Simulation */}
            <div
              className={`mx-auto bg-[#FAFAFC] border border-dashed border-[#A5A2B8] p-4 rounded-[14px] font-mono text-[11px] text-[#1C1B3A] space-y-2 shadow-inner ${
                receiptPaperSize === "58mm" ? "max-w-[260px]" : "max-w-[320px]"
              }`}
            >
              <div className="text-center space-y-0.5 border-b border-dashed border-[#A5A2B8] pb-2">
                <p className="font-extrabold text-xs">KOPKAR PT BHAKTI IDOLA TAMA</p>
                <p className="text-[10px] text-[#6F6B88]">Unit Toko &amp; Barang Elektronik</p>
                <p className="text-[9.5px] text-[#6F6B88]">{lastCompletedTx.transactionDate}</p>
                <p className="text-[9.5px] font-bold text-[#4A3AFF]">{lastCompletedTx.invoiceNumber}</p>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-[#A5A2B8] pb-1.5">
                <p>Pembeli: <strong>{lastCompletedTx.employeeName}</strong></p>
                <p>NIK: {lastCompletedTx.employeeNik} ({lastCompletedTx.department})</p>
              </div>

              <div className="space-y-1.5 py-1 border-b border-dashed border-[#A5A2B8]">
                {lastCompletedTx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="shrink-0 font-bold">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 text-[10.5px]">
                <div className="flex justify-between font-extrabold text-xs">
                  <span>TOTAL:</span>
                  <span>Rp {lastCompletedTx.totalAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#2DBA7D]">
                  <span>Hemat Anggota:</span>
                  <span>Rp {lastCompletedTx.totalSaved.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between pt-1 border-t border-dashed border-[#A5A2B8] text-[10px]">
                  <span>Metode:</span>
                  <span className="font-bold">
                    {lastCompletedTx.paymentMethod === "QRIS_MANDIRI"
                      ? "QRIS Bank Mandiri"
                      : "Tunai / Cash"}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9px] text-[#6F6B88] border-t border-dashed border-[#A5A2B8]">
                <p>Terima kasih atas partisipasi Anda.</p>
                <p>Simpan nota ini untuk klaim garansi barang.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Nota Thermal</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="py-3 px-5 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[#6F6B88] font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
