"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Moon, Sun, MessageSquare } from 'lucide-react'
import { useTheme } from "next-themes"
import Image from "next/image"
import { usePathname } from 'next/navigation';
import { auth, db } from "../firebase-config"; // Firebase auth and Firestore db
import { onAuthStateChanged } from "firebase/auth"; // Firebase auth state listener
import { doc, getDoc } from "firebase/firestore"; // Firestore methods to fetch user data

const routeTitles: { [key: string]: string } = {
  '/faculty/dashboard': 'Dashboard',
  '/faculty/calendar': 'Calendar',
  '/faculty/faculty': 'Faculty',
  '/faculty/profile': 'Profile',
  '/faculty/calendar/add-app': 'Add Appointment',
  '/faculty/dashboard/appointments' : 'Appointments'
};

export default function AppNavbar() {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const title = routeTitles[pathname] || 'Page Not Found';
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user document from Firestore
          const userDocRef = doc(db, 'Users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Assuming the user document has a 'name' field
            setUserName(userData.name || userData.firstName || 'User');
          } else {
            // Fallback to email or display name if no Firestore doc
            setUserName(user.displayName || user.email?.split('@')[0] || 'User');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName('User');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b">
      <div className="flex h-20 items-center px-6">
        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-base text-muted-foreground mt-1">
            Hello, {userName}!
          </p>
        </div>
        {/* Theme toggle button */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-4 pr-12 h-12 text-lg"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </div>
          </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </header>
  );
}