"use client"

import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { db } from "../../../firebase-config"  // import Firestore DB
import { collection, getDocs, query, where,deleteDoc,doc } from "firebase/firestore"
import { RescheduleDialog } from "../reschedule-dialog";
import { DeclineDialog } from "../decline-dialog";


export interface Appointment {
  id: string;
  date: Date;
  startTime: string; 
  endTime: string;   
  name: string;
  email: string;
  avatar: string;
  facultyName: string;
  title: string;
  location: string;
  course: string;
  section: string;
  meetingNotes?: string;
}

export default function AppointmentsPage() {
  const [date, setDate] = useState<Date>(new Date(2024, 11, 8)); // December 8, 2024
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([])


  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "appointments"))

        const fetchedAppointments: Appointment[] = querySnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          } as Appointment
        })

        setAppointments(fetchedAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    fetchAppointments()
  }, [])
  const deleteAppointment = async (appointmentId: string) => {
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));
      console.log("Appointment deleted successfully");
      // Update the appointments state to reflect the deletion
      setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#7B1113]">Unapproved appointments</h2>
          <p className="font-bold">Here, take a look at your pending appointments</p>
        </div>
        <Link href="/student/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-12 w-12">
                  <img src={appointment.avatar} alt={appointment.name} />
                </Avatar>
                <p className="text-lg">
                  <span className="font-semibold">{appointment.name}</span>
                  {" has scheduled an appointment with you."}
                </p>
              </div>

              <div className="border rounded-lg p-6 space-y-6">
                <div className="text-sm text-muted-foreground">
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <h2 className="text-xl font-semibold">{appointment.title}</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Meeting with</h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <img src={appointment.avatar} alt={appointment.facultyName} />
                      </Avatar>
                      <div>
                        <div className="font-medium">{appointment.facultyName}</div>
                        <div className="text-sm text-[#35563F]">{appointment.email}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Time</h3>
                    <p className="text-muted-foreground">
                      {appointment.startTime} to {appointment.endTime}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Location</h3>
                    <p className="text-muted-foreground">{appointment.location}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Course</h3>
                    <p className="text-muted-foreground">
                      {appointment.course} {appointment.section}
                    </p>
                  </div>
                </div>

                {appointment.meetingNotes && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Meeting notes</h3>
                    <p className="text-muted-foreground">{appointment.meetingNotes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsRescheduleOpen(true)} >
                    Reschedule
                  </Button>
                  <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={() => setIsDeclineOpen(true)}>
                    Decline
                  </Button>
                  <Button className="bg-[#35563F] hover:bg-[#2A4A33] text-white">
                    Accept
                  </Button>
                  <RescheduleDialog
                          open={isRescheduleOpen}
                          onOpenChange={setIsRescheduleOpen}
                          appointment={appointment}
                        />
                        <DeclineDialog
                          open={isDeclineOpen}
                          onOpenChange={setIsDeclineOpen}
                          onConfirm={() => {
                            setIsDeclineOpen(false);
                            deleteAppointment(appointment.id)
                          }}
                        />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
