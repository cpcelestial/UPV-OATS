"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Appointment {
  id: string
  title: string
  date: Date
  // Add other appointment properties as needed
}

export function Appointments() {
  // This is sample data. In a real application, you'd fetch this from an API
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "1", title: "Meeting with Professor", date: new Date() },
    // Add more sample appointments as needed
  ])

  const [unapprovedAppointments, setUnapprovedAppointments] = useState<Appointment[]>([
    { id: "2", title: "Pending Consultation", date: new Date() },
    // Add more sample unapproved appointments as needed
  ])

  const hasAppointments = appointments.length > 0
  const hasUnapprovedAppointments = unapprovedAppointments.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#35563F] mb-1">Upcoming appointments</h2>
        <p className="text-muted-foreground">Lorem ipsum dolor your appointments</p>
      </div>

      {!hasAppointments ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground">
              Go to the &apos;Calendar&apos; page to schedule an appointment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{appointment.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {appointment.date.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-[#35563F] mb-6">Unapproved appointments</h2>
        {!hasUnapprovedAppointments ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-muted-foreground">
                Go to the &apos;Calendar&apos; page to schedule an appointment
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {unapprovedAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{appointment.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.date.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Link href="/student/calendar">
            <Button variant="outline" className="bg-[#35563F] text-white hover:bg-[#2A4A33]">
              See all appointments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

