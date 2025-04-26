"use client";

import * as React from "react";
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
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/app/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const studentSchema = z.object({
  userType: z.literal("student"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  studentNumber: z.string().min(1, "Required"),
  college: z.string().min(1, "Required"),
  degreeProgram: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  cityTown: z.string().min(1, "Required"),
  description: z.string().optional(),
});

const facultySchema = z.object({
  userType: z.literal("faculty"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  facultyNumber: z.string().min(1, "Required"),
  college: z.string().min(1, "Required"),
  department: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  cityTown: z.string().min(1, "Required"),
  description: z.string().optional(),
});

const formSchema = z.discriminatedUnion("userType", [
  studentSchema,
  facultySchema,
]);

export function AddUserForm() {
  const [showDialog, setShowDialog] = React.useState(false);
  const [formChanged, setFormChanged] = React.useState(false);
  const [userType, setUserType] = React.useState<"student" | "faculty">(
    "student"
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "student",
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      cityTown: "",
      description: "",
    },
  });

  React.useEffect(() => {
    const subscription = form.watch(() => setFormChanged(true));
    return () => subscription.unsubscribe();
  }, [form]);

  React.useEffect(() => {
    form.setValue("userType", userType);
  }, [userType, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userData = {
        ...values,
        createdAt: serverTimestamp(),
      };

      const collectionName =
        values.userType === "student" ? "Students" : "Faculty";

      const docRef = await addDoc(collection(db, collectionName), userData);

      console.log(`${values.userType} added with ID: `, docRef.id);
      setFormChanged(false);
      window.history.back();
    } catch (error) {
      console.error(`Error adding ${userType}: `, error);
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

  return (
    <div className="mb-4 p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <UserPlus className="h-7 w-7" />
          <div>
            <h2 className="text-lg font-semibold">Add New User</h2>
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
          <div className="mb-6">
            <Tabs
              defaultValue={userType}
              onValueChange={(value) => {
                setUserType(value as "student" | "faculty");
                form.setValue("userType", value as "student" | "faculty");
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {userType === "student" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Student number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select college" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CCS">
                              College of Computer Studies
                            </SelectItem>
                            <SelectItem value="COE">
                              College of Engineering
                            </SelectItem>
                            <SelectItem value="CLA">
                              College of Liberal Arts
                            </SelectItem>
                            <SelectItem value="COB">
                              College of Business
                            </SelectItem>
                            <SelectItem value="COS">
                              College of Science
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degreeProgram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree Program</FormLabel>
                      <FormControl>
                        <Input placeholder="Degree program" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="facultyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Faculty number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select college" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CCS">
                              College of Computer Studies
                            </SelectItem>
                            <SelectItem value="COE">
                              College of Engineering
                            </SelectItem>
                            <SelectItem value="CLA">
                              College of Liberal Arts
                            </SelectItem>
                            <SelectItem value="COB">
                              College of Business
                            </SelectItem>
                            <SelectItem value="COS">
                              College of Science
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cityTown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City/Town</FormLabel>
                  <FormControl>
                    <Input placeholder="City or town" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description or bio..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleBack} className="mr-2">
              Cancel
            </Button>
            <Button type="submit">Create</Button>
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

export default AddUserForm;
