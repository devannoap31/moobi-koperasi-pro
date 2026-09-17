"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  sampleProducts,
  sampleIncomingOrders,
  sampleCanteenTenants,
  sampleCanteenSettlements,
  sampleTenantUpdateRequests,
} from "@/data/mockData";
import {
  CanteenProduct,
  ProductCategory,
  CanteenOrder,
  CanteenOrderStatus,
  CanteenTenant,
  CanteenSettlement,
  TenantUpdateRequest,
  CanteenQrisProfile,
} from "@/types";

interface ToastMessage {
  text: string;
  type: "success" | "error" | "info";
}

export interface ImagePreset {
  label: string;
  url: string;
  cat: ProductCategory;
}

export const availableImagePresets: ImagePreset[] = [
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

interface MerchantContextType {
  currentTenant: CanteenTenant;
  setCurrentTenant: (tenant: CanteenTenant) => void;
  updateStoreInfo: (updatedFields: Partial<CanteenTenant>) => void;
  updateCredentials: (username: string, password?: string) => void;
  qrisProfiles: CanteenQrisProfile[];
  activeQris: CanteenQrisProfile | null;
  addQrisProfile: (profile: Omit<CanteenQrisProfile, "id">) => boolean;
  updateQrisProfile: (id: string, updatedFields: Partial<CanteenQrisProfile>) => void;
  deleteQrisProfile: (id: string) => void;
  setActiveQris: (id: string) => void;
  products: CanteenProduct[];
  setProducts: React.Dispatch<React.SetStateAction<CanteenProduct[]>>;
  addProduct: (product: Omit<CanteenProduct, "id" | "tenantId">) => void;
  editProduct: (product: CanteenProduct) => void;
  deleteProduct: (productId: string) => void;
  quickRestock: (productId: string, amount: number) => void;
  orders: CanteenOrder[];
  setOrders: React.Dispatch<React.SetStateAction<CanteenOrder[]>>;
  updateOrderStatus: (orderId: string, status: CanteenOrderStatus) => void;
  addCompletedOrder: (order: CanteenOrder) => void;
  pendingOrdersCount: number;
  settlements: CanteenSettlement[];
  updateRequests: TenantUpdateRequest[];
  submitUpdateRequest: (requestedFields: TenantUpdateRequest["requestedFields"], reason: string) => void;
  toastMessage: ToastMessage | null;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

const MerchantProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const searchParams = useSearchParams();
  const tenantIdParam = searchParams?.get("tenantId") || "tenant-01";

  const [currentTenant, setCurrentTenant] = useState<CanteenTenant>(() => {
    return (
      sampleCanteenTenants.find((t) => t.id === tenantIdParam) ||
      sampleCanteenTenants[0]
    );
  });

  useEffect(() => {
    const found = sampleCanteenTenants.find((t) => t.id === tenantIdParam);
    if (found) {
      setCurrentTenant(found);
    }
  }, [tenantIdParam]);

  // QRIS Profiles Multi-management
  const getInitialQrisProfiles = (tenant: CanteenTenant): CanteenQrisProfile[] => {
    if (tenant.qrisProfiles && tenant.qrisProfiles.length > 0) {
      return tenant.qrisProfiles;
    }
    return [
      {
        id: `QRIS-${tenant.id}-01`,
        label: `QRIS Utama - ${tenant.name}`,
        imageUrl: tenant.qrisImageUrl || "/images/qris-example.jpg",
        nmid: tenant.qrisNmid || "ID1020039281920",
        bankOrProvider: tenant.bankName || "BCA",
        isActive: true,
        createdAt: "2024-01-15",
      },
    ];
  };

  const [qrisProfiles, setQrisProfiles] = useState<CanteenQrisProfile[]>(() =>
    getInitialQrisProfiles(currentTenant)
  );

  useEffect(() => {
    setQrisProfiles(getInitialQrisProfiles(currentTenant));
  }, [currentTenant.id]);

  const activeQris =
    qrisProfiles.find((q) => q.isActive) || qrisProfiles[0] || null;

  const syncQrisToTenant = (newProfiles: CanteenQrisProfile[]) => {
    const active = newProfiles.find((q) => q.isActive) || newProfiles[0] || null;
    setCurrentTenant((prev) => {
      const updated: CanteenTenant = {
        ...prev,
        qrisProfiles: newProfiles,
        qrisImageUrl: active?.imageUrl || prev.qrisImageUrl,
        qrisNmid: active?.nmid || prev.qrisNmid,
        activeQrisId: active?.id,
      };
      const idx = sampleCanteenTenants.findIndex((t) => t.id === prev.id);
      if (idx !== -1) {
        sampleCanteenTenants[idx] = updated;
      }
      return updated;
    });
  };

  const addQrisProfile = (profile: Omit<CanteenQrisProfile, "id">): boolean => {
    if (qrisProfiles.length >= 3) {
      showToast("Maksimal 3 barcode QRIS telah tercapai. Hapus salah satu untuk menambahkan baru.", "error");
      return false;
    }

    const newId = `QRIS-${currentTenant.id}-${Date.now().toString().slice(-4)}`;
    const willBeActive = profile.isActive || qrisProfiles.length === 0;

    const newProfiles = [
      ...qrisProfiles.map((q) => (willBeActive ? { ...q, isActive: false } : q)),
      { ...profile, id: newId, isActive: willBeActive, createdAt: "Baru saja" },
    ];

    setQrisProfiles(newProfiles);
    syncQrisToTenant(newProfiles);
    showToast(`Barcode QRIS "${profile.label}" berhasil ditambahkan!`);
    return true;
  };

  const updateQrisProfile = (id: string, updatedFields: Partial<CanteenQrisProfile>) => {
    setQrisProfiles((prev) => {
      const newProfiles = prev.map((q) => {
        if (q.id === id) {
          return { ...q, ...updatedFields };
        }
        if (updatedFields.isActive) {
          return { ...q, isActive: false };
        }
        return q;
      });
      syncQrisToTenant(newProfiles);
      return newProfiles;
    });
    showToast("Data barcode QRIS berhasil diperbarui!");
  };

  const deleteQrisProfile = (id: string) => {
    const target = qrisProfiles.find((q) => q.id === id);
    if (qrisProfiles.length <= 1) {
      showToast("Stand harus memiliki minimal 1 barcode QRIS aktif.", "error");
      return;
    }

    const filtered = qrisProfiles.filter((q) => q.id !== id);
    if (target?.isActive && filtered.length > 0) {
      filtered[0].isActive = true;
    }

    setQrisProfiles(filtered);
    syncQrisToTenant(filtered);
    showToast(`Barcode QRIS "${target?.label || id}" berhasil dihapus.`, "info");
  };

  const setActiveQris = (id: string) => {
    setQrisProfiles((prev) => {
      const newProfiles = prev.map((q) => ({
        ...q,
        isActive: q.id === id,
      }));
      syncQrisToTenant(newProfiles);
      return newProfiles;
    });
    const selected = qrisProfiles.find((q) => q.id === id);
    showToast(`QRIS "${selected?.label || id}" sekarang aktif digunakan di POS & Aplikasi!`);
  };

  // Update store settings & info
  const updateStoreInfo = (updatedFields: Partial<CanteenTenant>) => {
    setCurrentTenant((prev) => {
      const updated = { ...prev, ...updatedFields };
      // Sync with global mock array
      const idx = sampleCanteenTenants.findIndex((t) => t.id === prev.id);
      if (idx !== -1) {
        sampleCanteenTenants[idx] = updated;
      }
      return updated;
    });
    showToast("Pengaturan & Informasi Stand Kantin berhasil diperbarui!");
  };

  // Update private credentials (username & password)
  const updateCredentials = (username: string, password?: string) => {
    setCurrentTenant((prev) => {
      const updated = { ...prev, username, ...(password ? { password } : {}) };
      const idx = sampleCanteenTenants.findIndex((t) => t.id === prev.id);
      if (idx !== -1) {
        sampleCanteenTenants[idx] = updated;
      }
      return updated;
    });
    showToast("Kredensial login akun stand berhasil diperbarui!");
  };

  // Update Requests state
  const [updateRequests, setUpdateRequests] = useState<TenantUpdateRequest[]>(() => {
    return sampleTenantUpdateRequests.filter((r) => r.tenantId === currentTenant.id);
  });

  useEffect(() => {
    setUpdateRequests(sampleTenantUpdateRequests.filter((r) => r.tenantId === currentTenant.id));
  }, [currentTenant.id]);

  const submitUpdateRequest = (requestedFields: TenantUpdateRequest["requestedFields"], reason: string) => {
    const newRequest: TenantUpdateRequest = {
      id: `REQ-UPD-${Date.now().toString().slice(-4)}`,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      submittedAt: "Baru saja",
      requestedFields,
      reason,
      status: "PENDING_APPROVAL",
    };
    sampleTenantUpdateRequests.unshift(newRequest);
    setUpdateRequests((prev) => [newRequest, ...prev]);
    showToast("Pengajuan pembaruan data berhasil dikirim ke Superadmin Kopkar!", "success");
  };

  // Products state (filtered initially by tenant specialization)
  const [products, setProducts] = useState<CanteenProduct[]>(() => {
    if (currentTenant.id === "tenant-05") {
      return sampleProducts.filter((p) => p.category !== "MAKANAN" && p.category !== "MINUMAN");
    } else if (currentTenant.id === "tenant-02") {
      return sampleProducts.filter((p) => p.name.toLowerCase().includes("ayam") || p.category === "MAKANAN");
    } else {
      return sampleProducts.filter((p) => p.category === "MAKANAN" || p.category === "MINUMAN");
    }
  });

  // Orders state
  const [orders, setOrders] = useState<CanteenOrder[]>(sampleIncomingOrders);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Product actions
  const addProduct = (productData: Omit<CanteenProduct, "id" | "tenantId">) => {
    const newProduct: CanteenProduct = {
      ...productData,
      id: `PROD-${Date.now().toString().slice(-4)}`,
      tenantId: currentTenant.id,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Menu "${newProduct.name}" berhasil ditambahkan ke katalog!`);
  };

  const editProduct = (product: CanteenProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    showToast(`Perubahan menu "${product.name}" berhasil disimpan!`);
  };

  const deleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(`Menu "${target?.name || 'Produk'}" telah dihapus`, "info");
  };

  const quickRestock = (productId: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    );
    const target = products.find((p) => p.id === productId);
    showToast(`Stok ${target?.name || 'produk'} ditambah +${amount} pcs`);
  };

  // Order actions
  const updateOrderStatus = (orderId: string, nextStatus: CanteenOrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );
    const statusLabels: Record<CanteenOrderStatus, string> = {
      MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi",
      DIPROSES: "Sedang Disiapkan",
      SIAP_DIAMBIL: "Siap Diambil Karyawan",
      SELESAI: "Selesai / Diserahkan",
      DIBATALKAN: "Dibatalkan",
    };
    showToast(`Status pesanan diperbarui: ${statusLabels[nextStatus]}`);
  };

  const addCompletedOrder = (completedOrder: CanteenOrder) => {
    // Deduct stock for all items
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = completedOrder.items.find((c) => c.productId === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );
    setOrders((prev) => [completedOrder, ...prev]);
    showToast(
      `Transaksi sebesar Rp ${completedOrder.totalAmount.toLocaleString("id-ID")} berhasil diproses!`
    );
  };

  const pendingOrdersCount = orders.filter((o) => o.status === "MENUNGGU_KONFIRMASI").length;

  const settlements = sampleCanteenSettlements.filter(
    (s) => s.tenantId === currentTenant.id
  );

  return (
    <MerchantContext.Provider
      value={{
        currentTenant,
        setCurrentTenant,
        updateStoreInfo,
        updateCredentials,
        qrisProfiles,
        activeQris,
        addQrisProfile,
        updateQrisProfile,
        deleteQrisProfile,
        setActiveQris,
        products,
        setProducts,
        addProduct,
        editProduct,
        deleteProduct,
        quickRestock,
        orders,
        setOrders,
        updateOrderStatus,
        addCompletedOrder,
        pendingOrdersCount,
        settlements,
        updateRequests,
        submitUpdateRequest,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {/* Global Merchant Toast Notification */}
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
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </MerchantContext.Provider>
  );
};

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6F6B88]">Memuat portal kantin...</div>}>
      <MerchantProviderInner>{children}</MerchantProviderInner>
    </Suspense>
  );
};

export const useMerchant = () => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error("useMerchant must be used within a MerchantProvider");
  }
  return context;
};
