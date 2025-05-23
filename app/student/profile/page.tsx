"use client";

import { useState, useEffect } from "react";
import { ProfileSection } from "./profile-section";
import { ProfileDialog } from "./profile-dialog";
import { PasswordDialog } from "./password-dialog";
import { ScheduleDialog } from "./schedule-dialog";
import { ScheduleSection } from "./schedule-section";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase-config"; // Firestore instance
import type { Student, DaySchedule } from "../../data";

export default function Page() {
  const [profile, setProfile] = useState<Student | null>(null); // Start with null
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [docID, setDocID] = useState<string | null>(null);
  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // Fetch profile and schedule data from Firestore when user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        console.log("User ID:", userId);
        setDocID(userId);

        // Fetch profile
        try {
          const profileDocRef = doc(db, "students", userId);
          const profileSnapshot = await getDoc(profileDocRef);

          if (profileSnapshot.exists()) {
            setProfile(profileSnapshot.data() as Student);
          } else {
            console.error("Profile document does not exist for user:", userId);
            setProfile(null); // Ensure profile is null if no data exists
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          setProfile(null);
        }

        // Fetch schedule
        try {
          const scheduleDocRef = doc(db, "schedules", userId);
          const scheduleSnapshot = await getDoc(scheduleDocRef);
          let loadedSchedule: DaySchedule[] = [];
          if (scheduleSnapshot.exists()) {
            loadedSchedule = scheduleSnapshot.data().schedule as DaySchedule[];
          }
          setSchedule(
            DAYS.map(
              (day) =>
                loadedSchedule.find((d) => d.day === day) || { day, slots: [] }
            )
          );
        } catch {
          setSchedule(DAYS.map((day) => ({ day, slots: [] })));
        }
      } else {
        setDocID(null);
        setProfile(null);
        setSchedule(DAYS.map((day) => ({ day, slots: [] })));
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [DAYS]);
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
          onEditSchedule={() => setIsScheduleDialogOpen(true)}
          onUpdateSchedule={setSchedule}
          userId={docID}
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
        schedule={schedule}
        onUpdateSchedule={handleUpdateSchedule}
        onOpenChange={setIsScheduleDialogOpen}
        userId={docID ?? ""}
      />

      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </main>
  );
}
