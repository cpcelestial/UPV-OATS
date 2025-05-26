"use client";

import { useState, useEffect } from "react";
import { ProfileSection } from "./profile-section";
import { ProfileDialog } from "./profile-dialog";
import { PasswordDialog } from "./password-dialog";
import { ScheduleDialog } from "./schedule-dialog";
import { ScheduleSection } from "./schedule-section";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase-config";
import type { Student, DaySchedule } from "../../data";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Page() {
  const [profile, setProfile] = useState<Student | null>(null); // Start with null
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((day) => ({ day, slots: [] }))
  );
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state and set userId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setProfile(null);
        setSchedule(DAYS.map((day) => ({ day, slots: [] })));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch profile and schedule when userId changes
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetchProfileAndSchedule = async () => {
      // Fetch profile
      try {
        const profileDocRef = doc(db, "students", userId);
        const profileSnapshot = await getDoc(profileDocRef);

        if (profileSnapshot.exists()) {
          setProfile({
            id: profileSnapshot.id,
            ...profileSnapshot.data(),
          } as Student);
        } else {
          console.error("Profile document does not exist for user:", userId);
          setProfile(null);
        }
      } catch (error) {
        setProfile(null);
        setLoading(false);
        return;
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
      setLoading(false);
    };

    fetchProfileAndSchedule();
  }, [userId]);

  // Update profile in state after editing
  const handleUpdateProfile = (updatedProfile: Partial<Student>) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : null));
  };

  // Update schedule in state after editing
  const handleUpdateSchedule = (newSchedule: DaySchedule[]) => {
    setSchedule(
      DAYS.map(
        (day) => newSchedule.find((d) => d.day === day) || { day, slots: [] }
      )
    );
  };

  if (loading) {
    return <div className="h-full py-[25%] text-center">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="h-full py-[25%] text-center">
        Student profile not found. Please contact admin.
      </div>
    );
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
          userId={userId ?? ""}
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
        userId={userId ?? ""}
      />

      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </main>
  );
}
