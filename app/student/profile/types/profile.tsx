export interface TimeSlot {
  start: string
  end: string
}

export interface DaySchedule {
  day: string
  enabled: boolean
  slots: TimeSlot[]
}

export interface Contact {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export interface Appointment {
  id: string
  status: 'scheduled' | 'cancelled'
  date: string
  time: string
  with: Contact
}

export interface StudentProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVisibility: 'course_participants' | 'private' | 'public'
  studentNumber: string
  college: string
  degreeProgram: string
  contactNumber?: string
  description?: string
  country: string
  timezone: string
  avatarUrl: string
  schedule: DaySchedule[]
  contacts: Contact[]
  appointments: Appointment[]
}

