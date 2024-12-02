
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Appointment } from "./appointment-calendar"

interface AppointmentsListDialogProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  appointments: Appointment[]
}

const timeSlotColors = {
  "10:00 AM": "bg-[#FFE4BC] text-[#B66A00]",
  "1:00 PM": "bg-[#E8F0EB] text-[#35563F]",
  "4:00 PM": "bg-[#8B0000] text-white"
}

export function AppointmentsListDialog({
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
            List of Appointments
          </DialogTitle>
          <p className="text-lg font-medium mt-2">
            {format(date, 'MMMM d, yyyy')}
          </p>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={appointment.avatar} alt={appointment.name} />
                  <AvatarFallback>
                    {appointment.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{appointment.name}</h3>
                  <p className="text-[#35563F]">{appointment.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "px-4 py-1 rounded-full text-sm font-medium",
                  timeSlotColors[appointment.time as keyof typeof timeSlotColors] || "bg-gray-200"
                )}>
                  {appointment.time}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="bg-[#8B0000] hover:bg-[#660000]"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

