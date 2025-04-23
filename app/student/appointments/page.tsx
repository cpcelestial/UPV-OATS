"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Appointment } from "../data";
import { AppointmentsTabs } from "./appointment-tabs";
import { auth, db } from "@/app/firebase-config";
import { collection, query, where, orderBy, onSnapshot, Unsubscribe, or, and } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function Page() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<
    Appointment[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = React.useState<
    Appointment[]
  >([]);
  const [cancelledAppointments, setCancelledAppointments] = React.useState<
    Appointment[]
  >([]);
  const [rescheduleAppointments, setRescheduleAppointments] = React.useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(true);

      if (user) {
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("status", "in", ["approved", "pending", "cancelled", "reschedule"]),
          where("userId", "==", user.uid),
          orderBy("date", "asc")
        );

        unsubscribeSnapshot = onSnapshot(
          q,
          (querySnapshot) => {
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
          },
        );

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
  }, []);

  const handleReschedule = (id: string) => {
    alert(`Reschedule appointment ${id}`);
    // In a real app, navigate to reschedule page or open a modal
  };

  const handleDecline = (id: string) => {
    alert(`Decline appointment ${id}`);
    // In a real app, update the appointment status
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


