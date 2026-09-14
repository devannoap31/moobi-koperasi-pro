import { LoginView } from "@/components/views/LoginView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Kopkar PT. Bhakti Idola Tama (Moobi Koperasi Pro)",
  description: "Portal masuk sistem koperasi karyawan PT Bhakti Idola Tama",
};

export default function LoginPage() {
  return <LoginView />;
}
