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

export async function updateSchedule(schedule: DaySchedule[]) {
  try {
    const docRef = doc(db, SCHEDULE_DOC);
    await setDoc(docRef, { schedule });
  } catch (error) {
    console.error("Failed to update schedule:", error);
  }
}
