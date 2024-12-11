'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FacultyAvailability } from "./faculty-avail"
import { FacultyList } from "./faculty-list"

// Sample data - replace with your actual data source
const FACULTY_DATA = [
  {
    id: "1",
    name: "Jane Doe",
    email: "janedoe@uni.edu.ph",
    avatarUrl: "/placeholder.svg",
    college: "Arts and Sciences",
    department: "Physical Sciences and Mathematics",
    course: "B.S. Computer Science",
    availability: [
      {
        day: "Mon",
        slots: [
          { start: "9:00 AM", end: "10:00 AM" },
          { start: "1:30 PM", end: "3:00 PM" }
        ]
      },
      {
        day: "Tue",
        slots: [
          { start: "9:00 AM", end: "10:00 AM" },
          { start: "1:30 PM", end: "3:00 PM" },
          { start: "4:00 PM", end: "5:30 PM" }
        ]
      }
    ]
  },
  // Add more faculty members as needed
]

export default function ConsultationHours() {
  return (
    <main className="flex-grow px-6 py-6 overflow-auto">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="availability" className="space-y-4">
          <TabsList>
            <TabsTrigger value="availability">Consultation Hours</TabsTrigger>
            <TabsTrigger value="faculty">Faculty List</TabsTrigger>
          </TabsList>
          <TabsContent value="availability">
            <FacultyAvailability faculty={FACULTY_DATA} />
          </TabsContent>
          <TabsContent value="faculty">
            <FacultyList faculty={FACULTY_DATA} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

