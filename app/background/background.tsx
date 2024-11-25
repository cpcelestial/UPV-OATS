"use client";

import React from "react";
import AppSidebar from "@/app/sidebar/sidebar";
import "./globals.css";

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <div className="w-64">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-grow bg-white shadow-lg p-6">
        {children}
      </main>
    </div>
  );
}
