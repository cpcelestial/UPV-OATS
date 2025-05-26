"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const routeTitles: { [key: string]: string } = {
  "/admin/dashboard": "Dashboard",
  "/admin/calendar": "Calendar",
  "/admin/appointments": "Appointments",
  "/admin/appointments/sched-app": "Appointments",
  "/admin/users": "Users",
  "/admin/users/add-user": "Users",
};

export default function AppNavbar() {
  const pathname = usePathname();
  const title = pathname
    ? routeTitles[pathname] || "Page Not Found"
    : "Loading...";

  const [userName, setUserName] = useState("User");
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
              src="placeholder.svg"
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
