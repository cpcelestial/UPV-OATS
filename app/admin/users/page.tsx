"use client";

import { useEffect, useState } from "react";
import { UsersTable } from "./users-table";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase-config";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  dateAdded?: {
    seconds: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const studentsSnap = await getDocs(collection(db, "students"));
      const facultySnap = await getDocs(collection(db, "faculty"));

      const students = studentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        role: "Student",
      }));

      const faculty = facultySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        role: "Faculty",
      }));

      setUsers([...students, ...faculty]);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <main className="flex-grow p-4">
      <div className="container mx-auto">
        <UsersTable users={users} />
      </div>
    </main>
  );
}
