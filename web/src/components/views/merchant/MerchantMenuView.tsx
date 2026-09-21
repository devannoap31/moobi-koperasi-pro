"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { useMerchant, availableImagePresets } from "@/context/MerchantContext";
import { CanteenProduct, ProductCategory } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export const MerchantMenuView: React.FC = () => {
  const { products, addProduct, editProduct, deleteProduct, quickRestock, showToast } = useMerchant();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modals state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<CanteenProduct | null>(null);

  // Form state
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

  const categories: { id: string; label: string }[] = [
    { id: "ALL", label: "Semua Menu Kantin" },
    { id: "MAKANAN", label: "Makanan Siap Saji" },
    { id: "MINUMAN", label: "Minuman & Kopi" },
  ];

  // Filter Products (Strictly Makanan & Minuman for Factory Canteen)
  const filteredProducts = products.filter((p) => {
    const isFoodOrBeverage = p.category === "MAKANAN" || p.category === "MINUMAN";
    if (!isFoodOrBeverage) return false;
    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchSearch =
      !debouncedSearch.trim() ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Modal Handlers
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

  const handleOpenEditProduct = (product: CanteenProduct) => {
    setSelectedProductForEdit(product);
    setProductFormData({
      name: product.name,
      category: product.category,
      regularPrice: product.regularPrice,
      memberPrice: product.memberPrice,
      stock: product.stock,
      unit: product.unit || "Pcs",
      imageUrl: product.imageUrl || "/images/makanan/nasi-goreng.webp",
      description: product.description || "",
    });
    setIsEditProductModalOpen(true);
  };

  const handleOpenDeleteProduct = (product: CanteenProduct) => {
    setSelectedProductForEdit(product);
    setIsDeleteProductModalOpen(true);
  };

  const handleSaveAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name.trim()) {
      showToast("Nama produk wajib diisi!", "error");
      return;
    }
    addProduct(productFormData);
    setIsAddProductModalOpen(false);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForEdit) return;
    editProduct({
      ...selectedProductForEdit,
      ...productFormData,
    });
    setIsEditProductModalOpen(false);
    setSelectedProductForEdit(null);
  };

  const handleConfirmDeleteProduct = () => {
    if (!selectedProductForEdit) return;
    deleteProduct(selectedProductForEdit.id);
    setIsDeleteProductModalOpen(false);
    setSelectedProductForEdit(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-[20px] border border-[#E6E3F7] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#4A3AFF] text-white"
                  : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#F5F3FF] border border-[#E6E3F7]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#6F6B88] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari menu / produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
            />
          </div>

          <button
            onClick={handleOpenAddProduct}
            className="py-2 px-4 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1C1B3A]">
            Daftar Menu &amp; Stok Stand ({filteredProducts.length})
          </h3>
          <span className="text-[11px] text-[#6F6B88]">
            *Harga Anggota berlaku untuk seluruh karyawan aktif Kopkar BIT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAFAFC] text-[#6F6B88] font-bold border-y border-[#E6E3F7]">
              <tr>
                <th className="py-2.5 px-3">Produk / Foto</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Harga Anggota</th>
                <th className="py-2.5 px-3">Harga Umum</th>
                <th className="py-2.5 px-3">Stok Tersedia</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E3F7]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-[10px] bg-[#FAFAFC] border border-[#E6E3F7] overflow-hidden shrink-0 flex items-center justify-center">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <UtensilsCrossed className="w-4 h-4 text-[#A5A2B8]" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#1C1B3A]">{p.name}</p>
                        <p className="text-[10.5px] text-[#6F6B88]">Satuan: {p.unit || "Porsi"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-[#4A3AFF]">
                    Rp {p.memberPrice.toLocaleString("id-ID")}
                  </td>

                  <td className="py-3 px-3 text-[#6F6B88]">
                    Rp {p.regularPrice.toLocaleString("id-ID")}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          p.stock > 10
                            ? "bg-[#E6F9F0] text-[#2DBA7D]"
                            : p.stock > 0
                            ? "bg-[#FFF4E5] text-[#D97706]"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {p.stock} {p.unit || "Porsi"}
                      </span>
                      <button
                        onClick={() => quickRestock(p.id, 10)}
                        title="Tambah +10 stok"
                        className="py-0.5 px-2 rounded-full bg-[#FAFAFC] hover:bg-[#F5F3FF] border border-[#E6E3F7] text-[10px] font-bold text-[#4A3AFF] cursor-pointer"
                      >
                        +10
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        title="Edit menu"
                        className="p-1.5 rounded-full hover:bg-[#F5F3FF] text-[#6F6B88] hover:text-[#4A3AFF] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteProduct(p)}
                        title="Hapus menu"
                        className="p-1.5 rounded-full hover:bg-red-50 text-[#6F6B88] hover:text-red-500 cursor-pointer"
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

      {/* ADD / EDIT PRODUCT MODAL */}
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
                  placeholder="Contoh: Nasi Bakar Cumi Pedas"
                  className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-[10px] p-2.5 text-xs focus:outline-none focus:border-[#4A3AFF]"
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

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
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
    </div>
  );
};
