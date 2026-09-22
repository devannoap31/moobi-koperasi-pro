"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Factory,
  ChefHat,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  Trash2,
  Flame,
  Scale,
  DollarSign,
  Phone,
  MapPin,
  Check,
  X,
  Eye,
  Percent,
  Boxes,
  Truck,
  FileCheck,
  Pencil,
  Tag,
  Building2,
} from "lucide-react";
import {
  RawMaterialCategory,
  Supplier,
  RawMaterial,
  RecipeIngredient,
  MenuRecipe,
  PurchaseOrder,
  PurchaseOrderItem,
  RawMaterialPurchase,
  RawMaterialPurchaseItem,
  RawMaterialUsageItem,
  RawMaterialUsage,
  StockOpnameItem,
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
import { ReportExportModal } from "@/components/common/ReportExportModal";
import { FormalReportConfig } from "@/utils/reportExporter";

// ----------------------------------------------------
// SEARCHABLE RAW MATERIAL COMBOBOX WITH DEBOUNCE
// ----------------------------------------------------
interface PurchaseMaterialComboboxProps {
  value: string;
  rawMaterials: RawMaterial[];
  onSelect: (mat: RawMaterial) => void;
  placeholder?: string;
}

const PurchaseMaterialCombobox: React.FC<PurchaseMaterialComboboxProps> = ({
  value,
  rawMaterials,
  onSelect,
  placeholder = "Ketik kode / nama bahan baku...",
}) => {
  const currentMat = useMemo(
    () => rawMaterials.find((m) => m.id === value),
    [rawMaterials, value]
  );

  const [searchQuery, setSearchQuery] = useState<string>(
    currentMat ? `[${currentMat.code}] ${currentMat.name}` : ""
  );
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync display text when value changes from outside (e.g. initial load, PO auto-fill)
  React.useEffect(() => {
    if (currentMat) {
      setSearchQuery(`[${currentMat.code}] ${currentMat.name}`);
    } else {
      setSearchQuery("");
    }
  }, [currentMat]);

  // Debounce (200ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setHighlightedIndex(-1);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (currentMat) {
          setSearchQuery(`[${currentMat.code}] ${currentMat.name}`);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currentMat]);

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) {
      return rawMaterials.slice(0, 15);
    }
    // Check if query exactly equals current formatted tag
    if (currentMat && `[${currentMat.code.toLowerCase()}] ${currentMat.name.toLowerCase()}` === q) {
      return rawMaterials.slice(0, 15);
    }

    return rawMaterials.filter((m) => {
      const matchName = m.name.toLowerCase().includes(q);
      const matchCode = m.code.toLowerCase().includes(q);
      const matchCat = m.categoryName.toLowerCase().includes(q);
      const matchBarcode = m.barcode ? m.barcode.toLowerCase().includes(q) : false;
      const fullTag = `[${m.code.toLowerCase()}] ${m.name.toLowerCase()}`;
      return matchName || matchCode || matchCat || matchBarcode || fullTag.includes(q);
    });
  }, [rawMaterials, debouncedQuery, currentMat]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        const selected = filteredSuggestions[highlightedIndex];
        onSelect(selected);
        setSearchQuery(`[${selected.code}] ${selected.name}`);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      if (currentMat) {
        setSearchQuery(`[${currentMat.code}] ${currentMat.name}`);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-2.5 pr-7 py-1.5 rounded-[8px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF]/30"
        />
        <Search className="w-3.5 h-3.5 absolute right-2.5 text-[#6F6B88] pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[280px] sm:min-w-[340px] bg-white rounded-[12px] border border-[#E6E3F7] shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-[#E6E3F7]/50 animate-fadeIn">
          {filteredSuggestions.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#6F6B88]">
              Tidak ada bahan &quot;{debouncedQuery}&quot; ditemukan.
            </div>
          ) : (
            filteredSuggestions.map((mat, idx) => {
              const isSelected = mat.id === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => {
                    onSelect(mat);
                    setSearchQuery(`[${mat.code}] ${mat.name}`);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    isHighlighted
                      ? "bg-[#F5F3FF] text-[#4A3AFF]"
                      : isSelected
                      ? "bg-[#F8F7FD] font-bold text-[#4A3AFF]"
                      : "hover:bg-[#F8F7FD] text-[#1C1B3A]"
                  }`}
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10px] text-[#4A3AFF] bg-[#F5F3FF] px-1 py-0.2 rounded">
                        {mat.code}
                      </span>
                      <span className="font-bold truncate text-[11.5px]">{mat.name}</span>
                    </div>
                    <p className="text-[10px] text-[#6F6B88]">
                      {mat.categoryName} &bull; 1 {mat.purchaseUnit} = {mat.unitRatio} {mat.usageUnit}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10.5px] font-extrabold text-[#1C1B3A]">
                      Rp {mat.lastPurchasePrice.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[9.5px] text-[#6F6B88]">/{mat.purchaseUnit}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export type ProductionTab =
  | "RECIPES"
  | "RAW_MATERIALS"
  | "PURCHASE_ORDERS"
  | "PURCHASES"
  | "USAGE"
  | "STOCK_OPNAME"
  | "STOCK_MUTATIONS"
  | "CATEGORIES_SUPPLIERS";

export interface ProductionManagementViewProps {
  initialTab?: ProductionTab;
}

export const ProductionManagementView: React.FC<ProductionManagementViewProps> = ({
  initialTab = "RECIPES",
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ProductionTab>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Main Datasets (Interactive local state)
  const [categories, setCategories] = useState<RawMaterialCategory[]>(sampleRawMaterialCategories);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(sampleRawMaterials);
  const [recipes, setRecipes] = useState<MenuRecipe[]>(sampleMenuRecipes);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(samplePurchaseOrders);
  const [purchases, setPurchases] = useState<RawMaterialPurchase[]>(sampleRawMaterialPurchases);
  const [usages, setUsages] = useState<RawMaterialUsage[]>(sampleRawMaterialUsages);
  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>(sampleStockOpnames);
  const [mutations, setMutations] = useState<StockMutation[]>(sampleStockMutations);

  // Filter & Search States
  const [rawMaterialSearch, setRawMaterialSearch] = useState("");
  const [rawMaterialCatFilter, setRawMaterialCatFilter] = useState("ALL");
  const [rawMaterialStockFilter, setRawMaterialStockFilter] = useState<"ALL" | "SAFE" | "LOW" | "OUT">("ALL");

  // Recipe Selected State
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(sampleMenuRecipes[0].id);

  // Modals & Drawers
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showCookingSessionModal, setShowCookingSessionModal] = useState(false);
  const [showStockOpnameModal, setShowStockOpnameModal] = useState(false);
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RawMaterialCategory | null>(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Selected for Details
  const searchParams = useSearchParams();
  const materialParam = searchParams.get("materialId");
  const [viewingPo, setViewingPo] = useState<PurchaseOrder | null>(null);
  const [selectedMutationMaterialId, setSelectedMutationMaterialId] = useState<string>(
    materialParam || "ALL"
  );

  React.useEffect(() => {
    if (materialParam) {
      setSelectedMutationMaterialId(materialParam);
    }
  }, [materialParam]);

  // Report Export State
  const [reportConfig, setReportConfig] = useState<FormalReportConfig | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);
  const showToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // COMPUTED STATS
  // ----------------------------------------------------
  const activeRecipe = useMemo(() => {
    return recipes.find((r) => r.id === selectedRecipeId) || recipes[0];
  }, [recipes, selectedRecipeId]);

  const rawMaterialStats = useMemo(() => {
    const totalItems = rawMaterials.length;
    const lowStockItems = rawMaterials.filter((m) => m.currentStock <= m.minStock && m.currentStock > 0);
    const outOfStockItems = rawMaterials.filter((m) => m.currentStock <= 0);
    const totalAssetValue = rawMaterials.reduce((sum, m) => sum + m.currentStock * m.usageUnitPrice, 0);

    return {
      totalItems,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalAssetValue,
    };
  }, [rawMaterials]);

  const filteredRawMaterials = useMemo(() => {
    return rawMaterials.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(rawMaterialSearch.toLowerCase()) ||
        m.code.toLowerCase().includes(rawMaterialSearch.toLowerCase()) ||
        (m.barcode && m.barcode.includes(rawMaterialSearch));
      const matchCat = rawMaterialCatFilter === "ALL" || m.categoryId === rawMaterialCatFilter;
      const matchStock =
        rawMaterialStockFilter === "ALL"
          ? true
          : rawMaterialStockFilter === "SAFE"
          ? m.currentStock > m.minStock
          : rawMaterialStockFilter === "LOW"
          ? m.currentStock <= m.minStock && m.currentStock > 0
          : m.currentStock <= 0;
      return matchSearch && matchCat && matchStock;
    });
  }, [rawMaterials, rawMaterialSearch, rawMaterialCatFilter, rawMaterialStockFilter]);

  // ----------------------------------------------------
  // RECIPE EDITING HANDLERS & DEBOUNCED SEARCH
  // ----------------------------------------------------
  const [newIngredientMatId, setNewIngredientMatId] = useState("");
  const [newIngredientAmount, setNewIngredientAmount] = useState<number>(10);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState("");
  const [debouncedIngredientQuery, setDebouncedIngredientQuery] = useState("");
  const [isIngredientSearchOpen, setIsIngredientSearchOpen] = useState(false);
  const [highlightedIngredientIndex, setHighlightedIngredientIndex] = useState<number>(-1);
  const ingredientSearchRef = React.useRef<HTMLDivElement>(null);

  // Debounce handler (200ms)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedIngredientQuery(ingredientSearchQuery);
      setHighlightedIngredientIndex(-1);
    }, 200);
    return () => clearTimeout(handler);
  }, [ingredientSearchQuery]);

  // Click outside to close suggestion dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ingredientSearchRef.current &&
        !ingredientSearchRef.current.contains(event.target as Node)
      ) {
        setIsIngredientSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredIngredientSuggestions = useMemo(() => {
    const q = debouncedIngredientQuery.trim().toLowerCase();
    if (!q) {
      return rawMaterials.slice(0, 10);
    }
    return rawMaterials.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.categoryName.toLowerCase().includes(q)
    );
  }, [rawMaterials, debouncedIngredientQuery]);

  const selectedIngredientMaterial = useMemo(() => {
    return rawMaterials.find((m) => m.id === newIngredientMatId);
  }, [rawMaterials, newIngredientMatId]);

  const handleSelectIngredientFromSearch = (mat: RawMaterial) => {
    if (activeRecipe.ingredients.some((i) => i.rawMaterialId === mat.id)) {
      showToast(`Bahan ${mat.name} sudah ada dalam komposisi resep ini!`, "warning");
      return;
    }
    setNewIngredientMatId(mat.id);
    setIngredientSearchQuery(`[${mat.code}] ${mat.name}`);
    setIsIngredientSearchOpen(false);
  };

  const handleAddIngredientToRecipe = () => {
    if (!newIngredientMatId || newIngredientAmount <= 0) {
      showToast("Pilih bahan baku dan masukkan takaran yang valid!", "warning");
      return;
    }
    const mat = rawMaterials.find((m) => m.id === newIngredientMatId);
    if (!mat) return;

    // Check if ingredient already exists in recipe
    if (activeRecipe.ingredients.some((i) => i.rawMaterialId === mat.id)) {
      showToast("Bahan baku tersebut sudah ada di dalam resep ini!", "warning");
      return;
    }

    const subtotalCogs = Math.round(mat.usageUnitPrice * newIngredientAmount);
    const newIng: RecipeIngredient = {
      id: `ING-${Date.now()}`,
      rawMaterialId: mat.id,
      rawMaterialCode: mat.code,
      rawMaterialName: mat.name,
      usageUnit: mat.usageUnit,
      usageUnitPrice: mat.usageUnitPrice,
      amountPerPortion: newIngredientAmount,
      subtotalCogs,
      calories: mat.caloriesPerUnit ? Math.round(mat.caloriesPerUnit * newIngredientAmount * 10) / 10 : 0,
      protein: mat.proteinPerUnit ? Math.round(mat.proteinPerUnit * newIngredientAmount * 10) / 10 : 0,
      fat: mat.fatPerUnit ? Math.round(mat.fatPerUnit * newIngredientAmount * 10) / 10 : 0,
      carbs: mat.carbsPerUnit ? Math.round(mat.carbsPerUnit * newIngredientAmount * 10) / 10 : 0,
    };

    const updatedIngredients = [...activeRecipe.ingredients, newIng];
    const newTotalCogs = updatedIngredients.reduce((s, i) => s + i.subtotalCogs, 0);
    const newGrossProfitRp = activeRecipe.sellingPrice - newTotalCogs;
    const newGrossProfitPercent = Math.round((newGrossProfitRp / activeRecipe.sellingPrice) * 10000) / 100;

    const updatedRecipes = recipes.map((r) => {
      if (r.id === activeRecipe.id) {
        return {
          ...r,
          ingredients: updatedIngredients.map((ing) => ({
            ...ing,
            costPercentage: Math.round((ing.subtotalCogs / newTotalCogs) * 1000) / 10,
          })),
          totalCogs: newTotalCogs,
          grossProfitRp: newGrossProfitRp,
          grossProfitPercent: newGrossProfitPercent,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return r;
    });

    setRecipes(updatedRecipes);
    setNewIngredientMatId("");
    setIngredientSearchQuery("");
    setNewIngredientAmount(10);
    showToast(`Bahan ${mat.name} berhasil ditambahkan ke resep ${activeRecipe.menuName}!`, "success");
  };

  const handleRemoveIngredientFromRecipe = (ingId: string) => {
    const updatedIngredients = activeRecipe.ingredients.filter((i) => i.id !== ingId);
    const newTotalCogs = updatedIngredients.reduce((s, i) => s + i.subtotalCogs, 0);
    const newGrossProfitRp = activeRecipe.sellingPrice - newTotalCogs;
    const newGrossProfitPercent = activeRecipe.sellingPrice > 0 ? Math.round((newGrossProfitRp / activeRecipe.sellingPrice) * 10000) / 100 : 0;

    const updatedRecipes = recipes.map((r) => {
      if (r.id === activeRecipe.id) {
        return {
          ...r,
          ingredients: updatedIngredients.map((ing) => ({
            ...ing,
            costPercentage: newTotalCogs > 0 ? Math.round((ing.subtotalCogs / newTotalCogs) * 1000) / 10 : 0,
          })),
          totalCogs: newTotalCogs,
          grossProfitRp: newGrossProfitRp,
          grossProfitPercent: newGrossProfitPercent,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return r;
    });

    setRecipes(updatedRecipes);
    showToast("Bahan berhasil dihapus dari resep.", "info");
  };

  // ----------------------------------------------------
  // CREATE NEW MATERIAL HANDLER
  // ----------------------------------------------------
  const [newMatCode, setNewMatCode] = useState("");
  const [newMatName, setNewMatName] = useState("");
  const [newMatCatId, setNewMatCatId] = useState(sampleRawMaterialCategories[0].id);
  const [newMatPurchaseUnit, setNewMatPurchaseUnit] = useState("Kg");
  const [newMatUnitRatio, setNewMatUnitRatio] = useState<number>(1000);
  const [newMatUsageUnit, setNewMatUsageUnit] = useState("gram");
  const [newMatLastPurchasePrice, setNewMatLastPurchasePrice] = useState<number>(30000);
  const [newMatMinStock, setNewMatMinStock] = useState<number>(2000);
  const [newMatInitialStock, setNewMatInitialStock] = useState<number>(5000);
  const [newMatSupplierId, setNewMatSupplierId] = useState(sampleSuppliers[0].id);

  const calculatedUsageUnitPrice = useMemo(() => {
    if (!newMatUnitRatio || newMatUnitRatio <= 0) return 0;
    return Math.round((newMatLastPurchasePrice / newMatUnitRatio) * 100) / 100;
  }, [newMatLastPurchasePrice, newMatUnitRatio]);

  const handleSaveNewRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) {
      showToast("Nama bahan baku wajib diisi!", "warning");
      return;
    }

    const cat = categories.find((c) => c.id === newMatCatId);
    const sup = suppliers.find((s) => s.id === newMatSupplierId);
    const code = newMatCode.trim() || `BB-${String(rawMaterials.length + 1).padStart(3, "0")}`;

    const newMaterial: RawMaterial = {
      id: `BB-${Date.now()}`,
      code,
      barcode: `899100${String(rawMaterials.length + 1).padStart(4, "0")}`,
      name: newMatName.trim(),
      categoryId: newMatCatId,
      categoryName: cat?.name || "Bahan Baku",
      purchaseUnit: newMatPurchaseUnit,
      unitRatio: newMatUnitRatio,
      usageUnit: newMatUsageUnit,
      lastPurchasePrice: newMatLastPurchasePrice,
      usageUnitPrice: calculatedUsageUnitPrice,
      minStock: newMatMinStock,
      currentStock: newMatInitialStock,
      supplierId: newMatSupplierId,
      supplierName: sup?.name || "Supplier Utama",
      leadTimeDays: 1,
      status: "AKTIF",
    };

    setRawMaterials([newMaterial, ...rawMaterials]);
    setShowAddMaterialModal(false);
    showToast(`Bahan baku "${newMaterial.name}" berhasil didaftarkan!`, "success");

    // Reset Form
    setNewMatCode("");
    setNewMatName("");
    setNewMatLastPurchasePrice(30000);
    setNewMatInitialStock(5000);
  };

  // ----------------------------------------------------
  // CATEGORY CRUD HANDLERS
  // ----------------------------------------------------
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryInventoryAccount, setCategoryInventoryAccount] = useState("1130207");
  const [categoryExpenseAccount, setCategoryExpenseAccount] = useState("5110216");
  const [categoryDescription, setCategoryDescription] = useState("");

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryCode(`CAT-${String(categories.length + 1).padStart(2, "0")}`);
    const nextNum = 10 + categories.length;
    setCategoryInventoryAccount(`11302${nextNum}`);
    setCategoryExpenseAccount(`51102${nextNum + 5}`);
    setCategoryDescription("");
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: RawMaterialCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryCode(cat.code);
    setCategoryInventoryAccount(cat.inventoryAccountCode);
    setCategoryExpenseAccount(cat.expenseAccountCode);
    setCategoryDescription(cat.description || "");
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast("Nama kategori bahan wajib diisi!", "warning");
      return;
    }

    const code = categoryCode.trim().toUpperCase() || categoryName.trim().toUpperCase().replace(/\s+/g, "_");

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: categoryName.trim(),
              code,
              inventoryAccountCode: categoryInventoryAccount.trim() || "1130207",
              expenseAccountCode: categoryExpenseAccount.trim() || "5110216",
              description: categoryDescription.trim(),
            }
          : c
      );
      const updatedMaterials = rawMaterials.map((m) =>
        m.categoryId === editingCategory.id ? { ...m, categoryName: categoryName.trim() } : m
      );
      setCategories(updated);
      setRawMaterials(updatedMaterials);
      setShowCategoryModal(false);
      showToast(`Kategori "${categoryName.trim()}" berhasil diperbarui!`, "success");
    } else {
      const newCat: RawMaterialCategory = {
        id: `CAT-${Date.now()}`,
        code,
        name: categoryName.trim(),
        order: categories.length + 1,
        inventoryAccountCode: categoryInventoryAccount.trim() || "1130207",
        expenseAccountCode: categoryExpenseAccount.trim() || "5110216",
        description: categoryDescription.trim() || "Kategori bahan baku dapur",
      };
      setCategories([...categories, newCat]);
      setShowCategoryModal(false);
      showToast(`Kategori baru "${newCat.name}" berhasil ditambahkan!`, "success");
    }
  };

  const handleDeleteCategory = (cat: RawMaterialCategory) => {
    const linkedCount = rawMaterials.filter((m) => m.categoryId === cat.id).length;
    if (linkedCount > 0) {
      showToast(
        `Kategori "${cat.name}" tidak dapat dihapus karena masih digunakan oleh ${linkedCount} bahan baku!`,
        "warning"
      );
      return;
    }
    setCategories(categories.filter((c) => c.id !== cat.id));
    showToast(`Kategori "${cat.name}" berhasil dihapus.`, "info");
  };

  // ----------------------------------------------------
  // SUPPLIER CRUD HANDLERS
  // ----------------------------------------------------
  const [supplierCode, setSupplierCode] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierCity, setSupplierCity] = useState("Jakarta Barat");
  const [supplierType, setSupplierType] = useState<Supplier["supplierType"]>("DISTRIBUTOR");
  const [supplierPaymentTermDays, setSupplierPaymentTermDays] = useState<number | "">(14);
  const [supplierNotes, setSupplierNotes] = useState("");

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierCode(`SUP-${String(suppliers.length + 1).padStart(2, "0")}`);
    setSupplierName("");
    setSupplierContact("");
    setSupplierPhone("");
    setSupplierAddress("");
    setSupplierCity("Jakarta Barat");
    setSupplierType("DISTRIBUTOR");
    setSupplierPaymentTermDays(14);
    setSupplierNotes("");
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierCode(sup.code);
    setSupplierName(sup.name);
    setSupplierContact(sup.contactPerson);
    setSupplierPhone(sup.phone);
    setSupplierAddress(sup.address);
    setSupplierCity(sup.city);
    setSupplierType(sup.supplierType);
    setSupplierPaymentTermDays(sup.paymentTermDays);
    setSupplierNotes(sup.notes || "");
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      showToast("Nama supplier wajib diisi!", "warning");
      return;
    }

    const code = supplierCode.trim() || `SUP-${String(suppliers.length + 1).padStart(2, "0")}`;
    const termDays = typeof supplierPaymentTermDays === "number" ? supplierPaymentTermDays : 0;

    if (editingSupplier) {
      const updated = suppliers.map((s) =>
        s.id === editingSupplier.id
          ? {
              ...s,
              code,
              name: supplierName.trim(),
              contactPerson: supplierContact.trim() || "-",
              phone: supplierPhone.trim() || "-",
              address: supplierAddress.trim() || "-",
              city: supplierCity.trim() || "Jakarta",
              supplierType,
              paymentTermDays: termDays,
              notes: supplierNotes.trim() || undefined,
            }
          : s
      );
      const updatedMaterials = rawMaterials.map((m) =>
        m.supplierId === editingSupplier.id ? { ...m, supplierName: supplierName.trim() } : m
      );
      setSuppliers(updated);
      setRawMaterials(updatedMaterials);
      setShowSupplierModal(false);
      showToast(`Mitra supplier "${supplierName.trim()}" berhasil diperbarui!`, "success");
    } else {
      const newSup: Supplier = {
        id: `SUP-${Date.now()}`,
        code,
        name: supplierName.trim(),
        contactPerson: supplierContact.trim() || "-",
        phone: supplierPhone.trim() || "-",
        address: supplierAddress.trim() || "-",
        city: supplierCity.trim() || "Jakarta",
        supplierType,
        paymentTermDays: termDays,
        notes: supplierNotes.trim() || undefined,
      };
      setSuppliers([...suppliers, newSup]);
      setShowSupplierModal(false);
      showToast(`Mitra supplier baru "${newSup.name}" berhasil didaftarkan!`, "success");
    }
  };

  const handleDeleteSupplier = (sup: Supplier) => {
    const linkedCount = rawMaterials.filter((m) => m.supplierId === sup.id).length;
    if (linkedCount > 0) {
      showToast(
        `Supplier "${sup.name}" tidak dapat dihapus karena menjadi pemasok utama bagi ${linkedCount} bahan baku!`,
        "warning"
      );
      return;
    }
    setSuppliers(suppliers.filter((s) => s.id !== sup.id));
    showToast(`Mitra supplier "${sup.name}" berhasil dihapus.`, "info");
  };

  // ----------------------------------------------------
  // SMART BATCH COOKING (PENGGUNAAN RESEP OTOMATIS)
  // ----------------------------------------------------
  const [cookRecipeId, setCookRecipeId] = useState(recipes[0].id);
  const [cookPortionCount, setCookPortionCount] = useState<number>(50);
  const [cookChefPic, setCookChefPic] = useState("Siti Rahayu (Chef Kantin)");
  const [cookShift, setCookShift] = useState<"SHIFT_1" | "SHIFT_2" | "GENERAL">("SHIFT_1");
  const [cookNotes, setCookNotes] = useState("");

  const selectedCookRecipe = useMemo(() => {
    return recipes.find((r) => r.id === cookRecipeId) || recipes[0];
  }, [recipes, cookRecipeId]);

  const previewCookRequirements = useMemo(() => {
    return selectedCookRecipe.ingredients.map((ing) => {
      const totalAmount = ing.amountPerPortion * cookPortionCount;
      const subtotal = ing.subtotalCogs * cookPortionCount;
      const currentMat = rawMaterials.find((m) => m.id === ing.rawMaterialId);
      const stockAfter = currentMat ? currentMat.currentStock - totalAmount : 0;
      const isSufficient = currentMat ? currentMat.currentStock >= totalAmount : false;

      return {
        ...ing,
        totalAmount,
        subtotal,
        currentStock: currentMat?.currentStock || 0,
        stockAfter,
        isSufficient,
      };
    });
  }, [selectedCookRecipe, cookPortionCount, rawMaterials]);

  const totalCookBatchCost = useMemo(() => {
    return previewCookRequirements.reduce((sum, item) => sum + item.subtotal, 0);
  }, [previewCookRequirements]);

  const handleExecuteBatchCooking = () => {
    // Check if any material is insufficient
    const insufficient = previewCookRequirements.filter((p) => !p.isSufficient);
    if (insufficient.length > 0) {
      showToast(
        `Stok tidak mencukupi untuk: ${insufficient.map((i) => i.rawMaterialName).join(", ")}!`,
        "warning"
      );
      return;
    }

    const usageNumber = `USG/2026/09/${String(usages.length + 1).padStart(3, "0")}`;
    const timestamp = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const usageItems: RawMaterialUsageItem[] = previewCookRequirements.map((req) => ({
      id: `USGI-${Date.now()}-${req.rawMaterialId}`,
      rawMaterialId: req.rawMaterialId,
      rawMaterialCode: req.rawMaterialCode,
      rawMaterialName: req.rawMaterialName,
      usageUnit: req.usageUnit,
      unitPrice: req.usageUnitPrice,
      quantityUsed: req.totalAmount,
      subtotalCost: req.subtotal,
    }));

    const newUsage: RawMaterialUsage = {
      id: `USG-${Date.now()}`,
      usageNumber,
      usageDate: timestamp,
      batchCode: `BATCH-${selectedCookRecipe.menuCode}-${Date.now().toString().slice(-4)}`,
      menuId: selectedCookRecipe.id,
      menuName: selectedCookRecipe.menuName,
      portionCount: cookPortionCount,
      cookPic: cookChefPic,
      shift: cookShift,
      location: "Dapur Utama Kantin BIT (Lt. 1)",
      mode: "RECIPE_BATCH",
      items: usageItems,
      totalUsageCost: totalCookBatchCost,
      notes: cookNotes || `Pengolahan ${cookPortionCount} porsi ${selectedCookRecipe.menuName}`,
      createdAt: timestamp,
    };

    // Auto-deduct stock balance
    const updatedMaterials = rawMaterials.map((mat) => {
      const req = previewCookRequirements.find((r) => r.rawMaterialId === mat.id);
      if (req) {
        return {
          ...mat,
          currentStock: mat.currentStock - req.totalAmount,
        };
      }
      return mat;
    });

    // Create Stock Mutations
    const newMutations: StockMutation[] = previewCookRequirements.map((req) => ({
      id: `MUT-${Date.now()}-${req.rawMaterialId}`,
      rawMaterialId: req.rawMaterialId,
      rawMaterialCode: req.rawMaterialCode,
      rawMaterialName: req.rawMaterialName,
      timestamp,
      referenceNumber: usageNumber,
      mutationType: "PENGGUNAAN_DAPUR",
      qtyIn: 0,
      qtyOut: req.totalAmount,
      endingBalance: req.stockAfter,
      unit: req.usageUnit,
      unitPrice: req.usageUnitPrice,
      totalValue: req.subtotal,
      pic: cookChefPic,
      notes: `Sesi Masak ${cookPortionCount} porsi ${selectedCookRecipe.menuName}`,
    }));

    setRawMaterials(updatedMaterials);
    setUsages([newUsage, ...usages]);
    setMutations([...newMutations, ...mutations]);
    setShowCookingSessionModal(false);
    showToast(
      `Sesi masak ${cookPortionCount} porsi ${selectedCookRecipe.menuName} berhasil! Stok bahan baku otomatis terpotong.`,
      "success"
    );
  };

  // ----------------------------------------------------
  // STOCK OPNAME HANDLER
  // ----------------------------------------------------
  const [opnameAuditor, setOpnameAuditor] = useState("Dewi Lestari (Internal Audit Koperasi)");
  const [opnamePhysicalInputs, setOpnamePhysicalInputs] = useState<{ [materialId: string]: number }>({});
  const [opnameReasons, setOpnameReasons] = useState<{ [materialId: string]: string }>({});

  const handleOpenStockOpname = () => {
    // Pre-fill physical input with current system stock
    const initialInputs: { [key: string]: number } = {};
    const initialReasons: { [key: string]: string } = {};
    rawMaterials.forEach((m) => {
      initialInputs[m.id] = m.currentStock;
      initialReasons[m.id] = "Stok cocok 100%";
    });
    setOpnamePhysicalInputs(initialInputs);
    setOpnameReasons(initialReasons);
    setShowStockOpnameModal(true);
  };

  const handleApplyStockOpname = () => {
    const opnameNumber = `SO-BB/2026/09/${String(stockOpnames.length + 1).padStart(3, "0")}`;
    const timestamp = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    let totalSysVal = 0;
    let totalPhysVal = 0;
    let totalVarVal = 0;

    const opnameItems: StockOpnameItem[] = rawMaterials.map((mat) => {
      const physicalStock = opnamePhysicalInputs[mat.id] !== undefined ? opnamePhysicalInputs[mat.id] : mat.currentStock;
      const varianceQty = physicalStock - mat.currentStock;
      const varianceValue = Math.round(varianceQty * mat.usageUnitPrice);
      const systemValue = Math.round(mat.currentStock * mat.usageUnitPrice);
      const physicalValue = Math.round(physicalStock * mat.usageUnitPrice);

      totalSysVal += systemValue;
      totalPhysVal += physicalValue;
      totalVarVal += varianceValue;

      const varianceStatus: "MATCH" | "SHORTAGE" | "SURPLUS" =
        varianceQty === 0 ? "MATCH" : varianceQty < 0 ? "SHORTAGE" : "SURPLUS";

      return {
        id: `SOI-${Date.now()}-${mat.id}`,
        rawMaterialId: mat.id,
        rawMaterialCode: mat.code,
        rawMaterialName: mat.name,
        categoryName: mat.categoryName,
        usageUnit: mat.usageUnit,
        unitPrice: mat.usageUnitPrice,
        systemStock: mat.currentStock,
        systemValue,
        physicalStock,
        physicalValue,
        varianceQty,
        varianceValue,
        varianceStatus,
        reason: opnameReasons[mat.id] || (varianceQty === 0 ? "Stok cocok 100%" : "Penyesuaian fisik dapur"),
      };
    });

    const newOpname: StockOpname = {
      id: `SO-${Date.now()}`,
      opnameNumber,
      opnameDate: timestamp,
      location: "Dapur & Gudang Kantin Pabrik BIT",
      auditorName: opnameAuditor,
      shiftPic: "Siti Rahayu (Kepala Dapur)",
      status: "ADJUSTED",
      totalSystemValue: totalSysVal,
      totalPhysicalValue: totalPhysVal,
      totalVarianceValue: totalVarVal,
      notes: "Audit berkala fisik dapur. Stok sistem berhasil disesuaikan dengan fisik nyata.",
      createdAt: timestamp,
      items: opnameItems,
    };

    // Apply adjustments to system raw materials stock
    const updatedMaterials = rawMaterials.map((mat) => {
      const physicalStock = opnamePhysicalInputs[mat.id] !== undefined ? opnamePhysicalInputs[mat.id] : mat.currentStock;
      return {
        ...mat,
        currentStock: physicalStock,
      };
    });

    // Create mutations for any variances
    const varianceMutations: StockMutation[] = opnameItems
      .filter((item) => item.varianceQty !== 0)
      .map((item) => ({
        id: `MUT-${Date.now()}-${item.rawMaterialId}`,
        rawMaterialId: item.rawMaterialId,
        rawMaterialCode: item.rawMaterialCode,
        rawMaterialName: item.rawMaterialName,
        timestamp,
        referenceNumber: opnameNumber,
        mutationType: "OPNAME_PENYESUAIAN",
        qtyIn: item.varianceQty > 0 ? item.varianceQty : 0,
        qtyOut: item.varianceQty < 0 ? Math.abs(item.varianceQty) : 0,
        endingBalance: item.physicalStock,
        unit: item.usageUnit,
        unitPrice: item.unitPrice,
        totalValue: Math.abs(item.varianceValue),
        pic: opnameAuditor,
        notes: item.reason || "Penyesuaian hasil audit stok opname",
      }));

    setRawMaterials(updatedMaterials);
    setStockOpnames([newOpname, ...stockOpnames]);
    setMutations([...varianceMutations, ...mutations]);
    setShowStockOpnameModal(false);
    showToast(`Berita acara stok opname ${opnameNumber} berhasil disimpan & saldo stok disesuaikan!`, "success");
  };

  // ----------------------------------------------------
  // CREATE PURCHASE ORDER (PO) HANDLER & FORM STATE
  // ----------------------------------------------------
  interface PoItemForm {
    id: string;
    rawMaterialId: string;
    quantity: number | "";
    unitPrice: number | "";
  }

  const [poSupplierId, setPoSupplierId] = useState<string>(sampleSuppliers[0]?.id || "sup-1");
  const [poOrderDate, setPoOrderDate] = useState<string>("2026-09-21");
  const [poExpectedDeliveryDate, setPoExpectedDeliveryDate] = useState<string>("2026-09-23");
  const [poLocation, setPoLocation] = useState<string>("Dapur Kantin Pabrik BIT (Lt. 1)");
  const [poNotes, setPoNotes] = useState<string>("Mohon dikirim sesuai pesanan dan kondisi bahan segar.");
  const [poDiscountAmount, setPoDiscountAmount] = useState<number | "">("");
  const [poShippingCost, setPoShippingCost] = useState<number | "">("");

  const [poItems, setPoItems] = useState<PoItemForm[]>([
    {
      id: "po-item-1",
      rawMaterialId: sampleRawMaterials[0]?.id || "rm-1",
      quantity: 10,
      unitPrice: sampleRawMaterials[0]?.lastPurchasePrice || 30000,
    },
  ]);

  const handleAddPoItem = () => {
    const defaultMat = rawMaterials[0];
    setPoItems((prev) => [
      ...prev,
      {
        id: `po-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        rawMaterialId: defaultMat?.id || "",
        quantity: 1,
        unitPrice: defaultMat?.lastPurchasePrice || 0,
      },
    ]);
  };

  const handleRemovePoItem = (itemId: string) => {
    if (poItems.length <= 1) {
      showToast("Minimal harus ada 1 item bahan dalam Surat PO.", "warning");
      return;
    }
    setPoItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handlePoItemChange = (itemId: string, field: "rawMaterialId" | "quantity" | "unitPrice", value: any) => {
    setPoItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (field === "rawMaterialId") {
          const mat = rawMaterials.find((m) => m.id === value);
          return {
            ...item,
            rawMaterialId: value,
            unitPrice: mat ? mat.lastPurchasePrice : item.unitPrice,
          };
        }
        if (field === "quantity" || field === "unitPrice") {
          return {
            ...item,
            [field]: value === "" ? "" : isNaN(Number(value)) ? "" : Number(value),
          };
        }
        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const poCalculations = useMemo(() => {
    const calculatedItems: PurchaseOrderItem[] = poItems.map((item) => {
      const mat = rawMaterials.find((m) => m.id === item.rawMaterialId) || rawMaterials[0];
      const qty = typeof item.quantity === "number" ? item.quantity : (item.quantity === "" ? 0 : Number(item.quantity) || 0);
      const price = typeof item.unitPrice === "number" ? item.unitPrice : (item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0);
      const subtotal = Math.max(0, qty * price);
      return {
        id: item.id,
        rawMaterialId: mat ? mat.id : item.rawMaterialId,
        rawMaterialCode: mat ? mat.code : "BB-XXX",
        rawMaterialName: mat ? mat.name : "Bahan Baku",
        categoryName: mat ? mat.categoryName : "Umum",
        purchaseUnit: mat ? mat.purchaseUnit : "Kg",
        unitRatio: mat ? mat.unitRatio : 1,
        unitPrice: price,
        quantity: qty,
        discountAmount: 0,
        subtotal,
      };
    });

    const subtotal = calculatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const disc = typeof poDiscountAmount === "number" ? poDiscountAmount : (Number(poDiscountAmount) || 0);
    const ship = typeof poShippingCost === "number" ? poShippingCost : (Number(poShippingCost) || 0);
    const grandTotal = Math.max(0, subtotal - disc + ship);

    return {
      items: calculatedItems,
      subtotal,
      grandTotal,
    };
  }, [poItems, rawMaterials, poDiscountAmount, poShippingCost]);

  const handleCreatePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poSupplierId);
    if (!sup) {
      showToast("Pilih supplier rekanan terlebih dahulu!", "warning");
      return;
    }

    if (poCalculations.items.length === 0 || poCalculations.items.some((it) => it.quantity <= 0)) {
      showToast("Pastikan semua item memiliki kuantitas pemesanan minimal 1!", "warning");
      return;
    }

    const nextCount = purchaseOrders.length + 1;
    const now = new Date();
    const poNumber = `PO-BB/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(nextCount).padStart(3, "0")}`;
    const disc = typeof poDiscountAmount === "number" ? poDiscountAmount : (Number(poDiscountAmount) || 0);
    const ship = typeof poShippingCost === "number" ? poShippingCost : (Number(poShippingCost) || 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      orderDate: poOrderDate,
      expectedDeliveryDate: poExpectedDeliveryDate,
      supplierId: sup.id,
      supplierName: sup.name,
      supplierContact: sup.contactPerson,
      supplierPhone: sup.phone,
      supplierAddress: sup.address,
      location: poLocation,
      items: poCalculations.items,
      subtotal: poCalculations.subtotal,
      discountPercent: 0,
      discountAmount: disc,
      shippingAdminCost: ship,
      grandTotal: poCalculations.grandTotal,
      status: "SENT",
      notes: poNotes,
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setShowCreatePoModal(false);
    showToast(`Surat PO ${poNumber} berhasil diterbitkan dan dikirim ke ${sup.name}!`, "success");

    // Reset items for next PO
    setPoDiscountAmount("");
    setPoShippingCost("");
    setPoItems([
      {
        id: `po-item-${Date.now()}`,
        rawMaterialId: rawMaterials[0]?.id || "rm-1",
        quantity: 10,
        unitPrice: rawMaterials[0]?.lastPurchasePrice || 30000,
      },
    ]);
  };

  const handleExportPoReport = (po: PurchaseOrder) => {
    const config: FormalReportConfig = {
      title: "SURAT PESANAN PENGADAAN BAHAN BAKU (PURCHASE ORDER)",
      documentNumber: po.poNumber,
      period: `Tanggal PO: ${po.orderDate} | Estimasi Kirim: ${po.expectedDeliveryDate}`,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      departmentOrUnit: `Kantin BIT - Rekanan: ${po.supplierName}`,
      filename: `${po.poNumber.replace(/\//g, "-")}-${po.supplierName.replace(/\s+/g, "_")}`,
      orientation: "portrait",
      columns: [
        { header: "No", key: "no", width: "8%" },
        { header: "Kode", key: "code", width: "16%" },
        { header: "Nama Bahan Baku", key: "name", width: "32%" },
        { header: "Qty", key: "qty", align: "center", width: "12%" },
        { header: "Satuan", key: "unit", align: "center", width: "12%" },
        { header: "Harga Satuan", key: "unitPrice", align: "right", width: "20%" },
        { header: "Subtotal", key: "subtotal", align: "right", width: "20%" },
      ],
      data: po.items.map((it, idx) => ({
        no: idx + 1,
        code: it.rawMaterialCode,
        name: it.rawMaterialName,
        qty: it.quantity,
        unit: it.purchaseUnit,
        unitPrice: `Rp ${it.unitPrice.toLocaleString("id-ID")}`,
        subtotal: `Rp ${it.subtotal.toLocaleString("id-ID")}`,
      })),
      summaries: [
        { label: "Nomor PO", value: po.poNumber },
        { label: "Mitra Supplier", value: po.supplierName },
        { label: "Status Dokumen", value: po.status },
        { label: "Grand Total PO", value: `Rp ${po.grandTotal.toLocaleString("id-ID")}` },
      ],
      signatures: [
        { role: "Dibuat Oleh (Admin Dapur)", name: "Chef Dapur Kantin BIT" },
        { role: "Disetujui Oleh (Manajer Koperasi)", name: "Bpk. Rahmat Hidayat, SE" },
        { role: "Diterima Oleh (Mitra Supplier)", name: po.supplierContact || po.supplierName },
      ],
    };

    setReportConfig(config);
    setIsReportModalOpen(true);
  };

  // ----------------------------------------------------
  // CREATE INBOUND PURCHASE INVOICE HANDLER & FORM STATE
  // ----------------------------------------------------
  interface PurchaseItemForm {
    id: string;
    rawMaterialId: string;
    quantityReceived: number | "";
    unitPrice: number | "";
  }

  const [showCreatePurchaseModal, setShowCreatePurchaseModal] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<RawMaterialPurchase | null>(null);

  const [purchaseSupplierId, setPurchaseSupplierId] = useState<string>(sampleSuppliers[1]?.id || "SUP-02");
  const [purchasePoNumber, setPurchasePoNumber] = useState<string>("");
  const [purchaseInvoiceDate, setPurchaseInvoiceDate] = useState<string>("2026-09-21T09:30");
  const [purchaseVehiclePlate, setPurchaseVehiclePlate] = useState<string>("B 9482 KBC (Mobil Box Pendingin)");
  const [purchaseLocation, setPurchaseLocation] = useState<string>("Dapur & Gudang Kantin Pabrik BIT (Lt. 1)");
  const [purchasePaymentType, setPurchasePaymentType] = useState<"TUNAI_KAS_DAPUR" | "TRANSFER_KOPERASI" | "TEMPO_HUTANG">("TUNAI_KAS_DAPUR");
  const [purchaseCashBook, setPurchaseCashBook] = useState<string>("KAS OPERASIONAL DAPUR KANTIN");
  const [purchaseNotes, setPurchaseNotes] = useState<string>("Barang diterima lengkap dan fisik segar sesuai standar kitchen.");
  const [purchaseDiscountAmount, setPurchaseDiscountAmount] = useState<number | "">("");
  const [purchaseAdminCost, setPurchaseAdminCost] = useState<number | "">("");
  const [purchaseAmountPaid, setPurchaseAmountPaid] = useState<number | "">("");

  const [purchaseFormItems, setPurchaseFormItems] = useState<PurchaseItemForm[]>([
    {
      id: "puri-init-1",
      rawMaterialId: sampleRawMaterials[0]?.id || "rm-1",
      quantityReceived: 10,
      unitPrice: sampleRawMaterials[0]?.lastPurchasePrice || 30000,
    },
  ]);

  const handleAddPurchaseFormItem = () => {
    const defaultMat = rawMaterials[0];
    setPurchaseFormItems((prev) => [
      ...prev,
      {
        id: `puri-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        rawMaterialId: defaultMat?.id || "",
        quantityReceived: 1,
        unitPrice: defaultMat?.lastPurchasePrice || 0,
      },
    ]);
  };

  const handleRemovePurchaseFormItem = (itemId: string) => {
    if (purchaseFormItems.length <= 1) {
      showToast("Minimal harus ada 1 item bahan dalam faktur pembelian.", "warning");
      return;
    }
    setPurchaseFormItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handlePurchaseFormItemChange = (
    itemId: string,
    field: "rawMaterialId" | "quantityReceived" | "unitPrice",
    value: any
  ) => {
    setPurchaseFormItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (field === "rawMaterialId") {
          const mat = rawMaterials.find((m) => m.id === value);
          return {
            ...item,
            rawMaterialId: value,
            unitPrice: mat ? mat.lastPurchasePrice : item.unitPrice,
          };
        }
        if (field === "quantityReceived" || field === "unitPrice") {
          return {
            ...item,
            [field]: value === "" ? "" : isNaN(Number(value)) ? "" : Number(value),
          };
        }
        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleSelectPoForPurchase = (poNum: string) => {
    setPurchasePoNumber(poNum);
    if (!poNum) return;
    const po = purchaseOrders.find((p) => p.poNumber === poNum);
    if (po) {
      if (po.supplierId) {
        setPurchaseSupplierId(po.supplierId);
      }
      if (po.location) {
        setPurchaseLocation(po.location);
      }
      if (po.items && po.items.length > 0) {
        setPurchaseFormItems(
          po.items.map((it) => ({
            id: `puri-${Date.now()}-${it.id}`,
            rawMaterialId: it.rawMaterialId,
            quantityReceived: it.quantity,
            unitPrice: it.unitPrice,
          }))
        );
      }
      if (po.discountAmount) {
        setPurchaseDiscountAmount(po.discountAmount);
      }
      if (po.shippingAdminCost) {
        setPurchaseAdminCost(po.shippingAdminCost);
      }
    }
  };

  const handlePaymentTypeChange = (type: "TUNAI_KAS_DAPUR" | "TRANSFER_KOPERASI" | "TEMPO_HUTANG") => {
    setPurchasePaymentType(type);
    if (type === "TUNAI_KAS_DAPUR") {
      setPurchaseCashBook("KAS OPERASIONAL DAPUR KANTIN");
    } else if (type === "TRANSFER_KOPERASI") {
      setPurchaseCashBook("KAS UTAMA KOPKAR BIT");
    } else {
      setPurchaseCashBook("HUTANG DAGANG SUPPLIER");
    }
  };

  const purchaseCalculations = useMemo(() => {
    const calculatedItems: RawMaterialPurchaseItem[] = purchaseFormItems.map((item) => {
      const mat = rawMaterials.find((m) => m.id === item.rawMaterialId) || rawMaterials[0];
      const qty = typeof item.quantityReceived === "number" ? item.quantityReceived : (item.quantityReceived === "" ? 0 : Number(item.quantityReceived) || 0);
      const price = typeof item.unitPrice === "number" ? item.unitPrice : (item.unitPrice === "" ? 0 : Number(item.unitPrice) || 0);
      const subtotal = Math.max(0, qty * price);
      const unitRatio = mat ? mat.unitRatio : 1;
      const totalStockAdded = Math.round(qty * unitRatio);

      return {
        id: item.id,
        rawMaterialId: mat ? mat.id : item.rawMaterialId,
        rawMaterialCode: mat ? mat.code : "BB-XXX",
        rawMaterialName: mat ? mat.name : "Bahan Baku",
        purchaseUnit: mat ? mat.purchaseUnit : "Kg",
        unitRatio,
        usageUnit: mat ? mat.usageUnit : "gram",
        unitPrice: price,
        quantityReceived: qty,
        totalStockAdded,
        subtotal,
      };
    });

    const subtotal = calculatedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const disc = typeof purchaseDiscountAmount === "number" ? purchaseDiscountAmount : (Number(purchaseDiscountAmount) || 0);
    const adm = typeof purchaseAdminCost === "number" ? purchaseAdminCost : (Number(purchaseAdminCost) || 0);
    const grandTotal = Math.max(0, subtotal - disc + adm);

    let paid = 0;
    if (purchaseAmountPaid === "") {
      paid = purchasePaymentType === "TEMPO_HUTANG" ? 0 : grandTotal;
    } else {
      paid = typeof purchaseAmountPaid === "number" ? purchaseAmountPaid : (Number(purchaseAmountPaid) || 0);
    }
    const amountDue = Math.max(0, grandTotal - paid);

    return {
      items: calculatedItems,
      subtotal,
      grandTotal,
      paid,
      amountDue,
    };
  }, [purchaseFormItems, rawMaterials, purchaseDiscountAmount, purchaseAdminCost, purchaseAmountPaid, purchasePaymentType]);

  const handleSavePurchaseInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === purchaseSupplierId);
    if (!sup) {
      showToast("Pilih supplier rekanan terlebih dahulu!", "warning");
      return;
    }

    if (purchaseCalculations.items.length === 0 || purchaseCalculations.items.some((it) => it.quantityReceived <= 0)) {
      showToast("Pastikan semua item memiliki kuantitas penerimaan minimal 1!", "warning");
      return;
    }

    const nextCount = purchases.length + 1;
    const now = new Date();
    const invoiceNumber = `INV-BB/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(nextCount).padStart(3, "0")}`;
    const timestamp = `${purchaseInvoiceDate.replace("T", " ")} WIB`;
    const disc = typeof purchaseDiscountAmount === "number" ? purchaseDiscountAmount : (Number(purchaseDiscountAmount) || 0);
    const adm = typeof purchaseAdminCost === "number" ? purchaseAdminCost : (Number(purchaseAdminCost) || 0);

    const newPurchase: RawMaterialPurchase = {
      id: `PUR-${Date.now()}`,
      invoiceNumber,
      purchaseDate: timestamp,
      poNumber: purchasePoNumber ? purchasePoNumber : undefined,
      supplierId: sup.id,
      supplierName: sup.name,
      supplierPhone: sup.phone,
      vehiclePlateNumber: purchaseVehiclePlate || undefined,
      location: purchaseLocation,
      paymentType: purchasePaymentType,
      cashBook: purchaseCashBook,
      items: purchaseCalculations.items,
      subtotal: purchaseCalculations.subtotal,
      discountAmount: disc,
      adminCost: adm,
      grandTotal: purchaseCalculations.grandTotal,
      amountPaid: purchaseCalculations.paid,
      amountDue: purchaseCalculations.amountDue,
      notes: purchaseNotes,
      createdAt: timestamp,
    };

    // 1. Auto-increment stock in rawMaterials & update purchase price
    const updatedMaterials = rawMaterials.map((mat) => {
      const receivedItem = purchaseCalculations.items.find((it) => it.rawMaterialId === mat.id);
      if (receivedItem) {
        const newStock = mat.currentStock + receivedItem.totalStockAdded;
        const newUnitPrice = receivedItem.unitPrice;
        const newUsagePrice = Math.round((newUnitPrice / mat.unitRatio) * 100) / 100;
        return {
          ...mat,
          currentStock: newStock,
          lastPurchasePrice: newUnitPrice,
          usageUnitPrice: newUsagePrice,
        };
      }
      return mat;
    });

    // 2. Create Stock Mutations for each received item
    const newMutations: StockMutation[] = purchaseCalculations.items.map((it) => {
      const currentMat = rawMaterials.find((m) => m.id === it.rawMaterialId);
      const prevStock = currentMat ? currentMat.currentStock : 0;
      const endingStock = prevStock + it.totalStockAdded;

      return {
        id: `MUT-${Date.now()}-${it.rawMaterialId}`,
        rawMaterialId: it.rawMaterialId,
        rawMaterialCode: it.rawMaterialCode,
        rawMaterialName: it.rawMaterialName,
        timestamp,
        referenceNumber: invoiceNumber,
        mutationType: "PEMBELIAN_MASUK",
        qtyIn: it.totalStockAdded,
        qtyOut: 0,
        endingBalance: endingStock,
        unit: it.usageUnit,
        unitPrice: currentMat ? currentMat.usageUnitPrice : (it.unitPrice / it.unitRatio),
        totalValue: it.subtotal,
        pic: "Admin Penerimaan Dapur BIT",
        notes: `Penerimaan Faktur ${invoiceNumber} dari ${sup.name}${purchasePoNumber ? ` (Ref ${purchasePoNumber})` : ""}`,
      };
    });

    // 3. Mark referenced PO as RECEIVED if applicable
    if (purchasePoNumber) {
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.poNumber === purchasePoNumber ? { ...po, status: "RECEIVED" } : po
        )
      );
    }

    setPurchases([newPurchase, ...purchases]);
    setRawMaterials(updatedMaterials);
    setMutations([...newMutations, ...mutations]);
    setShowCreatePurchaseModal(false);

    showToast(
      `Faktur Pembelian ${invoiceNumber} berhasil disimpan! Stok bahan baku otomatis bertambah & dicatat di mutasi.`,
      "success"
    );

    // Reset Form
    setPurchasePoNumber("");
    setPurchaseDiscountAmount("");
    setPurchaseAdminCost("");
    setPurchaseAmountPaid("");
    setPurchaseFormItems([
      {
        id: `puri-${Date.now()}`,
        rawMaterialId: rawMaterials[0]?.id || "rm-1",
        quantityReceived: 10,
        unitPrice: rawMaterials[0]?.lastPurchasePrice || 30000,
      },
    ]);
  };

  const handleExportPurchaseReport = (pur: RawMaterialPurchase) => {
    const config: FormalReportConfig = {
      title: "FAKTUR PEMBELIAN & BUKTI PENERIMAAN BAHAN BAKU (GOODS RECEIPT)",
      documentNumber: pur.invoiceNumber,
      period: `Waktu Penerimaan: ${pur.purchaseDate} | Ref PO: ${pur.poNumber || "Pembelian Langsung"}`,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      departmentOrUnit: `Divisi Pengadaan Kantin BIT & Rekanan: ${pur.supplierName}`,
      filename: `${pur.invoiceNumber.replace(/\//g, "-")}-${pur.supplierName.replace(/\s+/g, "_")}`,
      orientation: "portrait",
      columns: [
        { header: "No", key: "no", width: "6%" },
        { header: "Kode", key: "code", width: "14%" },
        { header: "Nama Bahan Baku", key: "name", width: "26%" },
        { header: "Satuan Beli", key: "unit", align: "center", width: "12%" },
        { header: "Qty Masuk", key: "qty", align: "center", width: "12%" },
        { header: "Stok Masuk", key: "stockAdded", align: "center", width: "14%" },
        { header: "Harga Satuan", key: "unitPrice", align: "right", width: "16%" },
        { header: "Subtotal", key: "subtotal", align: "right", width: "18%" },
      ],
      data: pur.items.map((it, idx) => ({
        no: idx + 1,
        code: it.rawMaterialCode,
        name: it.rawMaterialName,
        unit: it.purchaseUnit,
        qty: `${it.quantityReceived} ${it.purchaseUnit}`,
        stockAdded: `+${it.totalStockAdded.toLocaleString("id-ID")} ${it.usageUnit}`,
        unitPrice: `Rp ${it.unitPrice.toLocaleString("id-ID")}`,
        subtotal: `Rp ${it.subtotal.toLocaleString("id-ID")}`,
      })),
      summaries: [
        { label: "Nomor Faktur", value: pur.invoiceNumber },
        { label: "Mitra Supplier", value: pur.supplierName },
        { label: "Metode Bayar", value: pur.paymentType === "TUNAI_KAS_DAPUR" ? "Tunai Kas Dapur" : pur.paymentType === "TRANSFER_KOPERASI" ? "Transfer Koperasi" : "Tempo / Hutang" },
        { label: "Grand Total", value: `Rp ${pur.grandTotal.toLocaleString("id-ID")}` },
        { label: "Status Bayar", value: pur.amountDue > 0 ? `Sisa Hutang: Rp ${pur.amountDue.toLocaleString("id-ID")}` : "LUNAS", highlight: pur.amountDue === 0 },
      ],
      signatures: [
        { role: "Petugas Penerima (Kitchen BIT)", name: "Staf Penerimaan Dapur BIT" },
        { role: "Kurir / Pengantar Supplier", name: pur.vehiclePlateNumber || pur.supplierName },
        { role: "Verifikasi Keuangan Koperasi", name: "Dewi Lestari (Bendahara)" },
      ],
    };

    setReportConfig(config);
    setIsReportModalOpen(true);
  };

  // ----------------------------------------------------
  // REPORT EXPORT TRIGGERS
  // ----------------------------------------------------
  const handleExportRawMaterialsReport = () => {
    const config: FormalReportConfig = {
      title: "LAPORAN MASTER DATA BAHAN BAKU & NILAI INVENTARIS DAPUR",
      documentNumber: `KOP-BIT/PROD-BB/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`,
      period: "September 2026",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      departmentOrUnit: "Divisi Produksi, Dapur & Pengadaan Kantin Kopkar BIT",
      filename: `Laporan-Bahan-Baku-Kantin-BIT-${new Date().getFullYear()}`,
      orientation: "landscape",
      summaries: [
        { label: "Total Item Bahan Baku", value: `${rawMaterials.length} Bahan`, subLabel: "Aktif Terdaftar", highlight: true },
        { label: "Total Nilai Aset Stok Fisik", value: `Rp ${rawMaterialStats.totalAssetValue.toLocaleString("id-ID")}`, subLabel: "Inventaris Dapur", highlight: true },
        { label: "Stok Menipis / Kritis", value: `${rawMaterialStats.lowStockCount + rawMaterialStats.outOfStockCount} Item`, subLabel: "Perlu Re-Order Segera" },
        { label: "Kapasitas Operasional", value: "10 Menu Olahan BIT", subLabel: "Shift 1 & Shift 2", highlight: true },
      ],
      columns: [
        { header: "KODE", key: "code", align: "center", width: "70px" },
        { header: "NAMA BAHAN BAKU", key: "name", align: "left", width: "200px" },
        { header: "KATEGORI", key: "categoryName", align: "left", width: "130px" },
        { header: "SATUAN BELI", key: "purchaseUnit", align: "center", width: "90px" },
        { header: "KONVERSI", key: "unitRatio", align: "center", width: "80px", formatter: (_val: any, row: any) => `1 : ${row.unitRatio} ${row.usageUnit}` },
        { header: "HARGA BELI", key: "lastPurchasePrice", align: "right", width: "100px", formatter: (val: any) => `Rp ${Number(val).toLocaleString("id-ID")}` },
        { header: "HPP / PAKAI", key: "usageUnitPrice", align: "right", width: "90px", formatter: (val: any, row: any) => `Rp ${Number(val).toLocaleString("id-ID")}/${row.usageUnit}` },
        { header: "STOK AKTIF", key: "currentStock", align: "right", width: "110px", formatter: (val: any, row: any) => `${Number(val).toLocaleString("id-ID")} ${row.usageUnit}` },
        { header: "NILAI TOTAL (RP)", key: "totalValue", align: "right", width: "110px", formatter: (_val: any, row: any) => `Rp ${(row.currentStock * row.usageUnitPrice).toLocaleString("id-ID")}` },
        { header: "SUPPLIER UTAMA", key: "supplierName", align: "left", width: "150px" },
      ],
      data: rawMaterials.map((m) => ({ ...m, totalValue: m.currentStock * m.usageUnitPrice })),
      signatures: [
        { role: "Kepala Dapur Kantin,", name: "Siti Rahayu", titleOrNik: "Chef Pengelola Dapur BIT" },
        { role: "Internal Auditor,", name: "Dewi Lestari", titleOrNik: "Bendahara Kopkar BIT" },
        { role: "Disetujui Oleh,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Koperasi Kopkar BIT" },
      ],
    };

    setReportConfig(config);
    setIsReportModalOpen(true);
  };

  const handleExportRecipeCogsReport = () => {
    const config: FormalReportConfig = {
      title: "LAPORAN RESEP BILL OF MATERIALS (BOM) & ANALISIS COGS / HPP MENU",
      documentNumber: `KOP-BIT/REC-COGS/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`,
      period: "September 2026",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      departmentOrUnit: "Divisi Produksi Dapur & Manajemen HPP Kantin Kopkar BIT",
      filename: `Laporan-COGS-Resep-Menu-BIT-${new Date().getFullYear()}`,
      orientation: "portrait",
      summaries: [
        { label: "Menu Terpilih", value: activeRecipe.menuName, subLabel: `Kode: ${activeRecipe.menuCode}`, highlight: true },
        { label: "Harga Jual Menu", value: `Rp ${activeRecipe.sellingPrice.toLocaleString("id-ID")}`, subLabel: "Per 1 Porsi", highlight: true },
        { label: "Total HPP Bahan Baku", value: `Rp ${activeRecipe.totalCogs.toLocaleString("id-ID")}`, subLabel: `${(100 - activeRecipe.grossProfitPercent).toFixed(1)}% dari Harga` },
        { label: "Gross Profit Margin", value: `Rp ${activeRecipe.grossProfitRp.toLocaleString("id-ID")}`, subLabel: `${activeRecipe.grossProfitPercent}% Margin`, highlight: true },
      ],
      columns: [
        { header: "NO", key: "no", align: "center", width: "40px", formatter: (_val: any, _row: any) => `•` },
        { header: "KODE", key: "rawMaterialCode", align: "center", width: "70px" },
        { header: "NAMA BAHAN BAKU", key: "rawMaterialName", align: "left", width: "180px" },
        { header: "TAKARAN / PORSI", key: "amountPerPortion", align: "center", width: "100px", formatter: (val: any, row: any) => `${val} ${row.usageUnit}` },
        { header: "HARGA / SATUAN", key: "usageUnitPrice", align: "right", width: "100px", formatter: (val: any, row: any) => `Rp ${Number(val).toLocaleString("id-ID")}/${row.usageUnit}` },
        { header: "SUBTOTAL HPP", key: "subtotalCogs", align: "right", width: "110px", formatter: (val: any) => `Rp ${Number(val).toLocaleString("id-ID")}` },
        { header: "% KONTRIBUSI", key: "costPercentage", align: "right", width: "90px", formatter: (val: any) => `${val}%` },
      ],
      data: activeRecipe.ingredients,
      notes: [
        `Resep terverifikasi untuk 1 porsi standar ${activeRecipe.menuName}.`,
        `Perhitungan HPP otomatis menyesuaikan harga beli bahan baku terakhir dari supplier.`,
        `Kandungan nutrisi per porsi: ${activeRecipe.totalCalories} kkal, ${activeRecipe.totalProtein}g Protein, ${activeRecipe.totalFat}g Lemak, ${activeRecipe.totalCarbs}g Karbohidrat.`,
      ],
      signatures: [
        { role: "Penyusun Resep,", name: "Siti Rahayu", titleOrNik: "Kepala Dapur & Koki Utama" },
        { role: "Pemeriksa Finansial,", name: "Dewi Lestari", titleOrNik: "Bendahara Kopkar BIT" },
        { role: "Disetujui Oleh,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Koperasi Kopkar BIT" },
      ],
    };

    setReportConfig(config);
    setIsReportModalOpen(true);
  };

  const handleExportStockOpnameReport = (opname: StockOpname) => {
    const config: FormalReportConfig = {
      title: "BERITA ACARA AUDIT FISIK & REKONSILIASI STOK OPNAME BAHAN BAKU",
      documentNumber: `BA-SO/${opname.opnameNumber.replace(/\//g, "-")}`,
      period: "September 2026",
      date: opname.opnameDate,
      departmentOrUnit: "Tim Audit Internal & Kepala Dapur Kantin PT Bhakti Idola Tama",
      filename: `Berita-Acara-Stok-Opname-${opname.opnameNumber.replace(/\//g, "-")}`,
      orientation: "landscape",
      summaries: [
        { label: "Nomor Berita Acara", value: opname.opnameNumber, subLabel: "Status: Disetujui", highlight: true },
        { label: "Nilai Stok Sistem", value: `Rp ${opname.totalSystemValue.toLocaleString("id-ID")}`, subLabel: "Buku Besar", highlight: true },
        { label: "Nilai Stok Fisik Nyata", value: `Rp ${opname.totalPhysicalValue.toLocaleString("id-ID")}`, subLabel: "Audit Lapangan", highlight: true },
        { label: "Total Selisih (Variance)", value: `Rp ${opname.totalVarianceValue.toLocaleString("id-ID")}`, subLabel: opname.totalVarianceValue === 0 ? "Cocok 100%" : "Selisih Wajar Dapur", highlight: opname.totalVarianceValue >= 0 },
      ],
      columns: [
        { header: "KODE", key: "rawMaterialCode", align: "center", width: "70px" },
        { header: "NAMA BAHAN BAKU", key: "rawMaterialName", align: "left", width: "170px" },
        { header: "KATEGORI", key: "categoryName", align: "left", width: "120px" },
        { header: "SATUAN", key: "usageUnit", align: "center", width: "60px" },
        { header: "HARGA HPP", key: "unitPrice", align: "right", width: "80px", formatter: (val: any) => `Rp ${Number(val).toLocaleString("id-ID")}` },
        { header: "STOK SISTEM", key: "systemStock", align: "right", width: "90px", formatter: (val: any, row: any) => `${Number(val).toLocaleString("id-ID")} ${row.usageUnit}` },
        { header: "STOK FISIK", key: "physicalStock", align: "right", width: "90px", formatter: (val: any, row: any) => `${Number(val).toLocaleString("id-ID")} ${row.usageUnit}` },
        { header: "SELISIH (QTY)", key: "varianceQty", align: "right", width: "90px", formatter: (val: any, row: any) => `${val > 0 ? "+" : ""}${val} ${row.usageUnit}` },
        { header: "SELISIH (RP)", key: "varianceValue", align: "right", width: "100px", formatter: (val: any) => `Rp ${Number(val).toLocaleString("id-ID")}` },
        { header: "STATUS", key: "varianceStatus", align: "center", width: "80px", formatter: (val: any) => val === "MATCH" ? "COCOK" : val === "SHORTAGE" ? "MINUS" : "PLUS" },
        { header: "KETERANGAN / ALASAN", key: "reason", align: "left", width: "160px" },
      ],
      data: opname.items,
      notes: [
        `Audit fisik dilakukan secara langsung di area penyimpanan gudang dan cold-storage dapur kantin BIT.`,
        `Selisih minus disebabkan oleh penyusutan alami (evaporasi air), trimming lemak ayam, dan waste saat proses persiapan bahan.`,
        `Saldo inventaris sistem telah disesuaikan secara otomatis sesuai angka fisik nyata.`,
      ],
      signatures: [
        { role: "Petugas Auditor,", name: opname.auditorName, titleOrNik: "Internal Audit Koperasi" },
        { role: "Kepala Dapur,", name: "Siti Rahayu", titleOrNik: "Penanggung Jawab Gudang Dapur" },
        { role: "Mengetahui & Menyetujui,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Koperasi Kopkar BIT" },
      ],
    };

    setReportConfig(config);
    setIsReportModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-[16px] shadow-xl text-xs font-bold text-white transition-all transform animate-bounce ${
            toastMessage.type === "success"
              ? "bg-[#2DBA7D]"
              : toastMessage.type === "warning"
              ? "bg-[#FFB547] text-[#1C1B3A]"
              : "bg-[#4A3AFF]"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white rounded-[24px] border border-[#E6E3F7] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#F5F3FF] to-transparent pointer-events-none -z-0" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FF] border border-[#E6E3F7] text-xs font-bold text-[#4A3AFF]">
            <Factory className="w-3.5 h-3.5" />
            <span>Manajemen Produksi &amp; Dapur Olahan Pabrik BIT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1B3A] tracking-tight">
            Produksi, Resep &amp; Bahan Baku Kantin
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6B88] max-w-2xl leading-relaxed">
            Pusat tata kelola formulasi resep menu (BOM &amp; COGS/HPP), pengadaan bahan baku ke supplier, pencatatan sesi masak batch, dan audit stok opname terpadu.
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={handleExportRawMaterialsReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E6E3F7] hover:bg-[#F5F3FF] text-[#1C1B3A] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#4A3AFF]" />
            <span>Laporan Bahan Baku (PDF)</span>
          </button>
          <button
            onClick={() => setShowCookingSessionModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold transition-all shadow-md shadow-[#4A3AFF]/25 active:scale-95 cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Sesi Masak Menu (Batch)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SETTING RESEP & COGS MENU (BOM - BILL OF MATERIALS)               */}
      {/* ========================================================================= */}
      {activeTab === "RECIPES" && (
        <div className="space-y-6">
          {/* Menu Selector Grid */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-[#1C1B3A]">Pilih Menu Olahan Kantin BIT</h3>
                <p className="text-xs text-[#6F6B88]">Pilih salah satu dari 10 menu olahan kantin untuk mengelola formulasi resep dan HPP:</p>
              </div>
              <button
                onClick={handleExportRecipeCogsReport}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#EAE6FD] text-[#4A3AFF] text-xs font-bold border border-[#E6E3F7] transition-all cursor-pointer w-fit"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan BOM ({activeRecipe.menuCode})</span>
              </button>
            </div>

            {/* Menu Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {recipes.map((menu) => {
                const isSelected = menu.id === selectedRecipeId;
                return (
                  <button
                    key={menu.id}
                    onClick={() => setSelectedRecipeId(menu.id)}
                    className={`p-3 rounded-[16px] border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#F5F3FF] border-[#4A3AFF] shadow-sm ring-2 ring-[#4A3AFF]/20"
                        : "bg-white border-[#E6E3F7] hover:border-[#4A3AFF]/50 hover:bg-[#FAFAFE]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#6F6B88]">{menu.menuCode}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          menu.category === "MAKANAN" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {menu.category}
                        </span>
                      </div>
                      <p className="font-extrabold text-xs text-[#1C1B3A] line-clamp-1">{menu.menuName}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#E6E3F7] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#4A3AFF]">Rp {menu.sellingPrice.toLocaleString("id-ID")}</span>
                      <span className="text-[10px] text-[#2DBA7D] font-bold">{menu.grossProfitPercent}% Mg</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Recipe Details & BOM Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recipe Metrics & Analytics (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Recipe Summary Card */}
              <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#F5F3FF] text-[#4A3AFF]">
                      {activeRecipe.menuCode}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#1C1B3A] mt-1">{activeRecipe.menuName}</h3>
                    <p className="text-xs text-[#6F6B88]">Yield Standar: {activeRecipe.portionYield} Porsi</p>
                  </div>
                  <div className="w-10 h-10 rounded-[14px] bg-[#E6F9F0] text-[#2DBA7D] flex items-center justify-center font-bold">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>

                {/* Price vs COGS Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-[16px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-0.5">
                    <p className="text-[10.5px] text-[#6F6B88] font-medium">Harga Jual Menu</p>
                    <p className="text-base font-extrabold text-[#1C1B3A]">
                      Rp {activeRecipe.sellingPrice.toLocaleString("id-ID")}
                    </p>
                    <span className="text-[10px] text-[#4A3AFF] font-bold">Per 1 Porsi</span>
                  </div>
                  <div className="p-3.5 rounded-[16px] bg-red-50/60 border border-red-100 space-y-0.5">
                    <p className="text-[10.5px] text-red-700 font-medium">Total HPP Bahan (COGS)</p>
                    <p className="text-base font-extrabold text-red-700">
                      Rp {activeRecipe.totalCogs.toLocaleString("id-ID")}
                    </p>
                    <span className="text-[10px] text-red-600 font-bold">
                      {((activeRecipe.totalCogs / activeRecipe.sellingPrice) * 100).toFixed(1)}% Biaya
                    </span>
                  </div>
                </div>

                {/* Profit Gauge Bar */}
                <div className="p-4 rounded-[18px] bg-emerald-50/70 border border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">Gross Profit (Laba Kotor):</span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      Rp {activeRecipe.grossProfitRp.toLocaleString("id-ID")} ({activeRecipe.grossProfitPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2DBA7D] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(activeRecipe.grossProfitPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10.5px] text-emerald-800 leading-tight">
                    Setiap porsi menghasilkan margin bersih Rp {activeRecipe.grossProfitRp.toLocaleString("id-ID")} untuk menutupi biaya operasional dan laba kantin.
                  </p>
                </div>

                {/* Nutritional Values (SPPG Standard) */}
                <div className="space-y-2 pt-2 border-t border-[#E6E3F7]">
                  <p className="text-xs font-bold text-[#1C1B3A] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#FFB547]" />
                    <span>Nilai Gizi Per Porsi (Estimasi Standar)</span>
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-[12px] bg-[#F8F7FD] border border-[#E6E3F7]">
                      <p className="text-[9.5px] text-[#6F6B88]">Energi</p>
                      <p className="text-xs font-bold text-[#1C1B3A]">{activeRecipe.totalCalories} kkal</p>
                    </div>
                    <div className="p-2 rounded-[12px] bg-[#F8F7FD] border border-[#E6E3F7]">
                      <p className="text-[9.5px] text-[#6F6B88]">Protein</p>
                      <p className="text-xs font-bold text-[#1C1B3A]">{activeRecipe.totalProtein} g</p>
                    </div>
                    <div className="p-2 rounded-[12px] bg-[#F8F7FD] border border-[#E6E3F7]">
                      <p className="text-[9.5px] text-[#6F6B88]">Lemak</p>
                      <p className="text-xs font-bold text-[#1C1B3A]">{activeRecipe.totalFat} g</p>
                    </div>
                    <div className="p-2 rounded-[12px] bg-[#F8F7FD] border border-[#E6E3F7]">
                      <p className="text-[9.5px] text-[#6F6B88]">Karbo</p>
                      <p className="text-xs font-bold text-[#1C1B3A]">{activeRecipe.totalCarbs} g</p>
                    </div>
                  </div>
                </div>

                {/* Cooking Instructions */}
                {activeRecipe.instructions && (
                  <div className="space-y-1 pt-2 border-t border-[#E6E3F7]">
                    <p className="text-xs font-bold text-[#1C1B3A]">Petunjuk Pengolahan Dapur:</p>
                    <p className="text-[11px] text-[#6F6B88] leading-relaxed italic bg-[#F8F7FD] p-3 rounded-[12px] border border-[#E6E3F7]">
                      &ldquo;{activeRecipe.instructions}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: BOM Ingredients Table & Quick Add Form (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E3F7] pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#1C1B3A]">
                      Komposisi Bahan Baku (BOM — {activeRecipe.menuName})
                    </h3>
                    <p className="text-xs text-[#6F6B88]">
                      Rincian takaran per porsi. Perubahan harga pada master bahan baku akan otomatis memperbarui total HPP di sini.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7] shrink-0">
                    {activeRecipe.ingredients.length} Komponen Bahan
                  </span>
                </div>

                {/* Quick Add Ingredient Row */}
                <div className="p-4 rounded-[18px] bg-[#F8F7FD] border border-[#E6E3F7] space-y-3">
                  <p className="text-xs font-bold text-[#1C1B3A] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    <span>Tambah Bahan Baku ke Resep Ini</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* Debounced Searchable Combobox for Raw Material Selection */}
                    <div className="sm:col-span-6 space-y-1 relative" ref={ingredientSearchRef}>
                      <label className="text-[11px] font-bold text-[#6F6B88] flex items-center justify-between">
                        <span>Pilih Bahan Baku (Ketik untuk Mencari)</span>
                        {selectedIngredientMaterial && (
                          <span className="text-[10px] text-[#4A3AFF] font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Terpilih (Rp {selectedIngredientMaterial.usageUnitPrice}/{selectedIngredientMaterial.usageUnit})
                          </span>
                        )}
                      </label>

                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6B88] pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Ketik nama atau kode bahan (e.g. Beras, Daging, BB-001)..."
                          value={ingredientSearchQuery}
                          onChange={(e) => {
                            setIngredientSearchQuery(e.target.value);
                            if (!isIngredientSearchOpen) setIsIngredientSearchOpen(true);
                            if (newIngredientMatId && e.target.value !== `[${selectedIngredientMaterial?.code}] ${selectedIngredientMaterial?.name}`) {
                              setNewIngredientMatId("");
                            }
                          }}
                          onFocus={() => {
                            setIsIngredientSearchOpen(true);
                          }}
                          onKeyDown={(e) => {
                            if (!isIngredientSearchOpen) {
                              if (e.key === "ArrowDown" || e.key === "Enter") {
                                setIsIngredientSearchOpen(true);
                              }
                              return;
                            }
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setHighlightedIngredientIndex((prev) =>
                                prev < filteredIngredientSuggestions.length - 1 ? prev + 1 : 0
                              );
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setHighlightedIngredientIndex((prev) =>
                                prev > 0 ? prev - 1 : filteredIngredientSuggestions.length - 1
                              );
                            } else if (e.key === "Enter" && highlightedIngredientIndex >= 0) {
                              e.preventDefault();
                              const selected = filteredIngredientSuggestions[highlightedIngredientIndex];
                              if (selected) {
                                handleSelectIngredientFromSearch(selected);
                              }
                            } else if (e.key === "Escape") {
                              setIsIngredientSearchOpen(false);
                            }
                          }}
                          className="w-full pl-9 pr-8 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/15 transition-all shadow-xs"
                        />
                        {ingredientSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setIngredientSearchQuery("");
                              setNewIngredientMatId("");
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                            title="Hapus pencarian"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Floating Suggestions Dropdown with Debounce Results */}
                      {isIngredientSearchOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-[#E6E3F7] rounded-[14px] shadow-2xl overflow-hidden animate-fadeIn max-h-64 overflow-y-auto divide-y divide-[#E6E3F7]/50">
                          <div className="px-3 py-1.5 bg-[#F8F7FD] border-b border-[#E6E3F7] flex items-center justify-between text-[10.5px] font-bold text-[#6F6B88]">
                            <span>
                              {filteredIngredientSuggestions.length > 0
                                ? `${filteredIngredientSuggestions.length} Pilihan Bahan Baku`
                                : "Tidak ditemukan"}
                            </span>
                            <span className="text-[10px] font-normal text-[#6F6B88]">
                              {debouncedIngredientQuery ? `Filter: "${debouncedIngredientQuery}"` : "Saran Populer"}
                            </span>
                          </div>

                          {filteredIngredientSuggestions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-[#6F6B88]">
                              Tidak ada bahan baku yang cocok dengan <strong>&quot;{debouncedIngredientQuery}&quot;</strong>.
                            </div>
                          ) : (
                            filteredIngredientSuggestions.map((m, idx) => {
                              const isSelected = newIngredientMatId === m.id;
                              const isHighlighted = highlightedIngredientIndex === idx;
                              const isAlreadyInRecipe = activeRecipe.ingredients.some((i) => i.rawMaterialId === m.id);

                              return (
                                <div
                                  key={m.id}
                                  onClick={() => handleSelectIngredientFromSearch(m)}
                                  className={`p-2.5 px-3 flex items-center justify-between transition-colors cursor-pointer ${
                                    isHighlighted || isSelected
                                      ? "bg-[#F5F3FF]"
                                      : "hover:bg-[#F8F7FD]"
                                  } ${isAlreadyInRecipe ? "opacity-45 bg-gray-50 cursor-not-allowed" : ""}`}
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#EBF7FC] text-[#0090D0]">
                                        {m.code}
                                      </span>
                                      <span className="font-bold text-xs text-[#1C1B3A]">{m.name}</span>
                                      {isAlreadyInRecipe && (
                                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-gray-200 text-gray-600">
                                          Sudah di Resep
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10.5px] text-[#6F6B88]">
                                      Kategori: <span className="font-medium text-[#1C1B3A]">{m.categoryName}</span> &bull; Stok Fisik:{" "}
                                      <span className="font-bold text-[#1C1B3A]">{m.currentStock.toLocaleString("id-ID")} {m.usageUnit}</span>
                                    </p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-extrabold text-[#4A3AFF]">
                                      Rp {m.usageUnitPrice.toLocaleString("id-ID")}
                                    </span>
                                    <span className="block text-[10px] text-[#6F6B88]">/{m.usageUnit}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold text-[#6F6B88]">
                        Takaran / Porsi ({selectedIngredientMaterial?.usageUnit || "satuan"})
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        placeholder="10"
                        value={newIngredientAmount || ""}
                        onChange={(e) => setNewIngredientAmount(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={handleAddIngredientToRecipe}
                        className="w-full py-2 px-3 rounded-[10px] bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table of BOM Ingredients */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                        <th className="py-2.5 px-3 rounded-l-[10px]">No</th>
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Nama Bahan Baku</th>
                        <th className="py-2.5 px-3 text-center">Takaran / Porsi</th>
                        <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                        <th className="py-2.5 px-3 text-right">Subtotal HPP</th>
                        <th className="py-2.5 px-3 text-right">% Biaya</th>
                        <th className="py-2.5 px-3 text-center rounded-r-[10px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E3F7]/60">
                      {activeRecipe.ingredients.map((ing, idx) => (
                        <tr key={ing.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                          <td className="py-3 px-3 font-mono text-center text-[#6F6B88]">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#4A3AFF]">{ing.rawMaterialCode}</td>
                          <td className="py-3 px-3 font-bold text-[#1C1B3A]">{ing.rawMaterialName}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-extrabold text-[#1C1B3A]">{ing.amountPerPortion}</span>{" "}
                            <span className="text-[11px] text-[#6F6B88]">{ing.usageUnit}</span>
                          </td>
                          <td className="py-3 px-3 text-right text-[#6F6B88]">
                            Rp {ing.usageUnitPrice.toLocaleString("id-ID")}/{ing.usageUnit}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-[#1C1B3A]">
                            Rp {ing.subtotalCogs.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                              {ing.costPercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleRemoveIngredientFromRecipe(ing.id)}
                              className="p-1.5 rounded-full hover:bg-red-50 text-[#6F6B88] hover:text-red-600 transition-colors cursor-pointer"
                              title="Hapus bahan dari resep"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#1C1B3A] bg-[#F5F3FF] font-extrabold text-[#1C1B3A]">
                        <td colSpan={5} className="py-3 px-3 text-right text-xs uppercase tracking-wide">
                          Total HPP Bahan Baku ({activeRecipe.menuName})
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-[#4A3AFF]">
                          Rp {activeRecipe.totalCogs.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right text-xs">100%</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MASTER BAHAN BAKU & KONVERSI SATUAN                               */}
      {/* ========================================================================= */}
      {activeTab === "RAW_MATERIALS" && (
        <div className="space-y-6">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-[#6F6B88]">
                <span>Total Bahan Terdaftar</span>
                <Boxes className="w-4 h-4 text-[#4A3AFF]" />
              </div>
              <p className="text-2xl font-extrabold text-[#1C1B3A]">{rawMaterialStats.totalItems}</p>
              <p className="text-[10.5px] text-[#2DBA7D] font-bold">100% Aktif Digunakan</p>
            </div>

            <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-[#6F6B88]">
                <span>Total Nilai Aset Stok Fisik</span>
                <DollarSign className="w-4 h-4 text-[#2DBA7D]" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-[#2DBA7D]">
                Rp {rawMaterialStats.totalAssetValue.toLocaleString("id-ID")}
              </p>
              <p className="text-[10.5px] text-[#6F6B88]">Gudang &amp; Chiller Dapur BIT</p>
            </div>

            <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-[#6F6B88]">
                <span>Stok Menipis (&le; Safety)</span>
                <AlertCircle className="w-4 h-4 text-[#FFB547]" />
              </div>
              <p className="text-2xl font-extrabold text-[#FFB547]">{rawMaterialStats.lowStockCount}</p>
              <p className="text-[10.5px] text-[#FFB547] font-bold">Perlu Re-Order Segera</p>
            </div>

            <div className="bg-white p-5 rounded-[20px] border border-[#E6E3F7] shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-[#6F6B88]">
                <span>Stok Habis (0)</span>
                <X className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-extrabold text-red-600">{rawMaterialStats.outOfStockCount}</p>
              <p className="text-[10.5px] text-red-500 font-bold">Segera Terbitkan PO</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6F6B88]" />
                  <input
                    type="text"
                    placeholder="Cari kode, nama bahan, barcode..."
                    value={rawMaterialSearch}
                    onChange={(e) => setRawMaterialSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E6E3F7] bg-[#F8F7FD] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] focus:bg-white"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={rawMaterialCatFilter}
                  onChange={(e) => setRawMaterialCatFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-full border border-[#E6E3F7] bg-[#F8F7FD] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] font-medium"
                >
                  <option value="ALL">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Stock Status Filter */}
                <select
                  value={rawMaterialStockFilter}
                  onChange={(e) => setRawMaterialStockFilter(e.target.value as any)}
                  className="px-3.5 py-2 rounded-full border border-[#E6E3F7] bg-[#F8F7FD] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] font-medium"
                >
                  <option value="ALL">Semua Status Stok</option>
                  <option value="SAFE">🟢 Stok Aman</option>
                  <option value="LOW">🟡 Stok Menipis</option>
                  <option value="OUT">🔴 Stok Habis</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAddMaterialModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-sm shadow-[#4A3AFF]/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bahan Baru</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                    <th className="py-3 px-3 rounded-l-[10px]">Kode</th>
                    <th className="py-3 px-3">Nama Bahan Baku</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-center">Satuan Beli</th>
                    <th className="py-3 px-3 text-center">Konversi</th>
                    <th className="py-3 px-3 text-right">Harga Beli</th>
                    <th className="py-3 px-3 text-right">HPP Satuan Pakai</th>
                    <th className="py-3 px-3 text-right">Stok Fisik Aktif</th>
                    <th className="py-3 px-3 text-center">Status Stok</th>
                    <th className="py-3 px-3">Supplier Utama</th>
                    <th className="py-3 px-3 text-center rounded-r-[10px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]/60">
                  {filteredRawMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-xs text-[#6F6B88]">
                        Tidak ada bahan baku yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredRawMaterials.map((mat) => {
                      const isLow = mat.currentStock <= mat.minStock && mat.currentStock > 0;
                      const isOut = mat.currentStock <= 0;
                      return (
                        <tr key={mat.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#4A3AFF]">{mat.code}</td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-[#1C1B3A]">{mat.name}</p>
                            {mat.specificationNotes && (
                              <p className="text-[10px] text-[#6F6B88] line-clamp-1">{mat.specificationNotes}</p>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[#6F6B88]">{mat.categoryName}</td>
                          <td className="py-3 px-3 text-center font-medium text-[#1C1B3A]">{mat.purchaseUnit}</td>
                          <td className="py-3 px-3 text-center text-[11px] font-mono text-[#4A3AFF]">
                            1 : {mat.unitRatio} {mat.usageUnit}
                          </td>
                          <td className="py-3 px-3 text-right text-[#1C1B3A] font-medium">
                            Rp {mat.lastPurchasePrice.toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-[#1C1B3A]">
                            Rp {mat.usageUnitPrice.toLocaleString("id-ID")}/<span className="text-[10px] text-[#6F6B88]">{mat.usageUnit}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-extrabold text-[#1C1B3A]">
                              {mat.currentStock.toLocaleString("id-ID")}
                            </span>{" "}
                            <span className="text-[10.5px] text-[#6F6B88]">{mat.usageUnit}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                isOut
                                  ? "bg-red-100 text-red-700"
                                  : isLow
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {isOut ? "🔴 Habis" : isLow ? "🟡 Menipis" : "🟢 Aman"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#6F6B88] text-[11px]">{mat.supplierName || "-"}</td>
                          <td className="py-3 px-3 text-center">
                            <Link
                              href={`/production/mutations?materialId=${encodeURIComponent(mat.id)}`}
                              className="inline-block px-2.5 py-1 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] text-[10.5px] font-bold transition-all cursor-pointer"
                              title="Lihat Kartu Stok & Riwayat Mutasi"
                            >
                              Mutasi
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PO PEMBELIAN BAHAN BAKU (PURCHASE ORDERS)                         */}
      {/* ========================================================================= */}
      {activeTab === "PURCHASE_ORDERS" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">
                  Daftar Purchase Order (PO) Bahan Baku
                </h3>
                <p className="text-xs text-[#6F6B88]">
                  Surat pesanan pengadaan bahan baku resmi kepada mitra supplier dan distributor.
                </p>
              </div>
              <button
                onClick={() => setShowCreatePoModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-sm shadow-[#4A3AFF]/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Surat PO Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                    <th className="py-3 px-3 rounded-l-[10px]">Nomor PO</th>
                    <th className="py-3 px-3">Tanggal PO</th>
                    <th className="py-3 px-3">Supplier Rekanan</th>
                    <th className="py-3 px-3">Lokasi Penerimaan</th>
                    <th className="py-3 px-3 text-center">Jumlah Item</th>
                    <th className="py-3 px-3 text-right">Grand Total (Rp)</th>
                    <th className="py-3 px-3 text-center">Status PO</th>
                    <th className="py-3 px-3 text-center rounded-r-[10px]">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]/60">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#4A3AFF]">{po.poNumber}</td>
                      <td className="py-3 px-3 text-[#1C1B3A]">{po.orderDate}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#1C1B3A]">{po.supplierName}</p>
                        <p className="text-[10.5px] text-[#6F6B88]">{po.supplierPhone}</p>
                      </td>
                      <td className="py-3 px-3 text-[#6F6B88] text-[11px]">{po.location}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#1C1B3A]">
                        {po.items.length} Macam Bahan
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-[#1C1B3A]">
                        Rp {po.grandTotal.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            po.status === "RECEIVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : po.status === "SENT"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {po.status === "RECEIVED" ? "✓ DITERIMA LENGKAP" : po.status === "SENT" ? "TERKIRIM KE SUPPLIER" : "DRAFT"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingPo(po)}
                            className="p-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] transition-colors cursor-pointer"
                            title="Lihat Rincian Item PO"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExportPoReport(po)}
                            className="p-1.5 rounded-full bg-[#EBF7FC] hover:bg-[#0090D0] hover:text-white text-[#0090D0] transition-colors cursor-pointer"
                            title="Cetak Surat PO Resmi (PDF)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
      {/* TAB 4: FAKTUR PEMBELIAN & PENERIMAAN STOK (PURCHASES)                     */}
      {/* ========================================================================= */}
      {activeTab === "PURCHASES" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">
                  Faktur Pembelian &amp; Penerimaan Bahan Baku
                </h3>
                <p className="text-xs text-[#6F6B88]">
                  Pencatatan barang fisik yang masuk ke dapur/gudang kantin yang secara otomatis menambah saldo stok.
                </p>
              </div>
              <button
                onClick={() => setShowCreatePurchaseModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2DBA7D] hover:bg-[#25A26C] text-white text-xs font-bold shadow-sm shadow-[#2DBA7D]/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Pembelian Masuk</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                    <th className="py-3 px-3 rounded-l-[10px]">No Faktur</th>
                    <th className="py-3 px-3">Waktu Penerimaan</th>
                    <th className="py-3 px-3">Ref PO</th>
                    <th className="py-3 px-3">Supplier</th>
                    <th className="py-3 px-3">Metode Bayar</th>
                    <th className="py-3 px-3 text-right">Total Belanja (Rp)</th>
                    <th className="py-3 px-3 text-right">Dibayar (Rp)</th>
                    <th className="py-3 px-3 text-center">Status Hutang</th>
                    <th className="py-3 px-3 text-center rounded-r-[10px]">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]/60">
                  {purchases.map((pur) => (
                    <tr key={pur.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#4A3AFF]">{pur.invoiceNumber}</td>
                      <td className="py-3 px-3 text-[#1C1B3A]">{pur.purchaseDate}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#6F6B88]">{pur.poNumber || "Pembelian Langsung"}</td>
                      <td className="py-3 px-3 font-bold text-[#1C1B3A]">{pur.supplierName}</td>
                      <td className="py-3 px-3 text-[#6F6B88]">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                          {pur.paymentType === "TUNAI_KAS_DAPUR"
                            ? "Tunai Kas Dapur"
                            : pur.paymentType === "TRANSFER_KOPERASI"
                            ? "Transfer Koperasi"
                            : "Tempo Hutang"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-[#1C1B3A]">
                        Rp {pur.grandTotal.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-right text-[#2DBA7D] font-bold">
                        Rp {pur.amountPaid.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {pur.amountDue > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Hutang Rp {pur.amountDue.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            ✓ LUNAS
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingPurchase(pur)}
                            className="p-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] transition-colors cursor-pointer"
                            title="Lihat Rincian Faktur"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExportPurchaseReport(pur)}
                            className="p-1.5 rounded-full bg-[#EBF7FC] hover:bg-[#0090D0] hover:text-white text-[#0090D0] transition-colors cursor-pointer"
                            title="Cetak Faktur & Bukti Penerimaan (PDF)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
      {/* TAB 5: PENGGUNAAN BAHAN BAKU / SESI MASAK (USAGE)                        */}
      {/* ========================================================================= */}
      {activeTab === "USAGE" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">
                  Riwayat Penggunaan Bahan Baku &amp; Sesi Masak
                </h3>
                <p className="text-xs text-[#6F6B88]">
                  Log pemakaian bahan baku saat sesi masak jam istirahat pabrik (Shift 1 &amp; Shift 2).
                </p>
              </div>
              <button
                onClick={() => setShowCookingSessionModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-sm shadow-[#4A3AFF]/20 transition-all cursor-pointer shrink-0"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Mulai Sesi Masak Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                    <th className="py-3 px-3 rounded-l-[10px]">No Pemakaian</th>
                    <th className="py-3 px-3">Waktu Sesi</th>
                    <th className="py-3 px-3">Batch / Menu Diolah</th>
                    <th className="py-3 px-3 text-center">Porsi</th>
                    <th className="py-3 px-3">Shift &amp; Chef PIC</th>
                    <th className="py-3 px-3 text-center">Item Bahan Terpakai</th>
                    <th className="py-3 px-3 text-right">Total Biaya Bahan (Rp)</th>
                    <th className="py-3 px-3 text-center rounded-r-[10px]">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]/60">
                  {usages.map((usg) => (
                    <tr key={usg.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#4A3AFF]">{usg.usageNumber}</td>
                      <td className="py-3 px-3 text-[#1C1B3A]">{usg.usageDate}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#1C1B3A]">{usg.menuName || "Pemakaian Bebas"}</p>
                        <p className="text-[10.5px] font-mono text-[#6F6B88]">{usg.batchCode}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-extrabold text-[#1C1B3A]">{usg.portionCount || "-"}</span> Porsi
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {usg.shift === "SHIFT_1" ? "Shift Pagi (1)" : "Shift Sore (2)"}
                        </span>
                        <p className="text-[11px] text-[#1C1B3A] font-medium mt-0.5">{usg.cookPic}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#1C1B3A]">
                        {usg.items.length} Bahan
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-[#4A3AFF]">
                        Rp {usg.totalUsageCost.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => showToast(`Rincian sesi masak ${usg.usageNumber} (${usg.menuName || "BOM"}) siap dicetak.`, "info")}
                          className="p-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] transition-colors cursor-pointer"
                          title="Lihat Komposisi yang Dipakai"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
      {/* TAB 6: STOK OPNAME & REKONSILIASI FISIK                                  */}
      {/* ========================================================================= */}
      {activeTab === "STOCK_OPNAME" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">
                  Audit Stok Opname &amp; Rekonsiliasi Fisik Dapur
                </h3>
                <p className="text-xs text-[#6F6B88]">
                  Pemeriksaan fisik mingguan/bulanan untuk mencocokkan stok buku sistem dengan stok nyata di rak/chiller.
                </p>
              </div>
              <button
                onClick={handleOpenStockOpname}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-sm shadow-[#4A3AFF]/20 transition-all cursor-pointer shrink-0"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Mulai Audit Stok Opname</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                    <th className="py-3 px-3 rounded-l-[10px]">No Berita Acara</th>
                    <th className="py-3 px-3">Tanggal &amp; Waktu</th>
                    <th className="py-3 px-3">Auditor Pelaksana</th>
                    <th className="py-3 px-3 text-right">Nilai Stok Sistem</th>
                    <th className="py-3 px-3 text-right">Nilai Stok Fisik</th>
                    <th className="py-3 px-3 text-right">Selisih (Variance)</th>
                    <th className="py-3 px-3 text-center">Status Audit</th>
                    <th className="py-3 px-3 text-center rounded-r-[10px]">Cetak Berita Acara</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]/60">
                  {stockOpnames.map((so) => (
                    <tr key={so.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#4A3AFF]">{so.opnameNumber}</td>
                      <td className="py-3 px-3 text-[#1C1B3A]">{so.opnameDate}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-[#1C1B3A]">{so.auditorName}</p>
                        <p className="text-[10.5px] text-[#6F6B88]">Saksi: {so.shiftPic}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-[#1C1B3A]">
                        Rp {so.totalSystemValue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#2DBA7D]">
                        Rp {so.totalPhysicalValue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-red-600">
                        Rp {so.totalVarianceValue.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          ✓ SALDO DISESUAIKAN
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleExportStockOpnameReport(so)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] text-xs font-bold transition-all mx-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak PDF</span>
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
      {/* TAB 7: KARTU STOK & BUKU BESAR MUTASI                                    */}
      {/* ========================================================================= */}
      {activeTab === "STOCK_MUTATIONS" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">
                  Kartu Stok &amp; Riwayat Mutasi Bahan Baku
                </h3>
                <p className="text-xs text-[#6F6B88]">
                  Audit trail pergerakan saldo persediaan (Pembelian Masuk, Pemakaian Dapur, dan Penyesuaian Opname).
                </p>
              </div>

              {/* Material Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[#6F6B88]">Pilih Bahan:</label>
                <select
                  value={selectedMutationMaterialId}
                  onChange={(e) => setSelectedMutationMaterialId(e.target.value)}
                  className="px-3.5 py-2 rounded-full border border-[#E6E3F7] bg-[#F8F7FD] text-xs font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                >
                  <option value="ALL">-- Semua Mutasi Bahan Baku --</option>
                  {rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                    <th className="py-3 px-3 rounded-l-[10px]">Waktu Mutasi</th>
                    <th className="py-3 px-3">No Referensi</th>
                    <th className="py-3 px-3">Nama Bahan Baku</th>
                    <th className="py-3 px-3 text-center">Jenis Mutasi</th>
                    <th className="py-3 px-3 text-right">Qty Masuk (+)</th>
                    <th className="py-3 px-3 text-right">Qty Keluar (-)</th>
                    <th className="py-3 px-3 text-right font-extrabold">Saldo Akhir</th>
                    <th className="py-3 px-3">PIC / Petugas</th>
                    <th className="py-3 px-3 rounded-r-[10px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]/60">
                  {mutations
                    .filter((mut) => selectedMutationMaterialId === "ALL" || mut.rawMaterialId === selectedMutationMaterialId)
                    .map((mut) => (
                      <tr key={mut.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                        <td className="py-3 px-3 text-[#1C1B3A]">{mut.timestamp}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#4A3AFF]">{mut.referenceNumber}</td>
                        <td className="py-3 px-3 font-bold text-[#1C1B3A]">{mut.rawMaterialName}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              mut.mutationType === "PEMBELIAN_MASUK"
                                ? "bg-emerald-100 text-emerald-800"
                                : mut.mutationType === "PENGGUNAAN_DAPUR"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {mut.mutationType === "PEMBELIAN_MASUK"
                              ? "⬇ MASUK (BELI)"
                              : mut.mutationType === "PENGGUNAAN_DAPUR"
                              ? "⬆ KELUAR (MASAK)"
                              : "⚖ PENYESUAIAN"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#2DBA7D]">
                          {mut.qtyIn > 0 ? `+${mut.qtyIn.toLocaleString("id-ID")} ${mut.unit}` : "-"}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-red-600">
                          {mut.qtyOut > 0 ? `-${mut.qtyOut.toLocaleString("id-ID")} ${mut.unit}` : "-"}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-[#1C1B3A] bg-[#F5F3FF]/50">
                          {mut.endingBalance.toLocaleString("id-ID")} {mut.unit}
                        </td>
                        <td className="py-3 px-3 text-[#6F6B88] font-medium">{mut.pic}</td>
                        <td className="py-3 px-3 text-[11px] text-[#6F6B88]">{mut.notes}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: KATEGORI & SUPPLIER                                               */}
      {/* ========================================================================= */}
      {activeTab === "CATEGORIES_SUPPLIERS" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Section */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">Kategori Bahan Baku</h3>
                <p className="text-xs text-[#6F6B88]">Pemetaan akun COA persediaan &amp; beban HPP</p>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-sm shadow-[#4A3AFF]/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E3F7] text-[#6F6B88] font-bold bg-[#F8F7FD]">
                    <th className="py-2.5 px-3 rounded-l-[10px]">Kode / Nama</th>
                    <th className="py-2.5 px-3">Akun Persediaan</th>
                    <th className="py-2.5 px-3">Akun Beban (COGS)</th>
                    <th className="py-2.5 px-3 text-center">Bahan Terkait</th>
                    <th className="py-2.5 px-3 text-center rounded-r-[10px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E3F7]/60">
                  {categories.map((c) => {
                    const linkedCount = rawMaterials.filter((m) => m.categoryId === c.id).length;
                    return (
                      <tr key={c.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#1C1B3A]">{c.name}</p>
                          <p className="text-[10px] text-[#6F6B88] line-clamp-1">{c.description}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#4A3AFF]">{c.inventoryAccountCode}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2DBA7D]">{c.expenseAccountCode}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF] text-[10.5px] font-bold">
                            {linkedCount} Bahan
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditCategory(c)}
                              className="p-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] transition-colors cursor-pointer"
                              title="Edit Kategori"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c)}
                              className="p-1.5 rounded-full bg-red-50 hover:bg-red-600 hover:text-white text-red-500 transition-colors cursor-pointer"
                              title="Hapus Kategori"
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

          {/* Suppliers Section */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E6E3F7] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E3F7] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">Mitra Supplier Rekanan</h3>
                <p className="text-xs text-[#6F6B88]">Pemasok bahan baku dapur kantin BIT</p>
              </div>
              <button
                onClick={handleOpenAddSupplier}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2DBA7D] hover:bg-[#25A26C] text-white text-xs font-bold shadow-sm shadow-[#2DBA7D]/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Supplier</span>
              </button>
            </div>

            <div className="space-y-3">
              {suppliers.map((s) => {
                const linkedCount = rawMaterials.filter((m) => m.supplierId === s.id).length;
                return (
                  <div key={s.id} className="p-3.5 rounded-[16px] border border-[#E6E3F7] hover:border-[#4A3AFF]/50 transition-all bg-[#FAFAFE] space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5F3FF] text-[#4A3AFF]">
                            {s.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {s.supplierType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Termin: {s.paymentTermDays === 0 ? "COD / Tunai" : `${s.paymentTermDays} Hari`}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1C1B3A] mt-1.5">{s.name}</h4>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditSupplier(s)}
                          className="p-1.5 rounded-full bg-white border border-[#E6E3F7] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] transition-colors cursor-pointer shadow-2xs"
                          title="Edit Data Supplier"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(s)}
                          className="p-1.5 rounded-full bg-white border border-[#E6E3F7] hover:bg-red-600 hover:text-white text-red-500 transition-colors cursor-pointer shadow-2xs"
                          title="Hapus Supplier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6F6B88]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#4A3AFF] shrink-0" />
                        <span>{s.phone} ({s.contactPerson})</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#4A3AFF] shrink-0" />
                        <span className="truncate">{s.address}, {s.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-[#E6E3F7]/60">
                      <span className="text-[#6F6B88] italic truncate">{s.notes || "Mitra pengadaan terverifikasi"}</span>
                      <span className="font-bold text-[#4A3AFF] shrink-0 ml-2">
                        {linkedCount} Bahan Dipasok
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH BAHAN BAKU BARU                                          */}
      {/* ========================================================================= */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    Tambah Master Bahan Baku Baru
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Konfigurasi satuan beli ke satuan keluar/pakai &amp; hitung HPP otomatis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRawMaterial} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Kode Bahan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Auto: BB-038"
                    value={newMatCode}
                    onChange={(e) => setNewMatCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Nama Bahan Baku *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Daging Sapi Giling Super"
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Kategori Bahan</label>
                  <select
                    value={newMatCatId}
                    onChange={(e) => setNewMatCatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Supplier Utama</label>
                  <select
                    value={newMatSupplierId}
                    onChange={(e) => setNewMatSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Calculator Box */}
              <div className="p-4 rounded-[18px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-3">
                <p className="text-xs font-bold text-[#4A3AFF] flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>Kalkulator Konversi Satuan &amp; HPP Pemakaian</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#6F6B88]">Satuan Beli (Kemasan)</label>
                    <input
                      type="text"
                      placeholder="e.g. Kg, Sak, Dus"
                      value={newMatPurchaseUnit}
                      onChange={(e) => setNewMatPurchaseUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#6F6B88]">Isi Satuan (Rasio)</label>
                    <input
                      type="number"
                      min="1"
                      value={newMatUnitRatio || ""}
                      onChange={(e) => setNewMatUnitRatio(e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#6F6B88]">Satuan Keluar/Pakai</label>
                    <input
                      type="text"
                      placeholder="e.g. gram, ml, pcs"
                      value={newMatUsageUnit}
                      onChange={(e) => setNewMatUsageUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#6F6B88]">
                      Harga Beli per {newMatPurchaseUnit} (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newMatLastPurchasePrice || ""}
                      onChange={(e) => setNewMatLastPurchasePrice(e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] font-bold"
                    />
                  </div>

                  <div className="p-3 rounded-[10px] bg-white border border-[#E6E3F7] flex flex-col justify-center">
                    <span className="text-[10px] text-[#6F6B88]">Otomatis HPP / Satuan Pakai:</span>
                    <span className="text-sm font-extrabold text-[#4A3AFF]">
                      Rp {calculatedUsageUnitPrice.toLocaleString("id-ID")} / {newMatUsageUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">
                    Stok Minimum (Safety Stock - {newMatUsageUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMatMinStock || ""}
                    onChange={(e) => setNewMatMinStock(e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">
                    Saldo Stok Awal ({newMatUsageUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMatInitialStock || ""}
                    onChange={(e) => setNewMatInitialStock(e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6E3F7] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6E3F7] text-xs font-bold text-[#6F6B88] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-md shadow-[#4A3AFF]/20 cursor-pointer"
                >
                  Simpan Bahan Baku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SESI MASAK MENU (BATCH COOKING AUTO-DEDUCT)                      */}
      {/* ========================================================================= */}
      {showCookingSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-3xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    Sesi Pengolahan &amp; Masak Menu Kantin (Batch Cooking)
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Sistem otomatis mengalikan komposisi resep x jumlah porsi dan memotong saldo stok.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCookingSessionModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Batch Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Pilih Menu Olahan</label>
                  <select
                    value={cookRecipeId}
                    onChange={(e) => setCookRecipeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] text-xs font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.menuCode}] {r.menuName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Jumlah Porsi yang Dimasak</label>
                  <input
                    type="number"
                    min="1"
                    value={cookPortionCount}
                    onChange={(e) => setCookPortionCount(e.target.value === "" ? 1 : parseInt(e.target.value) || 1)}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] text-xs font-extrabold text-[#4A3AFF] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Jadwal Shift Dapur</label>
                  <select
                    value={cookShift}
                    onChange={(e) => setCookShift(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  >
                    <option value="SHIFT_1">Shift 1 (Pagi 06:30 - 14:00)</option>
                    <option value="SHIFT_2">Shift 2 (Sore 14:00 - 21:00)</option>
                    <option value="GENERAL">General / Lembur</option>
                  </select>
                </div>
              </div>

              {/* Cook PIC & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Chef / Koki Penanggung Jawab</label>
                  <input
                    type="text"
                    value={cookChefPic}
                    onChange={(e) => setCookChefPic(e.target.value)}
                    className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] text-xs text-[#1C1B3A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Catatan Sesi Masak (Opsional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Persiapan jam makan siang 200 karyawan Shift 1"
                    value={cookNotes}
                    onChange={(e) => setCookNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] text-xs text-[#1C1B3A]"
                  />
                </div>
              </div>

              {/* Calculation Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1B3A]">
                    Rincian Kebutuhan Bahan Baku ({cookPortionCount} Porsi {selectedCookRecipe.menuName})
                  </span>
                  <span className="text-xs font-extrabold text-[#4A3AFF]">
                    Total Biaya HPP: Rp {totalCookBatchCost.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#E6E3F7] rounded-[16px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8F7FD] border-b border-[#E6E3F7] text-[#6F6B88] font-bold">
                        <th className="py-2.5 px-3">Bahan Baku</th>
                        <th className="py-2.5 px-3 text-center">Per Porsi</th>
                        <th className="py-2.5 px-3 text-center font-extrabold text-[#1C1B3A]">Total Diambil</th>
                        <th className="py-2.5 px-3 text-right">Stok Saat Ini</th>
                        <th className="py-2.5 px-3 text-right">Sisa Setelah Masak</th>
                        <th className="py-2.5 px-3 text-center">Kecukupan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E3F7]/60">
                      {previewCookRequirements.map((req) => (
                        <tr key={req.rawMaterialId} className="hover:bg-[#F5F3FF]/40">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-[#1C1B3A]">{req.rawMaterialName}</span>
                            <span className="block text-[10px] text-[#6F6B88]">Rp {req.usageUnitPrice}/{req.usageUnit}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-[#6F6B88]">
                            {req.amountPerPortion} {req.usageUnit}
                          </td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-[#4A3AFF]">
                            {req.totalAmount.toLocaleString("id-ID")} {req.usageUnit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#1C1B3A]">
                            {req.currentStock.toLocaleString("id-ID")} {req.usageUnit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#1C1B3A]">
                            {req.stockAfter.toLocaleString("id-ID")} {req.usageUnit}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {req.isSufficient ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                ✓ Cukup
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                ✕ Kurang
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E3F7] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCookingSessionModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6E3F7] text-xs font-bold text-[#6F6B88] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBatchCooking}
                  className="px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-md shadow-[#4A3AFF]/20 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Mulai Masak &amp; Potong Stok Bahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STOK OPNAME ENTRY SHEET                                         */}
      {/* ========================================================================= */}
      {showStockOpnameModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-4xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[94vh]">
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    Formulir Audit Stok Opname Fisik Dapur Kantin
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Masukkan kuantitas fisik nyata hasil penimbangan di dapur untuk mencatat selisih (*shrinkage/waste*).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStockOpnameModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Nama Petugas Auditor</label>
                  <input
                    type="text"
                    value={opnameAuditor}
                    onChange={(e) => setOpnameAuditor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[10px] border border-[#E6E3F7] text-xs text-[#1C1B3A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Lokasi Audit</label>
                  <input
                    type="text"
                    readOnly
                    value="Dapur & Gudang Bahan Kantin Pabrik BIT (Lt. 1)"
                    className="w-full px-3.5 py-2 rounded-[10px] border border-[#E6E3F7] bg-[#F8F7FD] text-xs text-[#6F6B88]"
                  />
                </div>
              </div>

              {/* Table of Materials for Opname Entry */}
              <div className="overflow-x-auto border border-[#E6E3F7] rounded-[16px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F7FD] border-b border-[#E6E3F7] text-[#6F6B88] font-bold">
                      <th className="py-2.5 px-3">Kode / Nama Bahan</th>
                      <th className="py-2.5 px-3 text-right">Stok Sistem</th>
                      <th className="py-2.5 px-3 text-center w-36">Stok Fisik Nyata</th>
                      <th className="py-2.5 px-3 text-right">Selisih Qty</th>
                      <th className="py-2.5 px-3 text-right">Selisih (Rp)</th>
                      <th className="py-2.5 px-3">Alasan / Catatan Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E3F7]/60">
                    {rawMaterials.map((mat) => {
                      const physical =
                        opnamePhysicalInputs[mat.id] !== undefined
                          ? opnamePhysicalInputs[mat.id]
                          : mat.currentStock;
                      const varianceQty = physical - mat.currentStock;
                      const varianceVal = Math.round(varianceQty * mat.usageUnitPrice);

                      return (
                        <tr key={mat.id} className="hover:bg-[#F5F3FF]/40">
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-[#4A3AFF] block text-[10px]">{mat.code}</span>
                            <span className="font-bold text-[#1C1B3A]">{mat.name}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-[#6F6B88]">
                            {mat.currentStock.toLocaleString("id-ID")} {mat.usageUnit}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={physical}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                  setOpnamePhysicalInputs({
                                    ...opnamePhysicalInputs,
                                    [mat.id]: val,
                                  });
                                }}
                                onFocus={(e) => e.target.select()}
                                className="w-24 px-2 py-1.5 rounded-[8px] border border-[#E6E3F7] text-center font-extrabold text-[#1C1B3A] text-xs focus:outline-none focus:border-[#4A3AFF]"
                              />
                              <span className="text-[10px] text-[#6F6B88]">{mat.usageUnit}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-bold">
                            {varianceQty === 0 ? (
                              <span className="text-emerald-700">0</span>
                            ) : varianceQty < 0 ? (
                              <span className="text-red-600">{varianceQty}</span>
                            ) : (
                              <span className="text-blue-600">+{varianceQty}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-bold">
                            {varianceVal === 0 ? (
                              <span className="text-emerald-700">Rp 0</span>
                            ) : (
                              <span className={varianceVal < 0 ? "text-red-600" : "text-blue-600"}>
                                Rp {varianceVal.toLocaleString("id-ID")}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={opnameReasons[mat.id] || ""}
                              onChange={(e) =>
                                setOpnameReasons({
                                  ...opnameReasons,
                                  [mat.id]: e.target.value,
                                })
                              }
                              placeholder="Alasan selisih..."
                              className="w-full px-2 py-1 rounded-[8px] border border-[#E6E3F7] text-[11px] text-[#1C1B3A]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-[#E6E3F7] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowStockOpnameModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6E3F7] text-xs font-bold text-[#6F6B88] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyStockOpname}
                  className="px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-md shadow-[#4A3AFF]/20 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan &amp; Terapkan Penyesuaian Saldo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VIEW PO DETAILS                                                  */}
      {/* ========================================================================= */}
      {viewingPo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div>
                <h3 className="font-extrabold text-base text-[#1C1B3A]">
                  Rincian Surat Pesanan (PO: {viewingPo.poNumber})
                </h3>
                <p className="text-xs text-[#6F6B88]">Supplier: {viewingPo.supplierName} &bull; Tgl: {viewingPo.orderDate}</p>
              </div>
              <button
                onClick={() => setViewingPo(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="overflow-x-auto border border-[#E6E3F7] rounded-[16px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F7FD] border-b border-[#E6E3F7] text-[#6F6B88] font-bold">
                      <th className="py-2.5 px-3">Kode</th>
                      <th className="py-2.5 px-3">Nama Bahan</th>
                      <th className="py-2.5 px-3 text-center">Satuan Beli</th>
                      <th className="py-2.5 px-3 text-center">Kuantitas</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E3F7]/60">
                    {viewingPo.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F5F3FF]/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#4A3AFF]">{item.rawMaterialCode}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1C1B3A]">{item.rawMaterialName}</td>
                        <td className="py-2.5 px-3 text-center text-[#6F6B88]">{item.purchaseUnit}</td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-[#1C1B3A]">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">Rp {item.unitPrice.toLocaleString("id-ID")}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-[#1C1B3A]">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#1C1B3A] bg-[#F5F3FF] font-extrabold text-[#1C1B3A]">
                      <td colSpan={5} className="py-2.5 px-3 text-right text-xs">GRAND TOTAL PO:</td>
                      <td className="py-2.5 px-3 text-right text-sm text-[#4A3AFF]">
                        Rp {viewingPo.grandTotal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-[#E6E3F7] flex items-center justify-between">
              <button
                onClick={() => handleExportPoReport(viewingPo)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EBF7FC] hover:bg-[#0090D0] hover:text-white text-[#0090D0] text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Surat PO Resmi (PDF)</span>
              </button>
              <button
                onClick={() => setViewingPo(null)}
                className="px-6 py-2 rounded-full bg-[#1C1B3A] text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CREATE PURCHASE ORDER (SURAT PO BARU)                             */}
      {/* ========================================================================= */}
      {showCreatePoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-4xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[94vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    Buat Surat Pesanan Bahan Baku (Purchase Order) Baru
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Terbitkan Surat PO resmi untuk pengadaan bahan baku ke mitra vendor supplier.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreatePoModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreatePurchaseOrder} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* 1. Supplier & Delivery Information */}
                <div className="bg-[#F8F7FD] p-4 rounded-[16px] border border-[#E6E3F7] space-y-3">
                  <h4 className="text-xs font-extrabold text-[#1C1B3A] flex items-center gap-1.5">
                    <Factory className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    <span>Informasi Mitra Supplier &amp; Pengiriman</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Pilih Supplier Rekanan *</label>
                      <select
                        value={poSupplierId}
                        onChange={(e) => setPoSupplierId(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      >
                        {suppliers.map((sup) => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name} ({sup.supplierType} &bull; {sup.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Tanggal Terbit PO</label>
                      <input
                        type="date"
                        value={poOrderDate}
                        onChange={(e) => setPoOrderDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Estimasi Tiba (Delivery)</label>
                      <input
                        type="date"
                        value={poExpectedDeliveryDate}
                        onChange={(e) => setPoExpectedDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Lokasi Tujuan Penerimaan</label>
                      <input
                        type="text"
                        value={poLocation}
                        onChange={(e) => setPoLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Catatan Instruksi untuk Vendor</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kirim pagi hari sebelum jam 08:00 WIB"
                        value={poNotes}
                        onChange={(e) => setPoNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Order Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#1C1B3A] flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-[#4A3AFF]" />
                        <span>Daftar Item Bahan Baku yang Dipesan ({poItems.length} Macam Bahan)</span>
                      </h4>
                      <p className="text-[10.5px] text-[#6F6B88]">
                        Pilih bahan baku dari katalog, masukkan kuantitas dan harga satuan kesepakatan PO.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPoItem}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] text-xs font-bold border border-[#E6E3F7] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris Bahan</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-[#E6E3F7] rounded-[16px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F8F7FD] border-b border-[#E6E3F7] text-[#6F6B88] font-bold">
                          <th className="py-2.5 px-3">Bahan Baku</th>
                          <th className="py-2.5 px-3 text-center">Satuan Beli</th>
                          <th className="py-2.5 px-3 text-center w-28">Kuantitas</th>
                          <th className="py-2.5 px-3 text-right w-36">Harga Satuan (Rp)</th>
                          <th className="py-2.5 px-3 text-right">Subtotal (Rp)</th>
                          <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E3F7]/60">
                        {poItems.map((item) => {
                          const mat = rawMaterials.find((m) => m.id === item.rawMaterialId) || rawMaterials[0];
                          const subtotal = (item.quantity || 0) * (item.unitPrice || 0);

                          return (
                            <tr key={item.id} className="hover:bg-[#F5F3FF]/30">
                              <td className="py-2.5 px-3 min-w-[240px]">
                                <PurchaseMaterialCombobox
                                  value={item.rawMaterialId}
                                  rawMaterials={rawMaterials}
                                  onSelect={(selectedMat) =>
                                    handlePoItemChange(item.id, "rawMaterialId", selectedMat.id)
                                  }
                                />
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-[#EBF7FC] text-[#0090D0] text-[10px] font-bold">
                                  {mat?.purchaseUnit || "Kg"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handlePoItemChange(item.id, "quantity", e.target.value)
                                  }
                                  onFocus={(e) => e.target.select()}
                                  className="w-full px-2 py-1.5 rounded-[8px] border border-[#E6E3F7] text-center font-extrabold text-[#4A3AFF] text-xs focus:outline-none focus:border-[#4A3AFF]"
                                  required
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="500"
                                  placeholder="0"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    handlePoItemChange(item.id, "unitPrice", e.target.value)
                                  }
                                  onFocus={(e) => e.target.select()}
                                  className="w-full px-2 py-1.5 rounded-[8px] border border-[#E6E3F7] text-right font-bold text-[#1C1B3A] text-xs focus:outline-none focus:border-[#4A3AFF]"
                                  required
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right font-extrabold text-[#1C1B3A]">
                                Rp {subtotal.toLocaleString("id-ID")}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePoItem(item.id)}
                                  disabled={poItems.length <= 1}
                                  className="p-1.5 rounded-full text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Cost Summary & Grand Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3 bg-[#F8F7FD] p-4 rounded-[16px] border border-[#E6E3F7]">
                    <h4 className="text-xs font-extrabold text-[#1C1B3A]">Penyesuaian Biaya (Opsional)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#1C1B3A]">Diskon Khusus Vendor (Rp)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={poDiscountAmount}
                          onChange={(e) => setPoDiscountAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#1C1B3A]">Ongkos Kirim / Kurir (Rp)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={poShippingCost}
                          onChange={(e) => setPoShippingCost(e.target.value === "" ? "" : parseFloat(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1C1B3A] text-white p-5 rounded-[16px] flex flex-col justify-between shadow-lg">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-white/70">
                        <span>Subtotal ({poItems.length} macam item):</span>
                        <span className="font-mono">Rp {poCalculations.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      {Number(poDiscountAmount) > 0 && (
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Diskon Vendor:</span>
                          <span className="font-mono">- Rp {Number(poDiscountAmount).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      {Number(poShippingCost) > 0 && (
                        <div className="flex items-center justify-between text-amber-300">
                          <span>Ongkir / Ekspedisi:</span>
                          <span className="font-mono">+ Rp {Number(poShippingCost).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-white/20 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-white/80">TOTAL SURAT PO:</span>
                      <span className="text-xl sm:text-2xl font-black text-[#FFB547]">
                        Rp {poCalculations.grandTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E6E3F7] flex items-center justify-end gap-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6E3F7] text-xs font-bold text-[#6F6B88] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-md shadow-[#4A3AFF]/20 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terbitkan &amp; Kirim Surat PO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: VIEW PURCHASE INVOICE DETAILS                                    */}
      {/* ========================================================================= */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-3xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2DBA7D] text-white flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    Rincian Faktur Pembelian ({viewingPurchase.invoiceNumber})
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Supplier: {viewingPurchase.supplierName} &bull; Waktu: {viewingPurchase.purchaseDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingPurchase(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#F8F7FD] p-3 rounded-[12px] border border-[#E6E3F7]">
                  <p className="text-[10px] text-[#6F6B88] font-bold uppercase">Mitra Supplier</p>
                  <p className="text-xs font-extrabold text-[#1C1B3A] line-clamp-1">{viewingPurchase.supplierName}</p>
                  <p className="text-[10.5px] text-[#4A3AFF]">{viewingPurchase.supplierPhone || "-"}</p>
                </div>

                <div className="bg-[#F8F7FD] p-3 rounded-[12px] border border-[#E6E3F7]">
                  <p className="text-[10px] text-[#6F6B88] font-bold uppercase">Referensi PO</p>
                  <p className="text-xs font-mono font-extrabold text-[#4A3AFF]">
                    {viewingPurchase.poNumber || "Pembelian Langsung"}
                  </p>
                  <p className="text-[10px] text-[#6F6B88]">Surat Pesanan Dapur</p>
                </div>

                <div className="bg-[#F8F7FD] p-3 rounded-[12px] border border-[#E6E3F7]">
                  <p className="text-[10px] text-[#6F6B88] font-bold uppercase">Metode Pembayaran</p>
                  <p className="text-xs font-bold text-[#1C1B3A]">
                    {viewingPurchase.paymentType === "TUNAI_KAS_DAPUR"
                      ? "Tunai Kas Dapur"
                      : viewingPurchase.paymentType === "TRANSFER_KOPERASI"
                      ? "Transfer Koperasi"
                      : "Tempo / Hutang"}
                  </p>
                  <p className="text-[10px] text-[#6F6B88]">{viewingPurchase.cashBook}</p>
                </div>

                <div className="bg-[#F8F7FD] p-3 rounded-[12px] border border-[#E6E3F7]">
                  <p className="text-[10px] text-[#6F6B88] font-bold uppercase">Status Pembayaran</p>
                  <p className="text-xs font-extrabold">
                    {viewingPurchase.amountDue > 0 ? (
                      <span className="text-red-600">Hutang Rp {viewingPurchase.amountDue.toLocaleString("id-ID")}</span>
                    ) : (
                      <span className="text-[#2DBA7D]">✓ LUNAS</span>
                    )}
                  </p>
                  <p className="text-[10px] text-[#6F6B88]">Dibayar Rp {viewingPurchase.amountPaid.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#1C1B3A] flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    <span>Daftar Bahan Baku Diterima ({viewingPurchase.items.length} Item)</span>
                  </h4>
                  <span className="text-[11px] text-[#6F6B88]">
                    Tujuan: <span className="font-semibold text-[#1C1B3A]">{viewingPurchase.location}</span>
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#E6E3F7] rounded-[16px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8F7FD] border-b border-[#E6E3F7] text-[#6F6B88] font-bold">
                        <th className="py-2.5 px-3">Kode</th>
                        <th className="py-2.5 px-3">Nama Bahan Baku</th>
                        <th className="py-2.5 px-3 text-center">Satuan Beli</th>
                        <th className="py-2.5 px-3 text-center">Qty Diterima</th>
                        <th className="py-2.5 px-3 text-center">Penambahan Stok</th>
                        <th className="py-2.5 px-3 text-right">Harga Beli</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E3F7]/60">
                      {viewingPurchase.items.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F5F3FF]/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#4A3AFF]">{item.rawMaterialCode}</td>
                          <td className="py-2.5 px-3 font-bold text-[#1C1B3A]">{item.rawMaterialName}</td>
                          <td className="py-2.5 px-3 text-center text-[#6F6B88]">{item.purchaseUnit}</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-[#1C1B3A]">
                            {item.quantityReceived} {item.purchaseUnit}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10.5px]">
                              +{item.totalStockAdded.toLocaleString("id-ID")} {item.usageUnit}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">Rp {item.unitPrice.toLocaleString("id-ID")}</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-[#1C1B3A]">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#1C1B3A] bg-[#F5F3FF] font-extrabold text-[#1C1B3A]">
                        <td colSpan={6} className="py-2.5 px-3 text-right text-xs">GRAND TOTAL BELANJA:</td>
                        <td className="py-2.5 px-3 text-right text-sm text-[#4A3AFF]">
                          Rp {viewingPurchase.grandTotal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes & Extra Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-[#F8F7FD] p-3 rounded-[12px] border border-[#E6E3F7] space-y-1">
                  <p className="text-[10px] text-[#6F6B88] font-bold uppercase">Kendaraan / Kurir Pengantar</p>
                  <p className="text-xs font-semibold text-[#1C1B3A] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#4A3AFF]" />
                    <span>{viewingPurchase.vehiclePlateNumber || "Bawa Sendiri / Logistik Kitchen"}</span>
                  </p>
                </div>
                <div className="bg-[#F8F7FD] p-3 rounded-[12px] border border-[#E6E3F7] space-y-1">
                  <p className="text-[10px] text-[#6F6B88] font-bold uppercase">Catatan &amp; Kondisi Fisik</p>
                  <p className="text-xs text-[#1C1B3A]">
                    {viewingPurchase.notes || "Kondisi bahan segar sesuai standar penerimaan gudang dapur."}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E6E3F7] flex items-center justify-between bg-white">
              <button
                onClick={() => handleExportPurchaseReport(viewingPurchase)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EBF7FC] hover:bg-[#0090D0] hover:text-white text-[#0090D0] text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Faktur / Bukti Penerimaan (PDF)</span>
              </button>
              <button
                onClick={() => setViewingPurchase(null)}
                className="px-6 py-2 rounded-full bg-[#1C1B3A] text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: CREATE INBOUND PURCHASE INVOICE                                 */}
      {/* ========================================================================= */}
      {showCreatePurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-4xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[94vh]">
            {/* Header */}
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2DBA7D] text-white flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    Input Penerimaan Barang &amp; Faktur Pembelian Masuk
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Catat barang fisik masuk dari supplier. Stok gudang/dapur akan otomatis bertambah &amp; kartu mutasi diterbitkan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreatePurchaseModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePurchaseInvoice} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* 1. Informasi Supplier & Ref PO */}
                <div className="bg-[#F8F7FD] p-4 rounded-[16px] border border-[#E6E3F7] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-[#1C1B3A] flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5 text-[#4A3AFF]" />
                      <span>Informasi Supplier &amp; Referensi Surat PO</span>
                    </h4>
                    {purchaseOrders.length > 0 && (
                      <span className="text-[11px] text-[#4A3AFF] font-bold">
                        Pilih PO untuk mengisi otomatis daftar bahan yang dipesan
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Tarik dari Surat PO (Opsional)</label>
                      <select
                        value={purchasePoNumber}
                        onChange={(e) => handleSelectPoForPurchase(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#4A3AFF] focus:outline-none focus:border-[#4A3AFF]"
                      >
                        <option value="">-- Pembelian Langsung (Tanpa PO) --</option>
                        {purchaseOrders.map((po) => (
                          <option key={po.id} value={po.poNumber}>
                            {po.poNumber} &bull; {po.supplierName} ({po.items.length} item &bull; Rp {po.grandTotal.toLocaleString("id-ID")})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Supplier Rekanan *</label>
                      <select
                        value={purchaseSupplierId}
                        onChange={(e) => setPurchaseSupplierId(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      >
                        {suppliers.map((sup) => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name} ({sup.supplierType} &bull; {sup.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Waktu Penerimaan Barang</label>
                      <input
                        type="datetime-local"
                        value={purchaseInvoiceDate}
                        onChange={(e) => setPurchaseInvoiceDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Plat Nomor / Armada Vendor</label>
                      <input
                        type="text"
                        placeholder="Contoh: B 9482 KBC (Mobil Box)"
                        value={purchaseVehiclePlate}
                        onChange={(e) => setPurchaseVehiclePlate(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1C1B3A]">Lokasi Masuk Gudang / Dapur</label>
                      <input
                        type="text"
                        value={purchaseLocation}
                        onChange={(e) => setPurchaseLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Metode Pembayaran */}
                <div className="bg-[#F8F7FD] p-4 rounded-[16px] border border-[#E6E3F7] space-y-3">
                  <h4 className="text-xs font-extrabold text-[#1C1B3A] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#2DBA7D]" />
                    <span>Metode Pembayaran &amp; Kas Pengeluaran</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handlePaymentTypeChange("TUNAI_KAS_DAPUR")}
                      className={`p-3 rounded-[12px] border text-left cursor-pointer transition-all ${
                        purchasePaymentType === "TUNAI_KAS_DAPUR"
                          ? "bg-white border-[#2DBA7D] shadow-xs ring-2 ring-[#2DBA7D]/20"
                          : "bg-white/60 border-[#E6E3F7] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1C1B3A]">Tunai Kas Dapur</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Lunas</span>
                      </div>
                      <p className="text-[10.5px] text-[#6F6B88] mt-1">Petty Cash Kas Operasional Dapur</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePaymentTypeChange("TRANSFER_KOPERASI")}
                      className={`p-3 rounded-[12px] border text-left cursor-pointer transition-all ${
                        purchasePaymentType === "TRANSFER_KOPERASI"
                          ? "bg-white border-[#4A3AFF] shadow-xs ring-2 ring-[#4A3AFF]/20"
                          : "bg-white/60 border-[#E6E3F7] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1C1B3A]">Transfer Koperasi</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Bank / Kas Utama</span>
                      </div>
                      <p className="text-[10.5px] text-[#6F6B88] mt-1">Rekening Kas Utama Kopkar BIT</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePaymentTypeChange("TEMPO_HUTANG")}
                      className={`p-3 rounded-[12px] border text-left cursor-pointer transition-all ${
                        purchasePaymentType === "TEMPO_HUTANG"
                          ? "bg-white border-amber-500 shadow-xs ring-2 ring-amber-500/20"
                          : "bg-white/60 border-[#E6E3F7] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1C1B3A]">Tempo / Hutang</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">Hutang Dagang</span>
                      </div>
                      <p className="text-[10.5px] text-[#6F6B88] mt-1">Jatuh tempo 14 - 30 hari supplier</p>
                    </button>
                  </div>
                </div>

                {/* 3. Multi-Item Bahan Baku Masuk */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#1C1B3A] flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-[#4A3AFF]" />
                        <span>Daftar Bahan Baku Fisik yang Diterima ({purchaseFormItems.length} Macam Bahan)</span>
                      </h4>
                      <p className="text-[10.5px] text-[#6F6B88]">
                        Stok di master bahan baku akan otomatis bertambah sesuai rasio konversi unit pakai.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPurchaseFormItem}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5F3FF] hover:bg-[#4A3AFF] hover:text-white text-[#4A3AFF] text-xs font-bold border border-[#E6E3F7] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris Bahan</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-[#E6E3F7] rounded-[16px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F8F7FD] border-b border-[#E6E3F7] text-[#6F6B88] font-bold">
                          <th className="py-2.5 px-3">Bahan Baku</th>
                          <th className="py-2.5 px-3 text-center">Satuan Beli</th>
                          <th className="py-2.5 px-3 text-center w-28">Qty Diterima</th>
                          <th className="py-2.5 px-3 text-center w-36">Tambah Stok</th>
                          <th className="py-2.5 px-3 text-right w-36">Harga Satuan (Rp)</th>
                          <th className="py-2.5 px-3 text-right">Subtotal (Rp)</th>
                          <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E3F7]/60">
                        {purchaseFormItems.map((item) => {
                          const mat = rawMaterials.find((m) => m.id === item.rawMaterialId) || rawMaterials[0];
                          const qty = typeof item.quantityReceived === "number" ? item.quantityReceived : (Number(item.quantityReceived) || 0);
                          const unitRatio = mat ? mat.unitRatio : 1;
                          const totalAdded = Math.round(qty * unitRatio);
                          const subtotal = qty * (typeof item.unitPrice === "number" ? item.unitPrice : (Number(item.unitPrice) || 0));

                          return (
                            <tr key={item.id} className="hover:bg-[#F5F3FF]/30">
                              <td className="py-2.5 px-3 min-w-[240px]">
                                <PurchaseMaterialCombobox
                                  value={item.rawMaterialId}
                                  rawMaterials={rawMaterials}
                                  onSelect={(selectedMat) =>
                                    handlePurchaseFormItemChange(item.id, "rawMaterialId", selectedMat.id)
                                  }
                                />
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-[#EBF7FC] text-[#0090D0] text-[10px] font-bold">
                                  {mat?.purchaseUnit || "Kg"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  value={item.quantityReceived}
                                  onChange={(e) =>
                                    handlePurchaseFormItemChange(item.id, "quantityReceived", e.target.value)
                                  }
                                  onFocus={(e) => e.target.select()}
                                  className="w-full px-2 py-1.5 rounded-[8px] border border-[#E6E3F7] text-center font-extrabold text-[#2DBA7D] text-xs focus:outline-none focus:border-[#2DBA7D]"
                                  required
                                />
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="font-extrabold text-[#2DBA7D] text-[11px]">
                                  +{totalAdded.toLocaleString("id-ID")} {mat?.usageUnit || "gram"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="500"
                                  placeholder="0"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    handlePurchaseFormItemChange(item.id, "unitPrice", e.target.value)
                                  }
                                  onFocus={(e) => e.target.select()}
                                  className="w-full px-2 py-1.5 rounded-[8px] border border-[#E6E3F7] text-right font-bold text-[#1C1B3A] text-xs focus:outline-none focus:border-[#4A3AFF]"
                                  required
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right font-extrabold text-[#1C1B3A]">
                                Rp {subtotal.toLocaleString("id-ID")}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePurchaseFormItem(item.id)}
                                  disabled={purchaseFormItems.length <= 1}
                                  className="p-1.5 rounded-full text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Rekap Biaya & Pembayaran */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3 bg-[#F8F7FD] p-4 rounded-[16px] border border-[#E6E3F7]">
                    <h4 className="text-xs font-extrabold text-[#1C1B3A]">Penyesuaian Biaya &amp; Nominal Bayar</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#1C1B3A]">Diskon Faktur (Rp)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={purchaseDiscountAmount}
                          onChange={(e) =>
                            setPurchaseDiscountAmount(e.target.value === "" ? "" : parseFloat(e.target.value))
                          }
                          onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#1C1B3A]">Biaya Kirim / Bongkar (Rp)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={purchaseAdminCost}
                          onChange={(e) =>
                            setPurchaseAdminCost(e.target.value === "" ? "" : parseFloat(e.target.value))
                          }
                          onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#1C1B3A]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#1C1B3A]">Nominal Dibayar (Rp)</label>
                        <button
                          type="button"
                          onClick={() => setPurchaseAmountPaid(purchaseCalculations.grandTotal)}
                          className="text-[10px] text-[#4A3AFF] font-bold hover:underline cursor-pointer"
                        >
                          Set Lunas Penuh
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder={String(purchaseCalculations.grandTotal)}
                        value={purchaseAmountPaid}
                        onChange={(e) =>
                          setPurchaseAmountPaid(e.target.value === "" ? "" : parseFloat(e.target.value))
                        }
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white text-xs font-bold text-[#2DBA7D]"
                      />
                    </div>
                  </div>

                  <div className="bg-[#1C1B3A] text-white p-5 rounded-[16px] flex flex-col justify-between shadow-lg">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-white/70">
                        <span>Subtotal ({purchaseFormItems.length} macam item):</span>
                        <span className="font-mono">Rp {purchaseCalculations.subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      {Number(purchaseDiscountAmount) > 0 && (
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Diskon Faktur:</span>
                          <span className="font-mono">- Rp {Number(purchaseDiscountAmount).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      {Number(purchaseAdminCost) > 0 && (
                        <div className="flex items-center justify-between text-amber-300">
                          <span>Biaya Kirim / Admin:</span>
                          <span className="font-mono">+ Rp {Number(purchaseAdminCost).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-white/90 pt-1 border-t border-white/10 font-bold">
                        <span>Total Belanja:</span>
                        <span className="font-mono text-[#FFB547]">Rp {purchaseCalculations.grandTotal.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/20 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-white/80">
                        {purchaseCalculations.amountDue > 0 ? "SISA HUTANG TEMPO:" : "STATUS BAYAR:"}
                      </span>
                      <span
                        className={`text-xl font-black ${
                          purchaseCalculations.amountDue > 0 ? "text-red-400" : "text-[#2DBA7D]"
                        }`}
                      >
                        {purchaseCalculations.amountDue > 0
                          ? `Rp ${purchaseCalculations.amountDue.toLocaleString("id-ID")}`
                          : "✓ LUNAS"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Catatan Penerimaan */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1C1B3A]">Catatan Penerimaan / Keterangan Kondisi Bahan</label>
                  <input
                    type="text"
                    value={purchaseNotes}
                    onChange={(e) => setPurchaseNotes(e.target.value)}
                    placeholder="Contoh: Kondisi ayam beku suhu terjaga, sayur segar tidak layu."
                    className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#E6E3F7] flex items-center justify-end gap-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => setShowCreatePurchaseModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6E3F7] text-xs font-bold text-[#6F6B88] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#2DBA7D] hover:bg-[#25A26C] text-white text-xs font-bold shadow-md shadow-[#2DBA7D]/20 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Faktur &amp; Tambah Stok Masuk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: TAMBAH / EDIT KATEGORI BAHAN BAKU                                */}
      {/* ========================================================================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    {editingCategory ? "Edit Kategori Bahan Baku" : "Tambah Kategori Bahan Baku Baru"}
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Konfigurasi klasifikasi bahan baku dan nomor akun Chart of Accounts (COA).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1B3A]">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Frozen Food &amp; Olahan Beku"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1B3A]">Kode Kategori (Uppercase)</label>
                <input
                  type="text"
                  placeholder="Contoh: FROZEN_FOOD"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] font-mono focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <div className="p-3.5 rounded-[16px] bg-[#F5F3FF] border border-[#E6E3F7] space-y-3">
                <p className="text-xs font-bold text-[#4A3AFF]">Pemetaan Chart of Accounts (COA)</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1C1B3A]">Akun Persediaan (Aset)</label>
                    <input
                      type="text"
                      required
                      placeholder="1130207"
                      value={categoryInventoryAccount}
                      onChange={(e) => setCategoryInventoryAccount(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white font-mono text-xs text-[#4A3AFF] font-bold"
                    />
                    <span className="text-[10px] text-[#6F6B88]">Kepala 1 (Aktiva Lancar Dapur)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#1C1B3A]">Akun Beban (COGS / HPP)</label>
                    <input
                      type="text"
                      required
                      placeholder="5110216"
                      value={categoryExpenseAccount}
                      onChange={(e) => setCategoryExpenseAccount(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-[#E6E3F7] bg-white font-mono text-xs text-[#2DBA7D] font-bold"
                    />
                    <span className="text-[10px] text-[#6F6B88]">Kepala 5 (Beban Pokok Menu)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1B3A]">Deskripsi / Keterangan Bahan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Nugget ayam, kentang goreng beku, sosis impor, dimsum"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <div className="pt-3 border-t border-[#E6E3F7] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6E3F7] text-xs font-bold text-[#6F6B88] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold shadow-md shadow-[#4A3AFF]/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? "Simpan Perubahan" : "Tambahkan Kategori"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: TAMBAH / EDIT MITRA SUPPLIER                                      */}
      {/* ========================================================================= */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-[#E6E3F7] w-full max-w-xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-[#E6E3F7] flex items-center justify-between bg-[#F8F7FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2DBA7D] text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B3A]">
                    {editingSupplier ? "Edit Data Mitra Supplier" : "Daftarkan Mitra Supplier Baru"}
                  </h3>
                  <p className="text-[11px] text-[#6F6B88]">
                    Kelola data vendor rekanan, kontak PIC, dan termin pembayaran pengadaan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[#1C1B3A]">Nama Supplier / Perusahaan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Berkah Pangan Nusantara"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] font-bold focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Kode Supplier</label>
                  <input
                    type="text"
                    placeholder="SUP-06"
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] font-mono focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Tipe Vendor</label>
                  <select
                    value={supplierType}
                    onChange={(e) => setSupplierType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] bg-white text-xs text-[#1C1B3A] font-medium focus:outline-none focus:border-[#4A3AFF]"
                  >
                    <option value="DISTRIBUTOR">Distributor Resmi</option>
                    <option value="GROSIR">Grosir / Agen Besar</option>
                    <option value="PASAR_TRADISIONAL">Pasar Tradisional</option>
                    <option value="SUPERMARKET">Supermarket / Modern Trade</option>
                    <option value="LOKAL">Supplier Lokal / Petani</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Termin Pembayaran (Hari)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Cash / COD, 7, 14, 30 hari"
                    value={supplierPaymentTermDays}
                    onChange={(e) =>
                      setSupplierPaymentTermDays(e.target.value === "" ? "" : parseInt(e.target.value) || 0)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] font-bold focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Nama Kontak PIC / Sales</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Hendra Gunawan"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Nomor WhatsApp / Telepon</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-9988-7766"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] font-medium focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[#1C1B3A]">Alamat Kantor / Gudang Vendor</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Kamal Muara No. 10 Kav. 4"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C1B3A]">Kota / Wilayah</label>
                  <input
                    type="text"
                    placeholder="Jakarta Barat"
                    value={supplierCity}
                    onChange={(e) => setSupplierCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C1B3A]">Catatan Pengadaan / Ketentuan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pemasok ayam potong segar pagi hari, min. order 10 ekor gratis ongkir."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#E6E3F7] text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
                />
              </div>

              <div className="pt-3 border-t border-[#E6E3F7] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E6E3F7] text-xs font-bold text-[#6F6B88] hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#2DBA7D] hover:bg-[#25A26C] text-white text-xs font-bold shadow-md shadow-[#2DBA7D]/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSupplier ? "Simpan Perubahan" : "Daftarkan Supplier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal Component */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        config={reportConfig}
      />
    </div>
  );
};
