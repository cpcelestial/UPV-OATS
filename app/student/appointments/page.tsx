"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Appointment } from "../../data";
import { AppointmentsTabs } from "./appointment-tabs";
import { auth, db } from "@/app/firebase-config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  or,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const router = useRouter();
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
        const q = query(
          appointmentsRef,
          or(
            where("userId", "==", currentUser.uid),
            where("participants", "array-contains", currentUser.email)
          ),
          orderBy("date", "asc")
        );

        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const upcoming: Appointment[] = [];
          const pending: Appointment[] = [];
          const cancelled: Appointment[] = [];
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
              case "approved": {
                const apptDate =
                  appointment.date instanceof Date
                    ? appointment.date
                    : new Date(appointment.date);

                if (apptDate >= today) {
                  upcoming.push({ ...appointment, date: apptDate });
                }
                break;
              }
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

  return (
    <div className="p-4">
      <Button
        onClick={() => router.push("appointments/sched-app")}
        className="float-right bg-[#2F5233] hover:bg-[#2F5233]/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Appointment
      </Button>
      <AppointmentsTabs
        upcomingAppointments={upcomingAppointments}
        pendingAppointments={pendingAppointments}
        cancelledAppointments={cancelledAppointments}
        rescheduleAppointments={rescheduleAppointments}
        loading={loading}
        onReschedule={handleReschedule}
        onDecline={handleDecline}
      />
    </div>
  );
}
