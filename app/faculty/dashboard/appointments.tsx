"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"
import { app } from "../../firebase-config"

const db = getFirestore(app);
const auth = getAuth(app);

export interface Appointment {
  time: "10:00 AM" | "1:00 PM" | "4:00 PM";
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  avatar: string;
  facultyName: string;
  title: string;
  userId: string;
  status: string;
}

export function UserAppointments() {
  const [user, setUser] = useState<User | null>(null);
  const [approvedAppointments, setApprovedAppointments] = useState<Appointment[]>([])
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserAppointments = async () => {
      // Only fetch if user is authenticated
      if (!user) return;

      try {
        // Create a query to fetch only appointments for the current user
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("userId", "==", user.uid));

        const appointmentsSnapshot = await getDocs(q);
        const appointmentsList: Appointment[] = appointmentsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            time: data.time,
            date: data.date.toDate(),
            startTime: data.startTime,
            endTime: data.endTime,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            facultyName: data.facultyName,
            title: data.title,
            userId: data.userId,
            status: data.status 
          }
        });

        // Separate appointments into approved and pending
        const approved = appointmentsList.filter(appointment => appointment.status === 'approved');
        const pending = appointmentsList.filter(appointment => appointment.status === 'pending');

        setApprovedAppointments(approved);
        setPendingAppointments(pending);
      } catch (error) {
        console.error("Error fetching user appointments: ", error);
      }
    };

    fetchUserAppointments();
  }, [user]); // Re-fetch when user changes

  const renderAppointmentSection = (
    title: string, 
    appointments: Appointment[], 
    emptyMessage: string
  ) => (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-[#35563F] mb-1">{title}</h2>
      {appointments.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{appointment.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {appointment.date.toLocaleDateString()} from {appointment.startTime} to {appointment.endTime}
                </p>
                <p className="text-sm text-muted-foreground">With {appointment.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // If no user is logged in, show a message
  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground">Please log in to view your appointments</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderAppointmentSection(
        "Approved Appointments", 
        approvedAppointments, 
        "No approved appointments"
      )}

      {renderAppointmentSection(
        "Pending Appointments", 
        pendingAppointments, 
        "No pending appointments"
      )}

      <div className="mt-4 flex justify-end">
        <Link href="/student/calendar">
          <Button variant="outline" className="bg-[#35563F] text-white hover:bg-[#2A4A33]">
            Schedule New Appointment
          </Button>
        </Link>
      </div>
    </div>
  )
}