"use client";

import React from "react";
import { UsersTable } from "./table";

export default function Background({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main className="flex-grow px-4">
        <UsersTable />
        {children}
      </main>
    </div>
  );
}
