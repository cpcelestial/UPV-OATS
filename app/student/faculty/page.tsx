"use client";

import { FacultyTable } from "./faculty-table";
import type { Faculty } from "@/app/data";

const sampleFaculty: Faculty[] = [
  {
    id: "1",
    firstName: "Emma",
    lastName: "Johnson",
    email: "emma.johnson@university.edu",
    facultyNumber: "STU001",
    college: "College of Engineering",
    department: "Computer Science",
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
    facultyNumber: "STU002",
    college: "College of Business",
    department: "Business Administration",
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
    facultyNumber: "STU003",
    college: "College of Arts and Sciences",
    department: "Psychology",
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
    facultyNumber: "STU004",
    college: "College of Engineering",
    department: "Mechanical Engineering",
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
    facultyNumber: "STU005",
    college: "College of Medicine",
    department: "Pre-Medicine",
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
    facultyNumber: "STU006",
    college: "College of Arts and Sciences",
    department: "Mathematics",
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
        <FacultyTable faculty={sampleFaculty} />
      </div>
    </main>
  );
}
