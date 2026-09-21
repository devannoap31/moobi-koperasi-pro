import { SuperadminCooperativeStoreView } from "@/components/views/SuperadminCooperativeStoreView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toko Koperasi & Penjualan Elektronik | Moobi Koperasi Pro PT BIT",
  description: "Katalog barang elektronik, perkakas kerja pabrik, kasir POS toko, dan fasilitas cicilan payroll karyawan PT Bhakti Idola Tama.",
};

export default function StoreAdminPage() {
  return <SuperadminCooperativeStoreView />;
}
