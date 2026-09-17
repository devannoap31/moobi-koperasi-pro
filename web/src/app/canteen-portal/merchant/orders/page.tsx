import { Metadata } from "next";
import { MerchantOrdersView } from "@/components/views/merchant/MerchantOrdersView";

export const metadata: Metadata = {
  title: "Pesanan App Karyawan | Portal Mitra Kantin Kopkar BIT",
  description: "Manajemen pesanan online masuk dari aplikasi mobile karyawan.",
};

export default function MerchantOrdersPage() {
  return <MerchantOrdersView />;
}
