"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/app/firebase-config";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { saveScheduleForUser } from "./autoslots";

const formSchema = z.object({
  purpose: z.string().min(1, "Required"),
  class: z.string().min(1, "Required"),
  section: z.string().min(1, "Required"),
  department: z.string().optional().default(""),
  facultyName: z.string().min(1, "Required"),
  facultyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  date: z.date({
    required_error: "Required",
  }),
  timeSlot: z.string().min(1, "Required"),
  meetingType: z.enum(["f2f", "online"]).default("f2f"),
  details: z.string().optional().default(""),
  participants: z
    .array(z.string().email("Invalid email"))
    .optional()
    .default([]),
  status: z.string().optional().default("pending"),
});

export function AddAppointmentForm() {
  const [showDialog, setShowDialog] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [facultyList, setFacultyList] = useState<
    { id: string; name: string }[]
  >([]);
  const [subjectOptions, setSubjectOptions] = useState<
    {
      subject: string;
      id: string;
      sections: string[];
      prof: string[];
      sub_id: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedFIC, setSelectedFIC] = useState("");
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [facultySections, setFacultySections] = useState<
    { faculty: string; sections: string[]; email: string }[]
  >([]);
  const [students, setStudents] = useState<{ name: string; email: string }[]>(
    []
  );
  const [selectedId, setSelectedId] = useState("");
  const [facultyNameToIdMap, setFacultyNameToIdMap] = useState(new Map());
  const [datecheck, setDateCheck] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<string>>(
    []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: "",
      class: "",
      section: "",
      department: "",
      facultyName: "",
      facultyEmail: "",
      date: undefined,
      timeSlot: "",
      meetingType: "f2f",
      details: "",
      participants: [],
      status: "pending",
    },
  });

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedId || !datecheck) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        const docRef = doc(db, "timeSlots", selectedId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data()[datecheck]) {
          form.setValue("timeSlot", "");
          const timeSlotData = docSnap.data()[datecheck];

          if (Array.isArray(timeSlotData)) {
            const availableSlots = timeSlotData
              .filter(
                (slot: { available?: boolean; booked?: boolean }) =>
                  slot.available === true && !slot.booked
              )
              .map((slot: { time: string }) => slot.time);
            setAvailableTimeSlots(availableSlots);
          } else {
            console.warn("Unexpected time slot data format:", timeSlotData);
            setAvailableTimeSlots([]);
          }
        } else {
          // No time slots found for the selected date and faculty
          console.log(
            "No time slots found, generating new schedule for:",
            selectedId,
            datecheck
          );
          await saveScheduleForUser(new Date(datecheck), selectedId);

          // Fetch the newly created schedule
          const newDocSnap = await getDoc(docRef);
          if (newDocSnap.exists() && newDocSnap.data()[datecheck]) {
            const timeSlotData = newDocSnap.data()[datecheck];
            const availableSlots = timeSlotData
              .filter(
                (slot: { available?: boolean; booked?: boolean }) =>
                  slot.available === true && !slot.booked
              )
              .map((slot: { time: string }) => slot.time);
            setAvailableTimeSlots(availableSlots);
          } else {
            setAvailableTimeSlots([]);
            console.warn("Failed to generate or fetch new time slots.");
          }
        }
      } catch (error) {
        console.error("Error fetching or generating time slots:", error);
        setAvailableTimeSlots([]);
      }
      console.log("Available time slots:", availableTimeSlots);
    };

    fetchTimeSlots();
  }, [selectedId, datecheck, form]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const q = query(
          collection(db, "Users"),
          where("role", "==", "faculty")
        );
        const querySnapshot = await getDocs(q);
        const facultyData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().firstName + " " + doc.data().lastName,
        }));
        setFacultyList(facultyData);

        const idMap = new Map();

        facultyData.forEach((faculty) => {
          idMap.set(faculty.name, faculty.id);
        });
        setFacultyNameToIdMap(idMap);

        console.log("Faculty loaded:", facultyData);
      } catch (error) {
        console.error("Error fetching faculty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  useEffect(() => {
    const fetchFacultySections = async () => {
      try {
        const q = query(collection(db, "Faculty_in_charge"));
        const querySnapshot = await getDocs(q);
        const facultySectionsData = querySnapshot.docs.map(
          (doc) =>
            doc.data() as { faculty: string; sections: string[]; email: string }
        );
        setFacultySections(facultySectionsData);
        console.log("Faculty sections loaded:", facultySectionsData);
      } catch (error) {
        console.error("Error fetching faculty sections:", error);
      }
    };
    fetchFacultySections();
  }, []);

  useEffect(() => {
    const selectedFacultyEmail =
      facultySections.find((fs) => fs.sections.includes(selectedFIC))?.email ||
      "";
    form.setValue("facultyEmail", selectedFacultyEmail);
  }, [selectedFIC, facultySections, form]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, "students"));
        const querySnapshot = await getDocs(q);
        const studentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { name: string; email: string }),
        }));
        setStudents(studentsData);
        console.log("Students data:", studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const q = query(collection(db, "Subjects"));
        const querySnapshot = await getDocs(q);
        const subjectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as {
            sections: string[];
            prof: string[];
            subject: string;
            sub_id: string;
          }),
        }));

        setSubjectOptions(subjectsData);
        console.log("Subjects loaded:", subjectsData);
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    const subscription = form.watch(() => setFormChanged(true));
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (selectedSubject) {
      const subjectObj = subjectOptions.find(
        (subject) => subject.subject === selectedSubject
      );

      if (subjectObj && subjectObj.sections) {
        setAvailableSections(subjectObj.sections);
      } else {
        setAvailableSections([]);
      }
    } else {
      setAvailableSections([]);
    }

    form.setValue("section", "");
  }, [selectedSubject, subjectOptions, form]);

  useEffect(() => {
    const singleFaculty =
      facultySections.filter((fs) => fs.sections.includes(selectedFIC))[0]
        ?.faculty || "";
    form.setValue("facultyName", singleFaculty);

    if (singleFaculty && facultyNameToIdMap.has(singleFaculty)) {
      const facultyId = facultyNameToIdMap.get(singleFaculty);
      setSelectedId(facultyId);
      console.log("Faculty ID:", facultyId);
    }
  }, [selectedFIC, facultySections, form, facultyNameToIdMap]);

  const dynamicSearch = (search: string) => {
    if (!search) return [];
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submission started");
    console.log("Form values:", values);

    setSubmitting(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      console.log("Current user:", user);

      if (!user) {
        console.error("No user logged in");
        alert("Please log in to schedule an appointment");
        return;
      }

      // Prepare the data for submission
      const appointmentData = {
        purpose: values.purpose,
        class: values.class,
        section: values.section,
        department: values.department || "",
        facultyName: values.facultyName,
        facultyEmail: values.facultyEmail || "",
        facultyId:
          facultyList.find((f) => f.name === values.facultyName)?.id ||
          facultySections.find((fs) => fs.faculty === values.facultyName)
            ?.faculty ||
          "",
        date: values.date,
        timeSlot: values.timeSlot,
        meetingType: values.meetingType,
        details: values.details || "",
        participants: values.participants || [],
        status: values.status || "pending",
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      };

      console.log("Appointment data to be saved:", appointmentData);

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, "appointments"),
        appointmentData
      );

      console.log("Appointment successfully added with ID:", docRef.id);

      // Show success message
      alert("Appointment scheduled successfully!");

      // Reset form state
      setFormChanged(false);

      // Navigate back
      window.history.back();
    } catch (error) {
      console.error("Detailed error adding appointment:", error);

      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Error scheduling appointment: ${error.message}`);
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (formChanged) {
      setShowDialog(true);
    } else {
      window.history.back();
    }
  };

  const handleConfirmBack = () => {
    setShowDialog(false);
    window.history.back();
  };

  const addParticipantByEmail = (email: string) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const currentParticipants = form.getValues("participants") || [];
      if (!currentParticipants.includes(email)) {
        form.setValue("participants", [...currentParticipants, email]);
        return true;
      }
    }
    return false;
  };

  return (
    <div className="mb-4 p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-7 w-7" />
          <div>
            <h2 className="text-lg font-semibold">Schedule Appointment</h2>
            <p className="text-sm text-muted-foreground">
              Please provide all the required information
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FormLabel
              className={cn(
                "block w-full mb-2",
                (form.formState.errors.class ||
                  form.formState.errors.section ||
                  form.formState.errors.purpose) &&
                  "text-destructive"
              )}
            >
              Purpose
            </FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem className="flex-shrink-0 w-auto">
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          setSelectedSubject(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-auto">
                          <div className="flex items-center justify-between w-full">
                            <SelectValue placeholder="Class" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : subjectOptions.length === 0 ? (
                            <SelectItem value="no-subjects" disabled>
                              No subjects found
                            </SelectItem>
                          ) : (
                            subjectOptions.map((subject) => (
                              <SelectItem
                                key={`subject-${subject.id}-${subject.sub_id}`}
                                value={subject.subject}
                              >
                                {subject.subject}
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
              {selectedSubject && selectedSubject !== "Other" && (
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem className="flex-shrink-0 w-auto">
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            setSelectedFIC(value);
                            field.onChange(value);
                            console.log("Selected section:", selectedFIC);
                          }}
                          value={field.value || ""}
                        >
                          <SelectTrigger className="w-auto">
                            <div className="flex items-center justify-between w-full">
                              <SelectValue placeholder="Section" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : selectedSubject.length === 0 ? (
                              <SelectItem value="no-sections" disabled>
                                Please choose a class
                              </SelectItem>
                            ) : (
                              availableSections.map((section, index) => (
                                <SelectItem
                                  key={`section-${selectedSubject}-${section}-${index}`}
                                  value={selectedSubject + "_" + section}
                                >
                                  {section}
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
              )}
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
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);

                        if (selectedSubject === "Other") {
                          const facultyId = facultyNameToIdMap.get(value) || "";
                          setSelectedId(facultyId);
                          console.log(
                            `Manual selection - Faculty: ${value}, ID: ${facultyId}`
                          );
                        }
                      }}
                      value={field.value}
                      disabled={selectedSubject !== "Other"}
                    >
                      <SelectTrigger>
                        <div className="flex items-center justify-between w-full">
                          <SelectValue placeholder="Select faculty" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : selectedSubject === "Other" ? (
                          facultyList
                            .filter((value) => value.id && value.name)
                            .map((faculty) => (
                              <SelectItem
                                key={`faculty-other-${faculty.id}`}
                                value={faculty.name}
                              >
                                {faculty.name}
                              </SelectItem>
                            ))
                        ) : (
                          facultySections
                            .filter((fs) => fs.sections.includes(selectedFIC))
                            .map((fs, index) => (
                              <SelectItem
                                key={`faculty-section-${fs.faculty}-${index}`}
                                value={fs.faculty}
                              >
                                {fs.faculty}
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
                    <Tabs
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="f2f">Face-to-Face</TabsTrigger>
                        <TabsTrigger value="online">Online</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage className="text-xs" />
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
                        onSelect={(value) => {
                          field.onChange(value);
                          setSelectedDate(value);
                          setDateCheck(
                            value ? format(value, "yyyy-MM-dd") : ""
                          );
                          console.log("Selected date:", datecheck);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
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
                        <div className="flex items-center justify-between w-full">
                          <SelectValue placeholder="Select time slot" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.length === 0 ? (
                          <SelectItem value="no-slots" disabled>
                            No available time slots
                          </SelectItem>
                        ) : (
                          availableTimeSlots.map((slot, index) => {
                            const timeSlotText = slot;
                            return (
                              <SelectItem
                                key={`timeslot-${index}-${timeSlotText}`}
                                value={timeSlotText}
                              >
                                {timeSlotText}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Insert meeting notes here..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="space-y-4 border-t pt-6">
            <FormLabel className="block w-full">Add Participants</FormLabel>
            <div className="flex flex-col gap-2">
              {form.watch("participants")?.length > 0 && (
                <div className="flex flex-wrap gap-2 my-2">
                  {form.watch("participants").map((participant, index) => (
                    <Badge
                      key={`participant-badge-${index}-${participant}`}
                      variant="secondary"
                      className="px-3 py-1.5"
                    >
                      {participant}
                      <button
                        type="button"
                        onClick={() => {
                          const currentParticipants =
                            form.getValues("participants") || [];
                          form.setValue(
                            "participants",
                            currentParticipants.filter((_, i) => i !== index)
                          );
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
                      e.preventDefault();
                      const input = e.currentTarget;
                      const email = input.value.trim();

                      if (addParticipantByEmail(email)) {
                        input.value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant={"secondary"}
                  onClick={() => {
                    const input = document.getElementById(
                      "participant-email"
                    ) as HTMLInputElement;
                    const email = input.value.trim();

                    if (addParticipantByEmail(email)) {
                      input.value = "";
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter or click Add to add a participant
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mr-2"
              type="button"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Scheduling..." : "Schedule"}
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
            <AlertDialogAction onClick={handleConfirmBack}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddAppointmentForm;
