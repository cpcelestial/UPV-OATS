"use client";

import React from "react";

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <main className="flex-grow bg-white shadow-lg px-100 py-2 border-r-10">
        {children}
      </main>
    </div>
  );
}
