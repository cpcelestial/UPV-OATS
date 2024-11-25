"use client";

import Image from "next/image";
import { usePathname } from "next/navigation"; // Import usePathname
import React from "react";
import "../globals.css";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Calendar, LayoutDashboard, Users2, UserRound, LogOut } from "lucide-react";

export default function AppSidebar() {
  const pathname = usePathname(); // Get the current active route

  // Function to check if the route is active
  const isActive = (route: string) => pathname === route;

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="h-full flex flex-col justify-between w-64">
        {/* Header */}
        <SidebarHeader className="pb-10">
          <div className="flex flex-col items-center gap-2 px-8 py-5">
            <Image
              src="/logo.png"
              alt="OATS Logo"
              width={80}
              height={80}
              className="object-contain"
            />
            <span className="header-logo">
              <span className="text-primary">UPV</span>{" "}
              <span className="text-secondary">OATS</span>
            </span>
          </div>
        </SidebarHeader>

        {/* Sidebar Menu */}
        <SidebarContent>
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Dashboard"
                className={`flex items-center gap-3 px-8 py-7 sidebar-button-text hover-text-primary font-medium ${
                  isActive("/dashboard")
                    ? "text-[#212121] active-page"
                    : "text-[#A3A3A3]"
                }`}
              >
                <LayoutDashboard
                  className={`h-5 w-5 ${
                    isActive("/dashboard") ? "text-primary active" : ""
                  }`}
                />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Calendar */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Calendar"
                className={`flex items-center gap-3 px-8 py-7 sidebar-button-text hover-text-primary font-medium ${
                  isActive("/calendar")
                    ? "text-[#212121] active-page"
                    : "text-[#A3A3A3]"
                }`}
              >
                <Calendar
                  className={`h-5 w-5 ${
                    isActive("/calendar") ? "text-primary active" : ""
                  }`}
                />
                <span>Calendar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Faculty */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Faculty"
                className={`flex items-center gap-3 px-8 py-7 sidebar-button-text hover-text-primary font-medium ${
                  isActive("/faculty")
                    ? "text-[#212121] active-page"
                    : "text-[#A3A3A3]"
                }`}
              >
                <Users2
                  className={`h-5 w-5 ${
                    isActive("/faculty") ? "text-primary active" : ""
                  }`}
                />
                <span>Faculty</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Profile */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Profile"
                className={`flex items-center gap-3 px-8 py-7 sidebar-button-text hover-text-primary font-medium ${
                  isActive("/profile")
                    ? "text-[#212121] active-page"
                    : "text-[#A3A3A3]"
                }`}
              >
                <UserRound
                  className={`h-5 w-5 ${
                    isActive("/profile") ? "text-primary active" : ""
                  }`}
                />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* Footer */}
        <div className="mt-auto px-4 py-4">
          <SidebarMenuButton
            tooltip="Logout"
            className="flex items-center gap-3 w-full px-8 py-3 text-tertiary sidebar-button-text hover-bg-primary hover-text-primary font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </SidebarMenuButton>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
