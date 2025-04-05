"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function AppointmentTabs() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="requested">Date Requested</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Upcoming Appointments</h3>
            <p className="text-sm text-muted-foreground">View your confirmed upcoming appointments.</p>
            {/* Content for upcoming appointments would go here */}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
        </TabsContent>
        <TabsContent value="requested" className="mt-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Date Requested</h3>
            <p className="text-sm text-muted-foreground">View appointments with requested dates.</p>
            {/* Content for date requested appointments would go here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

