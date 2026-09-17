import { Metadata } from "next";
import { UserManagementView } from "@/components/views/UserManagementView";

export const metadata: Metadata = {
  title: "Hak Akses & Manajemen User - Kopkar PT Bhakti Idola Tama",
  description: "Pengaturan hak akses modul dan akun pengguna internal PT Bhakti Idola Tama",
};

export default function UsersPage() {
  return <UserManagementView />;
}
