import { useEffect, useState } from "react"
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
import { deleteDoc, doc } from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import {RescheduleDialog} from "../dashboard/reschedule-dialog"

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
  const db = getFirestore()
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const handleDelete = async (appointmentId: string) => {
    try {
      await deleteDoc(doc(db, "appointments", appointmentId))
      onClose() 
    } catch (error) {
      console.error("Error deleting appointment:", error)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            List of Appointments
          </DialogTitle>
          <p className="text-lg font-medium mt-2">
            {format(date, "MMMM d, yyyy")}
          </p>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
              <h2 className="font-bold">{appointment.title}</h2>
                <div>
                  <h3 className="font-medium">{appointment.facultyName}</h3> 
                  <p className="text-[#35563F]">{appointment.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "px-4 py-1 rounded-full text-sm font-medium",
                    timeSlotColors[appointment.time as keyof typeof timeSlotColors] || "bg-gray-200"
                  )}
                >
                  {appointment.startTime} - {appointment.endTime} {/* Show start and end time */}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRescheduleOpen(true)}
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-[#8B0000] hover:bg-[#660000]"
                    onClick={() => handleDelete(appointment.id)}
                  >
                    Delete
                  </Button>
                  <RescheduleDialog
                          open={isRescheduleOpen}
                          onOpenChange={setIsRescheduleOpen}
                          appointment={appointment}
                        />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
