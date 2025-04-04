"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Plus, X } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

import { db } from "@/app/firebase-config" // Firebase initialization file
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"

function generateTimeSlots() {
  const slots = []
  for (let hour = 7; hour <= 17; hour++) {
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12
    const period = hour < 12 ? "AM" : "PM"

    // Add slot for current hour to half hour (e.g., 7:00 - 7:30)
    if (hour !== 17) {
      // Don't add 5:00 - 5:30 PM
      slots.push(`${hourFormatted}:00 ${period} - ${hourFormatted}:30 ${period}`)
    }

    // Add slot for half hour to next hour (e.g., 7:30 - 8:00)
    if (hour !== 17) {
      // Don't add 5:30 - 6:00 PM
      const nextHour = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12
      const nextPeriod = hour + 1 < 12 ? "AM" : "PM"
      slots.push(`${hourFormatted}:30 ${period} - ${nextHour}:00 ${nextPeriod}`)
    }
  }
  return slots
}

// Sample data for classes and sections
const classOptions = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Psychology",
]

const sectionOptions = ["A", "B", "C", "D", "E", "F"]

const formSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  department: z.string().min(1, "Department is required"),
  facultyName: z.string().min(1, "Faculty name is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  timeSlot: z.string().min(1, "Time slot is required"),
  meetingType: z.enum(["f2f", "online"]).default("f2f"),
  details: z.string().optional(),
  participants: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        name: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  status: z.string().optional().default("pending"),
})

export function AddAppointmentForm() {
  const router = useRouter()
  const [showDialog, setShowDialog] = React.useState(false)
  const [formChanged, setFormChanged] = React.useState(false)

  const [facultyList, setFacultyList] = React.useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = React.useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: "",
      class: "",
      section: "",
      department: "",
      facultyName: "",
      date: undefined,
      timeSlot: "",
      meetingType: "f2f", // Default to F2F
      details: "",
      participants: [],
      status: "pending",
    },
  })

  React.useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const q = query(collection(db, "Users"), where("role", "==", "faculty"))
        const querySnapshot = await getDocs(q)
        const facultyData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }))
        setFacultyList(facultyData)
      } catch (error) {
        console.error("Error fetching faculty:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFaculty()
  }, [])

  React.useEffect(() => {
    const subscription = form.watch(() => setFormChanged(true))
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        console.error("No user logged in")
        return
      }

      const appointmentData = {
        ...values,
        userId: user.uid,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "appointments"), appointmentData)

      console.log("Appointment added with ID: ", docRef.id)
      setFormChanged(false)
      router.push("/student/calendar")
    } catch (error) {
      console.error("Error adding appointment: ", error)
    }
  }

  const handleBackToCalendar = () => {
    if (formChanged) {
      setShowDialog(true)
    } else {
      router.push("/student/calendar")
    }
  }

  const handleConfirmBack = () => {
    setShowDialog(false)
    router.push("/student/calendar")
  }
  console.log(facultyList)
  return (
    <div className="mb-4 p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          <div>
            <h2 className="text-lg font-semibold">Schedule Appointment</h2>
            <p className="text-sm text-muted-foreground">Please provide all the required information</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBackToCalendar}>
          Back to Calendar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <FormLabel className="block w-full mb-2">Purpose</FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem className="w-[120px]">
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem className="w-[140px]">
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Insert purpose here..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="facultyName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Faculty Name</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : facultyList.length === 0 ? (
                          <SelectItem value="no-faculty" disabled>
                            No faculty found
                          </SelectItem>
                        ) : (
                          facultyList
                            .filter((faculty) => faculty.id && faculty.name) // Filter out invalid entries
                            .map((faculty) => (
                              <SelectItem key={faculty.id} value={faculty.name}>
                                {faculty.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Type of Meeting</FormLabel>
                  <FormControl>
                    <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="f2f">Face-to-Face</TabsTrigger>
                        <TabsTrigger value="online">Online</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeSlots().map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormLabel className="block w-full">For Group Appointments</FormLabel>
            <div className="flex flex-col gap-2">
              {form.watch("participants")?.length > 0 && (
                <div className="flex flex-wrap gap-2 my-2">
                  {form.watch("participants").map((participant, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1.5">
                      {participant.email}
                      <button
                        type="button"
                        onClick={() => {
                          const currentParticipants = form.getValues("participants") || []
                          form.setValue(
                            "participants",
                            currentParticipants.filter((_, i) => i !== index),
                          )
                        }}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  id="participant-email"
                  placeholder="Enter participant email"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const input = e.currentTarget
                      const email = input.value.trim()

                      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        const currentParticipants = form.getValues("participants") || []
                        if (!currentParticipants.some((p) => p.email === email)) {
                          form.setValue("participants", [...currentParticipants, { email }])
                          input.value = ""
                        }
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("participant-email") as HTMLInputElement
                    const email = input.value.trim()

                    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      const currentParticipants = form.getValues("participants") || []
                      if (!currentParticipants.some((p) => p.email === email)) {
                        form.setValue("participants", [...currentParticipants, { email }])
                        input.value = ""
                      }
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Press Enter or click Add to add a participant</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Textarea placeholder="Insert meeting notes here..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#2F5233] hover:bg-[#2F5233]/90">
              <Plus className="h-4 w-4" />
              Add Appointment
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
            <AlertDialogDescription>
              All data entered will not be saved. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBack} className="bg-[#35563F] hover:bg-[#2A4A33] text-white">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AddAppointmentForm