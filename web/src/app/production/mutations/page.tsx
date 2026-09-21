import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kartu Mutasi Stok Bahan Baku | Modul Produksi PT BIT",
  description: "Buku besar jejak audit pergerakan keluar, masuk, dan adjustment opname bahan baku dapur.",
};

export default function MutationsPage() {
  return <ProductionManagementView initialTab="STOCK_MUTATIONS" />;
}
