"use client";

import React from "react";
import { Calendar } from "./calendar";

export default function Background({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-grow px-8 py-2">
      {children}
      <div className="container mx-auto pb-4">
        <Calendar />
      </div>
    </main>
  );
}
