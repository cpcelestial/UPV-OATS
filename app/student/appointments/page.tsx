"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { AppointmentList } from "./appointment-list";
import type { Appointment } from "./appointment-card";

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
    purpose: "Thesis Defense Preparation",
    class: "CMSC 190",
    section: "2",
    facultyName: "Robert Chen",
    facultyEmail: "rchen@up.edu.ph",
    date: new Date(2024, 11, 10), // December 10, 2024
    timeSlot: "9:00 AM to 11:00 AM",
    meetingType: "f2f",
    status: "cancelled",
    details: "Preparation for the upcoming thesis defense presentation",
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

export default function Page() {
  const router = useRouter();
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
  const [activeTab, setActiveTab] = React.useState("pending");

  React.useEffect(() => {
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
      setCancelledAppointments(cancelled);
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

  return (
    <div className="px-8 py-4">
      <Button
        onClick={() => router.push("appointments/sched-app")}
        className="float-right bg-[#2F5233] hover:bg-[#2F5233]/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Appointment
      </Button>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="upcoming" className="mr-2 px-6">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="pending" className="mr-2 px-6">
            Pending
          </TabsTrigger>
          <TabsTrigger value="declined" className="mr-2 px-6">
            Declined
          </TabsTrigger>
          {rescheduleAppointments.length > 0 && (
            <TabsTrigger
              value="reschedule"
              className="px-6 bg-red-100 text-red-500"
            >
              For Reschedule
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList
              appointments={upcomingAppointments}
              emptyMessage="No upcoming appointments found"
              onReschedule={handleReschedule}
              onDecline={handleDecline}
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList
              appointments={pendingAppointments}
              emptyMessage="No pending appointments found"
              onReschedule={handleReschedule}
              onDecline={handleDecline}
            />
          )}
        </TabsContent>

        <TabsContent value="declined" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList
              appointments={cancelledAppointments}
              emptyMessage="No declined appointments found"
            />
          )}
        </TabsContent>

        {rescheduleAppointments.length > 0 && (
          <TabsContent value="reschedule" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <p>Loading appointments...</p>
              </div>
            ) : (
              <AppointmentList
                appointments={rescheduleAppointments}
                emptyMessage="No appointments for reschedule found"
                onDecline={handleDecline}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
