import { Metadata } from "next";
import { MerchantMenuView } from "@/components/views/merchant/MerchantMenuView";

export const metadata: Metadata = {
  title: "Kelola Menu & Stok | Portal Mitra Kantin Kopkar BIT",
  description: "Manajemen katalog menu, penetapan harga anggota vs umum, dan kontrol stok.",
};

export default function MerchantMenuPage() {
  return <MerchantMenuView />;
}
