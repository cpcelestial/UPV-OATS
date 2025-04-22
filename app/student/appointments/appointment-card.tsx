"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, VideoIcon } from "lucide-react";
import { format } from "date-fns";

export interface Appointment {
  id: string;
  class: string;
  section?: string;
  purpose: string;
  facultyName: string;
  facultyEmail: string;
  date: Date;
  timeSlot: string;
  meetingType: "f2f" | "online";
  details?: string;
  participants?: { email: string; name?: string }[];
  status: "approved" | "pending" | "cancelled" | "reschedule";
}

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onReschedule,
  onDecline,
}: AppointmentCardProps) {
  const facultyInitials = appointment.facultyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">
                {appointment.class === "Other" ? " " : appointment.class}{" "}
                {appointment.section && `- ${appointment.section}`}{" "}
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
                {appointment.facultyEmail || `faculty@example.com`}
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
          <div className="border-t pt-4">
            <p className="font-medium mb-2">Participants</p>
            <div className="flex flex-wrap gap-2">
              {appointment.participants.map((participant, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {participant.name || participant.email}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(onReschedule || onDecline) && (
          <div className="flex justify-end gap-3 mt-6 pt-4">
            {onDecline && (
              <Button
                variant="destructive"
                onClick={() => onDecline(appointment.id)}
              >
                Decline
              </Button>
            )}
            {onReschedule && (
              <Button onClick={() => onReschedule(appointment.id)}>
                Reschedule
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
