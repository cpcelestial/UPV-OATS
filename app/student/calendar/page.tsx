"use client";

import React from "react";
import { AppointmentCalendar } from "./appointment-calendar"

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-grow px-6 py-2 border-r-10">
      {children}
      <div className="container mx-auto py-10">
        <AppointmentCalendar />
      </div>
    </main>
  );
}
