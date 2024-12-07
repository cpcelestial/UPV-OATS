'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import type { Appointment } from './types/profile'

interface AppointmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointments: Appointment[]
}

export function AppointmentsDialog({ open, onOpenChange, appointments }: AppointmentsDialogProps) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredAppointments = appointments.filter(appointment => 
    appointment.with.name.toLowerCase().includes(search.toLowerCase()) ||
    appointment.with.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Appointments List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr,140px,140px] gap-4 p-4 bg-muted/50">
              <div>User name</div>
              <div className="text-right">Time</div>
              <div className="text-right">Date</div>
            </div>
            <div className="divide-y">
              {paginatedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="grid grid-cols-[1fr,140px,140px] gap-4 p-4 items-center"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={appointment.with.avatarUrl}
                      alt={appointment.with.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{appointment.with.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.with.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-right">{appointment.time}</div>
                  <div className="text-sm text-right">{appointment.date}</div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

