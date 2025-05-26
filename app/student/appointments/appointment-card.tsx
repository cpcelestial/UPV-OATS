"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, VideoIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { DialogTitle } from "@/components/ui/dialog";
import type { Appointment } from "../../data";

interface AppointmentCardProps {
  appointment: Appointment;
  onDecline?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onDecline,
}: AppointmentCardProps) {
  const facultyInitials = appointment.facultyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const getNumber = (str: string | null | undefined): string | null => {
    if (!str) return null;
    const parts = str.split("_");
    const last = parts.pop();
    return last && /^\d+$/.test(last) ? last : null;
  };

  // Reschedule dialog state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState(
    typeof appointment.date === "string"
      ? appointment.date
      : format(appointment.date, "yyyy-MM-dd")
  );
  const [newTime, setNewTime] = useState(appointment.timeSlot ?? "");
  const [loading, setLoading] = useState(false);

  const handleReschedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appointments/reschedule/${appointment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: newDate, time: newTime }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setRescheduleOpen(false);
        // Optionally, trigger a refetch or update parent state here
      } else {
        alert("Failed to reschedule: " + data.error);
      }
    } catch (err) {
      alert("Failed to reschedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="space-y-6">
        {/* ...existing content... */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">
                {appointment.class === "Other" ? " " : appointment.class}{" "}
                {appointment.section &&
                  getNumber(appointment.section) &&
                  `- ${getNumber(appointment.section)}`}{" "}
                {appointment.purpose}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <p className="text-lg font-medium">
                {format(appointment.date, "MMMM dd, yyyy")} @{" "}
                {appointment.timeSlot}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 bg-[#F7F7F7] p-4 rounded-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={`/placeholder.svg?height=40&width=40`}
                alt={appointment.facultyName}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {facultyInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{appointment.facultyName}</p>
              <p className="text-muted-foreground text-sm">
                {appointment.facultyEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {appointment.meetingType === "f2f" ? (
              <MapPinIcon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <VideoIcon className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Type of Appointment</p>
              <p className="text-muted-foreground text-sm">
                {appointment.meetingType === "f2f"
                  ? "Face to Face"
                  : "Online Meeting"}
              </p>
            </div>
          </div>
        </div>

        {appointment.details && (
          <div>
            <p className="font-medium mb-1">Appointment Details</p>
            <p className="text-muted-foreground">{appointment.details}</p>
          </div>
        )}

        {appointment.participants && appointment.participants.length > 0 && (
          <div className="">
            <p className="font-medium mb-2">Participants</p>
            <div className="flex flex-wrap gap-4 bg-[#F7F7F7] p-4 rounded-md">
              {appointment.participants.map((participant, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={participant.avatarUrl}
                      alt={participant.name}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {"US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{participant.name}</p>
                    {participant.email && (
                      <p className="text-xs text-muted-foreground">
                        {participant.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4">
          {onDecline && (
            <Button
              variant="destructive"
              onClick={() => onDecline(appointment.id)}
            >
              Cancel
            </Button>
          )}
          <Button onClick={() => setRescheduleOpen(true)}>Reschedule</Button>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <div className="flex flex-col gap-4">
            <label>
              New Date:
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </label>
            <label>
              New Time:
              <input
                type="time"
                className="border rounded px-2 py-1 w-full"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </label>
            <Button
              onClick={handleReschedule}
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Rescheduling..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
