export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVisibility: boolean
  studentNumber: string
  college: string
  degreeProgram: string
  country: string
  cityTown: string
  description: string
  avatarUrl: string
  schedule: DaySchedule[]
}

export interface DaySchedule {
  day: string
  slots: TimeSlot[]
}

export interface TimeSlot {
  start: string
  end: string
}
