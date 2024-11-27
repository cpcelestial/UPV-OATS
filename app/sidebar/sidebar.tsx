"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
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
import { Calendar, LayoutDashboard, Users2, UserRound, LogOut } from 'lucide-react';

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="h-full flex flex-col justify-between w-64">
        <SidebarHeader className="pb-8">
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
            {[
              { name: "Dashboard", icon: LayoutDashboard, route: "/dashboard" },
              { name: "Calendar", icon: Calendar, route: "/calendar" },
              { name: "Faculty", icon: Users2, route: "/faculty" },
              { name: "Profile", icon: UserRound, route: "/profile" },
            ].map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  tooltip={item.name}
                  className={`flex items-center gap-2 px-8 py-8 text-sm sidebar-button-text hover:text-primary font-medium ${
                    isActive(item.route)
                      ? "text-[#212121] active-page"
                      : "text-[#A3A3A3]"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${
                      isActive(item.route) ? "text-primary active" : ""
                    }`}
                  />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <div className="mt-auto px-2 py-2">
          <SidebarMenuButton
            tooltip="Logout"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-tertiary sidebar-button-text hover:bg-primary hover:text-primary font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </SidebarMenuButton>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}

