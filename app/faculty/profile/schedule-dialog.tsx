"use client";

import { updateSchedule } from "@/app/firebaseService";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import type { DaySchedule } from "../../data";

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
  return minutes.map((minute) => `${hour}:${minute} ${period}`);
}).flat();

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
  section: string;
  room: string;
  color: string;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  schedule,
  onUpdateSchedule,
}: ScheduleDialogProps) {
  const [classes, setClasses] = useState<ClassFormData[]>([]);
  const [invalidClasses, setInvalidClasses] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      // Map existing schedule to editable classes
      const existingClasses: ClassFormData[] = [];

      schedule.forEach((day) => {
        day.slots.forEach((slot) => {
          const existingClass = existingClasses.find(
            (cls) =>
              cls.start === slot.start &&
              cls.end === slot.end &&
              cls.subject === slot.subject &&
              cls.section === slot.section &&
              cls.room === slot.room
          );

          if (existingClass) {
            existingClass.days.push(day.day);
          } else {
            existingClasses.push({
              days: [day.day],
              start: slot.start,
              end: slot.end,
              subject: slot.subject || "",
              section: slot.section || "",
              room: slot.room || "",
              color: slot.color || CLASS_COLORS[0].value,
            });
          }
        });
      });

      setClasses(existingClasses); // Initialize classes with all existing slots
      setInvalidClasses([]); // Reset invalid classes when dialog opens
    }
  }, [open, schedule]);

  const handleDayToggle = (
    classIndex: number,
    day: string,
    checked: boolean
  ) => {
    setClasses((prev) => {
      const newClasses = [...prev];
      if (checked) {
        newClasses[classIndex].days.push(day);
      } else {
        newClasses[classIndex].days = newClasses[classIndex].days.filter(
          (d) => d !== day
        );
      }
      return newClasses;
    });

    // Remove from invalid classes if days are now selected
    if (checked) {
      setInvalidClasses((prev) => prev.filter((idx) => idx !== classIndex));
    }
  };

  const handleClassChange = <K extends keyof ClassFormData>(
    index: number,
    field: K,
    value: ClassFormData[K]
  ) => {
    setClasses((prev) => {
      const newClasses = [...prev];
      newClasses[index] = { ...newClasses[index], [field]: value };
      return newClasses;
    });
  };

  const handleAddClass = () => {
    setClasses((prev) => [
      ...prev,
      {
        days: [],
        start: "8:00 AM",
        end: "9:30 AM",
        subject: "",
        section: "",
        room: "",
        color: CLASS_COLORS[prev.length % CLASS_COLORS.length].value,
      },
    ]);
  };

  const handleRemoveClass = (index: number) => {
    setClasses((prev) => prev.filter((_, i) => i !== index));
    setInvalidClasses((prev) =>
      prev
        .filter((idx) => idx !== index)
        .map((idx) => (idx > index ? idx - 1 : idx))
    );
  };

  const handleSave = async () => {
    // Merge new classes with the existing schedule
    const newSchedule = DAYS.map((day) => {
      const slots = classes
        .filter((cls) => cls.days.includes(day))
        .map((cls) => ({
          start: cls.start,
          end: cls.end,
          subject: cls.subject,
          section: cls.section,
          room: cls.room,
          color: cls.color,
        }));

      return { day, slots };
    });

    try {
      await updateSchedule(newSchedule); // Save to Firestore
      onUpdateSchedule(newSchedule); // Update local state
      onOpenChange(false); // Close the dialog
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl py-6 pl-6 pr-4">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Weekly Schedule</DialogTitle>
          <DialogDescription>Customize your weekly schedule</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto py-2 pr-4 space-y-6">
          {classes.map((cls, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Subject"
                    value={cls.subject}
                    onChange={(e) =>
                      handleClassChange(index, "subject", e.target.value)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Select
                      value={cls.start}
                      onValueChange={(value) =>
                        handleClassChange(index, "start", value)
                      }
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
                      onValueChange={(value) =>
                        handleClassChange(index, "end", value)
                      }
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
                    onChange={(e) =>
                      handleClassChange(index, "room", e.target.value)
                    }
                  />
                  <Select
                    value={cls.color}
                    onValueChange={(value) =>
                      handleClassChange(index, "color", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose color" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded ${
                                color.value.split(" ")[0]
                              }`}
                            />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Section"
                    value={cls.section}
                    onChange={(e) =>
                      handleClassChange(index, "section", e.target.value)
                    }
                  />
                  <div>
                    <div
                      className={`grid grid-cols-2 gap-2 p-2 rounded-md border ${
                        invalidClasses.includes(index)
                          ? "bg-red-50 border-red-200"
                          : "border-transparent"
                      }`}
                    >
                      {DAYS.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${day}-${index}`}
                            checked={cls.days.includes(day)}
                            onCheckedChange={(checked) =>
                              handleDayToggle(index, day, checked as boolean)
                            }
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
        </div>
        <DialogFooter>
          <div className="w-full">
            <Button
              className="float-left bg-[#2F5233] hover:bg-[#2F5233]/90"
              onClick={handleAddClass}
            >
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const classesWithNoDays = classes
                .map((cls, index) => (cls.days.length === 0 ? index : -1))
                .filter((index) => index !== -1);

              if (classesWithNoDays.length > 0) {
                setInvalidClasses(classesWithNoDays);
                return;
              }
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
