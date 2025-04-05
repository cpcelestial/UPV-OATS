import type { Metadata } from "next"
import IntegratedAppointmentTabs from "./integrated-appointment-tabs"

export const metadata: Metadata = {
  title: "Appointments",
  description: "Manage your appointments",
}

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto py-6">

      <IntegratedAppointmentTabs />
    </div>
  )
}

