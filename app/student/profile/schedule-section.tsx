'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DaySchedule } from './types/profile'

interface ScheduleSectionProps {
  schedule: DaySchedule[]
  onUpdateSchedule: (schedule: DaySchedule[]) => void
}

export function ScheduleSection({ schedule, onUpdateSchedule }: ScheduleSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSchedule, setEditedSchedule] = useState(schedule)

  const handleSaveSchedule = () => {
    onUpdateSchedule(editedSchedule)
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Personal Schedule</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Update schedule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Schedule</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {editedSchedule.map((day, dayIndex) => (
                <div key={day.day} className="space-y-2">
                  <Label>{day.day}</Label>
                  {day.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex gap-2">
                      <Input
                        value={slot.start}
                        onChange={(e) => {
                          const newSchedule = [...editedSchedule]
                          newSchedule[dayIndex].slots[slotIndex].start = e.target.value
                          setEditedSchedule(newSchedule)
                        }}
                        placeholder="Start time"
                      />
                      <Input
                        value={slot.end}
                        onChange={(e) => {
                          const newSchedule = [...editedSchedule]
                          newSchedule[dayIndex].slots[slotIndex].end = e.target.value
                          setEditedSchedule(newSchedule)
                        }}
                        placeholder="End time"
                      />
                    </div>
                  ))}
                </div>
              ))}
              <Button onClick={handleSaveSchedule}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {schedule.map((day) => (
          <div key={day.day} className="space-y-2">
            <h3 className="font-medium">{day.day}</h3>
            <div className="flex flex-wrap gap-2">
              {day.slots.map((slot, idx) => (
                <span
                  key={idx}
                  className={`inline-flex px-3 py-1 text-sm rounded-full
                    ${idx % 2 === 0 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                    }`}
                >
                  {slot.start} - {slot.end}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

