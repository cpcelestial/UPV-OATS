import * as React from "react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Appointment } from "./appointment-calendar"

interface WeekViewProps {
  currentDate: Date
  appointments: Appointment[]
  onDayClick: (date: Date) => void
}

export function WeekView({ currentDate, appointments, onDayClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
      {weekDays.map((day) => (
        <div 
          key={day.toString()} 
          className="bg-background p-2 min-h-[200px] cursor-pointer hover:bg-muted/50"
          onClick={() => onDayClick(day)}
        >
          <div className="text-sm font-medium mb-1">{format(day, 'EEE d')}</div>
          <div className="space-y-1">
            {appointments
              .filter((appointment) => isSameDay(new Date(appointment.date), day))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded bg-[#E8F0EB] p-1 text-xs"
                >
                  <div className="font-medium">{appointment.time}</div>
                  <div className="mt-1">{appointment.title}</div>
                  <div className="flex -space-x-2 mt-1">
                    {appointment.attendees.map((attendee, index) => (
                      <Avatar
                        key={index}
                        className="h-6 w-6 border-2 border-background"
                      >
                        <AvatarImage src={attendee.avatar} alt={attendee.name} />
                        <AvatarFallback>
                          {attendee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

