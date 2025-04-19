"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { AppointmentList } from "./appointment-list";
import { db } from "@/app/firebase-config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const sampleAppointments = {
  upcoming: [
    {
      id: "app-001",
      purpose: "Thesis Consultation",
      class: "Computer Science",
      section: "CS-401",
      facultyName: "Dr. Maria Santos",
      date: new Date(2025, 4, 25, 10, 0), // May 25, 2025
      timeSlot: "10:00 AM - 11:00 AM",
      meetingType: "f2f" as const,
      details: "Discussion about thesis proposal and methodology",
      status: "approved" as const,
      participants: [
        { email: "student@example.com", name: "John Doe" },
        { email: "faculty@example.com", name: "Dr. Maria Santos" },
      ],
    },
    {
      id: "app-002",
      purpose: "Project Defense Preparation",
      class: "Software Engineering",
      section: "SE-302",
      facultyName: "Engr. James Rodriguez",
      date: new Date(2025, 4, 28, 14, 0), // May 28, 2025
      timeSlot: "2:00 PM - 3:30 PM",
      meetingType: "online" as const,
      details: "Final review of project presentation slides",
      status: "approved" as const,
      participants: [
        { email: "student@example.com", name: "John Doe" },
        { email: "faculty@example.com", name: "Engr. James Rodriguez" },
      ],
    },
  ],
  pending: [
    {
      id: "app-003",
      purpose: "Research Paper Review",
      class: "Research Methods",
      section: "RM-201",
      facultyName: "Dr. Anna Lee",
      date: new Date(2025, 5, 2, 13, 0), // June 2, 2025
      timeSlot: "1:00 PM - 2:00 PM",
      meetingType: "online" as const,
      details: "Initial review of research paper draft",
      status: "pending" as const,
      participants: [
        { email: "student@example.com", name: "John Doe" },
        { email: "faculty@example.com", name: "Dr. Anna Lee" },
      ],
    },
  ],
  declined: [
    {
      id: "app-004",
      purpose: "Laboratory Experiment Discussion",
      class: "Physics",
      section: "PHY-103",
      facultyName: "Prof. Robert Chen",
      date: new Date(2025, 4, 15, 9, 0), // May 15, 2025
      timeSlot: "9:00 AM - 10:00 AM",
      meetingType: "f2f" as const,
      details: "Faculty unavailable on this date. Please reschedule.",
      status: "rejected" as const,
      participants: [
        { email: "student@example.com", name: "John Doe" },
        { email: "faculty@example.com", name: "Prof. Robert Chen" },
      ],
    },
    {
      id: "app-005",
      purpose: "Midterm Exam Review",
      class: "Calculus",
      section: "MATH-201",
      facultyName: "Dr. Emily Watson",
      date: new Date(2025, 4, 18, 15, 0), // May 18, 2025
      timeSlot: "3:00 PM - 4:00 PM",
      meetingType: "online" as const,
      details:
        "Schedule conflict with department meeting. Please select another date.",
      status: "rejected" as const,
      participants: [
        { email: "student@example.com", name: "John Doe" },
        { email: "faculty@example.com", name: "Dr. Emily Watson" },
      ],
    },
  ],
  reschedule: [
    {
      id: "app-006",
      purpose: "Capstone Project Consultation",
      class: "Information Technology",
      section: "IT-405",
      facultyName: "Engr. Michael Brown",
      date: new Date(2025, 4, 20, 11, 0), // May 20, 2025
      timeSlot: "11:00 AM - 12:00 PM",
      meetingType: "f2f" as const,
      details:
        "Faculty requested to reschedule due to emergency meeting. Please select a new date.",
      status: "reschedule" as const,
      participants: [
        { email: "student@example.com", name: "John Doe" },
        { email: "faculty@example.com", name: "Engr. Michael Brown" },
      ],
    },
  ],
};

export default function Page() {
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = React.useState([]);
  const [pendingAppointments, setPendingAppointments] = React.useState([]);
  const [declinedAppointments, setDeclinedAppointments] = React.useState([]);
  const [rescheduleAppointments, setRescheduleAppointments] = React.useState(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("pending");

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("No user logged in");
          setLoading(false);
          return;
        }

        // Query for all user appointments
        const appointmentsRef = collection(db, "appointments");
        const userAppointmentsQuery = query(
          appointmentsRef,
          where("userId", "==", user.uid),
          orderBy("date", "asc")
        );

        const querySnapshot = await getDocs(userAppointmentsQuery);

        const upcoming = [];
        const pending = [];
        const declined = [];
        const reschedule = [];

        querySnapshot.forEach((doc) => {
          const data = {
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(), // Convert Firestore timestamp to Date
          };

          if (data.status === "approved") {
            upcoming.push(data);
          } else if (data.status === "pending") {
            pending.push(data);
          } else if (data.status === "reschedule") {
            reschedule.push(data);
          } else {
            declined.push(data);
          }
        });

        setUpcomingAppointments(upcoming);
        setPendingAppointments(pending);
        setDeclinedAppointments(declined);
        setRescheduleAppointments(reschedule);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
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
                appointments={sampleAppointments.upcoming}
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
                appointments={sampleAppointments.pending}
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
                appointments={sampleAppointments.declined}
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
                  appointments={sampleAppointments.reschedule}
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
