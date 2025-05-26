"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

const routeTitles: { [key: string]: string } = {
  "/faculty/dashboard": "Dashboard",
  "/faculty/calendar": "Calendar",
  "/faculty/appointments": "Appointments",
  "/faculty/appointments/sched-avail": "Appointments",
  "/faculty/students": "Students",
  "/faculty/profile": "Profile",
};

export default function AppNavbar() {
  const pathname = usePathname();
  const title = pathname
    ? routeTitles[pathname] || "Page Not Found"
    : "Loading...";

  const [userName, setUserName] = useState("User");
  const [userLast, setUserLast] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user document from Firestore
          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const facultyDocRef = collection(db, "faculty");
            const facultyQuery = query(
              facultyDocRef,
              where("uid", "==", user.uid)
            );

            const unsubscribefaculty = onSnapshot(facultyQuery, (snapshot) => {
              const facultyData = snapshot.docs[0]?.data();
              setUserName(facultyData?.firstName || "User");
              setUserLast(facultyData?.lastName || "");
            });
          } else {
            // Fallback to email or display name if no Firestore doc
            setUserName(
              user.displayName || user.email?.split("@")[0] || "User"
            );
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("User");
        }
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <header className="border-b">
      <div className="flex h-20 items-center px-6">
        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="font-secondary text-base text-muted-foreground font-medium">
            Hello, {userName}!
          </p>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src="placeholder.svg"
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {userName[0]}
              {userLast[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
