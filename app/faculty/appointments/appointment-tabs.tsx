"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentList } from "./appointment-list";
import { Appointment } from "@/app/data";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";

interface AppointmentsTabsProps {
  upcomingAppointments: Appointment[];
  pendingAppointments: Appointment[];
  cancelledAppointments?: Appointment[];
  rescheduleAppointments: Appointment[];
  loading: boolean;
  onReschedule: (id: string) => void;
  onDecline: (id: string) => void;
  onAccept: (id: string) => void;
}

export function AppointmentsTabs({
  upcomingAppointments,
  pendingAppointments,
  cancelledAppointments,
  rescheduleAppointments,
  loading,
  onReschedule,
}: AppointmentsTabsProps) {
  const [activeTab, setActiveTab] = React.useState("pending");
  const db = getFirestore();
  const auth = getAuth();

  // Function to get the current user ID
  const getCurrentUserId = (): Promise<string | null> => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user: User | null) => {
        resolve(user ? user.uid : null);
      });
    });
  };

  const extractTimeFromDate = (timestamp: { toDate: () => Date }): string => {
    try {
      const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
      const startHours = date.getHours();
      const startMinutes = date.getMinutes();
      const endDate = new Date(date.getTime() + 30 * 60 * 1000); // Assume 30-minute slot
      const endHours = endDate.getHours();
      const endMinutes = endDate.getMinutes();

      const formatTime = (hours: number, minutes: number) => {
        const period = hours >= 12 ? "PM" : "AM";
        const adjustedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, "0");
        return `${adjustedHours}:${formattedMinutes} ${period}`;
      };

      return `${formatTime(startHours, startMinutes)} - ${formatTime(
        endHours,
        endMinutes
      )}`;
    } catch (error) {
      throw new Error("Invalid date format in appointment data");
    }
  };

  // Handle declining an appointment
  const handleDecline = async (appointmentId: string) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.log("No user is signed in");
        return;
      }

      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "cancelled",
        updatedBy: userId,
      });
      console.log(
        `Appointment ${appointmentId} declined successfully by ${userId}`
      );
    } catch (error) {
      console.error("Error declining appointment:", error);
    }
  };

  // Handle accepting an appointment
  const handleAccept = async (appointmentId: string) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.log("No user is signed in");
        return;
      }

      const appointmentRef = doc(db, "appointments", appointmentId);
      const snapshot = await getDoc(appointmentRef);
      const appointmentData = snapshot.data();

      if (appointmentData && appointmentData.date) {
        // This is likely the document ID for the faculty's time slots
        let time: string;
        try {
          time = appointmentData.timeSlot; // Convert Timestamp to time slot format
        } catch (error) {
          console.error(error);
          toast.error("Invalid date format in appointment data.");
          return;
        }

        // Get the date string in YYYY-MM-DD format from the appointmentDate
        let appointmentDate: Date;
        if (
          appointmentData.date &&
          typeof appointmentData.date.toDate === "function"
        ) {
          appointmentDate = appointmentData.date.toDate();
        } else if (typeof appointmentData.date === "string") {
          appointmentDate = new Date(appointmentData.date);
        } else {
          appointmentDate = appointmentData.date; // already a Date object
        }
        const year = appointmentDate.getFullYear();
        const month = (appointmentDate.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        const day = appointmentDate.getDate().toString().padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`; // This is the key for the time slot array

        console.log("Datekey:", dateKey);

        const timeSlotRef = doc(db, "timeSlots", userId); // Use facultyId as the document ID
        const timeSlotSnapshot = await getDoc(timeSlotRef);
        const timeSlotData = timeSlotSnapshot.data();

        if (timeSlotData && timeSlotData[dateKey]) {
          console.log("Yes!!!"); // Check if the dateKey exists in the timeSlotData
          const timeSlots = timeSlotData[dateKey] as {
            available: boolean;
            booked: boolean;
            time: string;
          }[];
          console.log("Time Slots:", timeSlots);

          const updatedTimeSlots = timeSlots.map(
            (slot: { available: boolean; booked: boolean; time: string }) =>
              slot.time === time ? { ...slot, booked: true } : slot
          );

          // Update the specific date array within the timeSlots document
          await updateDoc(timeSlotRef, {
            [dateKey]: updatedTimeSlots,
          });

          await updateDoc(appointmentRef, {
            status: "approved",
          });

          toast.success(
            `Appointment ${appointmentId} accepted and time slot ${time} booked!`
          );
          console.log(
            `Appointment ${appointmentId} accepted and time slot ${time} booked by ${userId}`
          );
        } else {
          toast.error("Time slot data not found for the specified date.");
          console.log(
            "No time slots array found for the specified date in the document"
          );
        }
      } else {
        toast.error("Invalid appointment data or faculty ID/date not found.");
        console.log("Invalid appointment data or facultyId/date not found");
      }
    } catch (error) {
      console.error("Error accepting appointment:", error);
      toast.error("Failed to accept appointment.");
    }
  };
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming" className="px-6">
          Upcoming{" "}
          <span className="ml-2 opacity-50">
            [ {upcomingAppointments.length} ]
          </span>
        </TabsTrigger>
        <TabsTrigger value="pending" className="ml-2 px-6">
          Pending{" "}
          <span className="ml-2 opacity-50">
            [ {pendingAppointments.length} ]
          </span>
        </TabsTrigger>
        {cancelledAppointments != undefined && (
          <TabsTrigger value="declined" className="ml-2 px-6">
            Cancelled{" "}
            <span className="ml-2 opacity-50">
              [ {cancelledAppointments.length} ]
            </span>
          </TabsTrigger>
        )}
        {rescheduleAppointments.length > 0 && (
          <TabsTrigger
            value="reschedule"
            className="ml-2 px-6 bg-red-100 text-red-500"
          >
            For Reschedule{" "}
            <span className="ml-2 opacity-50">
              [ {rescheduleAppointments.length} ]
            </span>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="upcoming" className="mt-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <p>Loading appointments...</p>
          </div>
        ) : (
          <AppointmentList
            appointments={upcomingAppointments}
            emptyMessage="No upcoming appointments found"
            onDecline={handleDecline}
          />
        )}
      </TabsContent>

      <TabsContent value="pending" className="mt-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <p>Loading appointments...</p>
          </div>
        ) : (
          <AppointmentList
            appointments={pendingAppointments}
            emptyMessage="No pending appointments found"
            onDecline={handleDecline}
            onAccept={handleAccept}
          />
        )}
      </TabsContent>

      {cancelledAppointments != undefined && (
        <TabsContent value="declined" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList
              appointments={cancelledAppointments}
              emptyMessage="No declined appointments found"
            />
          )}
        </TabsContent>
      )}

      {rescheduleAppointments.length > 0 && (
        <TabsContent value="reschedule" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList
              appointments={rescheduleAppointments}
              emptyMessage="No appointments for reschedule found"
              onDecline={handleDecline}
            />
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
