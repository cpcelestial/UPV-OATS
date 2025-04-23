"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Appointment } from "../data";
import { AppointmentsTabs } from "./appointment-tabs";
import { db } from "@/app/firebase-config";
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
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
    const auth = getAuth();
    let unsubscribeSnapshot: Unsubscribe | null = null;
  
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const appointmentsRef = collection(db, "appointments");
        const userAppointmentsQuery = query(
          appointmentsRef,
          where("userId", "==", currentUser.uid),
          orderBy("date", "asc")
        );
      
        unsubscribeSnapshot = onSnapshot(userAppointmentsQuery, (querySnapshot) => {
          const upcoming: Appointment[] = [];
          const pending: Appointment[] = [];
          const cancelled: Appointment[] = [];
          const reschedule: Appointment[] = [];

          querySnapshot.forEach((doc) => {
            const data: Appointment = {
              id: doc.id,
              ...doc.data(),
              date: doc.data().date instanceof Date ? doc.data().date : doc.data().date.toDate(),
              purpose: doc.data().purpose,
              class: doc.data().class,
              details: doc.data().details,
              section: doc.data().section,
              facultyName: doc.data().facultyName,
              timeSlot: doc.data().timeSlot,
              meetingType: doc.data().meetingType,
              status: doc.data().status,
              facultyEmail: doc.data().facultyEmail,
            };

            if (data.status === "approved") {
              upcoming.push(data);
            } else if (data.status === "pending") {
              pending.push(data);
            } else if (data.status === "cancelled") {
              cancelled.push(data);
            } else if (data.status === "reschedule") {
              reschedule.push(data);
            }

            
          });
          setUpcomingAppointments(upcoming);
          setPendingAppointments(pending);
          setCancelledAppointments(cancelled);
          setRescheduleAppointments(reschedule);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching appointments:", error);
          setLoading(false);
        });
        } else {
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


