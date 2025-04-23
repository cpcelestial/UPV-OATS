"use client";

import { useState, useEffect } from "react";
import { ProfileSection } from "./profile-section";
import { ProfileDialog } from "./profile-dialog";
import { PasswordDialog } from "./password-dialog";
import { ScheduleDialog } from "./schedule-dialog";
import { ScheduleSection } from "./schedule-section";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase-config"; // Firestore instance
import type { Student } from "../data";

export default function Page() {
  const [profile, setProfile] = useState<Student | null>(null); // Start with null
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Fetch profile data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileDocRef = doc(db, "students", "1"); // Replace "1" with the actual document ID
        const profileSnapshot = await getDoc(profileDocRef);

        if (profileSnapshot.exists()) {
          setProfile(profileSnapshot.data() as Student);
        } else {
          console.error("Profile document does not exist.");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    const fetchSchedule = async () => {
      try {
        const scheduleDocRef = doc(db, "schedules", "userSchedule");
        const scheduleSnapshot = await getDoc(scheduleDocRef);

        if (scheduleSnapshot.exists()) {
          setSchedule(scheduleSnapshot.data().schedule as DaySchedule[]);
        } else {
          console.error("Schedule document does not exist.");
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      }
    };

    fetchProfile();
    fetchSchedule();
  }, []);

  const handleUpdateProfile = (updatedProfile: Partial<Student>) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : null));
    console.log("Updated Profile:", updatedProfile);
  };

  const handleUpdateSchedule = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
  };

  if (!profile) {
    return <div className="h-full py-[25%] text-center">Loading...</div>; // Show a loading state while fetching the profile
  }

  return (
    <main className="flex-grow p-4 overflow-auto">
      <div className="space-y-6">
        <ProfileSection
          profile={profile}
          onUpdateProfile={() => setIsProfileDialogOpen(true)}
          onChangePassword={() => setIsPasswordDialogOpen(true)}
        />

        <ScheduleSection
          schedule={schedule}
          onUpdateSchedule={() => setIsScheduleDialogOpen(true)}
        />
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
        schedule={schedule}
        onUpdateSchedule={(newSchedule) => {
          handleUpdateSchedule(newSchedule); // Update schedule
        }}
      />

      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </main>
  );
}
