import { Metadata } from "next";
import { MerchantFinanceView } from "@/components/views/merchant/MerchantFinanceView";

export const metadata: Metadata = {
  title: "Pendapatan & Settlement | Portal Mitra Kantin Kopkar BIT",
  description: "Laporan omzet penjualan, barcode QRIS stand resmi, dan riwayat settlement pencairan dana koperasi.",
};

export default function MerchantFinancePage() {
  return <MerchantFinanceView />;
}
