"use client";

import { useState, useEffect, Fragment } from "react";
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
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Appointment } from "../../data";
import { AppointmentCard } from "../appointments/appointment-card";
import { CalendarDialog } from "./calendar-dialog";
import {
  collection,
  query,
  where,
  onSnapshot,
  and,
  Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";

type ViewType = "month" | "week" | "day";

export function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const getNumber = (str: string | null | undefined): string | null => {
    if (!str) return null;
    const parts = str.split("_");
    const last = parts.pop();
    return last && /^\d+$/.test(last) ? last : null;
  };

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (currentUser) {
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          and(
            where("facultyId  ", "==", currentUser.uid),
            where("status", "==", "approved")
          )
        );

        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedAppointments: Appointment[] = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
                date:
                  doc.data().date instanceof Date
                    ? doc.data().date
                    : doc.data().date.toDate(),
              } as Appointment)
          );
          setAppointments(fetchedAppointments);
        });
      } else {
        setCurrentUser(null);
        setAppointments([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [currentUser]);

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
        setCurrentDate(
          (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
        );
        break;
      case "week":
        setCurrentDate((prev) => addDays(prev, -7));
        break;
      case "day":
        setCurrentDate((prev) => addDays(prev, -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(
          (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
        );
        break;
      case "week":
        setCurrentDate((prev) => addDays(prev, 7));
        break;
      case "day":
        setCurrentDate((prev) => addDays(prev, 1));
        break;
    }
  };

  const renderMonthView = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const firstDayOfFirstWeek = startOfWeek(firstDayOfMonth, {
      weekStartsOn: 0,
    });
    const lastDayOfLastWeek = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

    const days = eachDayOfInterval({
      start: firstDayOfFirstWeek,
      end: lastDayOfLastWeek,
    });

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium border-b border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayAppointments = appointments.filter((appt) =>
              isSameDay(appt.date, day)
            );
            const appointmentCount = dayAppointments.length;
            const isLastInRow = (index + 1) % 7 === 0;
            const isLastRow = index >= days.length - 7;

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[100px] p-2 border-r border-b border-border",
                  !isSameMonth(day, currentDate) &&
                    "bg-muted/70 text-muted-foreground",
                  "hover:bg-accent cursor-pointer transition-colors",
                  isLastInRow && "border-r-0",
                  isLastRow && "border-b-0"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {format(day, "d")}
                  </span>
                  {appointmentCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-sm bg-green-100 border border-green-200 text-green-700">
                      {appointmentCount}
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {dayAppointments.length > 0 && (
                    <Card
                      key={dayAppointments[0].id}
                      className="p-2 mb-2 bg-red-100 border-red-200 text-red-700 shadow-none"
                    >
                      <div className="text-sm font-semibold">
                        {dayAppointments[0].class === "Other"
                          ? " "
                          : dayAppointments[0].class}{" "}
                        {dayAppointments[0].section &&
                          getNumber(dayAppointments[0].section) &&
                          `- ${getNumber(dayAppointments[0].section)}`}{" "}
                        {dayAppointments[0].purpose}
                      </div>
                      <div className="text-sm">
                        {dayAppointments[0].timeSlot}
                      </div>
                    </Card>
                  )}
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
            const dayAppointments = appointments.filter((appt) =>
              isSameDay(appt.date, day)
            );
            const isLast = index === days.length - 1;

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[400px] border-r border-border",
                  "hover:bg-accent cursor-pointer transition-colors",
                  isLast && "border-r-0"
                )}
              >
                <div className="text-sm font-medium mb-2 p-2 border-b">
                  {format(day, "EEE - MMM d")}
                </div>
                {dayAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="p-2 m-2 bg-red-100 border-red-200 text-red-700 shadow-none"
                  >
                    <div className="text-sm font-semibold">
                      {appointment.purpose}
                    </div>
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
    const dayAppointments = appointments.filter((appt) =>
      isSameDay(appt.date, currentDate)
    );
    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm (6 to 21)

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
              <Fragment key={hour}>
                <div
                  className={cn(
                    "p-2 text-sm border-r border-b border-border",
                    isLast && "border-b-0"
                  )}
                >
                  {format(new Date().setHours(hour), "ha")}{" "}
                  {/* Display hour as 12-hour format */}
                </div>
                <div
                  className={cn(
                    "p-2 min-h-[60px] relative border-b border-border",
                    isLast && "border-b-0"
                  )}
                >
                  {hourAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              </Fragment>
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
            {format(
              currentDate,
              viewType === "day" ? "MMMM d, yyyy" : "MMMM yyyy"
            )}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={viewType}
            onValueChange={(value: ViewType) => setViewType(value)}
          >
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
          appointments={appointments.filter((appt) =>
            isSameDay(appt.date, selectedDate)
          )}
        />
      )}
    </div>
  );
}
