"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Student } from "../../data";

interface ProfileSectionProps {
  profile: Student;
  onUpdateProfile: () => void;
  onChangePassword: () => void;
}

export function ProfileSection({
  profile,
  onUpdateProfile,
  onChangePassword,
}: ProfileSectionProps) {
  const avatarSrc =
    profile.avatarUrl && profile.avatarUrl.trim() !== ""
      ? profile.avatarUrl
      : "/placeholder.svg";
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-48 w-48">
              <Image
                src={avatarSrc}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <Button className="w-full" onClick={onChangePassword}>
              Change password
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-3xl font-bold mb-1">{`${profile.firstName} ${profile.lastName}`}</h1>
                <p className="text-muted-foreground mb-6">
                  {profile.description}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={onUpdateProfile}
                className="whitespace-nowrap"
              >
                Edit profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
              <div>
                <p className="text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">College</p>
                <p className="font-medium">{profile.college}</p>
              </div>
              <div className="invisible">
                {profile.cityTown && (
                  <div className="visible">
                    <p className="text-muted-foreground mb-1">City/Town</p>
                    <p className="font-medium">{profile.cityTown}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Student Number</p>
                <p className="font-medium">{profile.studentNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Degree Program</p>
                <p className="font-medium">{profile.degreeProgram}</p>
              </div>
              <div className="invisible">
                {profile.country && (
                  <div className="visible">
                    <p className="text-muted-foreground mb-1">Country</p>
                    <p className="font-medium">{profile.country}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
