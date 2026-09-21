"use client";

import React, { useState } from "react";
import {
  Search,
  Smartphone,
  Check,
  CheckCircle,
} from "lucide-react";
import { useMerchant } from "@/context/MerchantContext";
import { CanteenOrder, CanteenOrderStatus } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

export const MerchantOrdersView: React.FC = () => {
  const { orders, updateOrderStatus } = useMerchant();

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const debouncedOrderSearch = useDebounce(orderSearchTerm, 300);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<CanteenOrder | null>(null);

  // Filter Incoming Orders
  const filteredOrders = orders.filter((ord) => {
    const matchStatus = orderStatusFilter === "ALL" || ord.status === orderStatusFilter;
    const matchSearch =
      !debouncedOrderSearch.trim() ||
      ord.orderNumber.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
      ord.employeeName.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
      ord.employeeNik.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
      ord.items.some((i) => i.productName.toLowerCase().includes(debouncedOrderSearch.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleStatusChange = (orderId: string, nextStatus: CanteenOrderStatus) => {
    updateOrderStatus(orderId, nextStatus);
    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Bar */}
      <div className="bg-white p-4 rounded-[20px] border border-[#E6E3F7] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setOrderStatusFilter("ALL")}
            className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
              orderStatusFilter === "ALL"
                ? "bg-[#4A3AFF] text-white"
                : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#F5F3FF] border border-[#E6E3F7]"
            }`}
          >
            Semua ({orders.length})
          </button>
          <button
            onClick={() => setOrderStatusFilter("MENUNGGU_KONFIRMASI")}
            className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
              orderStatusFilter === "MENUNGGU_KONFIRMASI"
                ? "bg-[#FFB547] text-[#1C1B3A]"
                : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#FFF4E5] border border-[#E6E3F7]"
            }`}
          >
            Menunggu Konfirmasi ({orders.filter((o) => o.status === "MENUNGGU_KONFIRMASI").length})
          </button>
          <button
            onClick={() => setOrderStatusFilter("DIPROSES")}
            className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
              orderStatusFilter === "DIPROSES"
                ? "bg-[#4A3AFF] text-white"
                : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#F5F3FF] border border-[#E6E3F7]"
            }`}
          >
            Sedang Disiapkan ({orders.filter((o) => o.status === "DIPROSES").length})
          </button>
          <button
            onClick={() => setOrderStatusFilter("SIAP_DIAMBIL")}
            className={`py-1.5 px-3 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap transition-all ${
              orderStatusFilter === "SIAP_DIAMBIL"
                ? "bg-[#2DBA7D] text-white"
                : "bg-[#FAFAFC] text-[#6F6B88] hover:bg-[#E6F9F0] border border-[#E6E3F7]"
            }`}
          >
            Siap Diambil ({orders.filter((o) => o.status === "SIAP_DIAMBIL").length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6F6B88] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. order / nama karyawan..."
            value={orderSearchTerm}
            onChange={(e) => setOrderSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFC] border border-[#E6E3F7] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#1C1B3A] focus:outline-none focus:border-[#4A3AFF]"
          />
        </div>
      </div>

      {/* Orders Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-[#E6E3F7] p-12 text-center space-y-2">
          <Smartphone className="w-10 h-10 text-[#A5A2B8] mx-auto" />
          <h3 className="text-sm font-bold text-[#1C1B3A]">Tidak Ada Pesanan Ditemukan</h3>
          <p className="text-xs text-[#6F6B88]">
            {orderSearchTerm ? "Coba ubah kata kunci pencarian Anda." : "Belum ada pesanan masuk dengan status filter ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-[20px] border border-[#E6E3F7] p-4.5 shadow-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Top Row: Order No + Status */}
                <div className="flex items-center justify-between border-b border-[#E6E3F7] pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-[#4A3AFF]">{ord.orderNumber}</span>
                    <p className="text-[10px] text-[#6F6B88]">{ord.createdAt}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      ord.status === "MENUNGGU_KONFIRMASI"
                        ? "bg-[#FFF4E5] text-[#D97706] border border-[#FFE0B2]"
                        : ord.status === "DIPROSES"
                        ? "bg-[#F5F3FF] text-[#4A3AFF] border border-[#E6E3F7]"
                        : ord.status === "SIAP_DIAMBIL"
                        ? "bg-[#E6F9F0] text-[#2DBA7D] border border-[#A7F3D0]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ord.status === "MENUNGGU_KONFIRMASI"
                      ? "Menunggu Konfirmasi"
                      : ord.status === "DIPROSES"
                      ? "Sedang Disiapkan"
                      : ord.status === "SIAP_DIAMBIL"
                      ? "Siap Diambil"
                      : "Selesai"}
                  </span>
                </div>

                {/* Employee Info */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#4A3AFF] flex items-center justify-center font-bold text-xs shrink-0">
                    {ord.employeeName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1C1B3A] truncate">{ord.employeeName}</p>
                    <p className="text-[10px] text-[#6F6B88] truncate">
                      NIK: {ord.employeeNik} • {ord.department}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-2.5 rounded-[14px] bg-[#FAFAFC] border border-[#E6E3F7] space-y-1.5">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-[#1C1B3A]">
                        <strong>{item.quantity}x</strong> {item.productName}
                      </span>
                      <span className="font-bold text-[#4A3AFF]">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                  {ord.notes && (
                    <p className="text-[10.5px] text-[#D97706] bg-[#FFF8E6] p-1.5 rounded-[8px] mt-1 italic">
                      Catatan: &quot;{ord.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Total & Payment Method */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#4A3AFF]">
                    {ord.paymentMethod === "QRIS_TUNAI"
                      ? "QRIS Statis Stand"
                      : "Uang Tunai (Cash)"}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-[#6F6B88] block">Total Bayar:</span>
                    <span className="text-sm font-extrabold text-[#1C1B3A]">
                      Rp {ord.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Lifecycle */}
              <div className="pt-2 border-t border-[#E6E3F7] flex gap-2">
                {ord.status === "MENUNGGU_KONFIRMASI" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(ord.id, "DIPROSES")}
                      className="flex-1 py-2 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terima &amp; Siapkan</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(ord.id, "DIBATALKAN")}
                      className="py-2 px-3 rounded-full bg-white hover:bg-red-50 border border-[#E6E3F7] text-red-500 font-semibold text-xs cursor-pointer"
                    >
                      Tolak
                    </button>
                  </>
                )}

                {ord.status === "DIPROSES" && (
                  <button
                    onClick={() => handleStatusChange(ord.id, "SIAP_DIAMBIL")}
                    className="w-full py-2 rounded-full bg-[#2DBA7D] hover:bg-[#259b67] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Tandai Siap Diambil</span>
                  </button>
                )}

                {ord.status === "SIAP_DIAMBIL" && (
                  <button
                    onClick={() => handleStatusChange(ord.id, "SELESAI")}
                    className="w-full py-2 rounded-full bg-[#1C1B3A] hover:bg-[#2D2B56] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Serahkan ke Karyawan (Selesai)</span>
                  </button>
                )}

                {ord.status === "SELESAI" && (
                  <div className="w-full py-1.5 text-center text-[11px] font-bold text-[#2DBA7D] bg-[#E6F9F0] rounded-full">
                    ✓ Pesanan Telah Selesai Diserahkan
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
