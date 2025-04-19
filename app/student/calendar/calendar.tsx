"use client";

import * as React from "react";
import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parse,
  getHours,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarDialog } from "./calendar-dialog";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";

type ViewType = "month" | "week" | "day";

export interface Appointment {
  purpose: string;
  class: string;
  id: string;
  details?: string;
  meetingType: string;
  facultyName: string;
  email: string;
  date: Date;
  participants: string[];
  status: string;
  timeSlot: string;
  userId: string;
}


export function Calendar() {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [viewType, setViewType] = React.useState<ViewType>("month");
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("userId", "==", user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedAppointments: Appointment[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date instanceof Date ? doc.data().date : doc.data().date.toDate(),
          } as Appointment));
          setAppointments(fetchedAppointments);
          console.log("Fetched Appointments:", fetchedAppointments);
        });
      } else {
        setCurrentUser(null);
        setAppointments([]); // Clear appointments if no user
      }
    });

    return () => unsubscribe();
  }, []);

  // const [appointments] = React.useState<Appointment[]>([
  //   {
  //     class: "1",
  //     id: "1",
  //     title: "Project Discussion",
  //     facultyName: "Dr. Smith",
  //     email: "smith@example.com",
  //     timeSlot: "10:00 AM - 10:30 AM",
  //     date: new Date(2025, 3, 15),
  //     details: "Discuss project requirements and timeline.",
  //     meetingType: "f2f",
  //     participants: ["user123", "user456"],
  //     status: "confirmed",
  //     userId: "user123"
  //   },
  //   {
  //     class: "2",
  //     id: "2",
  //     title: "Project Discussion CMSC56",
  //     facultyName: "Dr. Smith",
  //     email: "smith@example.com",
  //     timeSlot: "10:00 AM - 10:30 AM",
  //     date: new Date(2025, 3, 23),
  //     details: "Discuss project requirements and timeline.",
  //     meetingType: "f2f",
  //     participants: ["user123", "user456"],
  //     status: "pending",
  //     userId: "user123"
  //   }
  // ]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
  };

  const getStartTimeFromTimeSlot = (timeSlot: string): string => {
    if (!timeSlot || typeof timeSlot !== "string") return "";
    const [startTime] = timeSlot.split(" - ");
    return startTime.trim();
  };

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
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
    const lastDayOfLastWeek = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

    const days = eachDayOfInterval({
      start: firstDayOfFirstWeek,
      end: lastDayOfLastWeek
    });

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium border-b border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayAppointments = appointments.filter(appt => isSameDay(appt.date, day));
            const isLastInRow = (index + 1) % 7 === 0;
            const isLastRow = index >= days.length - 7;

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[100px] p-2 border-r border-b border-border",
                  !isSameMonth(day, currentDate) && "bg-muted/70 text-muted-foreground",
                  "hover:bg-accent cursor-pointer transition-colors",
                  isLastInRow && "border-r-0",
                  isLastRow && "border-b-0"
                )}
              >
                <span className="text-sm font-medium">{format(day, "d")}</span>
                <div className="mt-1 space-y-1">
                  {dayAppointments.map(appointment => (
                    <Card key={appointment.id} className="p-2 mb-2 bg-red-100 border-red-200 text-red-700 shadow-none">
                      <div className="text-sm font-semibold">{appointment.purpose}</div>
                      <div className="text-sm">{appointment.timeSlot}</div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start, end });


    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayAppointments = appointments.filter(appt => isSameDay(appt.date, day));
            const isLast = index === days.length - 1;

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[400px] p-2 border-r border-border",
                  "hover:bg-accent/5 cursor-pointer transition-colors",
                  isLast && "border-r-0"
                )}
              >
                <div className="text-sm font-medium mb-2">
                  {format(day, "EEE MMM d")}
                </div>
                {dayAppointments.map(appointment => (
                  <Card key={appointment.id} className="p-2 mb-2 bg-red-100 border-red-200 text-red-700 shadow-none">
                    <div className="text-sm font-semibold">{appointment.purpose}</div>
                    <div className="text-sm">{appointment.timeSlot}</div>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayAppointments = appointments.filter((appt) => isSameDay(appt.date, currentDate));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[100px_1fr]">
          {hours.map((hour, index) => {
            const hourAppointments = dayAppointments.filter((appt) => {
              const startTime = getStartTimeFromTimeSlot(appt.timeSlot); // e.g., "10:00 AM"
              if (!startTime) return false;

              // Parse the startTime (e.g., "10:00 AM") into a Date object
              // We need a base date for parsing; we'll use the appointment date
              const baseDate = appt.date;
              const parsedStartTime = parse(startTime, "h:mm a", baseDate);
              const startHour = getHours(parsedStartTime); // Get the hour in 24-hour format

              return startHour === hour;
            });

            const isLast = index === hours.length - 1;

            return (
              <React.Fragment key={hour}>
                <div
                  className={cn(
                    "p-2 text-sm border-r border-b border-border",
                    isLast && "border-b-0"
                  )}
                >
                  {format(new Date().setHours(hour), "ha")} {/* Display hour as 12-hour format */}
                </div>
                <div
                  className={cn(
                    "p-2 min-h-[60px] relative border-b border-border",
                    isLast && "border-b-0"
                  )}
                >
                  {hourAppointments.map((appointment) => {
                    const startTime = getStartTimeFromTimeSlot(appointment.timeSlot);
                    const [, endTime] = appointment.timeSlot.split(" - ");
                    return (
                      <Card
                        key={appointment.id}
                        className="p-2 mb-2 bg-red-100 border-red-200 text-red-700 shadow-none"
                      >
                        <div className="text-sm font-semibold">{appointment.purpose}</div>
                        <div className="text-sm">
                          {startTime} - {endTime?.trim()}
                        </div>

                      </Card>
                    );
                  })}
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
            <Button size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewType === "month" && renderMonthView()}
      {viewType === "week" && renderWeekView()}
      {viewType === "day" && renderDayView()}

      {selectedDate && (
        <CalendarDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          date={selectedDate}
          appointments={appointments.filter(appt => isSameDay(appt.date, selectedDate))}
        />
      )}
    </div>
  );
}