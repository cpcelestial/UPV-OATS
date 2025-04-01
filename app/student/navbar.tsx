"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { usePathname } from "next/navigation"

const routeTitles: { [key: string]: string } = {
  "/student/dashboard": "Dashboard",
  "/student/calendar": "Calendar",
  "/student/faculty": "Faculty",
  "/student/profile": "Profile",
}

export default function AppNavbar() {
  const pathname = usePathname();
  const title = pathname ? routeTitles[pathname] || "Page Not Found" : "Loading..."

  return (
    <header className="border-b">
      <div className="flex h-20 items-center px-6">
        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="font-secondary text-base text-muted-foreground font-medium">Hello, Student!</p>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <Button size="icon" variant="ghost" className="relative h-12 w-12 rounded-full">
            <Image src="/profile2.jpg" alt="Profile" className="rounded-full object-cover" fill />
          </Button>
        </div>
      </div>
    </header>
  )
}
