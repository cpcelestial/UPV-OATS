"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Clock, MapPin, Users, Video } from "lucide-react";
import { format } from "date-fns";

type Appointment = {
  id: string;
  purpose: string;
  class: string;
  section: string;
  facultyName: string;
  date: Date;
  timeSlot: string;
  meetingType: "f2f" | "online";
  details?: string;
  status: "upcoming" | "pending" | "declined";
  participants?: { email: string; name?: string }[];
};

interface AppointmentListProps {
  appointments: Appointment[];
  emptyMessage: string;
}

export function AppointmentList({
  appointments,
  emptyMessage,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{appointment.purpose}</CardTitle>
                <CardDescription>
                  {appointment.class} - Section {appointment.section}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center text-sm">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{format(appointment.date, "PPP")}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{appointment.timeSlot}</span>
              </div>
              <div className="flex items-center text-sm">
                {appointment.meetingType === "f2f" ? (
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                <span>
                  {appointment.meetingType === "f2f"
                    ? "Face-to-Face"
                    : "Online"}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Faculty: {appointment.facultyName}</span>
              </div>
              {appointment.details && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Details:</p>
                  <p className="text-muted-foreground">{appointment.details}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
