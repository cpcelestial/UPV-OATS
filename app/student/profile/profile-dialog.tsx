"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase-config";
import type { Student } from "../data";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Student;
  onUpdateProfile: (profile: Partial<Student>) => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  profile,
  onUpdateProfile,
}: ProfileDialogProps) {
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false); // Track saving state

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileDocRef = doc(db, "students", profile.id);
      await setDoc(profileDocRef, editedProfile, { merge: true });

      // Update local state
      onUpdateProfile(editedProfile); // Pass the updated profile to the parent
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl py-6 pl-6 pr-4">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Profile</DialogTitle>
          <DialogDescription>
            Please provide all required information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto py-2 pl-2 pr-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src={profile.avatarUrl || "/placeholder.svg"}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={editedProfile.firstName}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={editedProfile.lastName}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentNumber">Student Number</Label>
              <Input
                id="studentNumber"
                value={profile.studentNumber}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" value={profile.college} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degreeProgram">Degree Program</Label>
              <Input
                id="degreeProgram"
                value={profile.degreeProgram}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cityTown">City/Town</Label>
              <Input
                id="cityTown"
                value={editedProfile.cityTown}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    cityTown: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={editedProfile.country}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedProfile.description}
              onChange={(e) =>
                setEditedProfile((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Tell us about yourself..."
              className="h-24 resize-none"
            />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}