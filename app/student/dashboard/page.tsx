"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Appointment } from "../../data";
import { AppointmentsTabs } from "../appointments/appointment-tabs";
import MonthCalendar from "./month-calendar";
import { auth, db } from "@/app/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import {
  Unsubscribe,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  and,
  or,
} from "firebase/firestore";

export default function Page() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [rescheduleAppointments, setRescheduleAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const handleDecline = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "cancelled",
      });
      console.log(`Appointment ${appointmentId} declined successfully`);
    } catch (error) {
      console.error("Error declining appointment:", error);
    }
  };

  const handleReschedule = (id: string) => {
    alert(`Reschedule appointment ${id}`);
    // In a real app, navigate to reschedule page or open a modal
  };

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(true);

      if (user) {
        // <-- use 'user' here, not 'currentUser'
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          or(
            and(
              where("status", "in", ["approved", "pending", "reschedule"]),
              where("userId", "==", user.uid)
            ),
            and(
              where("status", "in", ["approved", "pending", "reschedule"]),
              where("participants", "array-contains", user.email)
            )
          ),
          orderBy("date", "asc")
        );

        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const upcoming: Appointment[] = [];
          const pending: Appointment[] = [];
          const reschedule: Appointment[] = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const appointment: Appointment = {
              id: doc.id,
              ...data,
              date:
                data.date && typeof data.date.toDate === "function"
                  ? data.date.toDate()
                  : typeof data.date === "string"
                  ? new Date(data.date)
                  : data.date,
              purpose: data.purpose,
              class: data.class,
              details: data.details,
              section: data.section,
              facultyName: data.facultyName,
              timeSlot: data.timeSlot,
              meetingType: data.meetingType,
              status: data.status,
              facultyEmail: data.facultyEmail,
            };

            switch (appointment.status) {
              case "approved":
                if (appointment.date >= today) {
                  upcoming.push(appointment);
                }
                break;
              case "pending":
                pending.push(appointment);
                break;
              case "reschedule":
                reschedule.push(appointment);
                break;
            }
          });

          setUpcomingAppointments(upcoming);
          setPendingAppointments(pending);
          setRescheduleAppointments(reschedule);
          setLoading(false);
        });
      } else {
        setUpcomingAppointments([]);
        setPendingAppointments([]);
        setRescheduleAppointments([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []); // <-- remove currentUser from dependency array
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // You can add additional logic here if needed
  };

  // Extract all appointment dates for the calendar highlighting
  const getAllAppointmentDates = () => {
    return [...upcomingAppointments.map((app) => app.date)];
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Appointments Section */}
      <div className="flex-grow m-4">
        <AppointmentsTabs
          upcomingAppointments={upcomingAppointments}
          pendingAppointments={pendingAppointments}
          rescheduleAppointments={rescheduleAppointments}
          loading={loading}
          onReschedule={handleReschedule}
          onDecline={handleDecline}
        />
      </div>

      {/* Calendar Section */}
      <div className="flex-none mx-4 my-6">
        <MonthCalendar
          onDateSelect={handleDateSelect}
          initialDate={selectedDate}
          appointmentDates={getAllAppointmentDates()}
        />
      </div>
    </div>
  );
}
