"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { FacultyMember } from "./types/faculty";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

interface FacultyAvailabilityProps {
  faculty: FacultyMember[];
}

export function FacultyAvailability({ faculty }: FacultyAvailabilityProps) {
  const [search, setSearch] = useState("");
  const [filteredFaculty, setFilteredFaculty] = useState(faculty);

  const handleSearch = () => {
    const filtered = faculty.filter(
      (member) =>
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFaculty(filtered);
  };

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
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                      <span className="font-medium">
                        {member.firstName} {member.lastName}
                      </span>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-sm text-gray-500">
                        {member.email}
                      </span>
                    </div>
                  </div>
                </td>
                {DAYS.map((day) => (
                  <td key={day} className="py-4 px-4">
                    <div className="flex flex-col items-center gap-1">
                      {member.availability
                        ?.find((a) => a.day === day)
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
