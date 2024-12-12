"use client"

import * as React from "react"
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationCard } from "./notification-card"
import Link from "next/link"

interface Notification {
  id: string
  user: {
    name: string
    avatar: string
  }
  action: string
  timestamp: Date
  isRead: boolean
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg",
    },
    action: "has scheduled an appointment with you.",
    timestamp: new Date(),
    isRead: false,
  },
  {
    id: "2",
    user: {
      name: "Liam Emmanuel Aguilar",
      avatar: "/placeholder.svg",
    },
    action: "has scheduled an appointment with you.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: "3",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg",
    },
    action: "has cancelled an appointment with you.",
    timestamp: new Date(),
    isRead: true,
  },
]

export function NotificationsDropdown() {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {SAMPLE_NOTIFICATIONS.some(n => !n.isRead) && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <p className="text-xs text-muted-foreground">
              Lorem ipsum dolor your appointments
            </p>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {SAMPLE_NOTIFICATIONS.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onShowDetails={() => setOpen(false)}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-2">
          <Link href="/notifications" className="block">
            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              See all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

