"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  RawMaterialCategory,
  Supplier,
  RawMaterial,
  MenuRecipe,
  PurchaseOrder,
  RawMaterialPurchase,
  RawMaterialUsage,
  RawMaterialUsageItem,
  StockOpname,
  StockMutation,
} from "@/types";
import {
  sampleRawMaterialCategories,
  sampleSuppliers,
  sampleRawMaterials,
  sampleMenuRecipes,
  samplePurchaseOrders,
  sampleRawMaterialPurchases,
  sampleRawMaterialUsages,
  sampleStockOpnames,
  sampleStockMutations,
} from "@/data/mockData";

interface ToastMessage {
  text: string;
  type: "success" | "error" | "info";
}

interface ProductionContextType {
  // Datasets
  categories: RawMaterialCategory[];
  suppliers: Supplier[];
  rawMaterials: RawMaterial[];
  recipes: MenuRecipe[];
  purchaseOrders: PurchaseOrder[];
  purchases: RawMaterialPurchase[];
  usages: RawMaterialUsage[];
  stockOpnames: StockOpname[];
  mutations: StockMutation[];

  // Toast
  toast: ToastMessage | null;
  showToast: (text: string, type?: "success" | "error" | "info") => void;

  // Computed KPI stats
  totalInventoryValue: number;
  activeMaterialsCount: number;
  reorderMaterialsCount: number;
  totalRecipesCount: number;
  pendingPOCount: number;

  // Actions
  addRawMaterial: (material: Omit<RawMaterial, "id">) => void;
  updateRawMaterial: (id: string, updatedFields: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => void;
  saveRecipe: (recipe: MenuRecipe) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "poNumber">) => PurchaseOrder;
  updatePOStatus: (id: string, status: PurchaseOrder["status"]) => void;
  createPurchase: (purchase: Omit<RawMaterialPurchase, "id" | "invoiceNumber">) => RawMaterialPurchase;
  recordBatchCooking: (
    recipeId: string,
    portionYield: number,
    notes?: string,
    pic?: string
  ) => { success: boolean; message: string };
  applyStockOpname: (opname: Omit<StockOpname, "id" | "opnameNumber">) => StockOpname;
  addCategory: (category: Omit<RawMaterialCategory, "id">) => void;
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export const ProductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<RawMaterialCategory[]>(sampleRawMaterialCategories);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(sampleRawMaterials);
  const [recipes, setRecipes] = useState<MenuRecipe[]>(sampleMenuRecipes);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(samplePurchaseOrders);
  const [purchases, setPurchases] = useState<RawMaterialPurchase[]>(sampleRawMaterialPurchases);
  const [usages, setUsages] = useState<RawMaterialUsage[]>(sampleRawMaterialUsages);
  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>(sampleStockOpnames);
  const [mutations, setMutations] = useState<StockMutation[]>(sampleStockMutations);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // KPI Calculations
  const totalInventoryValue = useMemo(() => {
    return rawMaterials.reduce((sum, item) => sum + item.currentStock * item.usageUnitPrice, 0);
  }, [rawMaterials]);

  const activeMaterialsCount = useMemo(() => {
    return rawMaterials.filter((m) => m.status === "AKTIF").length;
  }, [rawMaterials]);

  const reorderMaterialsCount = useMemo(() => {
    return rawMaterials.filter((m) => m.currentStock <= m.minStock).length;
  }, [rawMaterials]);

  const totalRecipesCount = useMemo(() => recipes.length, [recipes]);

  const pendingPOCount = useMemo(() => {
    return purchaseOrders.filter((po) => po.status === "DRAFT" || po.status === "SENT").length;
  }, [purchaseOrders]);

  // Actions
  const addRawMaterial = (material: Omit<RawMaterial, "id">) => {
    const newId = `rm-${Date.now()}`;
    const newMat: RawMaterial = { ...material, id: newId };
    setRawMaterials((prev) => [newMat, ...prev]);

    if (newMat.currentStock > 0) {
      const newMutation: StockMutation = {
        id: `mut-${Date.now()}`,
        rawMaterialId: newId,
        rawMaterialCode: newMat.code,
        rawMaterialName: newMat.name,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        referenceNumber: "INIT-SALDO",
        mutationType: "PEMBELIAN_MASUK",
        qtyIn: newMat.currentStock,
        qtyOut: 0,
        endingBalance: newMat.currentStock,
        unit: newMat.usageUnit,
        unitPrice: newMat.usageUnitPrice,
        totalValue: newMat.currentStock * newMat.usageUnitPrice,
        pic: "Admin Dapur BIT",
        notes: "Saldo Awal Pendaftaran Bahan Baku",
      };
      setMutations((prev) => [newMutation, ...prev]);
    }

    showToast(`Bahan baku "${newMat.name}" berhasil ditambahkan ke inventaris!`, "success");
  };

  const updateRawMaterial = (id: string, updatedFields: Partial<RawMaterial>) => {
    setRawMaterials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    showToast("Data bahan baku berhasil diperbarui!", "success");
  };

  const deleteRawMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((item) => item.id !== id));
    showToast("Bahan baku telah dinonaktifkan dari daftar.", "info");
  };

  const saveRecipe = (recipe: MenuRecipe) => {
    setRecipes((prev) => {
      const idx = prev.findIndex((r) => r.id === recipe.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = recipe;
        return updated;
      }
      return [...prev, recipe];
    });
    showToast(`Formula resep "${recipe.menuName}" berhasil disimpan!`, "success");
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, "id" | "poNumber">): PurchaseOrder => {
    const newId = `po-${Date.now()}`;
    const count = purchaseOrders.length + 1;
    const poNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(count).padStart(3, "0")}`;

    const newPO: PurchaseOrder = {
      ...poData,
      id: newId,
      poNumber,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    showToast(`Purchase Order ${poNumber} berhasil diterbitkan!`, "success");
    return newPO;
  };

  const updatePOStatus = (id: string, status: PurchaseOrder["status"]) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, status } : po))
    );
    showToast(`Status PO diperbarui menjadi: ${status}`, "info");
  };

  const createPurchase = (
    purchaseData: Omit<RawMaterialPurchase, "id" | "invoiceNumber">
  ): RawMaterialPurchase => {
    const newId = `pur-${Date.now()}`;
    const count = purchases.length + 1;
    const invoiceNumber = `INV-PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(count).padStart(3, "0")}`;

    const newPurchase: RawMaterialPurchase = {
      ...purchaseData,
      id: newId,
      invoiceNumber,
    };

    const newMutations: StockMutation[] = [];
    const stockAdditions: { [matId: string]: { added: number; price: number } } = {};

    newPurchase.items.forEach((item) => {
      const mat = rawMaterials.find((m) => m.id === item.rawMaterialId);
      const totalUnits = item.totalStockAdded;
      stockAdditions[item.rawMaterialId] = { added: totalUnits, price: item.unitPrice };

      const currentMatStock = mat ? mat.currentStock : 0;

      newMutations.push({
        id: `mut-${Date.now()}-${item.rawMaterialId}`,
        rawMaterialId: item.rawMaterialId,
        rawMaterialCode: item.rawMaterialCode,
        rawMaterialName: item.rawMaterialName,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        referenceNumber: invoiceNumber,
        mutationType: "PEMBELIAN_MASUK",
        qtyIn: totalUnits,
        qtyOut: 0,
        endingBalance: currentMatStock + totalUnits,
        unit: item.usageUnit,
        unitPrice: item.unitPrice / (item.unitRatio || 1),
        totalValue: item.subtotal,
        pic: "Admin Pembelian BIT",
        notes: `Penerimaan Pembelian (${item.quantityReceived} ${item.purchaseUnit})`,
      });
    });

    setRawMaterials((prev) =>
      prev.map((mat) => {
        if (stockAdditions[mat.id]) {
          return {
            ...mat,
            currentStock: mat.currentStock + stockAdditions[mat.id].added,
            lastPurchasePrice: stockAdditions[mat.id].price,
          };
        }
        return mat;
      })
    );

    setPurchases((prev) => [newPurchase, ...prev]);
    setMutations((prev) => [...newMutations, ...prev]);

    showToast(`Faktur ${invoiceNumber} berhasil dicatat & stok bahan bertambah!`, "success");
    return newPurchase;
  };

  const recordBatchCooking = (
    recipeId: string,
    portionYield: number,
    notes: string = "Sesi Masak Rutin Dapur BIT",
    pic: string = "Chef Dapur BIT"
  ): { success: boolean; message: string } => {
    const targetRecipe = recipes.find((r) => r.id === recipeId);
    if (!targetRecipe) {
      return { success: false, message: "Resep menu tidak ditemukan." };
    }

    const requiredItems: RawMaterialUsageItem[] = [];
    let isStockSufficient = true;
    let insufficientItemName = "";

    for (const ing of targetRecipe.ingredients) {
      const mat = rawMaterials.find((m) => m.id === ing.rawMaterialId);
      const totalQtyRequired = ing.amountPerPortion * portionYield;

      if (!mat || mat.currentStock < totalQtyRequired) {
        isStockSufficient = false;
        insufficientItemName = ing.rawMaterialName;
        break;
      }

      requiredItems.push({
        id: `use-item-${Date.now()}-${ing.rawMaterialId}`,
        rawMaterialId: ing.rawMaterialId,
        rawMaterialCode: ing.rawMaterialCode,
        rawMaterialName: ing.rawMaterialName,
        usageUnit: ing.usageUnit,
        unitPrice: ing.usageUnitPrice,
        quantityUsed: totalQtyRequired,
        subtotalCost: totalQtyRequired * ing.usageUnitPrice,
      });
    }

    if (!isStockSufficient) {
      showToast(
        `Gagal: Stok "${insufficientItemName}" tidak mencukupi untuk memasak ${portionYield} porsi ${targetRecipe.menuName}!`,
        "error"
      );
      return {
        success: false,
        message: `Stok ${insufficientItemName} tidak mencukupi!`,
      };
    }

    const usageId = `use-${Date.now()}`;
    const usageNumber = `USE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(usages.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const totalCost = requiredItems.reduce((sum, item) => sum + item.subtotalCost, 0);

    const newUsage: RawMaterialUsage = {
      id: usageId,
      usageNumber,
      usageDate: today,
      menuId: targetRecipe.id,
      menuName: targetRecipe.menuName,
      portionCount: portionYield,
      cookPic: pic,
      shift: "SHIFT_1",
      location: "Dapur Utama Pabrik BIT",
      mode: "RECIPE_BATCH",
      items: requiredItems,
      totalUsageCost: totalCost,
      notes,
      createdAt: today,
    };

    const newMutations: StockMutation[] = [];
    setRawMaterials((prev) =>
      prev.map((mat) => {
        const itemUsed = requiredItems.find((i) => i.rawMaterialId === mat.id);
        if (itemUsed) {
          const newBal = Math.max(0, mat.currentStock - itemUsed.quantityUsed);
          newMutations.push({
            id: `mut-${Date.now()}-${mat.id}`,
            rawMaterialId: mat.id,
            rawMaterialCode: mat.code,
            rawMaterialName: mat.name,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
            referenceNumber: usageNumber,
            mutationType: "PENGGUNAAN_DAPUR",
            qtyIn: 0,
            qtyOut: itemUsed.quantityUsed,
            endingBalance: newBal,
            unit: itemUsed.usageUnit,
            unitPrice: itemUsed.unitPrice,
            totalValue: itemUsed.subtotalCost,
            pic,
            notes: `Masak ${portionYield} Porsi ${targetRecipe.menuName}`,
          });

          return {
            ...mat,
            currentStock: newBal,
          };
        }
        return mat;
      })
    );

    setUsages((prev) => [newUsage, ...prev]);
    setMutations((prev) => [...newMutations, ...prev]);

    showToast(
      `Sesi Masak ${portionYield} porsi ${targetRecipe.menuName} berhasil dicatat & stok terpotong otomatis!`,
      "success"
    );

    return {
      success: true,
      message: `Berhasil memproses pemakaian bahan untuk ${portionYield} porsi.`,
    };
  };

  const applyStockOpname = (
    opnameData: Omit<StockOpname, "id" | "opnameNumber">
  ): StockOpname => {
    const newId = `so-${Date.now()}`;
    const count = stockOpnames.length + 1;
    const opnameNumber = `SO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(count).padStart(3, "0")}`;

    const newSO: StockOpname = {
      ...opnameData,
      id: newId,
      opnameNumber,
    };

    const newMutations: StockMutation[] = [];
    const adjustments: { [matId: string]: number } = {};

    newSO.items.forEach((item) => {
      adjustments[item.rawMaterialId] = item.physicalStock;

      if (item.varianceQty !== 0) {
        newMutations.push({
          id: `mut-${Date.now()}-${item.rawMaterialId}`,
          rawMaterialId: item.rawMaterialId,
          rawMaterialCode: item.rawMaterialCode,
          rawMaterialName: item.rawMaterialName,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          referenceNumber: opnameNumber,
          mutationType: "OPNAME_PENYESUAIAN",
          qtyIn: item.varianceQty > 0 ? item.varianceQty : 0,
          qtyOut: item.varianceQty < 0 ? Math.abs(item.varianceQty) : 0,
          endingBalance: item.physicalStock,
          unit: item.usageUnit,
          unitPrice: item.unitPrice,
          totalValue: Math.abs(item.varianceValue),
          pic: newSO.auditorName,
          notes: `Penyesuaian Opname Fisik: ${item.reason || "Koreksi audit"}`,
        });
      }
    });

    setRawMaterials((prev) =>
      prev.map((mat) => {
        if (adjustments[mat.id] !== undefined) {
          return {
            ...mat,
            currentStock: adjustments[mat.id],
          };
        }
        return mat;
      })
    );

    setStockOpnames((prev) => [newSO, ...prev]);
    setMutations((prev) => [...newMutations, ...prev]);

    showToast(
      `Hasil Stok Opname ${opnameNumber} berhasil disimpan dan saldo stok telah disesuaikan!`,
      "success"
    );

    return newSO;
  };

  const addCategory = (catData: Omit<RawMaterialCategory, "id">) => {
    const newCat: RawMaterialCategory = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Kategori bahan "${newCat.name}" berhasil ditambahkan!`, "success");
  };

  const addSupplier = (supData: Omit<Supplier, "id">) => {
    const newSup: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [...prev, newSup]);
    showToast(`Supplier vendor "${newSup.name}" berhasil ditambahkan!`, "success");
  };

  return (
    <ProductionContext.Provider
      value={{
        categories,
        suppliers,
        rawMaterials,
        recipes,
        purchaseOrders,
        purchases,
        usages,
        stockOpnames,
        mutations,
        toast,
        showToast,
        totalInventoryValue,
        activeMaterialsCount,
        reorderMaterialsCount,
        totalRecipesCount,
        pendingPOCount,
        addRawMaterial,
        updateRawMaterial,
        deleteRawMaterial,
        saveRecipe,
        createPurchaseOrder,
        updatePOStatus,
        createPurchase,
        recordBatchCooking,
        applyStockOpname,
        addCategory,
        addSupplier,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error("useProduction must be used within a ProductionProvider");
  }
  return context;
};
