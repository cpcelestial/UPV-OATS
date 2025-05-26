import { collection, doc, setDoc, getDocs, query } from "firebase/firestore";
import { db } from "@/app/firebase-config";
import { format } from "date-fns";

type TimeSlot = {
  time: string;
  available: boolean;
  booked: boolean;
};

// Helper function to parse time strings like "8:00 AM" to 24-hour minutes
const parseTimeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(" ");
  let [hour, minute] = time.split(":").map(Number);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
};

// Helper function to check if a time slot overlaps with a scheduled period
const doesTimeSlotOverlap = (
  slotStart: number,
  slotEnd: number,
  scheduleStart: number,
  scheduleEnd: number
): boolean => {
  return slotStart < scheduleEnd && slotEnd > scheduleStart;
};

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 7; hour <= 17; hour++) {
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? "AM" : "PM";
    if (hour !== 17) {
      slots.push({
        time: `${hourFormatted}:00 ${period} - ${hourFormatted}:30 ${period}`,
        available: false,
        booked: false,
      });
      const nextHour = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
      const nextPeriod = hour + 1 < 12 ? "AM" : "PM";
      slots.push({
        time: `${hourFormatted}:30 ${period} - ${nextHour}:00 ${nextPeriod}`,
        available: false,
        booked: false,
      });
    }
  }
  return slots;
};

const generateSchedule = async (date: Date, facultyId: string): Promise<{ [date: string]: TimeSlot[] }> => {
  const schedule: { [key: string]: TimeSlot[] } = {};
  const dateKey = format(date, "yyyy-MM-dd");
  const slots = generateTimeSlots();

  // Get the day of the week for the given date
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = daysOfWeek[date.getDay()];

  // Fetch the faculty's schedule for this day
  const schedulesRef = collection(db, "schedules", facultyId, "schedule");
  const q = query(schedulesRef);
  const querySnapshot = await getDocs(q);
  const facultySchedules = querySnapshot.docs
    .map(doc => doc.data())
    .filter(schedule => schedule.day === dayOfWeek);

  // Initially, set availability based on weekday logic (7 AM - 5 PM available)
  if (date.getDay() !== 0 && date.getDay() !== 6) {
    slots.forEach((slot) => {
      const [startTime] = slot.time.split(" - ");
      const startMinutes = parseTimeToMinutes(startTime);
      const hour = Math.floor(startMinutes / 60);
      if (hour >= 7 && hour < 17) {
        slot.available = true;
      }
    });
  }

  // Mark slots as unavailable if they overlap with a scheduled period
  facultySchedules.forEach((sched) => {
    const scheduleStart = parseTimeToMinutes(sched.start);
    const scheduleEnd = parseTimeToMinutes(sched.end);

    slots.forEach((slot) => {
      const [startTime, endTime] = slot.time.split(" - ");
      const slotStart = parseTimeToMinutes(startTime);
      const slotEnd = parseTimeToMinutes(endTime);

      if (doesTimeSlotOverlap(slotStart, slotEnd, scheduleStart, scheduleEnd)) {
        slot.available = false;
      }
    });
  });

  schedule[dateKey] = slots;
  return schedule;
};

export const saveScheduleForUser = async (date: Date, facultyId: string): Promise<void> => {
  if (!facultyId) {
    console.error("No faculty ID provided.");
    return;
  }

  const schedule = await generateSchedule(date, facultyId);

  try {
    const userDocRef = doc(collection(db, "timeSlots"), facultyId);
    await setDoc(userDocRef, schedule, { merge: true });
    console.log("Schedule saved to Firestore for faculty:", facultyId);
  } catch (error) {
    console.error("Error saving schedule:", error);
  }
};