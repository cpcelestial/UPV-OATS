"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase-config";
import type { FacultyMember } from "./types/faculty";

interface FacultyListProps {
  faculty: FacultyMember[];
}

interface FacultyWithSchedule extends FacultyMember {
  consultationHours?: {
    day: string;
    slots: { start: string; end: string; room?: string; note?: string }[];
  }[];
}

export function FacultyList({ faculty }: FacultyListProps) {
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [facultyWithSchedules, setFacultyWithSchedules] = useState<
    FacultyWithSchedule[]
  >([]);

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
      setFacultyWithSchedules(results);
    }
    if (faculty.length > 0) fetchSchedules();
  }, [faculty]);

  // Unique list of colleges for the dropdown
  const colleges = [
    "All Colleges",
    ...Array.from(new Set(faculty.map((f) => f.college).filter(Boolean))),
  ];

  // Filter and sort faculty based on search and selected college
  const filteredFaculty = facultyWithSchedules
    .filter((member) => {
      const matchesCollege =
        selectedCollege === "All Colleges" ||
        member.college === selectedCollege;
      const matchesSearch =
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());
      return matchesCollege && matchesSearch;
    })
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  return (
    <div>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {colleges.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>
          <Input
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[250px]">User name</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Department</TableHead>
            {/* Remove Consultation Hours column */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFaculty.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
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
                    <span>
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {member.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{member.college}</TableCell>
              <TableCell>{member.department}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
