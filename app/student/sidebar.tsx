"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Calendar, LayoutDashboard, Users2, UserRound, LogOut } from "lucide-react"

export default function AppSidebar() {
  const pathname = usePathname()

  // Use state for any browser-specific operations
  const [mounted, setMounted] = useState(false)

  // Set mounted to true after initial render
  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (route: string) => {
    // During SSR or first render, use a safe default
    if (!mounted) return false
    return pathname === route
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, route: "/student/dashboard" },
    { name: "Calendar", icon: Calendar, route: "/student/calendar" },
    { name: "Faculty", icon: Users2, route: "/student/faculty" },
    { name: "Profile", icon: UserRound, route: "/student/profile" },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="w-56 pl-4 h-full flex flex-col justify-between bg-[#F7F7F7] border-none">
        <div>
          <SidebarHeader className="p-4">
            <div className="flex flex-col items-center gap-2 px-6 py-3">
              <Image src="/logo.png" alt="OATS Logo" width={80} height={80} className="object-contain" />
              <span className="header-logo text-sm">
                <span className="text-primary">UPV</span> <span className="text-secondary">OATS</span>
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.route)}
                    className={`flex items-center w-full px-6 py-8 duration-200 relative
                      ${isActive(item.route)
                        ? "text-[#212121] bg-[#E2E2E2]"
                        : "text-tertiary transition duration-200 hover:text-[#212121] hover:bg-[#E2E2E2]" // Added gray background on hover
                      }`}
                  >
                    <a href={item.route} className="flex items-center gap-3 flex-1">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </div>

        <div className="mt-auto px-2 py-10">
          <SidebarMenuButton
            tooltip="Logout"
            className="flex items-center gap-2 w-full px-6 py-8 font-medium text-tertiary
            transition duration-200 hover:text-[#7B1113] hover:bg-[#F3D2D3]"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </SidebarMenuButton>
        </div>
      </Sidebar>
    </SidebarProvider>
  )
}

