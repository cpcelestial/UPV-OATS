"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacultyAvailability } from "./faculty-avail";
import { FacultyList } from "./faculty-list";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase-config";

export default function ConsultationHours() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      const facultySnap = await getDocs(collection(db, "faculty"));
      const facultyList = facultySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFaculty(facultyList);
      setLoading(false);
    };
    fetchFaculty();
  }, []);

  return (
    <main className="flex-grow px-6 py-6 overflow-auto">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="availability" className="space-y-4">
          <TabsList>
            <TabsTrigger value="availability">Consultation Hours</TabsTrigger>
            <TabsTrigger value="faculty">Faculty List</TabsTrigger>
          </TabsList>
          <TabsContent value="availability">
            {loading ? (
              <div>Loading faculty...</div>
            ) : (
              <FacultyAvailability faculty={faculty} />
            )}
          </TabsContent>
          <TabsContent value="faculty">
            {loading ? (
              <div>Loading faculty...</div>
            ) : (
              <FacultyList faculty={faculty} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
