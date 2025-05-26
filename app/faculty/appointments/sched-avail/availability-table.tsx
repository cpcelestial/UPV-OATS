"use client";

import { useState, useEffect } from "react";
import { format, addDays, isBefore, parse } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { db } from "@/app/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore"; // setDoc already imported
import { getAuth } from "firebase/auth";

interface TimeSlot {
  time: string; // Will be "hh:mm AM/PM - hh:mm AM/PM"
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
  time: string; // Will be "hh:mm AM/PM - hh:mm AM/PM"
}

export function AvailabilityTable({
  startDate,
  editMode,
  dailyView = false,
}: AvailabilityTableProps) {
  // Generate time slots from 6:00 to 20:30 in 30-min increments
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0); // Set to start of day for consistent formatting

    for (let hour = 6; hour < 21; hour++) { // From 6 AM to 8:30 PM (last slot starts at 20:30)
      for (let min = 0; min < 60; min += 30) {
        let startDateTime = new Date(referenceDate);
        startDateTime.setHours(hour, min);

        let endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // Add 30 minutes

        // Format start and end times with 'hh:mm a' for 2-digit hour and AM/PM
        const formattedStartTime = format(startDateTime, "hh:mm a");
        const formattedEndTime = format(endDateTime, "hh:mm a");

        slots.push({
          time: `${formattedStartTime} - ${formattedEndTime}`,
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
    const slots = generateTimeSlots(); // Get all possible slots for the day
    const dayOfWeek = new Date(date).getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

    // Set default business hours for weekdays (Monday = 1, Sunday = 0)
    // Based on your 7 AM to 5 PM requirement
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // If it's a weekday
      slots.forEach((slot) => {
        const [startTimeStr] = slot.time.split(" - ");
        // Parse using 'hh:mm a' to match generated format
        const parsedTime = parse(startTimeStr, "hh:mm a", new Date());
        const startHour24 = parsedTime.getHours();

        if (startHour24 >= 7 && startHour24 < 17) { // 7 AM (hour 7) to 5 PM (hour 17)
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
        const datesToSaveToFirebase: { [key: string]: TimeSlot[] } = {}; // Collect dates needing saving

        for (const date of dates) { // Use for...of for async operations
          let dateSlots = generateTimeSlots(); // Start with a complete set of all possible slots
          let shouldSaveDate = false; // Flag to indicate if this date's slots were defaulted/changed

          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData[date] && Array.isArray(userData[date])) {
              // Data for this specific date exists in Firebase
              const firebaseSlots = userData[date] as TimeSlot[];

              dateSlots = dateSlots.map((defaultSlot) => {
                const firebaseSlot = firebaseSlots.find(
                  (s) => s.time === defaultSlot.time
                );

                if (firebaseSlot) {
                  // If a matching slot is found in Firebase, use its data
                  if (firebaseSlot.booked) {
                    newBookings.push({ date, time: firebaseSlot.time }); // Track booked slots
                  }
                  // Return the Firebase slot data (ensuring 'available' and 'booked' are booleans)
                  return {
                    time: firebaseSlot.time,
                    available: firebaseSlot.available || false,
                    booked: firebaseSlot.booked || false,
                  };
                } else {
                  // This specific slot time is missing from Firebase for this date.
                  // Initialize it with default availability and mark for saving.
                  shouldSaveDate = true;
                  const initializedSlot = initializeScheduleForDate(date).find(s => s.time === defaultSlot.time);
                  return initializedSlot || defaultSlot; // Fallback to basic default if not found
                }
              });
            } else {
              // Document exists, but no data for this specific date field
              // Initialize with default business hours and mark for saving.
              dateSlots = initializeScheduleForDate(date);
              shouldSaveDate = true;
            }
          } else {
            // No Firebase document exists for the user.
            // Initialize all dates with default business hours and mark for saving.
            dateSlots = initializeScheduleForDate(date);
            shouldSaveDate = true;
          }

          newSchedule[date] = dateSlots; // Add to local state
          if (shouldSaveDate) {
            datesToSaveToFirebase[date] = dateSlots; // Add to list for batch saving to Firebase
          }
        }

        setSchedule(newSchedule);
        setBookings(newBookings);

        // --- NEW LOGIC: Save initialized/updated schedules to Firebase ---
        if (Object.keys(datesToSaveToFirebase).length > 0) {
            console.log("Saving newly generated/updated schedules to Firebase:", datesToSaveToFirebase);
            await setDoc(docRef, datesToSaveToFirebase, { merge: true });
            console.log("Default and merged schedules saved to Firebase successfully.");
        }
        // --------------------------------------------------------

      } catch (err) {
        console.error("Error fetching or initializing data:", err);
        // Fallback to local defaults on error to prevent empty table
        const dates = generateDates();
        const fallbackSchedule: { [key: string]: TimeSlot[] } = {};
        dates.forEach((date) => {
          fallbackSchedule[date] = initializeScheduleForDate(date);
        });
        setSchedule(fallbackSchedule);
        // Fallback or display an error message to the user
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
    // If the slot is booked, it cannot be toggled to unavailable.
    // If it's already booked, clicking the checkbox does nothing.
    if (currentSlot?.booked) {
        console.log("Cannot change availability for a booked slot.");
        return; 
    }

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

      // Ensure we're working with a complete set of slots for the day
      // If `schedule[date]` is not yet initialized for some reason, generate defaults
      const currentDateSlots = schedule[date] || initializeScheduleForDate(date);
      const updatedSlots = currentDateSlots.map(slot =>
        slot.time === time
          ? { ...slot, available: newAvailability }
          : { ...slot }
      );

      console.log("Saving to Firebase:", { [date]: updatedSlots });

      // Save complete slot array for the specific date to Firebase
      await setDoc(
        docRef,
        { [date]: updatedSlots },
        { merge: true } // Merge ensures only this date field is updated/added
      );

      console.log("Successfully saved to Firebase");
    } catch (error) {
      console.error("Failed to update availability:", error);

      // Revert local state on error
      setSchedule((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map(slot =>
            slot.time === time
              ? { ...slot, available: !newAvailability } // Revert to previous state
              : { ...slot }
          );
        }
        return updated;
      });
      // Optionally, show a toast notification for the error
    }
  };

  const isSlotInPast = (date: string, time: string) => {
    const [startTimeStr] = time.split(" - ");
    const [year, month, day] = date.split("-").map(Number);
    
    // Parse using 'hh:mm a' to match generated format
    const slotStartDateTime = parse(startTimeStr, "hh:mm a", new Date(year, month - 1, day));
    
    return isBefore(slotStartDateTime, new Date());
  };

  const isSlotBooked = (date: string, time: string) => {
    return bookings.some(
      (booking) => booking.date === date && booking.time === time
    );
  };

  const getSlotStatus = (date: string, time: string, available: boolean) => {
    // Check booked status first, as it takes precedence
    if (isSlotBooked(date, time)) return "BOOKED";
    // Then check if it's in the past and was previously available (now effectively closed)
    if (isSlotInPast(date, time) && available) return "CLOSED";
    // Otherwise, show its actual availability
    if (available) return "OPEN";
    return ""; // For slots that are not available, not booked, and not in past (e.g., manually made unavailable)
  };

  const getSlotColor = (date: string, time: string, available: boolean) => {
    if (isSlotBooked(date, time)) // Booked status has highest priority for color
      return "bg-blue-100 border-blue-200 text-blue-700";
    if (isSlotInPast(date, time)) // Past status is next, overrides OPEN/UNAVAILABLE if in past
      return "bg-red-100 border-red-200 text-red-700";
    if (available) // Available is green
      return "bg-green-100 border-green-200 text-green-700";
    return ""; // Default for unavailable slots (no specific color, maybe a light grey)
  };

  if (isLoading) {
    return <div>Loading availability...</div>;
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
                {timeSlot.time} {/* This will display "hh:mm AM/PM - hh:mm AM/PM" */}
              </td>
              {Object.entries(schedule).map(([date, slots]) => {
                const slot = slots.find((s) => s.time === timeSlot.time);
                // If a slot doesn't exist (shouldn't happen with generateTimeSlots logic), provide empty cell
                if (!slot) return <td key={date} className="px-2 py-1"></td>;

                const isPast = isSlotInPast(date, timeSlot.time);
                const isBooked = isSlotBooked(date, timeSlot.time); // Check if *this* slot is booked

                return (
                  <td
                    key={date}
                    className="border-t border-l px-2 py-1 text-center"
                  >
                    {editMode ? (
                      <Checkbox
                        checked={slot.available}
                        // Disable if in past or if it's booked
                        disabled={isPast || isBooked}
                        onCheckedChange={(checked) =>
                          handleToggleAvailability(date, timeSlot.time, checked)
                        }
                        className="mx-auto"
                      />
                    ) : (
                      // Display status badge in view mode
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
                              - {/* Display a hyphen for intentionally unavailable slots in view mode */}
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