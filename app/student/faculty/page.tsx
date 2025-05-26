"use client";

import { useEffect, useState } from "react";
import { FacultyTable } from "./faculty-table";
import type { Faculty } from "@/app/data";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase-config";

export default function UsersPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      setLoading(true);
      const facultySnap = await getDocs(collection(db, "faculty"));

      const faculty = facultySnap.docs.map((doc) => ({
        ...doc.data(),
      }));

      setFaculty([...faculty]);
      setLoading(false);
    };

    fetchFaculty();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <main className="flex-grow p-4">
      <div className="container mx-auto">
        <FacultyTable faculty={faculty} />
      </div>
    </main>
  );
}
