import { Button } from '@/components/ui/button'
import type { Appointment } from './types/profile'

interface AppointmentsSummaryProps {
  appointments: Appointment[]
  onViewAll: () => void
}

export function AppointmentsSummary({ appointments, onViewAll }: AppointmentsSummaryProps) {
  const totalAppointments = appointments.length
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Appointment Status</h2>
      <div className="grid gap-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Total Appointments</div>
          <div className="text-4xl font-bold text-primary">{totalAppointments}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Cancelled Appointments</div>
          <div className="text-4xl font-bold text-destructive">{cancelledAppointments}</div>
        </div>
        <Button onClick={onViewAll} variant="outline" className="w-full">
          See all appointments
        </Button>
      </div>
    </div>
  )
}

