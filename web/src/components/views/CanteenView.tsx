"use client";

import React, { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { sampleProducts, sampleEmployees, sampleIncomingOrders } from "@/data/mockData";
import {
  CanteenProduct,
  ProductCategory,
  CanteenOrder,
  CanteenOrderStatus,
  CanteenOrderItem,
  CanteenPaymentMethod,
} from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface CartItem {
  product: CanteenProduct;
  quantity: number;
}

export const CanteenView: React.FC = () => {
  // Active Main Tab: "POS" | "ORDERS" | "MANAGE"
  const [activeTab, setActiveTab] = useState<"POS" | "ORDERS" | "MANAGE">("POS");

  // Products State (CRUD)
  const [products, setProducts] = useState<CanteenProduct[]>(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Incoming Orders State
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

  // Toast Notification State
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

  // Available image presets for easy photo selection in CRUD
  const availableImagePresets = [
    { label: "Nasi Goreng Spesial", url: "/images/makanan/nasi-goreng.webp", cat: "MAKANAN" },
    { label: "Soto Ayam Lamongan", url: "/images/makanan/soto-ayam.webp", cat: "MAKANAN" },
    { label: "Ayam Geprek Sambal", url: "/images/makanan/geprek.webp", cat: "MAKANAN" },
    { label: "Mie Sup / Miso", url: "/images/makanan/miso.webp", cat: "MAKANAN" },
    { label: "Tahu & Tempe Crispy", url: "/images/makanan/tahu-tempe.webp", cat: "MAKANAN" },
    { label: "Es Teh Manis Jumbo", url: "/images/makanan/es-teh.webp", cat: "MINUMAN" },
    { label: "Kopi Hitam Mantap", url: "/images/makanan/kopi-hitam.webp", cat: "MINUMAN" },
    { label: "Air Mineral Botol", url: "/images/makanan/air-mineral.webp", cat: "MINUMAN" },
    { label: "Rice Cooker Smart", url: "/images/products/rice-cooker(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Blender Heavy Duty", url: "/images/products/blender(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Chopper Bumbu Daging", url: "/images/products/chopper(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Kipas Angin Tornado", url: "/images/products/kipas-angin(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Kompor Gas 2 Tungku", url: "/images/products/kompor(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Regulator Gas Safety", url: "/images/products/regulator(1).png", cat: "ALAT_KERJA" },
    { label: "Setrika Listrik Ceramic", url: "/images/products/setrika(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Dispenser Galon Bawah", url: "/images/products/dispenser(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Stand Mixer Otomatis", url: "/images/products/mixer(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Electric Oven 20L", url: "/images/products/oven.png", cat: "ELEKTRONIK_BIT" },
    { label: "Slow Cooker Keramik", url: "/images/products/slow-cooker(1).png", cat: "ELEKTRONIK_BIT" },
    { label: "Sandwich Toaster", url: "/images/products/sandwich.png", cat: "ELEKTRONIK_BIT" },
    { label: "Vacuum Cleaner Cyclone", url: "/images/products/vacum.png", cat: "ELEKTRONIK_BIT" },
    { label: "Hair Dryer Quick Dry", url: "/images/products/hair-dryer.png", cat: "ELEKTRONIK_BIT" },
    { label: "Slow Juicer Ekstraktor", url: "/images/products/juicer.png", cat: "ELEKTRONIK_BIT" },
    { label: "Cookware Set Granite", url: "/images/products/cookware(1).png", cat: "KEBUTUHAN_HARIAN" },
  ];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Incoming Orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    const q = debouncedOrderSearch.toLowerCase().trim();
    const matchSearch =
      q === "" ||
      o.employeeName.toLowerCase().includes(q) ||
      o.employeeNik.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.department.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Count of pending orders
  const pendingOrdersCount = orders.filter((o) => o.status === "MENUNGGU_KONFIRMASI").length;
  const processingOrdersCount = orders.filter((o) => o.status === "DIPROSES").length;
  const readyOrdersCount = orders.filter((o) => o.status === "SIAP_DIAMBIL").length;

  // POS Cart Handlers
  const addToCart = (product: CanteenProduct) => {
    if (product.stock <= 0) {
      showToast(`Stok ${product.name} sedang habis!`, "error");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Stok ${product.name} maksimal ${product.stock} ${product.unit}`, "error");
          return prev;
        }
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
            if (newQty > item.product.stock) {
              showToast(`Stok tidak mencukupi (Maksimal: ${item.product.stock})`, "error");
              return item;
            }
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

  const memberSavings = isMember ? regularSubtotal - subtotal : 0;

  // Handle Walk-in POS Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Deduct stock from products
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((item) => item.product.id === p.id);
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
        }
        return p;
      })
    );

    // Create completed order record
    const newOrder: CanteenOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      orderNumber: `POS-BIT-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedBuyer.id,
      employeeNik: selectedBuyer.nik,
      employeeName: selectedBuyer.name,
      department: selectedBuyer.department,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: isMember ? item.product.memberPrice : item.product.regularPrice,
        regularPrice: item.product.regularPrice,
        quantity: item.quantity,
        subtotal: (isMember ? item.product.memberPrice : item.product.regularPrice) * item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      totalAmount: subtotal,
      totalSaved: memberSavings,
      paymentMethod,
      status: "SELESAI",
      orderType: "KANTIN_MAKANAN",
      pickupTime: "Langsung di Kasir",
      notes: "Transaksi Langsung di Meja Kasir Kantin BIT",
      createdAt: "Baru saja",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastCompletedOrder(newOrder);
    setCart([]);
    setShowReceiptModal(true);
    showToast(
      `Transaksi ${newOrder.orderNumber} berhasil! ${
        paymentMethod === "POTONG_GAJI" ? "Otomatis dicatat ke Payroll HRD." : ""
      }`,
      "success"
    );
  };

  // Order Queue Status Transitions
  const handleUpdateOrderStatus = (orderId: string, nextStatus: CanteenOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    if (nextStatus === "DIPROSES") {
      showToast(`Pesanan ${target.orderNumber} (${target.employeeName}) diterima & sedang disiapkan!`, "info");
    } else if (nextStatus === "SIAP_DIAMBIL") {
      showToast(`Pesanan ${target.orderNumber} siap diambil! Notifikasi dikirim ke aplikasi karyawan.`, "success");
    } else if (nextStatus === "SELESAI") {
      showToast(`Pesanan ${target.orderNumber} telah diserahkan & selesai!`, "success");
    } else if (nextStatus === "DIBATALKAN") {
      showToast(`Pesanan ${target.orderNumber} telah dibatalkan.`, "error");
    }
  };

  // Accept all pending orders at once
  const handleAcceptAllPendingOrders = () => {
    if (pendingOrdersCount === 0) return;
    setOrders((prev) =>
      prev.map((o) => (o.status === "MENUNGGU_KONFIRMASI" ? { ...o, status: "DIPROSES" } : o))
    );
    showToast(`Semua ${pendingOrdersCount} pesanan baru telah diterima & masuk antrean dapur!`, "success");
  };

  // CRUD Handlers for Products
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

    const newProd: CanteenProduct = {
      id: `PRD-${String(products.length + 1).padStart(3, "0")}`,
      name: productFormData.name.trim(),
      category: productFormData.category,
      regularPrice: Number(productFormData.regularPrice),
      memberPrice: Number(productFormData.memberPrice),
      stock: Number(productFormData.stock),
      unit: productFormData.unit,
      imageUrl: productFormData.imageUrl,
      description: productFormData.description,
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsAddProductModalOpen(false);
    showToast(`Produk "${newProd.name}" berhasil ditambahkan ke katalog!`, "success");
  };

  const handleOpenEditProduct = (prod: CanteenProduct) => {
    setSelectedProductForEdit(prod);
    setProductFormData({
      name: prod.name,
      category: prod.category,
      regularPrice: prod.regularPrice,
      memberPrice: prod.memberPrice,
      stock: prod.stock,
      unit: prod.unit,
      imageUrl: prod.imageUrl || "/images/makanan/nasi-goreng.webp",
      description: prod.description || "",
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
              description: productFormData.description,
            }
          : p
      )
    );

    setIsEditProductModalOpen(false);
    showToast(`Data produk "${productFormData.name}" berhasil diperbarui!`, "success");
  };

  const handleOpenDeleteProduct = (prod: CanteenProduct) => {
    setSelectedProductForEdit(prod);
    setIsDeleteProductModalOpen(true);
  };

  const handleConfirmDeleteProduct = () => {
    if (!selectedProductForEdit) return;
    setProducts((prev) => prev.filter((p) => p.id !== selectedProductForEdit.id));
    setIsDeleteProductModalOpen(false);
    showToast(`Produk "${selectedProductForEdit.name}" telah dihapus dari katalog.`, "info");
  };

  const handleQuickRestock = (productId: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    );
    showToast(`Stok berhasil ditambah +${amount}`, "success");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-fadeIn">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-[16px] shadow-xl border text-xs font-semibold text-white ${
              toastMessage.type === "success"
                ? "bg-[#2DBA7D] border-[#2DBA7D]"
                : toastMessage.type === "error"
                ? "bg-[#EF4444] border-[#EF4444]"
                : "bg-[#1C1B3A] border-white/20"
            }`}
          >
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {toastMessage.type === "info" && <Info className="w-4 h-4 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. Header & Navigation Tabs */}
      <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#E6E3F7] shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1B3A] tracking-tight">
                Kantin &amp; Toko Perkakas Kopkar BIT
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Dual Pricing &amp; Order Gateway
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6F6B88]">
              Kelola kasir POS, antrean pesanan masuk dari aplikasi karyawan, dan manajemen katalog produk &amp; makanan.
            </p>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F3FF] rounded-full border border-[#E6E3F7] self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("POS")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "POS"
                  ? "bg-[#4A3AFF] text-white shadow-xs"
                  : "text-[#6F6B88] hover:text-[#1C1B3A]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>POS Kasir Digital</span>
            </button>

            <button
              onClick={() => setActiveTab("ORDERS")}
              className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "ORDERS"
                  ? "bg-[#4A3AFF] text-white shadow-xs"
                  : "text-[#6F6B88] hover:text-[#1C1B3A]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pesanan Masuk (App Karyawan)</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-[#FFB547] text-[#1C1B3A] animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("MANAGE")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "MANAGE"
                  ? "bg-[#4A3AFF] text-white shadow-xs"
                  : "text-[#6F6B88] hover:text-[#1C1B3A]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kelola Menu &amp; Stok (CRUD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: POS KASIR DIGITAL (PEMESANAN LANGSUNG & DUAL PRICING) */}
      {/* ========================================================================= */}
      {activeTab === "POS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 Cols): Product Catalog Grid */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search & Category Filter Bar */}
            <div className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari makanan, minuman, kompor, rice cooker, atau alat kerja..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#212529] placeholder-[#6F6B88] focus:outline-none focus:border-[#4A3AFF] focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                        : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7] hover:bg-[#F5F3FF] hover:text-[#4A3AFF]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-[18px] border border-[#E6E3F7] text-center text-[#6F6B88] space-y-2">
                  <ShoppingBag className="w-8 h-8 text-[#A5A2B8] mx-auto" />
                  <p className="font-bold text-[#1C1B3A]">Tidak ada produk yang sesuai</p>
                  <p className="text-xs">Coba ganti kata kunci pencarian atau kategori.</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const discountPercent = Math.round(
                    ((product.regularPrice - product.memberPrice) / product.regularPrice) * 100
                  );

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-[18px] border border-[#E6E3F7] p-3.5 flex flex-col justify-between hover:border-[#4A3AFF] hover:shadow-md transition-all group"
                    >
                      <div>
                        {/* Image Container with Real Photo */}
                        <div className="relative w-full h-32 sm:h-36 bg-[#FAFAFC] rounded-[12px] mb-2.5 overflow-hidden flex items-center justify-center p-2 border border-[#E6E3F7]/50">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={160}
                              height={160}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <UtensilsCrossed className="w-10 h-10 text-[#A5A2B8]" />
                          )}

                          {/* Member Discount Badge */}
                          <div className="absolute top-2 left-2 bg-[#2DBA7D] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            Hemat {discountPercent}%
                          </div>

                          {/* Stock Badge */}
                          <div
                            className={`absolute bottom-2 right-2 text-[9.5px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                              product.stock > 10
                                ? "bg-white/90 text-[#1C1B3A] border border-[#E6E3F7]"
                                : product.stock > 0
                                ? "bg-amber-500/90 text-white"
                                : "bg-red-500/90 text-white"
                            }`}
                          >
                            Stok: {product.stock} {product.unit}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-xs text-[#1C1B3A] line-clamp-2 min-h-[32px] leading-tight">
                          {product.name}
                        </h3>
                      </div>

                      {/* Pricing & Add to Cart */}
                      <div className="pt-2.5 border-t border-[#E6E3F7] mt-2 space-y-2">
                        {/* Dual Price Spotlight */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#6F6B88] line-through">
                              Rp {product.regularPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[9px] font-bold text-[#6F6B88] uppercase">
                              Umum
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-extrabold text-[#4A3AFF]">
                              Rp {product.memberPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[9.5px] font-bold text-[#2DBA7D] bg-[#E6F9F0] px-1.5 py-0.2 rounded-md">
                              Anggota
                            </span>
                          </div>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className={`w-full py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            product.stock <= 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                              : "bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white border border-[#E6E3F7]"
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{product.stock <= 0 ? "Habis" : "Beli / Tambah"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (4 Cols): Interactive POS Cart */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[20px] border border-[#E6E3F7] p-5 shadow-xs space-y-4 sticky top-24">
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-[#1C1B3A]">Keranjang Belanja POS</h2>
                    <p className="text-[10px] text-[#6F6B88]">{cart.length} Jenis Produk Dipilih</p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[10.5px] font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Select Employee / Buyer */}
              <div className="p-3 bg-[#F5F3FF] rounded-[14px] border border-[#E6E3F7] space-y-2 text-xs">
                <label className="font-bold text-[#1C1B3A] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#4A3AFF]" />
                  Pilih Karyawan Pembeli:
                </label>
                <select
                  value={selectedBuyerId}
                  onChange={(e) => setSelectedBuyerId(e.target.value)}
                  className="w-full bg-white border border-[#E6E3F7] rounded-[10px] px-2.5 py-2 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
                >
                  {sampleEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.nik}) - {emp.department}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[#6F6B88]">Status Anggota:</span>
                  <span className="font-bold text-[#2DBA7D] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Anggota Aktif (Diskon Otomatis)
                  </span>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#E6E3F7]">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-[#6F6B88] space-y-1">
                    <ShoppingBag className="w-8 h-8 text-[#A5A2B8] mx-auto opacity-50" />
                    <p className="text-xs font-semibold">Keranjang masih kosong</p>
                    <p className="text-[11px]">Klik produk di sebelah kiri untuk menambahkan.</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const price = isMember ? item.product.memberPrice : item.product.regularPrice;
                    const itemTotal = price * item.quantity;

                    return (
                      <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={36}
                              height={36}
                              className="w-9 h-9 object-contain rounded-md bg-gray-50 border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                              <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#1C1B3A] truncate">{item.product.name}</p>
                            <p className="text-[10px] text-[#4A3AFF] font-semibold">
                              Rp {price.toLocaleString("id-ID")} x {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#1C1B3A] w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-6 h-6 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] text-[#4A3AFF] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-6 h-6 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors ml-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Payment Method Selector */}
              {cart.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E6E3F7] text-xs">
                  <label className="font-bold text-[#1C1B3A] block">Metode Pembayaran:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("POTONG_GAJI")}
                      className={`p-2 rounded-[10px] border text-left transition-all cursor-pointer ${
                        paymentMethod === "POTONG_GAJI"
                          ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                          : "bg-white text-[#6F6B88] border-[#E6E3F7] hover:bg-[#F5F3FF]"
                      }`}
                    >
                      <p className="font-bold text-[11px]">Potong Gaji</p>
                      <p className="text-[9.5px] opacity-80">Auto Payroll HRD</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("SALDO_KOPERASI")}
                      className={`p-2 rounded-[10px] border text-left transition-all cursor-pointer ${
                        paymentMethod === "SALDO_KOPERASI"
                          ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                          : "bg-white text-[#6F6B88] border-[#E6E3F7] hover:bg-[#F5F3FF]"
                      }`}
                    >
                      <p className="font-bold text-[11px]">Saldo Koperasi</p>
                      <p className="text-[9.5px] opacity-80">Potong Saldo</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Cost Summary & Checkout Button */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#E6E3F7] text-xs">
                  <div className="space-y-1 text-[#6F6B88]">
                    <div className="flex justify-between">
                      <span>Total Harga Normal:</span>
                      <span className="line-through">Rp {regularSubtotal.toLocaleString("id-ID")}</span>
                    </div>
                    {memberSavings > 0 && (
                      <div className="flex justify-between text-[#2DBA7D] font-semibold">
                        <span>Diskon Khusus Anggota:</span>
                        <span>- Rp {memberSavings.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-[#1C1B3A] pt-1 border-t border-[#E6E3F7]">
                      <span>Total Bayar:</span>
                      <span className="text-[#4A3AFF]">Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4A3AFF]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Bayar &amp; Cetak Struk POS</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PESANAN MASUK DARI APLIKASI KARYAWAN (ONLINE ORDER QUEUE) */}
      {/* ========================================================================= */}
      {activeTab === "ORDERS" && (
        <div className="space-y-5">
          {/* Order Stats KPI Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#6F6B88]">Menunggu Konfirmasi</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB547] animate-pulse"></span>
              </div>
              <p className="text-2xl font-extrabold text-[#D97706]">{pendingOrdersCount} Pesanan</p>
              <p className="text-[11px] text-[#6F6B88] mt-1">Perlu segera diproses dapur/kasir</p>
            </div>

            <div className="p-4 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#6F6B88]">Sedang Disiapkan</span>
                <div className="w-6 h-6 rounded-full bg-[#EBF3FE] text-[#2563EB] flex items-center justify-center text-xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#2563EB]">{processingOrdersCount} Pesanan</p>
              <p className="text-[11px] text-[#6F6B88] mt-1">Dapur kantin / gudang BIT</p>
            </div>

            <div className="p-4 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#6F6B88]">Siap Diambil Karyawan</span>
                <div className="w-6 h-6 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#2DBA7D]">{readyOrdersCount} Pesanan</p>
              <p className="text-[11px] text-[#6F6B88] mt-1">Notifikasi terkirim ke mobile app</p>
            </div>

            <div className="p-4 rounded-[18px] bg-white border border-[#E6E3F7] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#6F6B88]">Total Omzet Mobile App</span>
                <div className="w-6 h-6 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center text-xs">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-[#4A3AFF]">
                Rp {orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-[#2DBA7D] font-medium mt-1">Potong gaji &amp; saldo otomatis</p>
            </div>
          </div>

          {/* Filter Bar & Quick Actions */}
          <div className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor order, nama karyawan, atau NIK..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-10 pr-4 py-2 text-xs text-[#212529] focus:outline-none focus:border-[#4A3AFF]"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs text-[#6F6B88] font-medium mr-1 hidden sm:inline">Status:</span>
              {[
                { id: "ALL", label: "Semua" },
                { id: "MENUNGGU_KONFIRMASI", label: `Baru (${pendingOrdersCount})` },
                { id: "DIPROSES", label: "Diproses" },
                { id: "SIAP_DIAMBIL", label: "Siap Diambil" },
                { id: "SELESAI", label: "Selesai" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOrderStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                    orderStatusFilter === st.id
                      ? "bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-xs"
                      : "bg-[#FAFAFC] text-[#6F6B88] border-[#E6E3F7] hover:bg-[#F5F3FF]"
                  }`}
                >
                  {st.label}
                </button>
              ))}

              {pendingOrdersCount > 0 && (
                <button
                  onClick={handleAcceptAllPendingOrders}
                  className="px-3 py-1.5 rounded-full bg-[#E6F9F0] hover:bg-[#2DBA7D] text-[#059669] hover:text-white border border-[#A7F3D0] text-xs font-bold transition-all cursor-pointer shrink-0 ml-2"
                >
                  Terima Semua ({pendingOrdersCount})
                </button>
              )}
            </div>
          </div>

          {/* Orders List Cards */}
          <div className="space-y-3.5">
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-[18px] border border-[#E6E3F7] text-center text-[#6F6B88] space-y-2">
                <Smartphone className="w-8 h-8 text-[#A5A2B8] mx-auto" />
                <p className="font-bold text-[#1C1B3A]">Tidak ada pesanan pada filter ini</p>
                <p className="text-xs">Pesanan baru dari aplikasi mobile karyawan akan muncul otomatis di sini.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-[18px] border p-5 transition-all shadow-xs space-y-4 ${
                      order.status === "MENUNGGU_KONFIRMASI"
                        ? "border-[#FFB547] ring-1 ring-[#FFB547]/30 bg-[#FFFDF8]"
                        : order.status === "SIAP_DIAMBIL"
                        ? "border-[#2DBA7D] bg-[#F9FEFB]"
                        : "border-[#E6E3F7]"
                    }`}
                  >
                    {/* Order Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E6E3F7]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {order.employeeName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-[#1C1B3A]">
                              {order.employeeName}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#4A3AFF] bg-[#F5F3FF] px-2 py-0.5 rounded-full border border-[#E6E3F7]">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10.5px] text-[#6F6B88]">
                              NIK: <strong>{order.employeeNik}</strong> • {order.department}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6F6B88] mt-0.5">
                            Dipesan: {order.createdAt} • Target Ambil:{" "}
                            <strong className="text-[#1C1B3A]">{order.pickupTime || "Segera"}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="self-start sm:self-center">
                        {order.status === "MENUNGGU_KONFIRMASI" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-[#FFF4E5] text-[#D97706] border border-[#FDE68A]">
                            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping"></span>
                            Menunggu Konfirmasi
                          </span>
                        )}
                        {order.status === "DIPROSES" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#EBF3FE] text-[#2563EB] border border-[#BFDBFE]">
                            <Clock className="w-3.5 h-3.5" />
                            Sedang Disiapkan
                          </span>
                        )}
                        {order.status === "SIAP_DIAMBIL" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#E6F9F0] text-[#059669] border border-[#A7F3D0]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Siap Diambil Karyawan
                          </span>
                        )}
                        {order.status === "SELESAI" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                            <Check className="w-3.5 h-3.5" />
                            Selesai &amp; Diserahkan
                          </span>
                        )}
                        {order.status === "DIBATALKAN" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                            <X className="w-3.5 h-3.5" />
                            Dibatalkan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-[12px] bg-[#FAFAFC] border border-[#E6E3F7]/70 text-xs"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-contain rounded-md bg-white border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                              <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#1C1B3A] truncate">{item.productName}</p>
                            <div className="flex items-center justify-between text-[11px] text-[#6F6B88]">
                              <span>{item.quantity} porsi / unit</span>
                              <span className="font-bold text-[#4A3AFF]">
                                Rp {item.subtotal.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Notes Callout (if any) */}
                    {order.notes && (
                      <div className="p-2.5 rounded-[10px] bg-[#F5F3FF] border border-[#E6E3F7] text-xs flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#4A3AFF] shrink-0" />
                        <span className="text-[#1C1B3A]">
                          <strong>Catatan Karyawan:</strong> &quot;{order.notes}&quot;
                        </span>
                      </div>
                    )}

                    {/* Order Footer & Action Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E6E3F7]">
                      {/* Payment & Totals */}
                      <div className="flex items-center gap-3 text-xs">
                        <div>
                          <span className="text-[11px] text-[#6F6B88]">Total Pembayaran:</span>
                          <p className="text-base font-extrabold text-[#4A3AFF]">
                            Rp {order.totalAmount.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="border-l border-[#E6E3F7] pl-3">
                          <span className="text-[10px] text-[#2DBA7D] font-bold block">
                            Hemat Rp {order.totalSaved.toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10.5px] font-semibold text-[#1C1B3A] bg-[#FAFAFC] px-2 py-0.5 rounded-full border border-[#E6E3F7]">
                            Metode: {order.paymentMethod === "POTONG_GAJI" ? "Potong Gaji (Payroll)" : "Saldo Koperasi"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {order.status === "MENUNGGU_KONFIRMASI" && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "DIBATALKAN")}
                              className="px-3.5 py-2 rounded-full border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs transition-all cursor-pointer"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "DIPROSES")}
                              className="px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Terima &amp; Siapkan Pesanan</span>
                            </button>
                          </>
                        )}

                        {order.status === "DIPROSES" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "SIAP_DIAMBIL")}
                            className="px-4 py-2 rounded-full bg-[#2DBA7D] hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>Tandai Siap Diambil (Kirim Notif)</span>
                          </button>
                        )}

                        {order.status === "SIAP_DIAMBIL" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, "SELESAI")}
                            className="px-4 py-2 rounded-full bg-[#1C1B3A] hover:bg-black text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D]" />
                            <span>Serahkan Pesanan (Selesai)</span>
                          </button>
                        )}

                        {order.status === "SELESAI" && (
                          <button
                            onClick={() => {
                              setLastCompletedOrder(order);
                              setShowReceiptModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-full border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#4A3AFF] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Ulang Struk</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANAJEMEN MENU & STOK (CRUD KATALOG PRODUK & MAKANAN) */}
      {/* ========================================================================= */}
      {activeTab === "MANAGE" && (
        <div className="space-y-5">
          {/* Header Bar with Add Product Action */}
          <div className="bg-white p-4 rounded-[18px] border border-[#E6E3F7] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-[#6F6B88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk untuk diubah / dihapus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-10 pr-4 py-2 text-xs text-[#212529] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#FAFAFC] border border-[#E6E3F7] rounded-full px-3 py-2 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="w-full md:w-auto px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-semibold text-xs shadow-md shadow-[#4A3AFF]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu / Produk Baru</span>
            </button>
          </div>

          {/* Product Management Table */}
          <div className="bg-white rounded-[20px] border border-[#E6E3F7] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E6E3F7] bg-[#FAFAFC]/60 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1B3A] uppercase tracking-wider">
                Katalog Menu &amp; Stok Barang ({filteredProducts.length} Item)
              </span>
              <span className="text-[11px] text-[#6F6B88]">
                Dual Pricing Terkoneksi ke POS &amp; Mobile App
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F3FF]/40 border-b border-[#E6E3F7] text-[11px] font-bold text-[#6F6B88] uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Foto &amp; Nama Produk</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Harga Umum</th>
                    <th className="py-3.5 px-4">Harga Khusus Anggota</th>
                    <th className="py-3.5 px-4">Stok Saat Ini</th>
                    <th className="py-3.5 px-4 text-right pr-6">Aksi (CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]">
                  {filteredProducts.map((prod) => {
                    const discount = Math.round(
                      ((prod.regularPrice - prod.memberPrice) / prod.regularPrice) * 100
                    );

                    return (
                      <tr key={prod.id} className="hover:bg-[#F5F3FF]/20 transition-colors">
                        {/* 1. Photo & Name */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[10px] bg-[#FAFAFC] border border-[#E6E3F7] p-1 flex items-center justify-center shrink-0">
                              {prod.imageUrl ? (
                                <Image
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#1C1B3A] text-xs">{prod.name}</p>
                              <p className="text-[10.5px] text-[#6F6B88] truncate max-w-xs">
                                {prod.description || "Tersedia di kantin & toko BIT"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category */}
                        <td className="py-3.5 px-4">
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]">
                            {prod.category}
                          </span>
                        </td>

                        {/* 3. Regular Price */}
                        <td className="py-3.5 px-4 text-[#6F6B88] font-medium">
                          Rp {prod.regularPrice.toLocaleString("id-ID")}
                        </td>

                        {/* 4. Member Price */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#4A3AFF]">
                              Rp {prod.memberPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[9px] font-bold text-[#2DBA7D] bg-[#E6F9F0] px-1 py-0.2 rounded">
                              -{discount}%
                            </span>
                          </div>
                        </td>

                        {/* 5. Stock */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                prod.stock > 15
                                  ? "text-[#1C1B3A]"
                                  : prod.stock > 0
                                  ? "text-amber-600"
                                  : "text-red-500"
                              }`}
                            >
                              {prod.stock} {prod.unit}
                            </span>

                            {/* Quick +10 stock button */}
                            <button
                              onClick={() => handleQuickRestock(prod.id, 10)}
                              title="Tambah +10 Stok"
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 hover:bg-[#4A3AFF] hover:text-white transition-colors cursor-pointer"
                            >
                              +10
                            </button>
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3.5 px-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              title="Edit Produk"
                              className="w-7 h-7 rounded-full bg-white hover:bg-[#F5F3FF] text-[#6F6B88] hover:text-[#4A3AFF] border border-[#E6E3F7] flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenDeleteProduct(prod)}
                              title="Hapus Produk"
                              className="w-7 h-7 rounded-full bg-white hover:bg-red-50 text-[#6F6B88] hover:text-red-600 border border-[#E6E3F7] hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STRUK INVOICE TRANSAKSI POS */}
      {/* ========================================================================= */}
      {showReceiptModal && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-[#E6E3F7]">
              <div className="w-10 h-10 rounded-full bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1C1B3A]">KOPKAR PT BHAKTI IDOLA TAMA</h3>
              <p className="text-[10.5px] text-[#6F6B88]">Struk Resmi Kantin &amp; Toko Koperasi</p>
              <p className="text-[11px] font-mono text-[#4A3AFF] font-bold">{lastCompletedOrder.orderNumber}</p>
            </div>

            <div className="space-y-1.5 text-xs text-[#6F6B88]">
              <div className="flex justify-between">
                <span>Pembeli:</span>
                <span className="font-bold text-[#1C1B3A]">{lastCompletedOrder.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span>NIK / Divisi:</span>
                <span>{lastCompletedOrder.employeeNik}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-semibold text-[#4A3AFF]">
                  {lastCompletedOrder.paymentMethod === "POTONG_GAJI" ? "Potong Gaji (Payroll)" : "Saldo Koperasi"}
                </span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-1.5 pt-2 border-t border-dashed border-[#E6E3F7] text-xs divide-y divide-gray-100">
              {lastCompletedOrder.items.map((item, i) => (
                <div key={i} className="pt-1.5 flex justify-between">
                  <div>
                    <p className="font-bold text-[#1C1B3A]">{item.productName}</p>
                    <p className="text-[10px] text-[#6F6B88]">
                      {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="font-bold text-[#1C1B3A]">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-[#E6E3F7] space-y-1 text-xs">
              {lastCompletedOrder.totalSaved > 0 && (
                <div className="flex justify-between text-[#2DBA7D] font-bold">
                  <span>Hemat Diskon Anggota:</span>
                  <span>- Rp {lastCompletedOrder.totalSaved.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#1C1B3A]">
                <span>Total:</span>
                <span className="text-[#4A3AFF]">
                  Rp {lastCompletedOrder.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH PRODUK BARU */}
      {/* ========================================================================= */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C1B3A]">Tambah Menu / Produk Baru</h3>
                  <p className="text-xs text-[#6F6B88]">Kantin &amp; Toko Koperasi PT Bhakti Idola Tama</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Nama Makanan / Produk *</label>
                <input
                  type="text"
                  placeholder="Contoh: Paket Nasi Ayam Bakar / Rice Cooker 1.8L"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Kategori *</label>
                  <select
                    value={productFormData.category}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  >
                    <option value="MAKANAN">🍱 Makanan Kantin</option>
                    <option value="MINUMAN">🥤 Minuman</option>
                    <option value="ELEKTRONIK_BIT">⚡ Elektronik &amp; Perkakas BIT</option>
                    <option value="ALAT_KERJA">🔧 Alat Kerja &amp; Safety</option>
                    <option value="KEBUTUHAN_HARIAN">🍳 Cookware &amp; Harian</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Satuan Kemasan</label>
                  <input
                    type="text"
                    placeholder="Porsi / Cup / Unit / Pcs / Set"
                    value={productFormData.unit}
                    onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Harga Umum (Rp) *</label>
                  <input
                    type="number"
                    value={productFormData.regularPrice}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        regularPrice: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#4A3AFF]">Harga Anggota (Rp) *</label>
                  <input
                    type="number"
                    value={productFormData.memberPrice}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        memberPrice: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full bg-[#F5F3FF] border border-[#4A3AFF] rounded-[10px] px-3 py-2.5 text-xs font-bold text-[#4A3AFF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Stok Awal</label>
                  <input
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        stock: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              {/* Photo Selector Preset */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#1C1B3A] block">
                  Pilih Foto Produk (Preset Foto Folder Makanan &amp; Product):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-[#FAFAFC] rounded-[12px] border border-[#E6E3F7]">
                  {availableImagePresets.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setProductFormData({ ...productFormData, imageUrl: preset.url })}
                      className={`relative p-1 rounded-[8px] border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        productFormData.imageUrl === preset.url
                          ? "border-[#4A3AFF] bg-[#F5F3FF] ring-2 ring-[#4A3AFF]/30"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        width={36}
                        height={36}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-[8.5px] truncate w-full text-center mt-0.5 text-[#6F6B88]">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Keterangan porsi, bahan, atau garansi..."
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6E3F7]">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E6E3F7] hover:bg-gray-50 text-[#6F6B88] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold shadow-sm transition-all cursor-pointer"
                >
                  Simpan Produk Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT PRODUK */}
      {/* ========================================================================= */}
      {isEditProductModalOpen && selectedProductForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1C1B3A]">Edit Data Produk</h3>
                  <p className="text-xs text-[#6F6B88]">{selectedProductForEdit.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProductModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1C1B3A]">Nama Makanan / Produk *</label>
                <input
                  type="text"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  required
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  >
                    <option value="MAKANAN">🍱 Makanan Kantin</option>
                    <option value="MINUMAN">🥤 Minuman</option>
                    <option value="ELEKTRONIK_BIT">⚡ Elektronik &amp; Perkakas BIT</option>
                    <option value="ALAT_KERJA">🔧 Alat Kerja &amp; Safety</option>
                    <option value="KEBUTUHAN_HARIAN">🍳 Cookware &amp; Harian</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Satuan Kemasan</label>
                  <input
                    type="text"
                    value={productFormData.unit}
                    onChange={(e) => setProductFormData({ ...productFormData, unit: e.target.value })}
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Harga Umum (Rp)</label>
                  <input
                    type="number"
                    value={productFormData.regularPrice}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        regularPrice: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#4A3AFF]">Harga Anggota (Rp)</label>
                  <input
                    type="number"
                    value={productFormData.memberPrice}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        memberPrice: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full bg-[#F5F3FF] border border-[#4A3AFF] rounded-[10px] px-3 py-2.5 text-xs font-bold text-[#4A3AFF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C1B3A]">Stok</label>
                  <input
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        stock: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] px-3 py-2.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              {/* Photo Selector Preset */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#1C1B3A] block">Ganti Foto Produk:</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-[#FAFAFC] rounded-[12px] border border-[#E6E3F7]">
                  {availableImagePresets.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setProductFormData({ ...productFormData, imageUrl: preset.url })}
                      className={`relative p-1 rounded-[8px] border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        productFormData.imageUrl === preset.url
                          ? "border-[#4A3AFF] bg-[#F5F3FF] ring-2 ring-[#4A3AFF]/30"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        width={36}
                        height={36}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-[8.5px] truncate w-full text-center mt-0.5 text-[#6F6B88]">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6E3F7]">
                <button
                  type="button"
                  onClick={() => setIsEditProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E6E3F7] hover:bg-gray-50 text-[#6F6B88] font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold shadow-sm transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KONFIRMASI HAPUS PRODUK */}
      {/* ========================================================================= */}
      {isDeleteProductModalOpen && selectedProductForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[22px] border border-[#E6E3F7] shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#1C1B3A]">Hapus Produk dari Katalog?</h3>
              <p className="text-xs text-[#6F6B88]">
                Produk <strong>&quot;{selectedProductForEdit.name}&quot;</strong> tidak akan lagi muncul di POS dan aplikasi mobile karyawan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteProductModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-[#E6E3F7] hover:bg-gray-50 text-[#6F6B88] font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="flex-1 py-2.5 rounded-full bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
