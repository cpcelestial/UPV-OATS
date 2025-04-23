import { AppointmentCard, type Appointment } from "./appointment-card";

interface AppointmentListProps {
  appointments: Appointment[];
  emptyMessage: string;
  onReschedule?: (id: string) => void;
  onDecline?: (id: string) => void;
}

export function AppointmentList({
  appointments,
  emptyMessage,
  onReschedule,
  onDecline,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onReschedule={onReschedule}
          onDecline={onDecline}
        />
      ))}
    </div>
  );
}
