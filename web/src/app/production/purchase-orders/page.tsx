import React from "react";
import { ProductionManagementView } from "@/components/views/ProductionManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PO Pembelian Bahan Baku | Modul Produksi PT BIT",
  description: "Purchase order pemesanan bahan baku ke vendor supplier rekanan PT Bhakti Idola Tama.",
};

export default function PurchaseOrdersPage() {
  return <ProductionManagementView initialTab="PURCHASE_ORDERS" />;
}
