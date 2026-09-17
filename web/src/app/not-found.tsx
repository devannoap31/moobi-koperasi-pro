import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7FD] p-4 text-center">
      <div className="bg-white p-8 rounded-[24px] border border-[#E6E3F7] shadow-lg max-w-md w-full space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#1C1B3A]">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-xs text-[#6F6B88]">
          Halaman yang Anda cari tidak ditemukan atau telah dipindahkan ke rute lain.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4A3AFF] hover:bg-[#6B5CEB] text-white text-xs font-bold transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
