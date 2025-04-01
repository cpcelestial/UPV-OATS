"use client"

import { useState } from "react"
import { CalendarIcon } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { TimePicker } from "@/components/ui/time-picker"
import * as z from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"

import { db } from "../../firebase-config"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"

const rescheduleSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  meetingType: z.string().min(1, "Meeting type is required"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional()
})

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    id: string
    title: string
    facultyName: string 
    location: string
    meetingNotes?: string
    date: Date
    startTime?: string
    endTime?: string
    meetingType?: string
  }
}

export function RescheduleDialog({ 
  open, 
  onOpenChange, 
  appointment 
}: RescheduleDialogProps) {
  const [showCalendar, setShowCalendar] = useState(false)

  const form = useForm<z.infer<typeof rescheduleSchema>>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      title: appointment.title || "",
      date: appointment.date,
      startTime: appointment.startTime || "",
      endTime: appointment.endTime || "",
      meetingType: appointment.meetingType || "Online meeting",
      location: appointment.location || "",
      notes: appointment.meetingNotes || ""
    }
  })

  const onSubmit = async (values: z.infer<typeof rescheduleSchema>) => {
    try {
      const appointmentRef = doc(db, "appointments", appointment.id)
      
      await updateDoc(appointmentRef, {
        ...values,
        status: "rescheduled",
        updatedAt: serverTimestamp()
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <p className="text-sm text-muted-foreground">Please provide all required information</p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <div className="flex items-center gap-1">
                <Label>Faculty Name</Label>
              </div>
              <Input 
                value={appointment.facultyName} 
                readOnly 
                className="bg-gray-50" 
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <div className="relative">
                    <Input
                        value={field.value instanceof Date 
                        ? format(field.value, "MMMM d, yyyy") 
                        : field.value && (field.value as any).toDate instanceof Function 
                        ? format((field.value as any).toDate(), "MMMM d, yyyy") 
                        : ""}
                        placeholder="Select Date"
                        onClick={() => setShowCalendar(!showCalendar)}
                        readOnly
                        className="cursor-pointer"
                      />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    {showCalendar && (
                      <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            setShowCalendar(false)
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Meeting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Online meeting">Online meeting</SelectItem>
                      <SelectItem value="Face to face meeting">Face to face meeting</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="resize-none" 
                      rows={4} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#35563F] hover:bg-[#2A4A33]"
              >
                Reschedule
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}