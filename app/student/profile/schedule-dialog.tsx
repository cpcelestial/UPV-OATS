'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import type { DaySchedule } from '../data'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: DaySchedule[]
  onUpdateSchedule: (schedule: DaySchedule[]) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12
  const period = i < 12 ? 'AM' : 'PM'
  return `${hour}:00 ${period}`
})

export function ScheduleDialog({ open, onOpenChange, schedule, onUpdateSchedule }: ScheduleDialogProps) {
  const [editedSchedule, setEditedSchedule] = useState(schedule)

  const handleDayToggle = (day: string, enabled: boolean) => {
    setEditedSchedule(prev =>
      prev.map(d => d.day === day ? { ...d, enabled, slots: d.slots || [] } : d)
    )
  }

  const handleTimeChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setEditedSchedule(prev =>
      prev.map(d => {
        if (d.day === day) {
          const slots = [...(d.slots || [])]
          if (slots[index]) {
            slots[index] = { ...slots[index], [field]: value }
          }
          return { ...d, slots }
        }
        return d
      })
    )
  }

  const handleAddSlot = (day: string) => {
    setEditedSchedule(prev =>
      prev.map(d => {
        if (d.day === day) {
          return {
            ...d,
            slots: [...(d.slots || []), { start: '9:00 AM', end: '10:00 AM' }]
          }
        }
        return d
      })
    )
  }

  const handleRemoveSlot = (day: string, index: number) => {
    setEditedSchedule(prev =>
      prev.map(d => {
        if (d.day === day && d.slots) {
          const slots = d.slots.filter((_, i) => i !== index)
          return { ...d, slots }
        }
        return d
      })
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Class Schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            {editedSchedule.map((day) => (
              <div key={day.day} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={day.enabled}
                    onCheckedChange={(checked) => handleDayToggle(day.day, checked as boolean)}
                  />
                  <span className="font-medium">{day.day}</span>
                </div>
                {day.enabled && (
                  <div className="space-y-2 pl-6">
                    {day.slots?.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select
                          value={slot.start}
                          onValueChange={(value) => handleTimeChange(day.day, index, 'start', value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {HOURS.map((hour) => (
                              <SelectItem key={hour} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>to</span>
                        <Select
                          value={slot.end}
                          onValueChange={(value) => handleTimeChange(day.day, index, 'end', value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            {HOURS.map((hour) => (
                              <SelectItem key={hour} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSlot(day.day, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSlot(day.day)}
                    >
                      Add time slot
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#2F5233] hover:bg-[#2F5233]/90"
              onClick={() => {
                onUpdateSchedule(editedSchedule)
                onOpenChange(false)
              }}
            >
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

