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

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    title: string
    faculty: { name: string }
    location: string
    meetingNotes?: string
    date: Date
  }
}

export function RescheduleDialog({ open, onOpenChange, appointment }: RescheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(appointment.date)
  const [showCalendar, setShowCalendar] = useState(false)
  const [startTime, setStartTime] = useState<string>("10:00 AM")
  const [endTime, setEndTime] = useState<string>("11:00 AM")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-7 w-7" />
            <div>
              <DialogTitle className="font-bold">Reschedule Appointment</DialogTitle>
              <p className="text-sm text-muted-foreground">Please provide all required information</p>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input id="title" defaultValue={appointment.title} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="faculty">Faculty Name</Label>
              <span className="text-red-500">*</span>
            </div>
            <Input id="faculty" value={appointment.faculty.name} readOnly className="bg-gray-50" />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-1">
              <Label>Date</Label>
              <span className="text-red-500">*</span>
            </div>
            <div className="relative">
              <Input
                value={date ? format(date, "MMMM d, yyyy") : ""}
                placeholder={date ? format(date, "MMMM d, yyyy") : "Select Date"}
                onClick={() => setShowCalendar(!showCalendar)}
                className="cursor-pointer"
                readOnly
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              {showCalendar && (
                <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate)
                      setShowCalendar(false)
                    }}
                    initialFocus
                  />
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-1">
              <Label>Time</Label>
              <span className="text-red-500">*</span>
            </div>
            <div className="flex items-center gap-4">
              <TimePicker value={startTime} onChange={setStartTime} />
              <span className="text-muted-foreground">to</span>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-1">
              <Label>Type of Meeting</Label>
              <span className="text-red-500">*</span>
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Online meeting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online meeting</SelectItem>
                <SelectItem value="face-to-face">Face to face meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="location">Location</Label>
              <span className="text-red-500">*</span>
            </div>
            <Input id="location" defaultValue={appointment.location} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Meeting Notes</Label>
            <Textarea
              id="notes"
              defaultValue={appointment.meetingNotes}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200">
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-[#212121] hover:opacity-90">
            Reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

