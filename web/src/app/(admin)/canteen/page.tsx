import { SuperadminCanteenManagementView } from "@/components/views/SuperadminCanteenManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Mitra Kantin & Monitoring Payroll - Kopkar PT Bhakti Idola Tama",
  description: "Pusat persetujuan akun stand kantin, monitoring transaksi belanja karyawan, dan settlement payroll.",
};

export default function CanteenPage() {
  return <SuperadminCanteenManagementView />;
}

