"use client";

import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ViewType = "month" | "week" | "day";

interface Event {
  id: string;
  title: string;
  date: Date;
  time?: string;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [viewType, setViewType] = React.useState<ViewType>("month");

  // Sample events - in a real app, this would come from your backend
  const [events] = React.useState<Event[]>([
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(2025, 3, 15),
      time: "10:00 AM"
    },
    {
      id: "2",
      title: "Project Review",
      date: new Date(2025, 3, 16),
      time: "2:00 PM"
    }
  ]);

  const navigatePrevious = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
        break;
      case "week":
        setCurrentDate(prev => addDays(prev, -7));
        break;
      case "day":
        setCurrentDate(prev => addDays(prev, -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
        break;
      case "week":
        setCurrentDate(prev => addDays(prev, 7));
        break;
      case "day":
        setCurrentDate(prev => addDays(prev, 1));
        break;
    }
  };

  const renderMonthView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    // Get the first day of the month
    const firstDayOfMonth = startOfMonth(currentDate);
    // Get the last day of the month
    const lastDayOfMonth = endOfMonth(currentDate);

    // Get the first day of the first week of the month
    const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Sunday as week start
    // Get the last day of the last week of the month
    const lastDayOfLastWeek = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 }); // Sunday as week start

    // Get all days between start and end
    const days = eachDayOfInterval({
      start: firstDayOfFirstWeek,
      end: lastDayOfLastWeek
    });

    return (
      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-background p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayEvents = events.filter(event => isSameDay(event.date, day));
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] bg-background p-2",
                !isSameMonth(day, currentDate) && "text-muted-foreground bg-muted/5",
                "hover:bg-accent cursor-pointer"
              )}
            >
              <span className="text-sm">{format(day, "d")}</span>
              <div className="mt-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="text-xs bg-primary/10 text-primary rounded p-1 mb-1 truncate"
                  >
                    {event.time && <span className="mr-1">{event.time}</span>}
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday as week start
    const end = endOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday as week start
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
        {days.map(day => {
          const dayEvents = events.filter(event => isSameDay(event.date, day));
          return (
            <div key={day.toString()} className="bg-background p-2 min-h-[400px]">
              <div className="text-sm font-medium mb-2">
                {format(day, "EEE MMM d")}
              </div>
              {dayEvents.map(event => (
                <Card key={event.id} className="p-2 mb-2">
                  <div className="text-sm font-medium">{event.time}</div>
                  <div className="text-sm">{event.title}</div>
                </Card>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter(event => isSameDay(event.date, currentDate));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-background rounded-lg overflow-hidden">
        <div className="grid grid-cols-[100px_1fr] divide-x">
          {hours.map(hour => {
            const timeString = `${hour.toString().padStart(2, "0")}:00`;
            const hourEvents = dayEvents.filter(event => event.time?.includes(timeString));

            return (
              <React.Fragment key={hour}>
                <div className="p-2 text-sm text-muted-foreground">
                  {format(new Date().setHours(hour), "ha")}
                </div>
                <div className="p-2 min-h-[60px] relative">
                  {hourEvents.map(event => (
                    <Card key={event.id} className="p-2 mb-2">
                      <div className="text-sm font-medium">{event.time}</div>
                      <div className="text-sm">{event.title}</div>
                    </Card>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-6 w-6" />
          <h2 className="text-2xl font-bold tracking-tight">
            {format(currentDate, viewType === "day" ? "MMMM d, yyyy" : "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewType === "month" && renderMonthView()}
      {viewType === "week" && renderWeekView()}
      {viewType === "day" && renderDayView()}
    </div>
  );
}