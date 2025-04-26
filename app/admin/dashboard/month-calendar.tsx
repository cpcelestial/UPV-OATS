"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MonthCalendarProps {
  className?: string;
  onDateSelect?: (date: Date | undefined) => void;
  initialDate?: Date;
  showHeader?: boolean;
  appointmentDates?: Date[];
}

export default function MonthCalendar({
  className,
  onDateSelect,
  initialDate,
  showHeader = true,
  appointmentDates = [],
}: MonthCalendarProps) {
  // State for selected date
  const [date, setDate] = useState<Date | undefined>(initialDate);

  // Handle date selection
  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const hasAppointment = (day: Date) => {
    return appointmentDates.some(
      (appointmentDate) =>
        appointmentDate.getDate() === day.getDate() &&
        appointmentDate.getMonth() === day.getMonth() &&
        appointmentDate.getFullYear() === day.getFullYear()
    );
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardContent className="p-0">
        {showHeader && (
          <div className="p-4">
            <div className="font-secondary text-3xl font-bold">
              {date
                ? format(date, "EEE, MMM d")
                : format(new Date(), "EEE, MMM d")}
            </div>
          </div>
        )}
        <div className="border-t">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="p-4 w-full max-w-md rounded-b-lg bg-white"
            classNames={{
              months:
                "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-6 w-full",
              caption: "flex justify-center items-center relative h-12 mb-6",
              caption_label: "text-xl font-medium mx-10",
              table: "w-full border-collapse",
              head_row: "grid grid-cols-7 gap-2 mb-2",
              head_cell:
                "text-muted-foreground text-center font-normal text-base",
              row: "grid grid-cols-7 gap-2 mt-2",
              cell: cn(
                "relative p-0 text-center text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected])]:rounded-md"
              ),
              day: cn(
                "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-muted hover:text-[#212121] rounded-md transition-all duration-200",
                ({ day }: { day: Date }) =>
                  hasAppointment(day) ? "border- border-blue-500" : ""
              ),
              day_selected:
                "bg-[#7B1113] text-white focus:bg-[#7c0a02] focus:text-white",
              day_today: "bg-[#014421] text-white text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
