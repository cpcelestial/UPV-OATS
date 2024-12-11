"use client";

import React from "react";
import AppSidebar from "./sidebar";
import NavBar from "./top-navbar";
import { AppointmentCalendar } from "./appointment-calendar"
import "./globals.css"; 


export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 ">   
        <AppSidebar />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col flex-grow">
        {/* Top Bar */}
        <NavBar />

        {/* Main Content */}

        <main className="flex-grow bg-white shadow-lg px-100 py-2 border-r-10">

          {children}
          <div className="container mx-auto py-10">
            <AppointmentCalendar />
          </div>
        </main>
      </div>
    </div>
  );
}
