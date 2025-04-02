"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import type { DaySchedule, TimeSlot } from "../data";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: DaySchedule[];
  onUpdateSchedule: (schedule: DaySchedule[]) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12;
  const minutes = ["00", "30"];
  const period = i < 12 ? "AM" : "PM";
  return minutes.map(minute => `${hour}:${minute} ${period}`);
}).flat();

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CLASS_COLORS = [
  { label: "Pink", value: "bg-pink-100 border-pink-200 text-pink-700" },
  { label: "Red", value: "bg-red-100 border-red-200 text-red-700" },
  { label: "Orange", value: "bg-orange-100 border-orange-200 text-orange-700" },
  { label: "Yellow", value: "bg-yellow-100 border-yellow-200 text-yellow-700" },
  { label: "Green", value: "bg-green-100 border-green-200 text-green-700" },
  { label: "Blue", value: "bg-blue-100 border-blue-200 text-blue-700" },
  { label: "Indigo", value: "bg-indigo-100 border-indigo-200 text-indigo-700" },
  { label: "Purple", value: "bg-purple-100 border-purple-200 text-purple-700" },
];

interface ClassFormData {
  days: string[];
  start: string;
  end: string;
  subject: string;
  room: string;
  professor: string;
  color: string;
}

export function ScheduleDialog({ open, onOpenChange, schedule, onUpdateSchedule }: ScheduleDialogProps) {
  const [classes, setClasses] = useState<ClassFormData[]>([]);

  const handleDayToggle = (classIndex: number, day: string, checked: boolean) => {
    setClasses(prev => {
      const newClasses = [...prev];
      if (checked) {
        newClasses[classIndex].days.push(day);
      } else {
        newClasses[classIndex].days = newClasses[classIndex].days.filter(d => d !== day);
      }
      return newClasses;
    });
  };

  const handleClassChange = (index: number, field: keyof ClassFormData, value: any) => {
    setClasses(prev => {
      const newClasses = [...prev];
      newClasses[index] = { ...newClasses[index], [field]: value };
      return newClasses;
    });
  };

  const handleAddClass = () => {
    setClasses(prev => [...prev, {
      days: [],
      start: "8:00 AM",
      end: "9:30 AM",
      subject: "",
      room: "",
      professor: "",
      color: CLASS_COLORS[prev.length % CLASS_COLORS.length].value
    }]);
  };

  const handleRemoveClass = (index: number) => {
    setClasses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newSchedule = DAYS.map(day => ({
      day,
      slots: classes
        .filter(cls => cls.days.includes(day))
        .map(cls => ({
          start: cls.start,
          end: cls.end,
          subject: cls.subject,
          room: cls.room,
          professor: cls.professor,
          color: cls.color,
          days: cls.days
        }))
    }));
    onUpdateSchedule(newSchedule);
    onOpenChange(false);
  };

  // Initialize classes from schedule on dialog open
  useState(() => {
    const existingClasses = new Map<string, ClassFormData>();

    schedule.forEach(day => {
      day.slots.forEach(slot => {
        const key = `${slot.subject}-${slot.start}-${slot.end}`;
        if (!existingClasses.has(key)) {
          existingClasses.set(key, {
            days: [day.day],
            ...slot,
            color: slot.color || CLASS_COLORS[0].value
          });
        } else {
          const existing = existingClasses.get(key)!;
          existing.days.push(day.day);
        }
      });
    });

    setClasses(Array.from(existingClasses.values()));
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl py-6 pl-6 pr-4">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Class Schedule</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto py-2 pr-4 space-y-6">
          {classes.map((cls, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Subject"
                    value={cls.subject}
                    onChange={(e) => handleClassChange(index, "subject", e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <Select
                      value={cls.start}
                      onValueChange={(value) => handleClassChange(index, "start", value)}
                    >
                      <SelectTrigger>
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
                      value={cls.end}
                      onValueChange={(value) => handleClassChange(index, "end", value)}
                    >
                      <SelectTrigger>
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
                  </div>

                  <Input
                    placeholder="Room"
                    value={cls.room}
                    onChange={(e) => handleClassChange(index, "room", e.target.value)}
                  />

                  <Input
                    placeholder="Professor"
                    value={cls.professor}
                    onChange={(e) => handleClassChange(index, "professor", e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <Select
                    value={cls.color}
                    onValueChange={(value) => handleClassChange(index, "color", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose color" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.value.split(' ')[0]}`} />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <div className="font-semibold mb-2">Choose the days:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {DAYS.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${day}-${index}`}
                            checked={cls.days.includes(day)}
                            onCheckedChange={(checked) => handleDayToggle(index, day, checked as boolean)}
                          />
                          <label
                            htmlFor={`${day}-${index}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => handleRemoveClass(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Class
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button
            className="bg-[#2F5233] hover:bg-[#2F5233]/90"
            onClick={handleAddClass}
          >
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}