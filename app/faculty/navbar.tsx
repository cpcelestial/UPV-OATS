"use client"

import { Button } from "@/components/ui/button"
//import { Moon, Sun, MessageSquare } from 'lucide-react'
import Image from "next/image"
import { usePathname } from 'next/navigation';

const routeTitles: { [key: string]: string } = {
  '/faculty/dashboard': 'Dashboard',
  '/faculty/dashboard/appointments': 'Dashboard',
  '/faculty/calendar': 'Calendar',
  '/faculty/calendar/add-app': 'Appointment',
  '/faculty/faculty': 'Faculty',
  '/faculty/profile': 'Profile',
};

export default function AppNavbar() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || 'Page Not Found';

  return (
    <header className="border-b">
      <div className="flex h-20 items-center px-6">
        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="font-secondary text-base text-muted-foreground font-medium">
            Hello, Student!
          </p>
        </div>
        {/* <div className="flex items-center gap-4 flex-1 justify-center">
          <div className="relative w-full max-w-md">
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
        </div> */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* <Button
            variant="ghost"
            className="text-muted-foreground h-12 w-12"
            onClick={toggleTheme}
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Theme</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground h-12 w-12">
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">Messages</span>
          </Button> */}
          <Button size="icon" variant="ghost" className="relative h-12 w-12 rounded-full">
            <Image
              src="/profile2.jpg"
              alt="Profile"
              className="rounded-full object-cover"
              fill
            />
          </Button>
        </div>
      </div>
    </header>
  );
}