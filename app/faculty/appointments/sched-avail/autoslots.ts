// import { collection, doc, setDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { db } from "@/app/firebase-config"; // Adjust the import path as necessary
// import { format, addDays } from "date-fns";

// type TimeSlot = {
//   time: string;
//   available: boolean;
//   booked: boolean;
// };

// const generateTimeSlots = (): TimeSlot[] => {
//   const slots: TimeSlot[] = [];
//   for (let hour = 9; hour < 21; hour++) {
//     for (let min = 0; min < 60; min += 30) {
//       slots.push({
//         time: `${hour.toString().padStart(2, "0")}:${min
//           .toString()
//           .padStart(2, "0")}`,
//         available: false,
//         booked: false,
//       });
//     }
//   }
//   return slots;
// };

// const generateSchedule = (
//   startDate: Date,
//   dailyView: boolean
// ): { [date: string]: TimeSlot[] } => {
//   const schedule: { [key: string]: TimeSlot[] } = {};
//   const days = dailyView ? 1 : 7;

//   for (let i = 0; i < days; i++) {
//     const date = addDays(startDate, i);
//     const dateKey = format(date, "yyyy-MM-dd");
//     const slots = generateTimeSlots();

//     // Weekday 9-5 = available
//     if (date.getDay() !== 0 && date.getDay() !== 6) {
//       slots.forEach((slot) => {
//         const [hour] = slot.time.split(":").map(Number);
//         if (hour >= 9 && hour < 17) {
//           slot.available = true;
//         }
//       });
//     }

//     schedule[dateKey] = slots;
//   }

//   return schedule;
// };

// export const saveScheduleForUser = async (startDate: Date, dailyView: boolean): Promise<void> => {
//     const auth = getAuth();
//     const user = auth.currentUser;
  
//     if (!user) {
//       console.error("No authenticated user.");
//       return;
//     }
  
//     const schedule = generateSchedule(startDate, dailyView);
  
//     try {
//       const userDocRef = doc(collection(db, "timeSlots"), user.uid);
//       await setDoc(userDocRef, schedule, { merge: true });
//       console.log("Schedule saved to Firestore for user:", user.uid);
//     } catch (error) {
//       console.error("Error saving schedule:", error);
//     }
//   };
  
