"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { AppointmentCard } from "../appointments/appointment-card";
import type { Appointment } from "@/app/data";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

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
}: AppointmentsListDialogProps) {
  const db = getFirestore();
  const handleDecline = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "cancelled",
      });
      console.log(`Appointment ${appointmentId} declined successfully`);
    } catch (error) {
      console.error("Error declining appointment:", error);
    }
  };
  const handleReschedule = (id: string) => {
    alert(`Reschedule appointment ${id}`);
    // In a real app, navigate to reschedule page or open a modal
  };

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
                onReschedule={handleReschedule}
                onDecline={handleDecline}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
