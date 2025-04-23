"use client";

import { useRef, useEffect, useState } from "react";
import { AppointmentCard } from "./appointment-card";
import type { Appointment } from "../data";

interface AppointmentListProps {
  appointments: Appointment[];
  emptyMessage: string;
  onReschedule?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function AppointmentList({
  appointments,
  emptyMessage,
  onReschedule,
  onDecline,
}: AppointmentListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrollbar, setHasScrollbar] = useState(false);

  useEffect(() => {
    const checkForScrollbar = () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current;
        setHasScrollbar(scrollHeight > clientHeight);
      }
    };

    checkForScrollbar();
    window.addEventListener("resize", checkForScrollbar);
    return () => {
      window.removeEventListener("resize", checkForScrollbar);
    };
  }, [appointments]);

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`space-y-6 max-h-[500px] overflow-y-auto ${
        hasScrollbar ? "pr-4" : ""
      }`}
    >
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onReschedule={onReschedule}
          onDecline={onDecline}
        />
      ))}
    </div>
  );
}
