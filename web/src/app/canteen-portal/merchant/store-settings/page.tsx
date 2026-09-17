import { Metadata } from "next";
import { MerchantStoreSettingsView } from "@/components/views/merchant/MerchantStoreSettingsView";

export const metadata: Metadata = {
  title: "Pengaturan & Info Stand Kantin | Portal Mitra Kantin Kopkar BIT",
  description: "Pengaturan profil stand kantin, jam operasional, dan barcode QRIS pembayaran stand kantin.",
};

export default function MerchantStoreSettingsPage() {
  return <MerchantStoreSettingsView />;
}
