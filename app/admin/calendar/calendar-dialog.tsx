"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { AppointmentList } from "../appointments/appointment-list";
import type { Appointment } from "@/app/data";

interface AppointmentsListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  appointments: Appointment[];
}

export function CalendarDialog({
  isOpen,
  onClose,
  date,
  appointments,
}: AppointmentsListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Appointments for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        <AppointmentList
          appointments={appointments}
          emptyMessage="No appointments scheduled for this day"
        />
      </DialogContent>
    </Dialog>
  );
}
