"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"

const routeTitles: { [key: string]: string } = {
  "/student/dashboard": "Dashboard",
  "/student/calendar": "Calendar",
  "/student/appointments": "Appointments",
  "/student/faculty": "Faculty",
  "/student/profile": "Profile",
}

export default function AppNavbar() {
  const pathname = usePathname()
  const title = pathname ? routeTitles[pathname] || "Page Not Found" : "Loading..."

  return (
    <header className="border-b">
      <div className="flex h-20 items-center px-6">
        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="font-secondary text-base text-muted-foreground font-medium">Hello, Student!</p>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/profile2.jpg" alt="Profile" className="object-cover" />
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}