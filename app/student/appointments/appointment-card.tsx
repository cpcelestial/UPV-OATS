"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, VideoIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { DialogTitle } from "@/components/ui/dialog";
import type { Appointment, Faculty } from "@/app/data";
import { db } from "@/app/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onReschedule,
  onDecline,
}: AppointmentCardProps) {
  const getNumber = (str: string | null | undefined): string | null => {
    if (!str) return null;
    const parts = str.split("_");
    const last = parts.pop();
    return last && /^\d+$/.test(last) ? last : null;
  };

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState(
    typeof appointment.date === "string"
      ? appointment.date
      : format(appointment.date, "yyyy-MM-dd")
  );
  const [newTime, setNewTime] = useState(appointment.timeSlot ?? "");
  const [loading, setLoading] = useState(false);

  const getFacultyInitials = (): string => {
    if (faculty?.firstName && faculty?.lastName) {
      return `${faculty.firstName.charAt(0)}${faculty.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    const nameParts = appointment.facultyName.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return appointment.facultyName.substring(0, 2).toUpperCase();
  };

  const handleReschedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appointments/reschedule/${appointment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: newDate, time: newTime }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setRescheduleOpen(false);
        // Optionally, trigger a refetch or update parent state here
      } else {
        alert("Failed to reschedule: " + data.error);
      }
    } catch (error) {
      alert("Failed to reschedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const q = query(
          collection(db, "Users"),
          where("email", "==", appointment.facultyEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const facultyDoc = querySnapshot.docs[0];
          const facultyData = facultyDoc.data() as Faculty;
          setFaculty({
            ...facultyData,
            id: facultyDoc.id,
          });
          console.log("Faculty loaded:", facultyData);
        } else {
          console.log("No faculty found with email:", appointment.facultyEmail);
          setFaculty(null);
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
        setFaculty(null);
      }
    };

    if (appointment.facultyEmail) {
      fetchFaculty();
    }
  }, [appointment.facultyEmail]);

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">
                {appointment.class === "Other" ? " " : appointment.class}{" "}
                {appointment.section &&
                  getNumber(appointment.section) &&
                  `- ${getNumber(appointment.section)}`}{" "}
                {appointment.purpose}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <p className="text-lg font-medium">
                {format(appointment.date, "MMMM dd, yyyy")} @{" "}
                {appointment.timeSlot}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 bg-[#F7F7F7] p-4 rounded-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={faculty?.avatarUrl}
                alt={appointment.facultyName}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getFacultyInitials()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-medium">{appointment.facultyName}</p>
              <p className="text-muted-foreground text-sm">
                {appointment.facultyEmail || `faculty@example.com`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {appointment.meetingType === "f2f" ? (
              <MapPinIcon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <VideoIcon className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Type of Appointment</p>
              <p className="text-muted-foreground text-sm">
                {appointment.meetingType === "f2f"
                  ? "Face to Face"
                  : "Online Meeting"}
              </p>
            </div>
          </div>
        </div>

        {appointment.details && (
          <div>
            <p className="font-medium mb-1">Appointment Details</p>
            <p className="text-muted-foreground">{appointment.details}</p>
          </div>
        )}

        {appointment.participants && appointment.participants.length > 0 && (
          <div className="">
            <p className="font-medium mb-2">Participants</p>
            <div className="flex flex-wrap gap-4 bg-[#F7F7F7] p-4 rounded-md">
              {appointment.participants.map((participant, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={participant.avatarUrl || "/placeholder.svg"}
                      alt={participant.name}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {participant.name
                        ? participant.name
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        : "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{participant.name}</p>
                    {participant.email && (
                      <p className="text-xs text-muted-foreground">
                        {participant.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4">
          {onDecline && (
            <Button
              variant="destructive"
              onClick={() => onDecline(appointment.id)}
            >
              Cancel
            </Button>
          )}
          <Button onClick={() => setRescheduleOpen(true)}>Reschedule</Button>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <div className="flex flex-col gap-4">
            <label>
              New Date:
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </label>
            <label>
              New Time:
              <input
                type="time"
                className="border rounded px-2 py-1 w-full"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </label>
            <Button
              onClick={handleReschedule}
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Rescheduling..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
