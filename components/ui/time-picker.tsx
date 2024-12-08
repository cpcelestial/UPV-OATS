"use client"

import * as React from "react"
import { Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onChange(e.target.value)
  }

  const handleTimeSelect = (hour: number, minute: string, period: 'AM' | 'PM') => {
    const newTime = `${hour}:${minute} ${period}`
    setInputValue(newTime)
    onChange(newTime)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={handleTimeInput}
            className={cn(
              "pl-3 pr-10",
              className
            )}
            placeholder="Select time"
          />
          <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="grid grid-cols-2 gap-2 p-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Hour</div>
            <div className="grid grid-cols-3 gap-2">
              {hours.map((hour) => (
                <Button
                  key={hour}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeSelect(hour, "00", "AM")}
                  className="h-8 w-8 p-0"
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Minute</div>
            <div className="grid grid-cols-4 gap-2 h-[200px] overflow-y-auto pr-2">
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTimeSelect(12, minute, "AM")}
                  className="h-8 w-8 p-0"
                >
                  {minute}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t p-3">
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTimeSelect(
                parseInt(inputValue.split(':')[0] || '12'),
                inputValue.split(':')[1]?.split(' ')[0] || '00',
                'AM'
              )}
            >
              AM
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTimeSelect(
                parseInt(inputValue.split(':')[0] || '12'),
                inputValue.split(':')[1]?.split(' ')[0] || '00',
                'PM'
              )}
            >
              PM
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
