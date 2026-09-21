import React from "react";
import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penggunaan Bahan / Masak Batch | Modul Produksi PT BIT",
  description: "Pencatatan sesi masak batch porsi menu dapur kantin BIT dan pemotongan otomatis stok bahan baku sesuai formula BOM.",
};

export default function UsagePage() {
  return <ProductionManagementView initialTab="USAGE" />;
}
