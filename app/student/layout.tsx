import type React from "react"
import AppSidebar from "./sidebar"
import AppNavbar from "./navbar"
import "@/app/globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-56">
        <AppSidebar />
      </div>
      {/* Main Layout */}
      <div className="rounded-2xl bg-white shadow-[0px_0px_30px_2px_rgba(0,_0,_0,_0.1)] flex flex-col flex-grow z-10 m-4">
        {/* Top Bar */}
        <AppNavbar />
        {/* Main Content */}
        <main className="flex-grow m-4 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

