"use client";

import { useState, useEffect } from "react";
import { format, addDays, isBefore } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { db } from "@/app/firebase-config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

interface Booking {
  date: string;
  time: string;
}

export function AvailabilityTable({
  startDate,
  editMode,
  dailyView = false,
}: AvailabilityTableProps) {
  // Generate time slots from 6:00 to 20:30 in 30-min increments
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour < 21; hour++) {
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

  // Generate dates for the schedule
  const generateDates = () => {
    const dates = [];
    const days = dailyView ? 1 : 7;
    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i);
      dates.push(format(date, "yyyy-MM-dd"));
    }
    return dates;
  };

  const [schedule, setSchedule] = useState<{ [key: string]: TimeSlot[] }>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize schedule with default business hours for new dates
  const initializeScheduleForDate = (date: string): TimeSlot[] => {
    const slots = generateTimeSlots();
    const dayOfWeek = new Date(date).getDay();
    
    // Set default business hours for weekdays (Monday = 1, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      slots.forEach((slot) => {
        const [hour] = slot.time.split(":").map(Number);
        if (hour >= 9 && hour < 17) {
          slot.available = true;
        }
      });
    }
    
    return slots;
  };

  // Fetch data from Firebase
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const dates = generateDates();
        const docRef = doc(db, "timeSlots", user.uid);
        const docSnap = await getDoc(docRef);

        const newSchedule: { [key: string]: TimeSlot[] } = {};
        const newBookings: Booking[] = [];

        dates.forEach((date) => {
          // Always start with a complete set of time slots
          let dateSlots = generateTimeSlots();

          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            if (userData[date] && Array.isArray(userData[date])) {
              // Merge Firebase data with complete time slot structure
              const firebaseSlots = userData[date] as TimeSlot[];
              
              dateSlots = dateSlots.map((defaultSlot) => {
                const firebaseSlot = firebaseSlots.find(
                  (s) => s.time === defaultSlot.time
                );
                
                if (firebaseSlot) {
                  // Preserve Firebase data and track bookings
                  if (firebaseSlot.booked) {
                    newBookings.push({ date, time: firebaseSlot.time });
                  }
                  return {
                    time: firebaseSlot.time,
                    available: firebaseSlot.available || false,
                    booked: firebaseSlot.booked || false,
                  };
                }
                
                // Use default for missing slots
                return { ...defaultSlot };
              });
            } else {
              // Date doesn't exist in Firebase - apply default business hours
              dateSlots = initializeScheduleForDate(date);
            }
          } else {
            // No Firebase document exists - apply default business hours
            dateSlots = initializeScheduleForDate(date);
          }

          newSchedule[date] = dateSlots;
        });

        console.log("Loaded schedule:", newSchedule); // Debug log
        console.log("Generated dates:", dates); // Debug log
        setSchedule(newSchedule);
        setBookings(newBookings);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Initialize with defaults on error
        const dates = generateDates();
        const fallbackSchedule: { [key: string]: TimeSlot[] } = {};
        dates.forEach((date) => {
          fallbackSchedule[date] = initializeScheduleForDate(date);
        });
        setSchedule(fallbackSchedule);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, dailyView]);

  const handleToggleAvailability = async (
    date: string,
    time: string,
    checked?: boolean | "indeterminate"
  ) => {
    if (!editMode) return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    const currentSlot = schedule[date]?.find((s) => s.time === time);
    const newAvailability = checked === true ? true : 
                           checked === false ? false : 
                           !(currentSlot?.available || false);

    // Update local state immediately for responsive UI
    setSchedule((prev) => {
      const updated = { ...prev };
      if (updated[date]) {
        updated[date] = updated[date].map(slot =>
          slot.time === time 
            ? { ...slot, available: newAvailability }
            : { ...slot }
        );
      }
      return updated;
    });

    try {
      const docRef = doc(db, "timeSlots", user.uid);
      
      // Use current local state to build the complete slot array
      const currentDateSlots = schedule[date] || generateTimeSlots();
      const updatedSlots = currentDateSlots.map(slot => 
        slot.time === time 
          ? { ...slot, available: newAvailability }
          : { ...slot }
      );

      console.log("Saving to Firebase:", { [date]: updatedSlots }); // Debug log

      // Save complete slot array to Firebase
      await setDoc(
        docRef,
        { [date]: updatedSlots },
        { merge: true }
      );
      
      console.log("Successfully saved to Firebase"); // Debug log
    } catch (error) {
      console.error("Failed to update availability:", error);
      
      // Revert local state on error
      setSchedule((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map(slot =>
            slot.time === time 
              ? { ...slot, available: !newAvailability }
              : { ...slot }
          );
        }
        return updated;
      });
    }
  };

  const isSlotInPast = (date: string, time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const [year, month, day] = date.split("-").map(Number);
    const slotDate = new Date(year, month - 1, day, hour, minute);
    return isBefore(slotDate, new Date());
  };

  const isSlotBooked = (date: string, time: string) => {
    return bookings.some(
      (booking) => booking.date === date && booking.time === time
    );
  };

  const getSlotStatus = (date: string, time: string, available: boolean) => {
    if (isSlotBooked(date, time)) return "BOOKED";
    if (isSlotInPast(date, time) && available) return "CLOSED";
    if (available) return "OPEN";
    return "";
  };

  const getSlotColor = (date: string, time: string, available: boolean) => {
    if (isSlotInPast(date, time))
      return "bg-red-100 border-red-200 text-red-700";
    if (isSlotBooked(date, time))
      return "bg-blue-100 border-blue-200 text-blue-700";
    if (available) return "bg-green-100 border-green-200 text-green-700";
    return "";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
                        disabled={isPast || isBooked}
                        onCheckedChange={(checked) =>
                          handleToggleAvailability(date, timeSlot.time, checked)
                        }
                        className="mx-auto"
                      />
                    ) : (
                      (() => {
                        const status = getSlotStatus(date, timeSlot.time, slot.available);
                        if (status) {
                          return (
                            <div className="flex justify-center">
                              <Badge
                                variant={"outline"}
                                className={cn(
                                  "px-4 py-1 font-semibold justify-center w-24",
                                  getSlotColor(date, timeSlot.time, slot.available)
                                )}
                              >
                                {status}
                              </Badge>
                            </div>
                          );
                        }
                        return (
                          <div className="flex justify-center">
                            <div className="w-24 h-6 flex items-center justify-center text-xs text-gray-400">
                              -
                            </div>
                          </div>
                        );
                      })()
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