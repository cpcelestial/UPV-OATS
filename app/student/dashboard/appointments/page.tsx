"use client"

import { useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

interface Appointment {
  id: string
  requester: {
    name: string
    avatar: string
  }
  faculty: {
    name: string
    email: string
    avatar: string
  }
  date: Date
  title: string
  time: {
    start: string
    end: string
  }
  location: string
  typeOfMeeting: string
  course: string
  section: string
  meetingNotes?: string
}

export default function AppointmentsPage() {
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      requester: {
        name: "John Doe",
        avatar: "/placeholder.svg",
      },
      faculty: {
        name: "Jack Doe",
        email: "jsdoe@up.edu.ph",
        avatar: "/placeholder.svg",
      },
      date: new Date(2024, 9, 17), // October 17, 2024
      title: "Consultation Regarding Grades",
      time: {
        start: "11:30 AM",
        end: "1:00 PM",
      },
      location: "Faculty room",
      typeOfMeeting: "Face to face meeting",
      course: "CMSC 128",
      section: "Section 2",
      meetingNotes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    },
    // Add more appointments as needed
  ])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#35563F]">Unapproved appointments</h1>
          <p className="text-muted-foreground">Lorem ipsum dolor your appointments</p>
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
                  <img src={appointment.requester.avatar} alt={appointment.requester.name} />
                </Avatar>
                <p className="text-lg">
                  <span className="font-semibold">{appointment.requester.name}</span>
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
                        <img src={appointment.faculty.avatar} alt={appointment.faculty.name} />
                      </Avatar>
                      <div>
                        <div className="font-medium">{appointment.faculty.name}</div>
                        <div className="text-sm text-[#35563F]">{appointment.faculty.email}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Time</h3>
                    <p className="text-muted-foreground">
                      {appointment.time.start} to {appointment.time.end}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Location</h3>
                    <p className="text-muted-foreground">{appointment.location}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Type of meeting</h3>
                    <p className="text-muted-foreground">{appointment.typeOfMeeting}</p>
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
                  <Button variant="outline">
                    Reschedule
                  </Button>
                  <Button variant="outline" className="text-red-500 hover:text-red-600">
                    Decline
                  </Button>
                  <Button className="bg-[#35563F] hover:bg-[#2A4A33] text-white">
                    Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

