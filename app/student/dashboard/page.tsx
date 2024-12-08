"use client";

import React, { useState } from "react";
import AppSidebar from "./sidebar";
import NavBar from "./top-navbar";
import "./globals.css";
import AppCalendar from "./calendar";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns"; // Assuming you're using `date-fns` for formatting
import { RescheduleDialog } from "./reschedule-dialog";
import { DeclineDialog } from "./decline-dialog";

interface Appointment {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  faculty: {
    name: string;
    email: string;
    avatar: string;
  };
  typeOfMeeting: string;
  location: string;
  course: string;
  section: string;
  meetingNotes?: string;
  createdAt: Date;
}

const appointments: Appointment[] = [
  {
    id: "1",
    title: "Consultation Regarding CMSC 128 Grades",
    date: new Date(2024, 11, 8), // December 8, 2024
    startTime: "11:30 AM",
    endTime: "1:00 PM",
    faculty: {
      name: "James Doe",
      email: "jdoe@up.edu.ph",
      avatar: "/placeholder.svg",
    },
    typeOfMeeting: "Face to face meeting",
    location: "Faculty room",
    course: "CMSC 128",
    section: "Section 2",
    meetingNotes:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
    createdAt: new Date(2024, 11, 1), // December 1, 2024
  },
];

const unapprovedAppointments: Appointment[] = [
  {
    id: "2",
    title: "Consultation Regarding CMSC 128 Grades",
    date: new Date(2024, 11, 15), // December 15, 2024
    startTime: "11:30 AM",
    endTime: "1:00 PM",
    faculty: {
      name: "James Doe",
      email: "jdoe@up.edu.ph",
      avatar: "/placeholder.svg",
    },
    typeOfMeeting: "Face to face meeting",
    location: "Faculty room",
    course: "CMSC 128",
    section: "Section 2",
    createdAt: new Date(2024, 11, 8), // December 8, 2024
  },
];

export default function Background({ children }: { children: React.ReactNode }) {
  const [date, setDate] = useState<Date>(new Date(2024, 11, 8)); // December 8, 2024
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);

  const hasAppointments = appointments.length > 0;
  const hasUnapprovedAppointments = unapprovedAppointments.length > 0;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <AppSidebar />
      </div>

      {/* Main Layout */}
      <div className="flex flex-col flex-grow">
        {/* Top Bar */}
        <NavBar />

        {/* Main Content */}
        <main className="flex-grow bg-white shadow-lg px-10 py-6">
          <div className="flex justify-between">
            <div className="flex-grow">
              {children}

              {/* Appointments Section */}
              <div className="space-y-6 mt-10">
                <div className="container mx-auto p-6 space-y-6">
                  <div className="grid md:grid-cols-[1fr,400px] gap-6">
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
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-sm text-muted-foreground">
                                      {format(appointment.createdAt, "MMMM dd, yyyy")}
                                    </div>
                                    <h3 className="text-lg font-semibold">{appointment.title}</h3>
                                  </div>

                                  {/* Faculty Information */}
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <img
                                        src={appointment.faculty.avatar}
                                        alt={appointment.faculty.name}
                                        className="rounded-full"
                                      />
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{appointment.faculty.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {appointment.faculty.email}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Appointment Details */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm font-medium">Time</div>
                                      <div className="text-sm text-muted-foreground">
                                        {appointment.startTime} to {appointment.endTime}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">Type of Meeting</div>
                                      <div className="text-sm text-muted-foreground">
                                        {appointment.typeOfMeeting}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">Location</div>
                                      <div className="text-sm text-muted-foreground">
                                        {appointment.location}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">Course</div>
                                      <div className="text-sm text-muted-foreground">
                                        {appointment.course} {appointment.section}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Meeting Notes */}
                                  {appointment.meetingNotes && (
                                    <div>
                                      <div className="text-sm font-medium">Meeting Notes</div>
                                      <div className="text-sm text-muted-foreground">
                                        {appointment.meetingNotes}
                                      </div>
                                    </div>
                                  )}

                                  {/* Buttons */}
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" onClick={() => setIsRescheduleOpen(true)}>
                                      Reschedule
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => setIsDeclineOpen(true)}
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                </div>

                                {/* Dialogs */}
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
                                    // Add decline logic here
                                  }}
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Calendar Section */}
                    <div className="space-y-6">
                      <Card>
                        <CardContent className="p-0">
                          <div className="p-4 border-b">
                            <div className="text-xl font-semibold">{format(date, "EEE, MMM d")}</div>
                          </div>
                          <AppCalendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => date && setDate(date)}
                            className="rounded-md border"
                          />
                        </CardContent>
                      </Card>

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
                              <div key={appointment.id} className="text-sm text-muted-foreground">
                                {format(appointment.date, "MMMM d, yyyy")}
                                <div className="font-medium">{appointment.title}</div>
                              </div>
                            ))}
                            {/* See All Appointments Button */}
                            <div className="mt-4 text-center">
                              <Link href="/student/dashboard/appointments">
                                <Button variant="outline" className="w-full">
                                  See All Appointments
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
