"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { AppointmentList } from "./appointment-list";
import { db } from "@/app/firebase-config";
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";


type Appointment = {
  id: string;
  purpose: string;
  class: string;
  section: string;
  facultyName: string;
  date: Date;
  timeSlot: string;
  meetingType: "f2f" | "online";
  details?: string;
  status: "upcoming" | "pending" | "cancelled" | "reschedule";
  participants?: { email: string; name?: string }[];
};

export default function Page() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null); // Added user state
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = React.useState<Appointment[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = React.useState<Appointment[]>([]);
  const [rescheduleAppointments, setRescheduleAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("pending");

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
          };
    
          if (data.status === "upcoming") {
            upcoming.push(data);
          } else if (data.status === "pending") {
            pending.push(data);
          } else if (data.status === "cancelled") {
            cancelled.push(data);
          } else if (data.status === "reschedule") {
            reschedule.push(data);
          }
        });
        

        console.log("Upcoming Appointments:", upcoming);
        console.log("Pending Appointments:", pending);
        console.log("Cancelled Appointments:", cancelled);
        console.log("Reschedule Appointments:", reschedule);
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

  // Cleanup function that unsubscribes from both listeners
  return () => {
    unsubscribeAuth();
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }
  };
}, []);

  return (
    <div className="px-8 py-4">
      <Button
        onClick={() => router.push("appointments/sched-app")}
        className="float-right bg-[#2F5233] hover:bg-[#2F5233]/90"
      >
        <Plus className="h-4 w-4" />
        Add Appointment
      </Button>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="upcoming" className="px-6">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="pending" className="px-6">
            Pending
          </TabsTrigger>
          <TabsTrigger value="declined" className="px-6">
            Declined
          </TabsTrigger>
          {rescheduleAppointments.length > 0 && (
            <TabsTrigger value="reschedule" className="px-6">
              For Reschedule
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 p-6 rounded-lg border">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-4">
                Upcoming Appointments
              </h1>
              <AppointmentList
                appointments={upcomingAppointments}
                emptyMessage="No upcoming appointments found"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6 p-6 rounded-lg border">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-4">
                Pending Appointments
              </h1>
              <AppointmentList
                appointments={pendingAppointments}
                emptyMessage="No pending appointments found"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="declined" className="mt-6 p-6 rounded-lg border">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-4">
                Declined Appointments
              </h1>
              <AppointmentList
                appointments={cancelledAppointments}
                emptyMessage="No declined appointments found"
              />
            </>
          )}
        </TabsContent>

        {rescheduleAppointments.length > 0 && (
          <TabsContent
            value="reschedule"
            className="mt-6 p-6 rounded-lg border"
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <p>Loading appointments...</p>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold mb-4">
                  Appointments For Reschedule
                </h1>
                <AppointmentList
                  appointments={rescheduleAppointments}
                  emptyMessage="No appointments for reschedule found"
                />
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}