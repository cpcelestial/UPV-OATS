import React from "react";
import AppSidebar from "./sidebar";
import AppNavbar from "./navbar";
import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <div className="w-56">
            <AppSidebar />
          </div>
          {/* Main Layout */}
          <div className="rounded-l-3xl bg-white shadow-xl flex flex-col flex-grow -ml-1 z-10">
            {/* Top Bar */}
            <AppNavbar />
            {/* Main Content */}
            <main className="flex-grow p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html >
  );
}