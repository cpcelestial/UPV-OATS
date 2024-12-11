"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from 'lucide-react'
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from 'date-fns'
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

import { db } from "../../../firebase-config" // Firebase initialization file
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const formSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  department: z.string().min(1, "Department is required"),
  facultyName: z.string().min(1, "Faculty name is required"),
  course: z.string().min(1, "Course is required"),
  section: z.string().min(1, "Section is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  meetingType: z.string().min(1, "Meeting type is required"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
  status: z.string().optional().default("pending") 
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
      title: "",
      department: "",
      facultyName: "",
      course: "",
      section: "",
      date: undefined,
      startTime: "",
      endTime: "",
      meetingType: "Online meeting",
      location: "",
      notes: "",
      status: "pending" 
    },
  })

  React.useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const q = query(collection(db, "Users"), where("role", "==", "faculty"))
        const querySnapshot = await getDocs(q)
        const facultyData = querySnapshot.docs.map(doc => ({
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
        createdAt: serverTimestamp()
      }
  
      const docRef = await addDoc(collection(db, "appointments"), appointmentData)
  
      console.log("Appointment added with ID: ", docRef.id)
      setFormChanged(false)
      router.push('/student/calendar')
    } catch (error) {
      console.error("Error adding appointment: ", error)
    }
  }

  const handleBackToCalendar = () => {
    if (formChanged) {
      setShowDialog(true)
    } else {
      router.push('/student/calendar')
    }
  }

  const handleConfirmBack = () => {
    setShowDialog(false)
    router.push('/student/calendar')
  }
  console.log(facultyList);
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Add Appointment</h2>
            <p className="text-sm text-muted-foreground">Please provide all the required information</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBackToCalendar}>
          Back to Calendar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Title</FormLabel>
                <FormControl>
                  <Input placeholder="Insert meeting title here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Degree name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="math">Applied Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="stats">Statistics</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
<FormField
  control={form.control}
  name="facultyName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Faculty Name</FormLabel>
      <FormControl>
        <Select 
          onValueChange={field.onChange} 
          value={field.value}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select faculty" />
          </SelectTrigger>
          <SelectContent>
            {loading ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : facultyList.length === 0 ? (
              <SelectItem value="no-faculty" disabled>No faculty found</SelectItem>
            ) : (
              facultyList
                .filter(faculty => faculty.id && faculty.name) // Filter out invalid entries
                .map((faculty) => (
                  <SelectItem 
                    key={faculty.id} 
                    value={faculty.name}
                  >
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter section..." {...field} />
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
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
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
            <div className="space-y-2">
              <FormLabel>Time Schedule</FormLabel>
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="text-muted-foreground">to</span>
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="meetingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Meeting</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Online meeting, in-person, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Insert location here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Insert meeting notes here..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button type="submit" className="bg-[#35563F] hover:bg-[#2A4A33]">
              Add appointment
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
