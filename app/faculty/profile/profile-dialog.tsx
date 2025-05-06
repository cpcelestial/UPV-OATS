"use client";

import { useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
import type { Faculty } from "../../data";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Faculty;
  onUpdateProfile: (profile: Partial<Faculty>) => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  profile,
  onUpdateProfile,
}: ProfileDialogProps) {
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false); // Track saving state
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setEditedProfile(profile);
    }
  }, [open, profile]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected.");
      return;
    }
    console.log("File selected:", file.name);

    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${profile.id}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);
      setEditedProfile((prev) => ({
        ...prev,
        avatarUrl: downloadURL,
      }));
      console.log("Image uploaded successfully:", downloadURL);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileDocRef = doc(db, "faculty", profile.id);
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
                src={editedProfile.avatarUrl || "/placeholder.svg"}
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
                <label
                  htmlFor="file-input"
                  className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer flex items-center justify-center"
                  style={{
                    width: "32px", // Adjust the size to match the small icon
                    height: "32px",
                    borderRadius: "50%",
                  }}
                />
                <Camera className="h-4 w-4" />
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
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
              <Label htmlFor="studentNumber">Faculty Number</Label>
              <Input
                id="studentNumber"
                value={profile.facultyNumber}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" value={profile.college} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degreeProgram">Department</Label>
              <Input id="degreeProgram" value={profile.department} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cityTown">City/Town</Label>
              <Input
                id="cityTown"
                value={editedProfile.cityTown}
                placeholder="Miagao, Iloilo"
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
                placeholder="Philippines"
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
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving ? "Saving..." : isUploading ? "Uploading..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
