import * as React from "react"
import { Clock } from 'lucide-react'
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ClockPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onTimeChange: (time: string) => void
}

export function ClockPicker({ className, onTimeChange, ...props }: ClockPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTime, setSelectedTime] = React.useState(props.value as string || "")

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  const handleTimeSelect = (hour: number, minute: string, period: 'AM' | 'PM') => {
    const time = `${hour}:${minute} ${period}`
    setSelectedTime(time)
    onTimeChange(time)
    setOpen(false)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedTime || "Select time"}
          <Clock className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content className="w-[280px] p-0">
        <div className="grid grid-cols-2 gap-2 p-2">
          <div className="space-y-1">
            <div className="font-bold">Hour</div>
            <div className="grid grid-cols-3 gap-2">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  size="sm"
                  variant="outline"
                  onClick={() => handleTimeSelect(hour, "00", "AM")}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-bold">Minute</div>
            <div className="grid grid-cols-4 gap-2 h-[200px] overflow-y-auto">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  size="sm"
                  variant="outline"
                  onClick={() => handleTimeSelect(12, minute, "AM")}
                >
                  {minute}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 p-2">
          <Button size="sm" onClick={() => handleTimeSelect(12, "00", "AM")}>AM</Button>
          <Button size="sm" onClick={() => handleTimeSelect(12, "00", "PM")}>PM</Button>
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  )
}

