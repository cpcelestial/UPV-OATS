"use client";

import { useState, useEffect } from "react";
import { format, addDays, isBefore, setHours, setMinutes } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
  booked: boolean;
}

interface AvailabilityTableProps {
  startDate: Date;
  editMode: boolean;
  dailyView?: boolean;
}

export function AvailabilityTable({
  startDate,
  editMode,
  dailyView = false,
}: AvailabilityTableProps) {
  // Generate time slots from 00:00 to 23:30 in 30-min increments
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${min
            .toString()
            .padStart(2, "0")}`,
          available: false,
          booked: false,
        });
      }
    }
    return slots;
  };

  // Generate initial schedule
  const generateSchedule = () => {
    const schedule: { [key: string]: TimeSlot[] } = {};
    const days = dailyView ? 1 : 7;

    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i);
      const dateKey = format(date, "yyyy-MM-dd");
      schedule[dateKey] = generateTimeSlots();

      // Set some defaults - weekdays 9-5 are available
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        // Not weekend
        schedule[dateKey].forEach((slot) => {
          const [hour] = slot.time.split(":").map(Number);
          if (hour >= 9 && hour < 17) {
            slot.available = true;
          }
        });
      }
    }

    return schedule;
  };

  const [schedule, setSchedule] = useState<{ [key: string]: TimeSlot[] }>({});

  // Mock booking data
  const [bookings, setBookings] = useState<{ date: string; time: string }[]>([
    {
      date: format(addDays(startDate, 1), "yyyy-MM-dd"),
      time: "10:00",
    },
    {
      date: format(addDays(startDate, 2), "yyyy-MM-dd"),
      time: "14:30",
    },
  ]);

  useEffect(() => {
    setSchedule(generateSchedule());
  }, [startDate, dailyView]);

  const handleToggleAvailability = (
    date: string,
    time: string,
    checked?: boolean
  ) => {
    if (!editMode) return;

    setSchedule((prev) => {
      const newSchedule = { ...prev };
      const slot = newSchedule[date].find((s) => s.time === time);
      if (slot) {
        // Use the checked parameter directly if provided
        slot.available = checked !== undefined ? checked : !slot.available;
      }
      return newSchedule;
    });
  };

  // Check if a slot is in the past
  const isSlotInPast = (date: string, time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const slotDate = new Date(date);
    setHours(slotDate, hour);
    setMinutes(slotDate, minute);

    return isBefore(slotDate, new Date());
  };

  // Check if a slot is booked
  const isSlotBooked = (date: string, time: string) => {
    return bookings.some(
      (booking) => booking.date === date && booking.time === time
    );
  };

  // Determine slot status text
  const getSlotStatus = (date: string, time: string, available: boolean) => {
    if (isSlotInPast(date, time)) return "CLOSED";
    if (isSlotBooked(date, time)) return "BOOKED";
    if (available) return "OPEN";
    return "";
  };

  // Determine slot color
  const getSlotColor = (date: string, time: string, available: boolean) => {
    if (isSlotInPast(date, time))
      return "bg-red-100 border-red-200 text-red-700";
    if (isSlotBooked(date, time))
      return "bg-blue-100 border-blue-200 text-blue-700";
    if (available) return "bg-green-100 border-green-200 text-green-700";
    return "";
  };

  return (
    <div className="border rounded-md overflow-auto">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-2 text-center w-24">Local Time</th>
            {Object.keys(schedule).map((date) => (
              <th
                key={date}
                className="border-l px-4 py-2 text-center min-w-[120px]"
              >
                <div>{format(new Date(date), "MMMM d")}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(date), "EEE")}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {generateTimeSlots().map((timeSlot) => (
            <tr key={timeSlot.time}>
              <td className="border-t px-2 py-2 text-center bg-muted/50">
                {timeSlot.time}
              </td>

              {Object.entries(schedule).map(([date, slots]) => {
                const slot = slots.find((s) => s.time === timeSlot.time);
                if (!slot) return <td key={date} className="px-2 py-1"></td>;

                const isPast = isSlotInPast(date, timeSlot.time);
                const isBooked = isSlotBooked(date, timeSlot.time);

                return (
                  <td
                    key={date}
                    className="border-t border-l px-2 py-1 text-center"
                  >
                    {editMode ? (
                      <Checkbox
                        checked={slot.available}
                        disabled={isPast}
                        onCheckedChange={(checked) =>
                          handleToggleAvailability(date, timeSlot.time, checked)
                        }
                        className="mx-auto"
                      />
                    ) : (
                      slot.available && (
                        <div className="flex justify-center">
                          <Badge
                            variant={"outline"}
                            className={cn(
                              "px-4 py-1 font-semibold justify-center w-24",
                              getSlotColor(date, timeSlot.time, slot.available)
                            )}
                          >
                            {getSlotStatus(date, timeSlot.time, slot.available)}
                          </Badge>
                        </div>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
