"use client";

import React from "react";
import { AppointmentCalendar } from "./appointment-calendar"

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-grow px-6 py-6 overflow-auto">
      {children}
      <div className="container mx-auto py-4">
        <AppointmentCalendar />
      </div>
    </main>
  );
}
