"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex flex-col h-screen w-64 bg-gray-800 text-white">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-8">
        <Image
          src="/logo-image-1.png"
          alt="OATS Logo"
          width={50}
          height={50}
          className="mr-4"
        />
        <h1 className="text-2xl font-bold">
          <span className="text-yellow-500">UPV</span>
          <span className="text-red-600"> OATS</span>
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col space-y-2 px-4">
        <Link
          href="#dashboard"
          className="flex items-center space-x-4 rounded-lg px-4 py-3 transition duration-300 hover:bg-gray-700"
        >
          <span className="material-icons">dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link
          href="#calendar"
          className="flex items-center space-x-4 rounded-lg px-4 py-3 transition duration-300 hover:bg-gray-700"
        >
          <span className="material-icons">calendar_today</span>
          <span>Calendar</span>
        </Link>
        <Link
          href="#faculty"
          className="flex items-center space-x-4 rounded-lg px-4 py-3 transition duration-300 hover:bg-gray-700"
        >
          <span className="material-icons">groups</span>
          <span>Faculty</span>
        </Link>
        <Link
          href="#profile"
          className="flex items-center space-x-4 rounded-lg px-4 py-3 transition duration-300 hover:bg-gray-700"
        >
          <span className="material-icons">account_circle</span>
          <span>Profile</span>
        </Link>
      </nav>

      {/* Logout Section */}
      <div className="mt-auto px-4 py-6">
        <Link
          href="#logout"
          className="flex items-center space-x-4 rounded-lg px-4 py-3 transition duration-300 hover:bg-red-600"
        >
          <span className="material-icons">logout</span>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
}
