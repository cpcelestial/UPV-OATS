"use client";

import { useState, useEffect } from "react";
import { Appointment } from "@/app/data";
import { AppointmentsTabs } from "./appointment-tabs";
import { auth, db } from "@/app/firebase-config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [cancelledAppointments, setCancelledAppointments] = useState<
    Appointment[]
  >([]);
  const [rescheduleAppointments, setRescheduleAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(true);

      if (currentUser) {
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, orderBy("date", "asc"));

        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const upcoming: Appointment[] = [];
          const pending: Appointment[] = [];
          const cancelled: Appointment[] = [];
          const reschedule: Appointment[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const appointment: Appointment = {
              id: doc.id,
              ...data,
              date: data.date instanceof Date ? data.date : data.date.toDate(),
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
                upcoming.push(appointment);
                break;
              case "pending":
                pending.push(appointment);
                break;
              case "cancelled":
                cancelled.push(appointment);
                break;
              case "reschedule":
                reschedule.push(appointment);
                break;
            }
          });

          setUpcomingAppointments(upcoming);
          setPendingAppointments(pending);
          setCancelledAppointments(cancelled);
          setRescheduleAppointments(reschedule);
          setLoading(false);
        });
      } else {
        setUpcomingAppointments([]);
        setPendingAppointments([]);
        setCancelledAppointments([]);
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
  }, [currentUser]);

  return (
    <div className="p-4">
      <AppointmentsTabs
        upcomingAppointments={upcomingAppointments}
        pendingAppointments={pendingAppointments}
        cancelledAppointments={cancelledAppointments}
        rescheduleAppointments={rescheduleAppointments}
        loading={loading}
      />
    </div>
  );
}
