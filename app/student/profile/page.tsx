'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfileDialog } from './profile-dialog'
import { ScheduleDialog } from './schedule-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import AppSidebar from './sidebar'
import NavBar from './top-navbar'
import type { StudentProfile } from './types/profile'
import { AppointmentsDialog } from './appointments-dialog'

// Sample data - replace with your actual data source
const initialProfile: StudentProfile = {
  id: '1',
  firstName: 'Juan',
  lastName: 'dela Cruz',
  email: 'jdelacruz@up.edu.ph',
  emailVisibility: 'course_participants',
  studentNumber: '2022-12345',
  college: 'Arts and Sciences',
  degreeProgram: 'B.S. in Computer Science',
  country: 'Philippines',
  timezone: 'Asia/Manila',
  contactNumber: '09123456789',
  description: '',
  avatarUrl: '/placeholder.svg',
  schedule: [
    {
      day: 'Monday',
      enabled: true,
      slots: [
        { start: '9:00 AM', end: '10:00 AM' },
        { start: '11:30 AM', end: '1:00 PM' }
      ]
    },
    {
      day: 'Tuesday',
      enabled: true,
      slots: [
        { start: '10:00 AM', end: '11:00 AM' }
      ]
    },
    {
      day: 'Wednesday',
      enabled: true,
      slots: [
        { start: '10:00 AM', end: '11:00 AM' }
      ]
    },
    {
      day: 'Thursday',
      enabled: true,
      slots: [
        { start: '10:00 AM', end: '11:00 AM' }
      ]
    },
    {
      day: 'Friday',
      enabled: true,
      slots: [
        { start: '10:00 AM', end: '11:00 AM' }
      ]
    },
    {
      day: 'Saturday',
      enabled: false,
      slots: []
    }
  ],
  contacts: [
    {
      id: '1',
      name: 'John Doe',
      email: 'jdoe@up.edu.ph',
      avatarUrl: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jsmith@up.edu.ph',
      avatarUrl: '/placeholder.svg'
    }
  ],
  appointments: [
    {
      id: '1',
      status: 'scheduled',
      date: '2024-01-15',
      time: '10:00 AM',
      with: {
        id: '1',
        name: 'John Doe',
        email: 'jdoe@up.edu.ph',
        avatarUrl: '/placeholder.svg'
      }
    },
    // Add more appointments as needed
  ]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile)
  const [selectedMonth, setSelectedMonth] = useState('October')
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isAppointmentsDialogOpen, setIsAppointmentsDialogOpen] = useState(false)
  const router = useRouter()

  const handleUpdateProfile = (updatedProfile: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }))
  }

  const handleUpdateSchedule = (newSchedule: typeof profile.schedule) => {
    handleUpdateProfile({ schedule: newSchedule })
  }

  const handleAddAppointment = (contactId: string) => {
    router.push(`/student/calendar/add-app?contactId=${contactId}`)
  }

  const totalAppointments = profile.appointments?.length ?? 0
  const cancelledAppointments = profile.appointments?.filter(a => a.status === 'cancelled').length ?? 0

  return (
    <div className="flex h-screen">
      <div className="w-64">
        <AppSidebar />
      </div>

      <div className="flex flex-col flex-grow">
        <NavBar />

        <main className="flex-grow bg-white shadow-lg px-6 py-6 overflow-auto">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3 space-y-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.avatarUrl}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
                      <div className="text-sm text-muted-foreground">
                        <div>Email: {profile.email}</div>
                        <div>College: {profile.college}</div>
                        <div>Degree program: {profile.degreeProgram}</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsProfileDialogOpen(true)}
                    >
                      Update profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Personal Schedule</h2>
                    <Button 
                      variant="outline"
                      onClick={() => setIsScheduleDialogOpen(true)}
                    >
                      Update schedule
                    </Button>
                  </div>
                  <div className="space-y-6">
                    {profile.schedule?.filter(day => day.enabled).map((day) => (
                      <div key={day.day} className="space-y-2">
                        <h3 className="font-medium">{day.day}</h3>
                        <div className="flex flex-wrap gap-2">
                          {day.slots?.map((slot, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex px-3 py-1 text-sm rounded-full
                                ${idx % 2 === 0 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : 'bg-green-100 text-green-800'
                                }`}
                            >
                              {slot.start} - {slot.end}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Frequent Contacts</h2>
                  <div className="space-y-4">
                    {profile.contacts?.map((contact) => (
                      <Dialog key={contact.id}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="w-full justify-start">
                            <img
                              src={contact.avatarUrl}
                              alt={contact.name}
                              className="h-10 w-10 rounded-full mr-3"
                            />
                            <div className="text-left">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-muted-foreground">{contact.email}</div>
                            </div>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{contact.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img
                              src={contact.avatarUrl}
                              alt={contact.name}
                              className="h-24 w-24 rounded-full mx-auto"
                            />
                            <div className="text-center">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-muted-foreground">{contact.email}</div>
                            </div>
                            <Button 
                              className="w-full"
                              onClick={() => handleAddAppointment(contact.id)}
                            >
                              Add Appointment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Appointment Status</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Appointments</div>
                      <div className="text-4xl font-bold text-[#2F5233]">{totalAppointments}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cancelled Appointments</div>
                      <div className="text-4xl font-bold text-red-600">{cancelledAppointments}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsAppointmentsDialogOpen(true)}
                    >
                      See all appointments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <ProfileDialog
            open={isProfileDialogOpen}
            onOpenChange={setIsProfileDialogOpen}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />

          <ScheduleDialog
            open={isScheduleDialogOpen}
            onOpenChange={setIsScheduleDialogOpen}
            schedule={profile.schedule}
            onUpdateSchedule={handleUpdateSchedule}
          />
          <AppointmentsDialog
            open={isAppointmentsDialogOpen}
            onOpenChange={setIsAppointmentsDialogOpen}
            appointments={profile.appointments}
          />
        </main>
      </div>
    </div>
  )
}

