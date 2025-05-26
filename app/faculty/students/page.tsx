"use client";

import { useEffect, useState } from "react";

import { db } from "@/app/firebase-config";
import { StudentsTable } from "./students-table";
import type { Student } from "@/app/data";
import { collection, getDocs } from "firebase/firestore";

export default function UsersPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const studentsSnap = await getDocs(collection(db, "students"));

      const students = studentsSnap.docs.map((doc) => ({
        ...doc.data(),
      }));

      setStudents([...students]);
      setLoading(false);
    };

    fetchStudents();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <main className="flex-grow p-4">
      <div className="container mx-auto">
        <StudentsTable students={students} />
      </div>
    </main>
  );
}
