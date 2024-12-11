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
          {appointments.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No appointments for this day
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {appointment.facultyName.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{appointment.title}</h3>
                    <p className="text-muted-foreground">
                      {appointment.facultyName} | {appointment.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {appointment.startTime} - {appointment.endTime}
                    </span>
                    <span 
                      className={cn(
                        "px-2 py-1 rounded-full text-xs mt-1",
                        appointment.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="bg-[#8B0000] hover:bg-[#660000]"
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
  )
}