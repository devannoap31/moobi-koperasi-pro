import { Metadata } from "next";
import { MerchantPosView } from "@/components/views/merchant/MerchantPosView";

export const metadata: Metadata = {
  title: "POS Kasir Stand | Portal Mitra Kantin Kopkar BIT",
  description: "Aplikasi POS kasir untuk melayani transaksi makanan & minuman karyawan dan umum.",
};

export default function MerchantPosPage() {
  return <MerchantPosView />;
}
