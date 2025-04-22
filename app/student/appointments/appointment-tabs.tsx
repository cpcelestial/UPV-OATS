"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentList } from "./appointment-list";
import type { Appointment } from "./appointment-card";

interface AppointmentsTabsProps {
  upcomingAppointments: Appointment[];
  pendingAppointments: Appointment[];
  cancelledAppointments?: Appointment[];
  rescheduleAppointments: Appointment[];
  loading: boolean;
  onReschedule: (id: string) => void;
  onDecline: (id: string) => void;
}

export function AppointmentsTabs({
  upcomingAppointments,
  pendingAppointments,
  cancelledAppointments,
  rescheduleAppointments,
  loading,
  onReschedule,
  onDecline,
}: AppointmentsTabsProps) {
  const [activeTab, setActiveTab] = React.useState("pending");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming" className="mr-2 px-6">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="pending" className="mr-2 px-6">
          Pending
        </TabsTrigger>
        {cancelledAppointments != undefined && (
          <TabsTrigger value="declined" className="mr-2 px-6">
            Declined
          </TabsTrigger>
        )}
        {rescheduleAppointments.length > 0 && (
          <TabsTrigger
            value="reschedule"
            className="px-6 bg-red-100 text-red-500"
          >
            For Reschedule
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="upcoming" className="mt-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <p>Loading appointments...</p>
          </div>
        ) : (
          <AppointmentList
            appointments={upcomingAppointments}
            emptyMessage="No upcoming appointments found"
            onReschedule={onReschedule}
            onDecline={onDecline}
          />
        )}
      </TabsContent>

      <TabsContent value="pending" className="mt-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <p>Loading appointments...</p>
          </div>
        ) : (
          <AppointmentList
            appointments={pendingAppointments}
            emptyMessage="No pending appointments found"
            onReschedule={onReschedule}
            onDecline={onDecline}
          />
        )}
      </TabsContent>

      {cancelledAppointments != undefined && (
        <TabsContent value="declined" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList
              appointments={cancelledAppointments}
              emptyMessage="No declined appointments found"
            />
          )}
        </TabsContent>
      )}

      {rescheduleAppointments.length > 0 && (
        <TabsContent value="reschedule" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList
              appointments={rescheduleAppointments}
              emptyMessage="No appointments for reschedule found"
              onDecline={onDecline}
            />
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
