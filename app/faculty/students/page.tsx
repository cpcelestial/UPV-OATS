"use client";

import { StudentsTable } from "./students-table";
import type { Student } from "@/app/data";

const sampleStudents: Student[] = [
  {
    id: "1",
    firstName: "Emma",
    lastName: "Johnson",
    email: "emma.johnson@university.edu",
    studentNumber: "STU001",
    college: "College of Engineering",
    degreeProgram: "Computer Science",
    country: "United States",
    cityTown: "San Francisco",
    description: "Passionate about AI and machine learning",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    schedule: [],
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@university.edu",
    studentNumber: "STU002",
    college: "College of Business",
    degreeProgram: "Business Administration",
    country: "Canada",
    cityTown: "Toronto",
    description: "Interested in entrepreneurship and finance",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    schedule: [],
  },
  {
    id: "3",
    firstName: "Sofia",
    lastName: "Rodriguez",
    email: "sofia.rodriguez@university.edu",
    studentNumber: "STU003",
    college: "College of Arts and Sciences",
    degreeProgram: "Psychology",
    country: "Spain",
    cityTown: "Madrid",
    description: "Researching cognitive behavioral therapy",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    schedule: [],
  },
  {
    id: "4",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@university.edu",
    studentNumber: "STU004",
    college: "College of Engineering",
    degreeProgram: "Mechanical Engineering",
    country: "United Kingdom",
    cityTown: "London",
    description: "Focus on renewable energy systems",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    schedule: [],
  },
  {
    id: "5",
    firstName: "Aisha",
    lastName: "Patel",
    email: "aisha.patel@university.edu",
    studentNumber: "STU005",
    college: "College of Medicine",
    degreeProgram: "Pre-Medicine",
    country: "India",
    cityTown: "Mumbai",
    description: "Aspiring to specialize in pediatrics",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    schedule: [],
  },
  {
    id: "6",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@university.edu",
    studentNumber: "STU006",
    college: "College of Arts and Sciences",
    degreeProgram: "Mathematics",
    country: "South Korea",
    cityTown: "Seoul",
    description: "Research in applied mathematics",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    schedule: [],
  },
];

export default function Page() {
  return (
    <main className="flex-grow p-4">
      <div className="container mx-auto">
        <StudentsTable students={sampleStudents} />
      </div>
    </main>
  );
}
