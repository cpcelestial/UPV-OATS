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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import type { FacultyMember } from "./types/faculty";
import { Button } from "@/components/ui/button";

interface FacultyListProps {
  faculty: FacultyMember[];
}

export function FacultyList({ faculty }: FacultyListProps) {
  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [filteredFaculty, setFilteredFaculty] = useState(faculty);

  const handleSearch = () => {
    const filtered = faculty.filter(
      (member) =>
        (member.name.toLowerCase().includes(search.toLowerCase()) ||
          member.email.toLowerCase().includes(search.toLowerCase())) &&
        (selectedCollege === "all" || member.college === selectedCollege)
    );
    setFilteredFaculty(filtered);
  };

  const colleges = Array.from(new Set(faculty.map((f) => f.college).filter(Boolean))).concat(
    " "
  );

  return (
    <div className="space-y-8">
      {/* Adjusted layout */}
      <div className="flex justify-between items-center">
        {/* Dropdown on the left */}
        <Select value={selectedCollege} onValueChange={setSelectedCollege}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select College" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {colleges.map((college) => (
              <SelectItem key={college} value={college}>
                {college}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search bar and button on the right */}
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className = "bg-gray-50">
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
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{member.name}</span>
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
