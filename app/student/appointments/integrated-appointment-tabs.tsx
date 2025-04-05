"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentList } from "./appointment-list"
import { db } from "@/app/firebase-config"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { getAuth } from "firebase/auth"

export default function IntegratedAppointmentTabs() {
  const [upcomingAppointments, setUpcomingAppointments] = React.useState([])
  const [pendingAppointments, setPendingAppointments] = React.useState([])
  const [declinedAppointments, setDeclinedAppointments] = React.useState([])
  const [rescheduleAppointments, setRescheduleAppointments] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("pending")

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (!user) {
          console.error("No user logged in")
          setLoading(false)
          return
        }

        // Query for all user appointments
        const appointmentsRef = collection(db, "appointments")
        const userAppointmentsQuery = query(appointmentsRef, where("userId", "==", user.uid), orderBy("date", "asc"))

        const querySnapshot = await getDocs(userAppointmentsQuery)

        const upcoming = []
        const pending = []
        const declined = []
        const reschedule = []

        querySnapshot.forEach((doc) => {
          const data = {
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(), // Convert Firestore timestamp to Date
          }

          if (data.status === "approved") {
            upcoming.push(data)
          } else if (data.status === "pending") {
            pending.push(data)
          } else if (data.status === "reschedule") {
            reschedule.push(data)
          } else {
            
            declined.push(data)
          }
        })

        setUpcomingAppointments(upcoming)
        setPendingAppointments(pending)
        setDeclinedAppointments(declined)
        setRescheduleAppointments(reschedule)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${rescheduleAppointments.length > 0 ? "grid-cols-4" : "grid-cols-3"}`}>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          {rescheduleAppointments.length > 0 && <TabsTrigger value="reschedule">For Reschedule</TabsTrigger>}
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList appointments={upcomingAppointments} emptyMessage="No upcoming appointments found." />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {activeTab === "pending" && (
            <>
              {loading ? (
                <div className="flex justify-center py-10">
                  <p>Loading appointments...</p>
                </div>
              ) : (
                <>
                  {pendingAppointments.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Pending Appointments</h3>
                      <AppointmentList
                        appointments={pendingAppointments}
                        emptyMessage="No pending appointments found."
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="declined" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentList appointments={declinedAppointments} emptyMessage="No declined appointments found." />
          )}
        </TabsContent>

        {rescheduleAppointments.length > 0 && (
          <TabsContent value="reschedule" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <p>Loading appointments...</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">Appointments For Reschedule</h3>
                <AppointmentList
                  appointments={rescheduleAppointments}
                  emptyMessage="No appointments for reschedule found."
                />
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

