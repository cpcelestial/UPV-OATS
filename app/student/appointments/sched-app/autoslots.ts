import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase-config";
import { format } from "date-fns";

type TimeSlot = {
  time: string;
  available: boolean;
  booked: boolean;
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

const generateSchedule = (date: Date): { [date: string]: TimeSlot[] } => {
  const schedule: { [key: string]: TimeSlot[] } = {};
  const dateKey = format(date, "yyyy-MM-dd");
  const slots = generateTimeSlots();

  // Weekday 7 AM - 5 PM = available
  if (date.getDay() !== 0 && date.getDay() !== 6) {
    slots.forEach((slot) => {
      const [startHour] = slot.time.split(":").map((part) => parseInt(part));
      const isPM = slot.time.includes("PM");
      const hour24 = isPM && startHour !== 12 ? startHour + 12 : startHour;
      if (hour24 >= 7 && hour24 < 17) {
        slot.available = true;
      }
    });
  }

  schedule[dateKey] = slots;
  return schedule;
};

export const saveScheduleForUser = async (date: Date, facultyId: string): Promise<void> => {
  if (!facultyId) {
    console.error("No faculty ID provided.");
    return;
  }

  const schedule = generateSchedule(date);

  try {
    const userDocRef = doc(collection(db, "timeSlots"), facultyId);
    await setDoc(userDocRef, schedule, { merge: true });
    console.log("Schedule saved to Firestore for faculty:", facultyId);
  } catch (error) {
    console.error("Error saving schedule:", error);
  }
};