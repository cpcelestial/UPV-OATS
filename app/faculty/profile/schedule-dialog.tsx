"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, BookOpen, Calendar } from "lucide-react";
import type { DaySchedule } from "../../data";
import { db } from "@/app/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: DaySchedule[];
  onUpdateSchedule: (schedule: DaySchedule[]) => void;
  userId: string;
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

const COLORS = [
  { label: "Pink", value: "bg-pink-100 border-pink-200 text-pink-700" },
  { label: "Red", value: "bg-red-100 border-red-200 text-red-700" },
  { label: "Orange", value: "bg-orange-100 border-orange-200 text-orange-700" },
  { label: "Yellow", value: "bg-yellow-100 border-yellow-200 text-yellow-700" },
  { label: "Green", value: "bg-green-100 border-green-200 text-green-700" },
  { label: "Blue", value: "bg-blue-100 border-blue-200 text-blue-700" },
  { label: "Indigo", value: "bg-indigo-100 border-indigo-200 text-indigo-700" },
  { label: "Purple", value: "bg-purple-100 border-purple-200 text-purple-700" },
];

interface ScheduleItemData {
  type: "class" | "consultation";
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
  userId,
}: ScheduleDialogProps) {
  // Always fetch the schedule for this user when dialog opens
  useEffect(() => {
    if (open && userId) {
      const fetchSchedule = async () => {
        try {
          const scheduleDocRef = doc(db, "schedules", userId);
          await getDoc(scheduleDocRef);

          // Optionally, you can update the schedule state here if needed
        } catch (error) {
          console.error("Failed to fetch schedule:", error);
        }
      };
      fetchSchedule();
    }
  }, [open, userId]);

  const [activeTab, setActiveTab] = useState<string>("classes");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItemData[]>([]);
  const [invalidItems, setInvalidItems] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      // Map existing schedule to editable items
      const existingItems: ScheduleItemData[] = [];

      schedule.forEach((day) => {
        day.slots.forEach((slot) => {
          // Determine if it's a class or consultation based on properties
          // This is an assumption - you may need a better way to distinguish them
          const type = slot.section ? "class" : "consultation";

          const existingItem = existingItems.find(
            (item) =>
              item.start === slot.start &&
              item.end === slot.end &&
              item.subject === slot.subject &&
              item.section === slot.section &&
              item.room === slot.room &&
              item.type === type
          );

          if (existingItem) {
            existingItem.days.push(day.day);
          } else {
            existingItems.push({
              type,
              days: [day.day],
              start: slot.start,
              end: slot.end,
              subject: slot.subject || "",
              section: slot.section || "",
              room: slot.room || "",
              color: slot.color || COLORS[0].value,
            });
          }
        });
      });

      setScheduleItems(existingItems);
      setInvalidItems([]);
    }
  }, [open, schedule]);

  const handleDayToggle = (
    itemIndex: number,
    day: string,
    checked: boolean
  ) => {
    setScheduleItems((prev) => {
      const newItems = [...prev];
      if (checked) {
        newItems[itemIndex].days.push(day);
      } else {
        newItems[itemIndex].days = newItems[itemIndex].days.filter(
          (d) => d !== day
        );
      }
      return newItems;
    });

    // Remove from invalid items if days are now selected
    if (checked) {
      setInvalidItems((prev) => prev.filter((idx) => idx !== itemIndex));
    }
  };

  const handleItemChange = <K extends keyof ScheduleItemData>(
    index: number,
    field: K,
    value: ScheduleItemData[K]
  ) => {
    setScheduleItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleAddClass = () => {
    setScheduleItems((prev) => [
      ...prev,
      {
        type: "class",
        days: [],
        start: "6:00 AM",
        end: "9:00 PM",
        subject: "",
        section: "",
        room: "",
        color: COLORS[prev.length % COLORS.length].value,
      },
    ]);
    setActiveTab("classes");
  };

  const handleAddConsultation = () => {
    setScheduleItems((prev) => [
      ...prev,
      {
        type: "consultation",
        days: [],
        start: "6:00 AM",
        end: "9:00 PM",
        subject: "Consultation",
        section: "",
        room: "",
        color: "bg-gray-200 border-gray-300 text-gray-800",
      },
    ]);
    setActiveTab("consultations");
  };

  const handleRemoveItem = (index: number) => {
    setScheduleItems((prev) => prev.filter((_, i) => i !== index));
    setInvalidItems((prev) =>
      prev
        .filter((idx) => idx !== index)
        .map((idx) => (idx > index ? idx - 1 : idx))
    );
  };

  const handleSave = async () => {
    // Merge new items with the existing schedule
    const newSchedule = DAYS.map((day) => {
      const slots = scheduleItems
        .filter((item) => item.days.includes(day))
        .map((item) => ({
          start: item.start,
          end: item.end,
          subject: item.subject,
          section: item.section,
          room: item.room,
          color: item.color,
        }));

      return { day, slots };
    });

    try {
      // Save to Firestore under this user's document
      await setDoc(doc(db, "schedules", userId), {
        schedule: newSchedule,
      });
      onUpdateSchedule(newSchedule);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  const classItems = scheduleItems.filter((item) => item.type === "class");
  const consultationItems = scheduleItems.filter(
    (item) => item.type === "consultation"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl py-6 pl-6 pr-4">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Weekly Schedule</DialogTitle>
          <DialogDescription>
            Manage your classes and consultation hours
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="classes">
              Classes ({classItems.length})
            </TabsTrigger>
            <TabsTrigger value="consultations">
              Consultations ({consultationItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="classes"
            className="max-h-[50vh] overflow-y-auto py-2 pr-4 space-y-6"
          >
            {classItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No classes added yet.
              </div>
            ) : (
              classItems.map((item, index) => {
                const itemIndex = scheduleItems.findIndex((i) => i === item);
                return (
                  <div
                    key={itemIndex}
                    className="space-y-4 p-4 border rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <Input
                          placeholder="Subject"
                          value={item.subject}
                          onChange={(e) =>
                            handleItemChange(
                              itemIndex,
                              "subject",
                              e.target.value
                            )
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Select
                            value={item.start}
                            onValueChange={(value) =>
                              handleItemChange(itemIndex, "start", value)
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
                            value={item.end}
                            onValueChange={(value) =>
                              handleItemChange(itemIndex, "end", value)
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
                          value={item.room}
                          onChange={(e) =>
                            handleItemChange(itemIndex, "room", e.target.value)
                          }
                        />
                        <Select
                          value={item.color}
                          onValueChange={(value) =>
                            handleItemChange(itemIndex, "color", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose color" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLORS.map((color) => (
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
                          value={item.section}
                          onChange={(e) =>
                            handleItemChange(
                              itemIndex,
                              "section",
                              e.target.value
                            )
                          }
                        />
                        <div>
                          <div
                            className={`grid grid-cols-2 gap-2 p-2 rounded-md border ${
                              invalidItems.includes(itemIndex)
                                ? "bg-red-50 border-red-200"
                                : "border-transparent"
                            }`}
                          >
                            {DAYS.map((day) => (
                              <div
                                key={day}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`${day}-${itemIndex}`}
                                  checked={item.days.includes(day)}
                                  onCheckedChange={(checked) =>
                                    handleDayToggle(
                                      itemIndex,
                                      day,
                                      checked as boolean
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`${day}-${itemIndex}`}
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
                          onClick={() => handleRemoveItem(itemIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove Class
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent
            value="consultations"
            className="max-h-[50vh] overflow-y-auto py-2 pr-4 space-y-6"
          >
            {consultationItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No consultation hours added yet.
              </div>
            ) : (
              consultationItems.map((item, index) => {
                const itemIndex = scheduleItems.findIndex((i) => i === item);
                return (
                  <div
                    key={itemIndex}
                    className="space-y-4 p-4 border rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <Input
                          placeholder="Title"
                          value="Consultation"
                          onChange={(e) =>
                            handleItemChange(
                              itemIndex,
                              "subject",
                              "Consultation"
                            )
                          }
                          disabled
                        />
                        <div className="flex items-center gap-2">
                          <Select
                            value={item.start}
                            onValueChange={(value) =>
                              handleItemChange(itemIndex, "start", value)
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
                            value={item.end}
                            onValueChange={(value) =>
                              handleItemChange(itemIndex, "end", value)
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
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div
                            className={`grid grid-cols-2 gap-2 p-2 rounded-md border ${
                              invalidItems.includes(itemIndex)
                                ? "bg-red-50 border-red-200"
                                : "border-transparent"
                            }`}
                          >
                            {DAYS.map((day) => (
                              <div
                                key={day}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`${day}-${itemIndex}`}
                                  checked={item.days.includes(day)}
                                  onCheckedChange={(checked) =>
                                    handleDayToggle(
                                      itemIndex,
                                      day,
                                      checked as boolean
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`${day}-${itemIndex}`}
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
                          onClick={() => handleRemoveItem(itemIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove Consultation
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <div className="w-full">
            <Button
              onClick={handleAddClass}
              className="mr-2 float-left bg-[#2F5233] hover:bg-[#2F5233]/90"
            >
              <BookOpen className="h-4 w-4" />
              Add Class
            </Button>

            <Button
              onClick={handleAddConsultation}
              className="float-left bg-[#2F5233] hover:bg-[#2F5233]/90"
            >
              <Calendar className="h-4 w-4" />
              Add Consultation
            </Button>

            <Button onClick={handleSave} className="float-right">
              Save
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const itemsWithNoDays = scheduleItems
                  .map((item, index) => (item.days.length === 0 ? index : -1))
                  .filter((index) => index !== -1);

                if (itemsWithNoDays.length > 0) {
                  setInvalidItems(itemsWithNoDays);
                  return;
                }
                onOpenChange(false);
              }}
              className="mr-2 float-right"
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
