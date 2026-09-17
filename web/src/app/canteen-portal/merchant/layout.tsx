import React from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { MerchantProvider } from "@/context/MerchantContext";
import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { MerchantHeader } from "@/components/layout/MerchantHeader";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <MerchantProvider>
        <div className="flex h-screen overflow-hidden bg-[#F8F7FD]">
          {/* 1. Dedicated Responsive Merchant Sidebar */}
          <MerchantSidebar />

          {/* 2. Main Right Section */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <MerchantHeader />

            {/* Scrollable Page Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </MerchantProvider>
    </SidebarProvider>
  );
}
