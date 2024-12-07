import React from "react";
import AppSidebar from "./sidebar";
import NavBar from "./top-navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
            <main className="flex-grow bg-white shadow-lg p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
