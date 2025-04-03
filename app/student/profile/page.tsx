"use client"

import { useState } from "react"
import { ProfileSection } from "./profile-section"
import { ScheduleSection } from "./schedule-section"
import { ProfileDialog } from "./profile-dialog"
import { ScheduleDialog } from "./schedule-dialog"
import type { Student } from "../data"

// Sample data - replace with your actual data source
const initialProfile: Student = {
  id: "1",
  firstName: "Juan",
  lastName: "dela Cruz",
  email: "jdelacruz@up.edu.ph",
  emailVisibility: true,
  studentNumber: "2022-12345",
  college: "Arts and Sciences",
  degreeProgram: "BS Computer Science",
  cityTown: "Miagao, Iloilo",
  country: "Philippines",
  description: "",
  avatarUrl: "/profile.jpg",
  schedule: [
    { day: "Monday", slots: [] },
    { day: "Tuesday", slots: [] },
    { day: "Wednesday", slots: [] },
    { day: "Thursday", slots: [] },
    { day: "Friday", slots: [] },
    { day: "Saturday", slots: [] },
  ],
}

export default function Page() {
  const [profile, setProfile] = useState<Student>(initialProfile)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)

  const handleUpdateProfile = (updatedProfile: Partial<Student>) => {
    setProfile((prev) => ({ ...prev, ...updatedProfile }))
  }

  const handleUpdateSchedule = (newSchedule: typeof profile.schedule) => {
    handleUpdateProfile({ schedule: newSchedule })
  }

  return (
    <main className="flex-grow p-4 overflow-auto">
      <div className="space-y-6">
        <ProfileSection profile={profile} onUpdateProfile={() => setIsProfileDialogOpen(true)} />

        <ScheduleSection schedule={profile.schedule} onUpdateSchedule={() => setIsScheduleDialogOpen(true)} />
      </div>

      <ProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      <ScheduleDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        schedule={profile.schedule}
        onUpdateSchedule={handleUpdateSchedule}
      />
    </main>
  )
}