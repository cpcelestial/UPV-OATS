"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { auth, db } from "../firebase-config"; // Firebase auth and Firestore db
import { onAuthStateChanged } from "firebase/auth"; // Firebase auth state listener
import { doc, getDoc } from "firebase/firestore"; // Firestore methods to fetch user data

const routeTitles: { [key: string]: string } = {
  "/student/dashboard": "Dashboard",
  "/student/calendar": "Calendar",
  "/student/appointments": "Appointments",
  "/student/appointments/sched-app": "Appointments",
  "/student/faculty": "Faculty",
  "/student/profile": "Profile",
};

export default function AppNavbar() {
  const pathname = usePathname();
  const title = pathname
    ? routeTitles[pathname] || "Page Not Found"
    : "Loading...";

  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user document from Firestore
          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Assuming the user document has a 'name' field
            setUserName(userData.name || userData.firstName || "User");
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
              src="/profile2.jpg"
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
