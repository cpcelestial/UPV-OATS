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
  '/student/dashboard': 'Dashboard',
  '/student/calendar': 'Calendar',
  '/student/faculty': 'Faculty',
  '/student/profile': 'Profile',
  '/student/calendar/add-app': 'Add Appointment',
  '/student/dashboard/appointments' : 'Appointments'
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
          const userDocRef = doc(db, 'users', user.uid);
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