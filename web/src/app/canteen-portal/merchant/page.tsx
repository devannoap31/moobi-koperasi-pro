import React from "react";
import { MerchantPosView } from "@/components/views/merchant/MerchantPosView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS Kasir Stand | Portal Mitra Kantin Kopkar BIT",
  description: "Workspace privat kasir POS, pesanan online karyawan, dan kelola menu mitra kantin PT Bhakti Idola Tama.",
};

export default function MerchantCanteenPage() {
  return <MerchantPosView />;
}
