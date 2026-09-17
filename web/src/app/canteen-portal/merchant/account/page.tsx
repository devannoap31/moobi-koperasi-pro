import { Metadata } from "next";
import { MerchantAccountView } from "@/components/views/merchant/MerchantAccountView";

export const metadata: Metadata = {
  title: "Informasi Akun & Pengajuan Pembaruan | Portal Mitra Kantin Kopkar BIT",
  description: "Informasi profil akun stand, kredensial login, dan pengajuan pembaruan data resmi ke Superadmin.",
};

export default function MerchantAccountPage() {
  return <MerchantAccountView />;
}
