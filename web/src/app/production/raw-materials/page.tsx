import React from "react";
import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bahan Baku & COGS | Modul Produksi PT BIT",
  description: "Master inventaris bahan baku dapur kantin, konversi satuan beli ke satuan pakai, harga satuan pakai, dan safety stock.",
};

export default function RawMaterialsPage() {
  return <ProductionManagementView initialTab="RAW_MATERIALS" />;
}
