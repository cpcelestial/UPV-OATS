export interface FacultyMember {
  id: string
  name: string
  email: string
  avatarUrl: string
  department?: string
  college?: string
  course?: string
  availability?: {
    day: string
    slots: Array<{
      start: string
      end: string
    }>
  }[]
}

