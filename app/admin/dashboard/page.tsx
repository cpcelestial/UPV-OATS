"use client";

import React from "react";

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {children}
    </div>
  );
}
