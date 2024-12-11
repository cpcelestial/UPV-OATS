"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Calendar, LayoutDashboard, Users2, UserRound, LogOut } from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, route: "/faculty/dashboard" },
    { name: "Calendar", icon: Calendar, route: "/faculty/calendar" },
    { name: "Students", icon: Users2, route: "/faculty/students" },
    { name: "Profile", icon: UserRound, route: "/faculty/profile" },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="h-full flex flex-col justify-between w-56 bg-[#F7F7F7] border-[#F7F7F7]">
        <div>
          <SidebarHeader className="p-4">
            <div className="flex flex-col items-center gap-2 px-6 py-3">
              <Image
                src="/logo.png"
                alt="OATS Logo"
                width={80}
                height={80}
                className="object-contain"
              />
              <span className="header-logo text-sm">
                <span className="text-primary">UPV</span>{" "}
                <span className="text-secondary">OATS</span>
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
                    className={`flex items-center w-full px-6 py-8 text-sm duration-200 relative
                      ${isActive(item.route)
                        ? "active-sidebar-item"
                        : "text-[#A3A3A3] transition duration-500 hover:text-[#212121]"
                      }`
                    }
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
            className="flex items-center gap-2 w-full px-4 py-8 text-sm text-tertiary sidebar-button-text hover:text-[#7c0a02] font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </SidebarMenuButton>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}