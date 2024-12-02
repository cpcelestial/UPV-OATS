"use client"

import React from "react"
import AppSidebar from "./sidebar"
import NavBar from "./top-navbar"
import { UsersTable } from "./table"
import "./globals.css"

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <AppSidebar />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col flex-grow">
        {/* Top Bar */}
        <NavBar />

        {/* Main Content */}
        <main className="flex-grow bg-white shadow-lg p-8">
          <UsersTable />
          {children}
        </main>
      </div>
    </div>
  )
}

