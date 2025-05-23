"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase-config";
import type { FacultyMember } from "./types/faculty";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface FacultyAvailabilityProps {
  faculty: FacultyMember[];
}

interface FacultyWithSchedule extends FacultyMember {
  consultationHours?: {
    day: string;
    slots: { start: string; end: string; room?: string; note?: string }[];
  }[];
}

export function FacultyAvailability({ faculty }: FacultyAvailabilityProps) {
  const [search, setSearch] = useState("");
  const [filteredFaculty, setFilteredFaculty] = useState<FacultyWithSchedule[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Fetch consultation hours for each faculty
  useEffect(() => {
    async function fetchSchedules() {
      const results = await Promise.all(
        faculty.map(async (f) => {
          try {
            const schedDoc = await getDoc(doc(db, "schedules", f.id));
            const schedule = schedDoc.exists() ? schedDoc.data().schedule : [];
            return { ...f, consultationHours: schedule };
          } catch {
            return { ...f, consultationHours: [] };
          }
        })
      );
      setFilteredFaculty(results);
      setLoading(false);
    }
    if (faculty.length > 0) fetchSchedules();
  }, [faculty]);

  // Search handler
  const handleSearch = () => {
    setFilteredFaculty((prev) =>
      prev.filter(
        (member) =>
          `${member.firstName} ${member.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          member.email.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  if (loading) {
    return <div>Loading consultation hours...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <Input
          placeholder="Search faculty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-2 px-4 font-medium text-gray-600 w-1/4">
                Faculty name
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="text-center py-2 px-4 font-medium text-gray-600 w-1/6"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.map((member) => (
              <tr key={member.id} className="border-b">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.avatarUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                      />
                      <AvatarFallback>
                        {(member.firstName?.charAt(0) ?? "") +
                          (member.lastName?.charAt(0) ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {member.firstName} {member.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {member.email}
                      </span>
                    </div>
                  </div>
                </td>
                {DAYS.map((day) => (
                  <td key={day} className="py-4 px-4">
                    <div className="flex flex-col items-center gap-1">
                      {member.consultationHours
                        ?.find(
                          (a) =>
                            a.day.slice(0, 3).toLowerCase() ===
                            day.toLowerCase()
                        )
                        ?.slots.map((slot, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex px-3 py-1 text-xs rounded-full w-fit
                              ${
                                idx % 3 === 0
                                  ? "bg-orange-100 text-orange-800"
                                  : idx % 3 === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {slot.start} - {slot.end}
                            {slot.room ? ` (${slot.room})` : ""}
                          </span>
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
