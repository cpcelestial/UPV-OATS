import * as React from "react"
import { format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import type { Appointment } from "./appointment-calendar"

interface DayViewProps {
  currentDate: Date
  appointments: Appointment[]
}

export function DayView({ currentDate, appointments }: DayViewProps) {
  const dayAppointments = appointments.filter((appointment) =>
    appointment.date && isSameDay(new Date(appointment.date), currentDate)
  )

  return (
    <div className="bg-background p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
      <div className="space-y-4">
        {dayAppointments.length > 0 ? (
          dayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded bg-[#E8F0EB] p-3"
            >
              <div className="font-medium">{appointment.startTime} - {appointment.endTime}</div>
              <div className="text-lg mt-1">{appointment.facultyName}</div>
              <div className="mt-1">{appointment.title}</div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground">No appointments for this day</div>
        )}
      </div>
    </div>
  )
}
