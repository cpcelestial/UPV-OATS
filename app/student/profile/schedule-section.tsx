"use client";

import { useState, useEffect } from "react";
import { fetchSchedule } from "@/app/firebaseService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, User } from "lucide-react";
import type { DaySchedule } from "../../data";

export function ScheduleSection({
  schedule: initialSchedule,
  onEditSchedule,
  userId,
}: {
  schedule: DaySchedule[];
  onEditSchedule: (updatedSchedule: DaySchedule[]) => void;
}) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);

  useEffect(() => {
    if (!userId) return;
    const loadSchedule = async () => {
      const data = await fetchSchedule(userId); // Fetch from Firestore
      if (data) setSchedule(data);
    };
    loadSchedule();
  }, [userId]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Schedule</h1>
          <Button variant="secondary" onClick={onEditSchedule}>
            Edit schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4">
          {schedule.map((day) => (
            <div key={day.day} className="space-y-3">
              <h3 className="font-bold text-gray-900 text-center">{day.day}</h3>
              <div className="space-y-2">
                {day.slots.length > 0 ? (
                  day.slots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${slot.color} space-y-2`}
                    >
                      {slot.subject && (
                        <div className="font-semibold">{slot.subject}</div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          {slot.start} - {slot.end}
                        </span>
                      </div>
                      {slot.room && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{slot.room}</span>
                        </div>
                      )}
                      {slot.professor && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>{slot.professor}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-20 flex items-center justify-center text-sm text-gray-500">
                    No classes
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
