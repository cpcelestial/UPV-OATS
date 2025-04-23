import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase-config";
import type { DaySchedule } from "./data";

const db = getFirestore(app);
const SCHEDULE_DOC = "schedules/userSchedule";

export async function fetchSchedule(): Promise<DaySchedule[] | null> {
  try {
    const docRef = doc(db, SCHEDULE_DOC);
    const snapshot = await getDoc(docRef);
    return snapshot.exists()
      ? (snapshot.data().schedule as DaySchedule[])
      : null;
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return null;
  }
}

export async function updateSchedule(newSchedule: DaySchedule[]) {
  try {
    const docRef = doc(db, SCHEDULE_DOC);
    await setDoc(docRef, { schedule: newSchedule }, { merge: true });

    // Fetch the existing schedule
    const snapshot = await getDoc(docRef);
    const existingSchedule: DaySchedule[] = snapshot.exists()
      ? (snapshot.data().schedule as DaySchedule[]) || [] // Ensure it's an array
      : [];

    // Merge the existing schedule with the new schedule
    const mergedSchedule = existingSchedule.map((day) => {
      const newDay = newSchedule.find((d) => d.day === day.day);
      return {
        day: day.day,
        slots: [...day.slots, ...(newDay?.slots || [])], // Merge slots
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
    await setDoc(docRef, { schedule: deduplicatedSchedule }, { merge: true });
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
