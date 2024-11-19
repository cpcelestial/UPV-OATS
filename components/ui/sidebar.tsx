import React from "react";
import "styles/global.css";
import Image from "next/image";
import {LayoutDashboard, CalendarDays, LogOut} from "lucide-react";
import { UsersIcon, UserCircleIcon} from "@heroicons/react/24/outline";




export default function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-gray-100 border-r">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 bg-primary text-white">
        <Image src="/logo.png" alt="OATS Logo" width={40} height={40} />
        <h1 className="ml-2 font-black text-lg">
          <span className="text-primary">UPV</span>
          <span className="text-secondary">OATS</span>
        </h1>
      </div>

      {/* Menu Items */}
      <ul className="flex-grow space-y-2 px-4 mt-4 text-gray-800">
        <li className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
          <LayoutDashboard className="h-5 w-5 text-gray-600" />
          <a href="#dashboard" className="font-medium">Dashboard</a>
        </li>
        <li className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
          <CalendarDays className="h-5 w-5 text-gray-600" />
          <a href="#calendar" className="font-medium">Calendar</a>
        </li>
        <li className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
          <UsersIcon className="h-5 w-5 text-gray-600" />
          <a href="#faculty" className="font-medium">Faculty</a>
        </li>
        <li className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
          <UserCircleIcon className="h-5 w-5 text-gray-600" />
          <a href="#profile" className="font-medium">Profile</a>
        </li>
      </ul>

      {/* Logout Section */}
      <div className="px-4 py-4">
        <button className="flex items-center gap-2 text-red-600 hover:text-red-800">
          <LogOut className="h-5 w-5" />
          <a href="#logout" className="font-medium">Logout</a>
        </button>
      </div>
    </div>
  );
}
