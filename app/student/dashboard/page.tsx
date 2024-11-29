"use client";

import React from "react";
import AppSidebar from "./sidebar";
import NavBar from "./top-navbar";
import "./globals.css";
import AppCalendar from "./calendar";

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
        <main className="flex-grow bg-white shadow-lg px-100 py-2 border-r-10">
          <div className="flex justify-between">
            {/* Main Content */}
            <div className="flex-grow">{children}</div>

            {/* Calendar */}
            <div className="w-150 mr-10 mt-10"> 
              <AppCalendar />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
