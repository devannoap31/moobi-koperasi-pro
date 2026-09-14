"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  UtensilsCrossed,
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
  Clock,
  Bell,
  Check,
  X,
  Edit3,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Package,
  Layers,
  FileText,
  Filter,
  Info,
  Printer,
  Smartphone,
  CheckCircle,
  Store,
  MapPin,
  Building2,
  DollarSign,
  TrendingUp,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  sampleProducts,
  sampleEmployees,
  sampleIncomingOrders,
  sampleCanteenTenants,
  sampleCanteenSettlements,
} from "@/data/mockData";
import {
  CanteenProduct,
  ProductCategory,
  CanteenOrder,
  CanteenOrderStatus,
  CanteenOrderItem,
  CanteenPaymentMethod,
  CanteenTenant,
} from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface CartItem {
  product: CanteenProduct;
  quantity: number;
}

export const MerchantCanteenView: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenantIdParam = searchParams.get("tenantId") || "tenant-01";

  // Active Tenant
  const [currentTenant, setCurrentTenant] = useState<CanteenTenant>(() => {
    return (
      sampleCanteenTenants.find((t) => t.id === tenantIdParam) ||
      sampleCanteenTenants[0]
    );
  });

  // Switch tenant if query param changes
  useEffect(() => {
    const found = sampleCanteenTenants.find((t) => t.id === tenantIdParam);
    if (found) {
      setCurrentTenant(found);
    }
  }, [tenantIdParam]);

  // Active Tab: "POS" | "ORDERS" | "MANAGE" | "FINANCE"
  const [activeTab, setActiveTab] = useState<"POS" | "ORDERS" | "MANAGE" | "FINANCE">("POS");

  // Products State (Filtered for this tenant)
  const [products, setProducts] = useState<CanteenProduct[]>(() => {
    // If tenant-01 or tenant-02, return food products. If tenant-05, return products.
    if (currentTenant.id === "tenant-05") {
      return sampleProducts.filter((p) => p.category !== "MAKANAN" && p.category !== "MINUMAN");
    } else if (currentTenant.id === "tenant-02") {
      return sampleProducts.filter((p) => p.name.toLowerCase().includes("ayam") || p.category === "MAKANAN");
    } else {
      return sampleProducts.filter((p) => p.category === "MAKANAN" || p.category === "MINUMAN");
    }
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Incoming Orders State (Tenant-specific)
  const [orders, setOrders] = useState<CanteenOrder[]>(sampleIncomingOrders);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const debouncedOrderSearch = useDebounce(orderSearchTerm, 300);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<CanteenOrder | null>(null);

  // POS Walk-in Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(sampleEmployees[0].id);
  const [paymentMethod, setPaymentMethod] = useState<CanteenPaymentMethod>("POTONG_GAJI");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<CanteenOrder | null>(null);

  // CRUD Product Modals
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<CanteenProduct | null>(null);

  // Form State for Add / Edit Product
  const [productFormData, setProductFormData] = useState({
    name: "",
    category: "MAKANAN" as ProductCategory,
    regularPrice: 20000,
    memberPrice: 16000,
    stock: 50,
    unit: "Porsi",
    imageUrl: "/images/makanan/nasi-goreng.webp",
    description: "",
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Selected Buyer for POS
  const selectedBuyer =
    sampleEmployees.find((e) => e.id === selectedBuyerId) || sampleEmployees[0];

  const categories: { id: string; label: string }[] = [
    { id: "ALL", label: "Semua Kategori" },
    { id: "MAKANAN", label: "🍱 Makanan Kantin" },
    { id: "MINUMAN", label: "🥤 Minuman" },
    { id: "ELEKTRONIK_BIT", label: "⚡ Elektronik & Perkakas BIT" },
    { id: "ALAT_KERJA", label: "🔧 Alat Kerja & Safety" },
    { id: "KEBUTUHAN_HARIAN", label: "🍳 Cookware & Harian" },
  ];

  // Image Presets for CRUD
  const availableImagePresets = [
    { label: "Nasi Goreng Spesial", url: "/images/makanan/nasi-goreng.webp", cat: "MAKANAN" },
    { label: "Soto Ayam Lamongan", url: "/images/makanan/soto-ayam.webp", cat: "MAKANAN" },
    { label: "Ayam Geprek Sambal Korek", url: "/images/makanan/geprek.webp", cat: "MAKANAN" },
    { label: "Mie Sup / Miso Ayam", url: "/images/makanan/miso.webp", cat: "MAKANAN" },
    { label: "Tahu & Tempe Bacem", url: "/images/makanan/tahu-tempe.webp", cat: "MAKANAN" },
    { label: "Kopi Hitam Mantap", url: "/images/makanan/kopi-hitam.webp", cat: "MINUMAN" },
    { label: "Es Teh Manis Jumbo", url: "/images/makanan/es-teh.webp", cat: "MINUMAN" },
    { label: "Air Mineral 600ml", url: "/images/makanan/air-mineral.webp", cat: "MINUMAN" },
    { label: "Digital Rice Cooker", url: "/images/products/rice-cooker(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Blender 3-in-1", url: "/images/products/blender(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Food Chopper Turbo", url: "/images/products/chopper(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Kompor Gas 2 Tungku", url: "/images/products/kompor(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Setrika Listrik Ceramic", url: "/images/products/setrika(1).png", cat: "ELEKTRONIK_BIT" },
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

  // Filter Incoming Orders
  const filteredOrders = orders.filter((ord) => {
    const matchStatus = orderStatusFilter === "ALL" || ord.status === orderStatusFilter;
    const matchSearch =
      !debouncedOrderSearch.trim() ||
      ord.orderNumber.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
      ord.employeeName.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
      ord.employeeNik.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
      ord.items.some((i) => i.productName.toLowerCase().includes(debouncedOrderSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Cart Calculations
  const cartSubtotalRegular = cart.reduce(
    (acc, item) => acc + item.product.regularPrice * item.quantity,
    0
  );
  const cartSubtotalMember = cart.reduce(
    (acc, item) => acc + item.product.memberPrice * item.quantity,
    0
  );
  const totalMemberSavings = cartSubtotalRegular - cartSubtotalMember;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
  };

  // Process POS Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("Keranjang belanja masih kosong!", "error");
      return;
    }

    // Deduct stock
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((c) => c.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    const completedOrder: CanteenOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      orderNumber: `ORD-POS-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedBuyer.id,
      employeeNik: selectedBuyer.nik,
      employeeName: selectedBuyer.name,
      department: selectedBuyer.department,
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        price: c.product.memberPrice,
        regularPrice: c.product.regularPrice,
        quantity: c.quantity,
        subtotal: c.product.memberPrice * c.quantity,
        imageUrl: c.product.imageUrl,
      })),
      totalAmount: cartSubtotalMember,
      totalSaved: totalMemberSavings,
      paymentMethod: paymentMethod,
      status: "SELESAI",
      orderType: "KANTIN_MAKANAN",
      pickupTime: "Langsung di Kasir",
      notes: "Transaksi POS Kasir Stand",
      createdAt: "Baru saja",
    };

    setOrders((prev) => [completedOrder, ...prev]);
    setLastCompletedOrder(completedOrder);
    setShowReceiptModal(true);
    setCart([]);
    showToast(`Transaksi sebesar Rp ${cartSubtotalMember.toLocaleString("id-ID")} berhasil diproses!`);
  };

  // Order Status Change Handlers
  const handleUpdateOrderStatus = (orderId: string, nextStatus: CanteenOrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );
    const statusLabels: Record<CanteenOrderStatus, string> = {
      MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi",
      DIPROSES: "Sedang Disiapkan",
      SIAP_DIAMBIL: "Siap Diambil Karyawan",
      SELESAI: "Selesai / Diserahkan",
      DIBATALKAN: "Dibatalkan",
    };
    showToast(`Status pesanan diperbarui: ${statusLabels[nextStatus]}`);
    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  // CRUD Product Actions
  const handleOpenAddProduct = () => {
    setProductFormData({
      name: "",
      category: "MAKANAN",
      regularPrice: 20000,
      memberPrice: 16000,
      stock: 50,
      unit: "Porsi",
      imageUrl: "/images/makanan/nasi-goreng.webp",
      description: "",
    });
    setIsAddProductModalOpen(true);
  };

  const handleSaveAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name.trim()) {
      showToast("Nama produk/makanan wajib diisi!", "error");
      return;
    }
    const newProduct: CanteenProduct = {
      id: `PRD-${Date.now().toString().slice(-4)}`,
      name: productFormData.name.trim(),
      category: productFormData.category,
      regularPrice: Number(productFormData.regularPrice),
      memberPrice: Number(productFormData.memberPrice),
      stock: Number(productFormData.stock),
      unit: productFormData.unit,
      imageUrl: productFormData.imageUrl,
      description: productFormData.description.trim(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    setIsAddProductModalOpen(false);
    showToast(`Berhasil menambahkan menu "${newProduct.name}"!`);
  };

  const handleOpenEditProduct = (product: CanteenProduct) => {
    setSelectedProductForEdit(product);
    setProductFormData({
      name: product.name,
      category: product.category,
      regularPrice: product.regularPrice,
      memberPrice: product.memberPrice,
      stock: product.stock,
      unit: product.unit,
      imageUrl: product.imageUrl || "/images/makanan/nasi-goreng.webp",
      description: product.description || "",
    });
    setIsEditProductModalOpen(true);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForEdit) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProductForEdit.id
          ? {
              ...p,
              name: productFormData.name.trim(),
              category: productFormData.category,
              regularPrice: Number(productFormData.regularPrice),
              memberPrice: Number(productFormData.memberPrice),
              stock: Number(productFormData.stock),
              unit: productFormData.unit,
              imageUrl: productFormData.imageUrl,
              description: productFormData.description.trim(),
            }
          : p
      )
    );
    setIsEditProductModalOpen(false);
    setSelectedProductForEdit(null);
    showToast("Data menu berhasil diperbarui!");
  };

  const handleQuickRestock = (productId: string, amount: number = 10) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    );
    showToast(`Stok berhasil ditambah +${amount}`);
  };

  const handleOpenDeleteProduct = (product: CanteenProduct) => {
    setSelectedProductForEdit(product);
    setIsDeleteProductModalOpen(true);
  };

  const handleConfirmDeleteProduct = () => {
    if (!selectedProductForEdit) return;
    setProducts((prev) => prev.filter((p) => p.id !== selectedProductForEdit.id));
    setIsDeleteProductModalOpen(false);
    showToast(`Menu "${selectedProductForEdit.name}" telah dihapus`, "info");
    setSelectedProductForEdit(null);
  };

  const pendingOrdersCount = orders.filter((o) => o.status === "MENUNGGU_KONFIRMASI").length;

  return (
    <div className="min-h-screen bg-[#F8F7FD] flex flex-col justify-between select-none font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div
            className={`py-3 px-4 rounded-[14px] shadow-2xl border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-[#1C1B3A] text-white border-white/10"
                : toastMessage.type === "error"
                ? "bg-red-600 text-white border-red-700"
                : "bg-[#4A3AFF] text-white border-[#4A3AFF]"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#2DBA7D]" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-white" />}
            {toastMessage.type === "info" && <Info className="w-4 h-4 text-white" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. TOP MERCHANT NAVBAR */}
      <header className="bg-white border-b border-[#E6E3F7] sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Left: Stand Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[14px] bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2] flex items-center justify-center font-bold text-sm shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#1C1B3A] truncate">
                {currentTenant.name}
              </h1>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0] shrink-0">
                Stand Aktif
              </span>
            </div>
            <p className="text-[11px] text-[#6F6B88] truncate flex items-center gap-1.5">
              <span>Pemilik: <strong>{currentTenant.ownerName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-[#4A3AFF]" />
                {currentTenant.location}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Tenant Switcher Dropdown (Demo) & Logout */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Tenant Switcher */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFAFC] border border-[#E6E3F7] text-xs">
            <span className="text-[#6F6B88]">Ganti Stand:</span>
            <select
              value={currentTenant.id}
              onChange={(e) => {
                const selected = sampleCanteenTenants.find((t) => t.id === e.target.value);
                if (selected) {
                  router.push(`/canteen-portal/merchant?tenantId=${selected.id}`);
                }
              }}
              className="bg-transparent font-bold text-[#4A3AFF] focus:outline-none cursor-pointer"
            >
              {sampleCanteenTenants.filter((t) => t.status === "ACTIVE").map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/canteen-portal/login"
            title="Keluar dari Kasir Stand"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white hover:bg-red-50 text-[#6F6B88] hover:text-[#EF4444] border border-[#E6E3F7] hover:border-red-200 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("POS")}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "POS"
                  ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
                  : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>POS Kasir Stand</span>
            </button>

            <button
              onClick={() => setActiveTab("ORDERS")}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === "ORDERS"
                  ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
                  : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pesanan App Karyawan</span>
              {pendingOrdersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FFB547] text-[#1C1B3A] text-[9px] font-bold flex items-center justify-center">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("MANAGE")}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "MANAGE"
                  ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
                  : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Kelola Menu &amp; Stok</span>
            </button>

            <button
              onClick={() => setActiveTab("FINANCE")}
              className={`py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "FINANCE"
                  ? "bg-[#4A3AFF] text-white shadow-sm shadow-[#4A3AFF]/25"
                  : "bg-white text-[#6F6B88] border border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pendapatan &amp; Settlement</span>
            </button>
          </div>

          <span className="text-[11px] text-[#6F6B88] hidden lg:inline">
            Jadwal Cutoff Payroll: <strong>Tgl 25 Setiap Bulan</strong>
          </span>
        </div>

        {/* TAB 1: POS KASIR STAND */}
        {activeTab === "POS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Product Catalog */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
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

            {/* Right: Walk-in Cart & Checkout */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-lg space-y-5 sticky top-20">
              <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#4A3AFF]" />
                  <h2 className="text-sm font-bold text-[#1C1B3A]">Keranjang Kasir Stand</h2>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Buyer Selector (Employee) */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-[#1C1B3A] flex items-center justify-between">
                  <span>Pilih Karyawan Pembeli:</span>
                  <span className="text-[10px] text-[#2DBA7D] font-semibold">Harga Anggota Aktif</span>
                </label>
                <select
                  value={selectedBuyerId}
                  onChange={(e) => setSelectedBuyerId(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[12px] p-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                >
                  {sampleEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — NIK: {emp.nik} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Item List */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#A5A2B8] space-y-1">
                    <ShoppingBag className="w-8 h-8 mx-auto text-gray-300" />
                    <p>Keranjang masih kosong</p>
                    <p className="text-[10.5px]">Klik menu di sebelah kiri untuk menambahkan</p>
                  </div>
                ) : (
                  cart.map((c) => (
                    <div
                      key={c.product.id}
                      className="p-2.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-[#1C1B3A] truncate">{c.product.name}</p>
                        <p className="text-[10.5px] text-[#6F6B88]">
                          Rp {c.product.memberPrice.toLocaleString("id-ID")} x {c.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-[#4A3AFF]">
                          Rp {(c.product.memberPrice * c.quantity).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(c.product.id)}
                          className="p-1 text-[#A5A2B8] hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-[#E6E3F7]">
                <label className="font-bold text-[#1C1B3A] block">Metode Pembayaran:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "POTONG_GAJI", label: "Potong Gaji" },
                      { id: "SALDO_KOPERASI", label: "Saldo Koperasi" },
                      { id: "QRIS_TUNAI", label: "QRIS / Tunai" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2 rounded-[10px] text-[11px] font-bold border transition-all cursor-pointer text-center ${
                        paymentMethod === m.id
                          ? "bg-[#4A3AFF] text-white border-[#4A3AFF]"
                          : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7] hover:bg-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Totals */}
              <div className="p-3 rounded-[14px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6F6B88]">
                  <span>Total Item:</span>
                  <span className="font-bold text-[#1C1B3A]">{totalItemsCount} pcs</span>
                </div>
                <div className="flex justify-between text-[#2DBA7D]">
                  <span>Hemat Diskon Anggota:</span>
                  <span className="font-bold">-Rp {totalMemberSavings.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#1C1B3A] pt-1 border-t border-[#E6E3F7]">
                  <span>Total Tagihan:</span>
                  <span className="text-[#4A3AFF]">
                    Rp {cartSubtotalMember.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-3 px-4 rounded-full text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  cart.length > 0
                    ? "bg-[#4A3AFF] hover:bg-[#3D2EE0] active:scale-[0.98]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Bayar &amp; Cetak Struk (Rp {cartSubtotalMember.toLocaleString("id-ID")})</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PESANAN MASUK APP KARYAWAN */}
        {activeTab === "ORDERS" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-[20px] border border-[#E6E3F7] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setOrderStatusFilter("ALL")}
                  className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                    orderStatusFilter === "ALL"
                      ? "bg-[#4A3AFF] text-white"
                      : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                  }`}
                >
                  Semua ({orders.length})
                </button>
                <button
                  onClick={() => setOrderStatusFilter("MENUNGGU_KONFIRMASI")}
                  className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                    orderStatusFilter === "MENUNGGU_KONFIRMASI"
                      ? "bg-[#FFB547] text-[#1C1B3A]"
                      : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                  }`}
                >
                  Menunggu Konfirmasi ({orders.filter((o) => o.status === "MENUNGGU_KONFIRMASI").length})
                </button>
                <button
                  onClick={() => setOrderStatusFilter("DIPROSES")}
                  className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                    orderStatusFilter === "DIPROSES"
                      ? "bg-[#4A3AFF] text-white"
                      : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                  }`}
                >
                  Sedang Disiapkan
                </button>
                <button
                  onClick={() => setOrderStatusFilter("SIAP_DIAMBIL")}
                  className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer ${
                    orderStatusFilter === "SIAP_DIAMBIL"
                      ? "bg-[#2DBA7D] text-white"
                      : "bg-[#FAFAFC] text-[#6F6B88] border border-[#E6E3F7]"
                  }`}
                >
                  Siap Diambil
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#6F6B88] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari no. order / nama karyawan..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#1C1B3A]"
                />
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-[20px] border border-[#E6E3F7] p-4.5 shadow-sm space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Order No + Status */}
                    <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-[#4A3AFF]">{ord.orderNumber}</span>
                        <p className="text-[10px] text-[#6F6B88]">{ord.createdAt}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord.status === "MENUNGGU_KONFIRMASI"
                            ? "bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]"
                            : ord.status === "DIPROSES"
                            ? "bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]"
                            : ord.status === "SIAP_DIAMBIL"
                            ? "bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ord.status === "MENUNGGU_KONFIRMASI"
                          ? "Menunggu Konfirmasi"
                          : ord.status === "DIPROSES"
                          ? "Sedang Disiapkan"
                          : ord.status === "SIAP_DIAMBIL"
                          ? "Siap Diambil"
                          : "Selesai"}
                      </span>
                    </div>

                    {/* Employee Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold text-xs shrink-0">
                        {ord.employeeName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1C1B3A] truncate">{ord.employeeName}</p>
                        <p className="text-[10px] text-[#6F6B88] truncate">
                          NIK: {ord.employeeNik} • {ord.department}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-2.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1.5">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-[#1C1B3A]">
                            <strong>{item.quantity}x</strong> {item.productName}
                          </span>
                          <span className="font-bold text-[#4A3AFF]">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                      {ord.notes && (
                        <p className="text-[10.5px] text-[#D97706] bg-[#FFF8E6] p-1.5 rounded-[8px] mt-1 italic">
                          Catatan: &quot;{ord.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Total & Payment Method */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                        {ord.paymentMethod === "POTONG_GAJI"
                          ? "Potong Gaji"
                          : ord.paymentMethod === "SALDO_KOPERASI"
                          ? "Saldo Koperasi"
                          : "QRIS/Tunai"}
                      </span>
                      <div className="text-right">
                        <span className="text-[10px] text-[#6F6B88] block">Total Bayar:</span>
                        <span className="text-sm font-extrabold text-[#1C1B3A]">
                          Rp {ord.totalAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Lifecycle */}
                  <div className="pt-2 border-t border-[#E6E3F7] flex gap-2">
                    {ord.status === "MENUNGGU_KONFIRMASI" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, "DIPROSES")}
                        className="flex-1 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Terima &amp; Siapkan</span>
                      </button>
                    )}
                    {ord.status === "DIPROSES" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, "SIAP_DIAMBIL")}
                        className="flex-1 py-2 rounded-full bg-[#2DBA7D] hover:bg-[#259b67] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Tandai Siap Diambil</span>
                      </button>
                    )}
                    {ord.status === "SIAP_DIAMBIL" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, "SELESAI")}
                        className="flex-1 py-2 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D]" />
                        <span>Serahkan &amp; Selesai</span>
                      </button>
                    )}
                    {ord.status === "SELESAI" && (
                      <div className="w-full py-1.5 text-center text-xs font-semibold text-[#2DBA7D]">
                        ✓ Pesanan Selesai
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: KELOLA MENU & STOK (CRUD) */}
        {activeTab === "MANAGE" && (
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1C1B3A]">
                  Daftar Menu &amp; Stok ({currentTenant.name})
                </h2>
                <p className="text-xs text-[#6F6B88]">
                  Kelola item makanan, minuman, dan stok yang dijual di stand Anda.
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="py-2.5 px-4 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu Baru</span>
              </button>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
                  <tr>
                    <th className="py-3 px-3">Foto &amp; Menu</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Harga Umum</th>
                    <th className="py-3 px-3">Harga Anggota</th>
                    <th className="py-3 px-3">Stok Live</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F5F3FF]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-[10px] bg-[#FAFAFC] border border-[#E6E3F7] overflow-hidden relative shrink-0">
                            {p.imageUrl && (
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-contain p-1"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#1C1B3A]">{p.name}</p>
                            <p className="text-[10px] text-[#6F6B88]">{p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#6F6B88]">
                        Rp {p.regularPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#4A3AFF]">
                        Rp {p.memberPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              p.stock <= 5 ? "text-red-500" : "text-[#1C1B3A]"
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleQuickRestock(p.id, 10)}
                            title="Tambah 10 stok instan"
                            className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white border border-[#E6E3F7] transition-colors cursor-pointer"
                          >
                            +10 Cepat
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            title="Edit menu"
                            className="p-1.5 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] hover:text-[#4A3AFF]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteProduct(p)}
                            title="Hapus menu"
                            className="p-1.5 rounded-full hover:bg-red-50 text-[#6F6B88] hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PENDAPATAN & SETTLEMENT */}
        {activeTab === "FINANCE" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
                <p className="text-xs text-[#6F6B88]">Total Omzet Terkumpul</p>
                <p className="text-xl font-extrabold text-[#1C1B3A]">
                  Rp {currentTenant.totalRevenue.toLocaleString("id-ID")}
                </p>
                <p className="text-[10.5px] text-[#2DBA7D]">Akumulasi seluruh penjualan</p>
              </div>

              <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
                <p className="text-xs text-[#6F6B88]">Saldo Menunggu Settlement</p>
                <p className="text-xl font-extrabold text-[#4A3AFF]">
                  Rp {currentTenant.pendingSettlement.toLocaleString("id-ID")}
                </p>
                <p className="text-[10.5px] text-[#6F6B88]">
                  Ditransfer koperasi pada cutoff tgl 25
                </p>
              </div>

              <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
                <p className="text-xs text-[#6F6B88]">Rekening Pencairan</p>
                <p className="text-sm font-bold text-[#1C1B3A] truncate">
                  {currentTenant.bankName}
                </p>
                <p className="text-[11px] text-[#6F6B88]">
                  {currentTenant.bankAccountNumber} (a.n {currentTenant.bankAccountName})
                </p>
              </div>
            </div>

            {/* Settlement History Table */}
            <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#1C1B3A]">
                Riwayat Settlement Dana dari Koperasi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
                    <tr>
                      <th className="py-2.5 px-3">Periode Cutoff</th>
                      <th className="py-2.5 px-3">Transaksi</th>
                      <th className="py-2.5 px-3">Omzet Kotor</th>
                      <th className="py-2.5 px-3">Iuran Kopkar (1%)</th>
                      <th className="py-2.5 px-3">Dana Bersih Ditransfer</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E3F7]">
                    {sampleCanteenSettlements
                      .filter((s) => s.tenantId === currentTenant.id)
                      .map((stl) => (
                        <tr key={stl.id} className="hover:bg-[#F5F3FF]/50">
                          <td className="py-3 px-3 font-semibold text-[#1C1B3A]">{stl.period}</td>
                          <td className="py-3 px-3">{stl.totalTransactions} x</td>
                          <td className="py-3 px-3">Rp {stl.grossRevenue.toLocaleString("id-ID")}</td>
                          <td className="py-3 px-3 text-red-500">
                            -Rp {stl.platformFee.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-3 font-bold text-[#4A3AFF]">
                            Rp {stl.netDisbursement.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                stl.status === "PROCESSED"
                                  ? "bg-[#E6F9F0] text-[#2DBA7D]"
                                  : "bg-[#FFF4E5] text-[#D97706]"
                              }`}
                            >
                              {stl.status === "PROCESSED" ? "Sudah Ditransfer" : "Menunggu Cutoff 25"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. MODAL: ADD / EDIT PRODUCT */}
      {(isAddProductModalOpen || isEditProductModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
              <h3 className="text-sm font-bold text-[#1C1B3A]">
                {isAddProductModalOpen ? "Tambah Menu / Barang Baru" : "Edit Menu / Barang"}
              </h3>
              <button
                onClick={() => {
                  setIsAddProductModalOpen(false);
                  setIsEditProductModalOpen(false);
                }}
                className="w-7 h-7 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={isAddProductModalOpen ? handleSaveAddProduct : handleSaveEditProduct}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Nama Menu / Produk *</label>
                <input
                  type="text"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  required
                  placeholder="Contoh: Ayam Bakar Madu"
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Kategori</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs"
                  >
                    <option value="MAKANAN">Makanan Kantin</option>
                    <option value="MINUMAN">Minuman</option>
                    <option value="ELEKTRONIK_BIT">Elektronik &amp; Perkakas BIT</option>
                    <option value="ALAT_KERJA">Alat Kerja &amp; Safety</option>
                    <option value="KEBUTUHAN_HARIAN">Cookware &amp; Harian</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Satuan</label>
                  <input
                    type="text"
                    value={productFormData.unit}
                    onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                    placeholder="Porsi / Cup / Pcs"
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Harga Umum</label>
                  <input
                    type="number"
                    value={productFormData.regularPrice}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        regularPrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#4A3AFF]">Harga Anggota *</label>
                  <input
                    type="number"
                    value={productFormData.memberPrice}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        memberPrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#4A3AFF] rounded-[10px] p-2.5 text-xs font-bold text-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Stok Awal</label>
                  <input
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, stock: Number(e.target.value) })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Photo Preset Gallery */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-[#1C1B3A] block">Pilih Preset Foto Menu:</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-[#E6E3F7] rounded-[12px] bg-[#FAFAFC]">
                  {availableImagePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setProductFormData({ ...productFormData, imageUrl: preset.url })
                      }
                      className={`relative h-14 rounded-[8px] overflow-hidden border p-1 transition-all cursor-pointer ${
                        productFormData.imageUrl === preset.url
                          ? "border-[#4A3AFF] ring-2 ring-[#4A3AFF]/30 bg-white"
                          : "border-transparent bg-white hover:border-[#E6E3F7]"
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        sizes="50px"
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductModalOpen(false);
                    setIsEditProductModalOpen(false);
                  }}
                  className="py-2 px-4 rounded-full bg-white border border-[#E6E3F7] text-[#6F6B88] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold cursor-pointer"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: DELETE PRODUCT CONFIRMATION */}
      {isDeleteProductModalOpen && selectedProductForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1B3A]">Hapus Menu Stand?</h3>
              <p className="text-xs text-[#6F6B88] mt-1">
                Menu <strong>&quot;{selectedProductForEdit.name}&quot;</strong> akan dihapus dari katalog kasir stand Anda.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsDeleteProductModalOpen(false)}
                className="flex-1 py-2 rounded-full bg-white border border-[#E6E3F7] text-[#6F6B88] font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteProduct}
                className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Hapus Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: STRUK KASIR POS */}
      {showReceiptModal && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center space-y-1 border-b border-dashed border-[#E6E3F7] pb-3">
              <h3 className="text-sm font-bold text-[#1C1B3A]">{currentTenant.name}</h3>
              <p className="text-[10px] text-[#6F6B88]">{currentTenant.location}</p>
              <p className="text-[10px] text-[#4A3AFF] font-bold">{lastCompletedOrder.orderNumber}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6F6B88]">
                <span>Pembeli:</span>
                <span className="font-bold text-[#1C1B3A]">{lastCompletedOrder.employeeName}</span>
              </div>
              <div className="flex justify-between text-[#6F6B88]">
                <span>Metode:</span>
                <span className="font-bold text-[#4A3AFF]">{lastCompletedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="border-y border-dashed border-[#E6E3F7] py-2.5 space-y-1 text-xs">
              {lastCompletedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.quantity}x {item.productName}</span>
                  <span className="font-bold">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-extrabold text-sm text-[#1C1B3A]">
              <span>TOTAL BAYAR:</span>
              <span className="text-[#4A3AFF]">
                Rp {lastCompletedOrder.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full py-2.5 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] text-white font-bold text-xs cursor-pointer"
            >
              Tutup Struk &amp; Siap Transaksi Baru
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#E6E3F7] py-3 text-center text-xs text-[#6F6B88]">
        <p className="text-[11px] text-[#A5A2B8]">
          &copy; 2026 PT. Bhakti Idola Tama — Kasir POS Merchant Multi-Tenant Kopkar.
        </p>
      </footer>
    </div>
  );
};
