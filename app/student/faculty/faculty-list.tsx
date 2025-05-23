"use client";

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
import { useState } from "react";
import type { FacultyMember } from "./types/faculty";

interface FacultyListProps {
  faculty: FacultyMember[];
}

export function FacultyList({ faculty }: FacultyListProps) {
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");

  // Unique list of colleges for the dropdown
  const colleges = [
    "All Colleges",
    ...Array.from(new Set(faculty.map((f) => f.college).filter(Boolean))),
  ];

  // Filter and sort faculty based on search and selected college
  const filteredFaculty = faculty
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
      // Always sort by name
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  return (
    <div>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          {/* Dropdown for college filter */}
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
            <TableHead>Course</TableHead>
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
              <TableCell>{member.course}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
