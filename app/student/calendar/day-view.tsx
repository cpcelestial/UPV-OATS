import * as React from "react"
import { format, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Appointment } from "./appointment-calendar"

interface DayViewProps {
  currentDate: Date
  appointments: Appointment[]
}

export function DayView({ currentDate, appointments }: DayViewProps) {
  const dayAppointments = appointments.filter((appointment) => 
    isSameDay(new Date(appointment.date), currentDate)
  )

  return (
    <div className="bg-background p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      <div className="space-y-4">
        {dayAppointments.length > 0 ? (
          dayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded bg-[#E8F0EB] p-3"
            >
              <div className="font-medium">{appointment.time}</div>
              <div className="mt-1 text-lg">{appointment.title}</div>
              <div className="flex -space-x-2 mt-2">
                {appointment.attendees.map((attendee, index) => (
                  <Avatar
                    key={index}
                    className="h-8 w-8 border-2 border-background"
                  >
                    <AvatarImage src={attendee.avatar} alt={attendee.name} />
                    <AvatarFallback>
                      {attendee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground">No appointments for this day</div>
        )}
      </div>
    </div>
  )
}

