"use client";

import * as React from "react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { AppointmentsListDialog } from "./appointments-list-dialog";
import { useRouter } from "next/navigation";

import { 
  collection, 
  query, 
  where,
  or, 
  onSnapshot 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase-config";


type ViewType = "month" | "week" | "day";

export interface Appointment {
  time: "10:00 AM" | "1:00 PM" | "4:00 PM";
  id: string;
  date: Date;
  startTime: string; 
  endTime: string;   
  name: string;
  email: string;
  avatar: string;
  facultyName: string;
  title: string;
  location: string;
  course: string;
  section: string;
  meetingNotes?: string;
}

export function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date>();
  const [viewType, setViewType] = React.useState<ViewType>("month");
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  const router = useRouter();

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);

      const appointmentsRef = collection(db, "appointments");
      const combinedQuery = query(
        appointmentsRef, 
        or(
          where("userId", "==", user.uid),
          where("facultyId", "==", user.uid)
        )
      );

      const unsubscribeAppointments = onSnapshot(combinedQuery, (snapshot) => {
        const fetchedAppointments: Appointment[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(), // Convert Firestore timestamp to Date
        } as Appointment));

        setAppointments(fetchedAppointments);
      });
        return () => {
          unsubscribeAppointments();
        };
      } else {
        setCurrentUser(null);
        setAppointments([]);
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  const previousPeriod = () => {
    if (viewType === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewType === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const nextPeriod = () => {
    if (viewType === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewType === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((appointment) =>
      isSameDay(new Date(appointment.date), date)
    );
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleAddAppointment = () => {
    router.push("/student/calendar/add-app");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={previousPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {viewType === "month" && format(currentDate, "MMMM yyyy")}
            {viewType === "week" && `Week of ${format(currentDate, "MMM d, yyyy")}`}
            {viewType === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={nextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search appointments..." className="pl-8 w-[200px]" />
          </div>
          <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#35563F] hover:bg-[#2A4A33]" onClick={handleAddAppointment}>
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>
      </div>

      {viewType === "month" && (
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="bg-background p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[120px] bg-background p-2 cursor-pointer hover:bg-muted/50",
                  !isCurrentMonth && "text-muted-foreground",
                  "relative"
                )}
                onClick={() => handleDayClick(day)}
              >
                <span className="text-sm">{format(day, "d")}</span>
                <div className="mt-1 space-y-1">
                  {dayAppointments.map((appointment) => (
                    <div key={appointment.id} className="rounded bg-[#E8F0EB] p-1 text-xs">
                      {/* Displaying faculty and time */}
                      <div className="font-medium">{appointment.title}</div>
                      <div className="font-light">{appointment.facultyName}</div>
                      <div className="text-xs">{appointment.startTime} - {appointment.endTime}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewType === "week" && (
        <WeekView
          currentDate={currentDate}
          appointments={appointments}
          onDayClick={handleDayClick}
        />
      )}

      {viewType === "day" && (
        <DayView currentDate={currentDate} appointments={appointments} />
      )}

      <AppointmentsListDialog
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate || new Date()}
        appointments={selectedDate ? getAppointmentsForDay(selectedDate) : []}
      />
    </div>
  );
}
