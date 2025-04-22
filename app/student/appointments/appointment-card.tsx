"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export type Appointment = {
  id: string
  purpose: string
  class: string
  section: string
  facultyName: string
  facultyEmail?: string
  date: Date
  timeSlot: string
  meetingType: "f2f" | "online"
  location?: string
  details?: string
  status: "upcoming" | "pending" | "cancelled" | "reschedule"
  participants?: { email: string; name?: string }[]
}

interface AppointmentCardProps {
  appointment: Appointment
  onReschedule?: (id: string) => void
  onDecline?: (id: string) => void
}

export function AppointmentCard({ appointment, onReschedule, onDecline }: AppointmentCardProps) {
  const facultyInitials = appointment.facultyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{format(appointment.date, "MMMM dd, yyyy")}</p>
          <h3 className="text-xl font-semibold mt-1">{appointment.purpose}</h3>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={appointment.facultyName} />
            <AvatarFallback>{facultyInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{appointment.facultyName}</p>
            <p className="text-sm text-muted-foreground">{appointment.facultyEmail || `faculty@example.com`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="font-medium">Time</p>
              <p className="text-muted-foreground">{appointment.timeSlot}</p>
            </div>
            <div>
              <p className="font-medium">Location</p>
              <p className="text-muted-foreground">
                {appointment.location || (appointment.meetingType === "f2f" ? "Faculty room" : "Online meeting")}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium">Type of Meeting</p>
              <p className="text-muted-foreground">
                {appointment.meetingType === "f2f" ? "Face to face meeting" : "Online meeting"}
              </p>
            </div>
            <div>
              <p className="font-medium">Course</p>
              <p className="text-muted-foreground">
                {appointment.class} Section {appointment.section}
              </p>
            </div>
          </div>
        </div>

        {appointment.details && (
          <div>
            <p className="font-medium">Meeting Notes</p>
            <p className="text-muted-foreground">{appointment.details}</p>
          </div>
        )}

        {(onReschedule || onDecline) && (
          <div className="flex justify-end gap-3 mt-4">
            {onReschedule && (
              <Button variant="outline" onClick={() => onReschedule(appointment.id)}>
                Reschedule
              </Button>
            )}
            {onDecline && (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDecline(appointment.id)}
              >
                Decline
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
