import React from "react";
import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pembelian Bahan Baku Masuk | Modul Produksi PT BIT",
  description: "Pencatatan faktur pembelian bahan baku, metode pembayaran kas dapur/tempo, dan otomatis penambahan stok persediaan.",
};

export default function PurchasesPage() {
  return <ProductionManagementView initialTab="PURCHASES" />;
}
