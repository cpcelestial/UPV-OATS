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
import type { Faculty, DaySchedule } from "../../data";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function Page() {
  const [profile, setProfile] = useState<Faculty | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((day) => ({ day, slots: [] }))
  );
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state and set facultyId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFacultyId(user.uid);
      } else {
        setFacultyId(null);
        setProfile(null);
        setSchedule(DAYS.map((day) => ({ day, slots: [] })));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch profile and schedule when facultyId changes
  useEffect(() => {
    if (!facultyId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetchProfileAndSchedule = async () => {
      // Fetch profile
      try {
        const profileDocRef = doc(db, "faculty", facultyId);
        const profileSnapshot = await getDoc(profileDocRef);

        if (profileSnapshot.exists()) {
          setProfile({
            id: profileSnapshot.id,
            ...profileSnapshot.data(),
          } as Faculty);
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
        const scheduleDocRef = doc(db, "schedules", facultyId);
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
  }, [facultyId]);

  // Update profile in state after editing
  const handleUpdateProfile = (updatedProfile: Partial<Faculty>) => {
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
        Faculty profile not found. Please contact admin.
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
          userId={facultyId ?? ""}
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
        userId={facultyId ?? ""}
      />

      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </main>
  );
}
