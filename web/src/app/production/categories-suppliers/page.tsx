import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategori Bahan & Supplier Rekanan | Modul Produksi PT BIT",
  description: "Pemetaan akun COA akuntansi persediaan & beban bahan baku, serta direktori kontak supplier vendor rekanan.",
};

export default function CategoriesSuppliersPage() {
  return <ProductionManagementView initialTab="CATEGORIES_SUPPLIERS" />;
}
