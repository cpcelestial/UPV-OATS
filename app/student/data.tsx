export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVisibility: boolean;
  studentNumber: string;
  college: string;
  degreeProgram: string;
  country: string;
  cityTown: string;
  description: string;
  avatarUrl: string;
  schedule: DaySchedule[];
}

export interface TimeSlot {
  start: string;
  end: string;
  subject?: string;
  room?: string;
  professor?: string;
  days: string[];
  color?: string;
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

export interface ClassSchedule {
  id: string;
  name: string;
  schedule: DaySchedule[];
}

export interface Appointment {
  id: string;
  purpose: string;
  class: string;
  section: string;
  facultyName: string;
  facultyEmail: string;
  date: Date;
  timeSlot: string;
  meetingType: "f2f" | "online";
  location?: string;
  details?: string;
  status: "approved" | "pending" | "cancelled" | "reschedule";
  participants?: { email: string; name?: string }[];
}
