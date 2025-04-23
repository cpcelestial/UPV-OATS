"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { AppointmentCard } from "../appointments/appointment-card";
import type { Appointment } from "../data";

interface AppointmentsListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  appointments: Appointment[];
  onReschedule?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function CalendarDialog({
  isOpen,
  onClose,
  date,
  appointments,
  onReschedule,
  onDecline,
}: AppointmentsListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Appointments for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No appointments scheduled for this day
            </p>
          ) : (
            appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onReschedule={onReschedule}
                onDecline={onDecline}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
