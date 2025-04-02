"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { DaySchedule } from "../data"

interface ScheduleSectionProps {
  schedule: DaySchedule[]
  onUpdateSchedule: () => void
}

export function ScheduleSection({ schedule, onUpdateSchedule }: ScheduleSectionProps) {
  // Color mapping for time slots
  const getSlotColor = (time: string) => {
    if (time.includes("8:00")) return "bg-amber-100 text-amber-800"
    if (time.includes("11:30")) return "bg-emerald-100 text-emerald-800"
    if (time.includes("4:00")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Class Schedule</h1>
          <Button variant="secondary" onClick={onUpdateSchedule}>
            Update schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {schedule.map((day) => (
            <div key={day.day} className="space-y-2">
              <h4 className="text-center font-medium">{day.day}</h4>
              <div className="flex flex-col gap-2">
                {day.slots.length > 0 ? (
                  day.slots.map((slot, slotIndex) => (
                    <span
                      key={slotIndex}
                      className={`text-center px-3 py-2 text-sm rounded-md ${getSlotColor(slot.start)}`}
                    >
                      {slot.start} - {slot.end}
                    </span>
                  ))
                ) : (
                  <span className="text-center px-3 py-2 text-sm text-gray-500">No class</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}