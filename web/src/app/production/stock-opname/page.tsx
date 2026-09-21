import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stok Opname Bahan Baku | Modul Produksi PT BIT",
  description: "Lembar audit fisik berkala bahan baku dapur, kalkulasi otomatis selisih unit & nilai rupiah, serta penyesuaian saldo.",
};

export default function StockOpnamePage() {
  return <ProductionManagementView initialTab="STOCK_OPNAME" />;
}
