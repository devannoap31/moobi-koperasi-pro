import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setting Resep & BOM Menu Kantin | Modul Produksi PT BIT",
  description: "Formula Bill of Materials (BOM), kalkulasi otomatis HPP / COGS, harga jual, margin laba, dan estimasi nilai gizi SPPG.",
};

export default function RecipesPage() {
  return <ProductionManagementView initialTab="RECIPES" />;
}
