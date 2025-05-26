"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentList } from "./appointment-list";
import type { Appointment } from "../../data";

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
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming" className="px-6">
          Upcoming{" "}
          <span className="ml-2 opacity-50">
            [ {upcomingAppointments.length} ]
          </span>
        </TabsTrigger>
        <TabsTrigger value="pending" className="ml-2 px-6">
          Pending{" "}
          <span className="ml-2 opacity-50">
            [ {pendingAppointments.length} ]
          </span>
        </TabsTrigger>
        {cancelledAppointments != undefined && (
          <TabsTrigger value="declined" className="ml-2 px-6">
            Cancelled{" "}
            <span className="ml-2 opacity-50">
              [ {cancelledAppointments.length} ]
            </span>
          </TabsTrigger>
        )}
        {rescheduleAppointments.length > 0 && (
          <TabsTrigger
            value="reschedule"
            className="ml-2 px-6 bg-red-100 text-red-500"
          >
            For Reschedule{" "}
            <span className="ml-2 opacity-50">
              [ {rescheduleAppointments.length} ]
            </span>
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
