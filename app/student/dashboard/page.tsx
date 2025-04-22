"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Appointment } from "../data";
import { AppointmentsTabs } from "../appointments/appointment-tabs";
import MonthCalendar from "./month-calendar";

// Mock appointments data
const mockAppointments: Omit<Appointment, "id">[] = [
  {
    purpose: "Consultation Regarding Grades",
    class: "CMSC 128",
    section: "1",
    facultyName: "James Doe",
    facultyEmail: "jdoe@up.edu.ph",
    date: new Date(2024, 11, 1), // December 1, 2024
    timeSlot: "11:30 AM to 1:00 PM",
    meetingType: "f2f",
    status: "approved",
    details:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  },
  {
    purpose: "Project Review Meeting",
    class: "CMSC 142",
    section: "2",
    facultyName: "Sarah Johnson",
    facultyEmail: "sjohnson@up.edu.ph",
    date: new Date(2024, 11, 5), // December 5, 2024
    timeSlot: "2:00 PM to 3:30 PM",
    meetingType: "online",
    status: "pending",
    details:
      "Discussion about the final project requirements and grading criteria",
  },
  {
    purpose: "Research Methodology Discussion",
    class: "CMSC 198",
    section: "1",
    facultyName: "Maria Garcia",
    facultyEmail: "mgarcia@up.edu.ph",
    date: new Date(2024, 11, 15), // December 15, 2024
    timeSlot: "1:00 PM to 2:30 PM",
    meetingType: "online",
    status: "reschedule",
    details:
      "Discussion about research methodologies and data collection techniques",
  },
];

export default function Background({
  children,
}: {
  children: React.ReactNode;
}) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [rescheduleAppointments, setRescheduleAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  useEffect(() => {
    // Mock data fetching
    setTimeout(() => {
      const upcoming: Appointment[] = [];
      const pending: Appointment[] = [];
      const cancelled: Appointment[] = [];
      const reschedule: Appointment[] = [];

      mockAppointments.forEach((appointment, index) => {
        const data: Appointment = {
          id: `appointment-${index}`,
          ...appointment,
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
      setRescheduleAppointments(reschedule);
      setLoading(false);
    }, 1000);
  }, []);

  const handleReschedule = (id: string) => {
    alert(`Reschedule appointment ${id}`);
    // In a real app, navigate to reschedule page or open a modal
  };

  const handleDecline = (id: string) => {
    alert(`Decline appointment ${id}`);
    // In a real app, update the appointment status
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    // You can add additional logic here if needed
  };

  // Extract all appointment dates for the calendar highlighting
  const getAllAppointmentDates = () => {
    return [...upcomingAppointments.map((app) => app.date)];
  };

  return (
    <div className="flex flex-col md:flex-row">
      {children}
      {/* Appointments Section */}
      <div className="flex-grow m-4">
        <AppointmentsTabs
          upcomingAppointments={upcomingAppointments}
          pendingAppointments={pendingAppointments}
          rescheduleAppointments={rescheduleAppointments}
          loading={loading}
          onReschedule={handleReschedule}
          onDecline={handleDecline}
        />
      </div>

      {/* Calendar Section */}
      <div className="flex-none mx-4 my-6">
        <MonthCalendar
          onDateSelect={handleDateSelect}
          initialDate={selectedDate}
          appointmentDates={getAllAppointmentDates()}
        />
      </div>
    </div>
  );
}
