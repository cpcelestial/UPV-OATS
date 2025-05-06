"use client";

import { useState, useEffect } from "react";
import { format, addDays, isBefore, setHours, setMinutes } from "date-fns";
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
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Fetch data from Firebase with the structure: timeSlots/{userId}/{dateField: Array<TimeSlot>}
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) return;
  
    const fetchData = async () => {
      try {
        // Generate dates to check
        const dates = [];
        const days = dailyView ? 1 : 7;
        for (let i = 0; i < days; i++) {
          const date = addDays(startDate, i);
          dates.push(format(date, "yyyy-MM-dd"));
        }
        
        // Initialize a new schedule with default time slots
        const newSchedule: { [key: string]: TimeSlot[] } = {};
        dates.forEach(date => {
          newSchedule[date] = generateTimeSlots();
        });
        
        // Fetch the user's document
        const docRef = doc(db, "timeSlots", user.uid);
        const docSnap = await getDoc(docRef);
        
        const newBookings: Booking[] = [];
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Process each date that exists in the document
          dates.forEach(date => {
            if (userData[date]) {
              // Replace default slots with the ones from Firebase
              const dateSlots = userData[date];
              
              // Convert Firebase array to our time slots format
              if (Array.isArray(dateSlots)) {
                // Merge with the default slots to ensure we have all time slots
                dateSlots.forEach((slot, index) => {
                  // Find corresponding default slot
                  const slotIndex = newSchedule[date].findIndex(s => s.time === slot.time);
                  
                  if (slotIndex >= 0) {
                    // Update existing slot
                    newSchedule[date][slotIndex] = {
                      time: slot.time,
                      available: slot.available,
                      booked: slot.booked
                    };
                    
                    // Track bookings
                    if (slot.booked) {
                      newBookings.push({ date, time: slot.time });
                    }
                  }
                });
              }
            }
          });
        }
        
        setSchedule(newSchedule);
        setBookings(newBookings);
      } catch (err) {
        console.error("Error fetching data:", err);
        // If error, fall back to generated schedule
        setSchedule(generateSchedule());
      }
    };
  
    fetchData();
  }, [startDate, dailyView]);

  // Initialize with generated schedule if no schedule is set
  useEffect(() => {
    if (Object.keys(schedule).length === 0) {
      setSchedule(generateSchedule());
    }
  }, [startDate, dailyView]);

  const handleToggleAvailability = async (
    date: string,
    time: string,
    checked?: boolean | "indeterminate"
  ) => {
    if (!editMode) return;
  
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
  
    // Update local state
    setSchedule((prev) => {
      const updated = { ...prev };
      const slot = updated[date]?.find((s) => s.time === time);
      if (slot) {
        slot.available = checked === true ? true : checked === false ? false : !slot.available;
      }
      return updated;
    });
  
    try {
      const docRef = doc(db, "timeSlots", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        let existingDateSlots = data[date] || [];
        
        // Find if this time slot already exists
        const existingSlotIndex = existingDateSlots.findIndex(
          (slot: TimeSlot) => slot.time === time
        );
        
        if (existingSlotIndex >= 0) {
          // Update the existing time slot's availability
          existingDateSlots[existingSlotIndex] = {
            ...existingDateSlots[existingSlotIndex],
            available: checked === true ? true : checked === false ? false : !existingDateSlots[existingSlotIndex].available
          };
        } else {
          // Add a new time slot
          existingDateSlots.push({
            time,
            available: checked === true ? true : checked === false ? false : true,
            booked: false
          });
        }
        
        // Sort the array by time
        existingDateSlots.sort((a: TimeSlot, b: TimeSlot) => 
          a.time.localeCompare(b.time)
        );
        
        // Update the document with the modified slots array
        await updateDoc(docRef, {
          [date]: existingDateSlots
        });
      } else {
        // Create a new document for this user
        const newSlot = {
          time,
          available: checked === true ? true : checked === false ? false : true,
          booked: false
        };
        
        await setDoc(docRef, {
          [date]: [newSlot]
        });
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
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
            <th className="border-b px-4 py-2 text-center w-24">Local Time</th>
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
              <td className="border-b px-2 py-2 text-center bg-muted/50">
                {timeSlot.time}
              </td>

              {Object.entries(schedule).map(([date, slots]) => {
                const slot = slots.find((s) => s.time === timeSlot.time);
                if (!slot) return <td key={date} className="px-2 py-1"></td>;

                const isPast = isSlotInPast(date, timeSlot.time);
                const isBooked = isSlotBooked(date, timeSlot.time);

                return (
                  <td key={date} className="border px-2 py-1 text-center">
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
                      (slot.available || isPast) && (
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