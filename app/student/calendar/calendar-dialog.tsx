"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Appointment } from "./calendar";

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
  appointments
}: AppointmentsListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Appointments for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No appointments scheduled for this day
            </p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-medium">{appointment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      with {appointment.facultyName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1 rounded-full text-sm font-medium bg-primary/10">
                    {appointment.timeSlot}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        // Handle reschedule
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // Handle delete
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}