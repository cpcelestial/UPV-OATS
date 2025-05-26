import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase-config";
import type { DaySchedule } from "./data";

const db = getFirestore(app);

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export async function fetchSchedule(userId: string): Promise<DaySchedule[]> {
  const scheduleDocRef = doc(db, "schedules", userId);
  const scheduleSnapshot = await getDoc(scheduleDocRef);
  let schedule: DaySchedule[] = [];
  if (scheduleSnapshot.exists()) {
    schedule = scheduleSnapshot.data().schedule as DaySchedule[];
  }

  return DAYS.map(
    (day) => schedule.find((d) => d.day === day) || { day, slots: [] }
  );
}

export async function updateSchedule(
  userId: string,
  newSchedule: DaySchedule[]
) {
  try {
    const scheduleDocRef = doc(db, "schedules", userId);
    await setDoc(scheduleDocRef, { schedule: newSchedule }, { merge: true });

    // Fetch the existing schedule
    const snapshot = await getDoc(scheduleDocRef);
    const existingSchedule: DaySchedule[] = snapshot.exists()
      ? (snapshot.data().schedule as DaySchedule[]) || []
      : [];

    // Merge the existing schedule with the new schedule
    const mergedSchedule = existingSchedule.map((day) => {
      const newDay = newSchedule.find((d) => d.day === day.day);
      return {
        day: day.day,
        slots: [...day.slots, ...(newDay?.slots || [])],
      };
    });

    // Add any new days that are not in the existing schedule
    newSchedule.forEach((newDay) => {
      if (!mergedSchedule.find((day) => day.day === newDay.day)) {
        mergedSchedule.push(newDay);
      }
    });

    // Remove duplicate slots
    const deduplicatedSchedule = mergedSchedule.map((day) => ({
      ...day,
      slots: removeDuplicateSlots(day.slots),
    }));

    // Save the deduplicated schedule back to Firestore
    await setDoc(
      scheduleDocRef,
      { schedule: deduplicatedSchedule },
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to update schedule:", error);
  }
}

// Helper function to remove duplicate slots
function removeDuplicateSlots(slots: DaySchedule["slots"]) {
  const uniqueSlots = new Map<string, (typeof slots)[0]>();
  slots.forEach((slot) => {
    const key = `${slot.start}-${slot.end}-${slot.subject}`;
    uniqueSlots.set(key, slot);
  });
  return Array.from(uniqueSlots.values());
}
