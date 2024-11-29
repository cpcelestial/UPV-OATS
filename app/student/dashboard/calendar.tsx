import React from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function AppCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <DayPicker
      mode="single"
      selected={date}
      onSelect={setDate}
      showOutsideDays={showOutsideDays}
      className={cn("p-4 w-full max-w-md border rounded-lg bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6 w-full",
        caption: "flex justify-center items-center relative h-12 mb-6",
        caption_label: "text-xl font-medium mx-10",
        nav: "flex items-center absolute inset-0 justify-between px-4",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 text-muted-foreground hover:bg-transparent border-none"
        ),
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 mb-2",
        head_cell: "text-muted-foreground text-center font-normal text-base",
        row: "grid grid-cols-7 mt-2",
        cell: cn(
          "relative p-0 text-center text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-muted"
        ),
        day_selected:
          "bg-[#7c0a02] text-white hover:bg-[#7c0a02] hover:text-white focus:bg-[#7c0a02] focus:text-white",
        day_today: "bg-[#7c0a02] text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-6 w-6" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-6 w-6" />,
      }}
      {...props}
    />
  );
}

