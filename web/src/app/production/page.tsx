import React from "react";
import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modul Manajemen Produksi & Bahan Baku | Moobi Koperasi Pro PT BIT",
  description: "Portal pengolahan resep menu kantin BIT, formula BOM, kalkulasi COGS/HPP, PO & faktur pembelian bahan baku, pencatatan pemakaian dapur, dan stok opname.",
};

export default function ProductionMainPage() {
  return <ProductionManagementView initialTab="RECIPES" />;
}
