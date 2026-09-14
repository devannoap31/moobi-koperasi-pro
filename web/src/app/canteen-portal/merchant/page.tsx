import React, { Suspense } from "react";
import { MerchantCanteenView } from "@/components/views/MerchantCanteenView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kasir Stand Mitra Kantin - Kopkar PT Bhakti Idola Tama",
  description: "Workspace privat kasir POS, pesanan online karyawan, dan kelola menu mitra kantin PT Bhakti Idola Tama.",
};

export default function MerchantCanteenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7FD] text-xs font-semibold text-[#6F6B88]">
          Memuat Ruang Kerja Stand Kantin...
        </div>
      }
    >
      <MerchantCanteenView />
    </Suspense>
  );
}
