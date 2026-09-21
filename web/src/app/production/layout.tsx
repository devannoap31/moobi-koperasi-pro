"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import { ProductionProvider } from "@/context/ProductionContext";
import { ProductionSidebar } from "@/components/layout/ProductionSidebar";
import { ProductionHeader } from "@/components/layout/ProductionHeader";

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/production/login" || pathname === "/production/login/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <ProductionProvider>
        <div className="flex h-screen overflow-hidden bg-[#F8F7FD]">
          {/* 1. Dedicated Responsive Production Sidebar */}
          <ProductionSidebar />

          {/* 2. Main Right Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <ProductionHeader />

            {/* Scrollable Page Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </ProductionProvider>
    </SidebarProvider>
  );
}
