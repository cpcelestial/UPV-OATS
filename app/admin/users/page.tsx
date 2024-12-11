"use client"

import React from "react"
import { UsersTable } from "./table"

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <main className="flex-grow p-8">
        <UsersTable />
        {children}
      </main>
    </div>
  )
}

