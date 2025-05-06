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
import { ArrowLeft, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth, db } from "@/app/firebase-config";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from 'firebase/auth';
import { Fira_Sans } from "next/font/google";

const studentSchema = z.object({
  role: z.literal("student"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  studentNumber: z.string().min(1, "Required"),
  college: z.string().min(1, "Required"),
  degreeProgram: z.string().min(1, "Required"),
});

const facultySchema = z.object({
  role: z.literal("faculty"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  facultyNumber: z.string().min(1, "Required"),
  college: z.string().min(1, "Required"),
  department: z.string().min(1, "Required"),
});

const formSchema = z.discriminatedUnion("role", [studentSchema, facultySchema]);

export function AddUserForm() {
  const [showDialog, setShowDialog] = React.useState(false);
  const [formChanged, setFormChanged] = React.useState(false);
  const [role, setRole] = React.useState<"student" | "faculty">("student");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "student",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    const subscription = form.watch(() => setFormChanged(true));
    return () => subscription.unsubscribe();
  }, [form]);

  React.useEffect(() => {
    form.setValue("role", role);
  }, [role, form]);

  const router = useRouter();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const auth = getAuth(); // Initialize Firebase Auth

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Retrieve the user object
      console.log("User created successfully");

      const userData = {
        firstName: values.firstName,
        email: values.email,
        studentnumber: values.role === "student" ? values.studentNumber : null,
        facultynumber: values.role === "faculty" ? values.facultyNumber : null,
        role: values.role,
        dateAdded: serverTimestamp(),
      };

      const collectionName = values.role === "student" ? "student" : "faculty";

      const docRef = doc(db, "Users", user.uid);
      await setDoc(docRef, userData);
      if (values.role === "student") {
        await addDoc(collection(db, "student"), {
          ...userData,
          firstName: values.firstName,
          lastName: values.lastName,
          college: values.college,
          degreeProgram: values.degreeProgram,
        });
      }
      if (values.role === "faculty") {
        await addDoc(collection(db, "Faculty_in_charge"), {
          ...userData,
          firstName: values.firstName,
          lastName: values.lastName,
          college: values.college,
          department: values.department,
        });
      }

      console.log(`${values.role} added with ID: `, docRef.id);
      setFormChanged(false);
      router.push("/admin/users");
    } catch (error) {
      console.error(`Error adding ${role}: `, error);
    }
  };

  const handleBack = () => {
    if (formChanged) {
      setShowDialog(true);
    } else {
      router.push("/admin/users");
    }
  };

  const handleConfirmBack = () => {
    setShowDialog(false);
    router.push("/admin/users");
  };

  return (
    <div className="mb-2 p-6 space-y-6 max-w-2xl mx-auto bg-white rounded-lg">
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
              defaultValue={role}
              onValueChange={(value) => {
                setRole(value as "student" | "faculty");
                form.setValue("role", value as "student" | "faculty");
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
                    <Input placeholder="Juan" {...field} />
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
                    <Input placeholder="Dela Cruz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {role === "student" ? (
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
                          placeholder="email@up.edu.ph"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            console.log("Email input:", e.target.value);
                            setEmail(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          console.log("Password input:", e.target.value);
                          setPassword(e.target.value);
                        }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Number</FormLabel>
                      <FormControl>
                        <Input placeholder="20XX-XXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            <SelectItem value="CAS">
                              College of Arts and Sciences
                            </SelectItem>
                            <SelectItem value="CFOS">
                              College of Fisheries and Ocean Sciences
                            </SelectItem>
                            <SelectItem value="CM">
                              College of Management
                            </SelectItem>
                            <SelectItem value="SOTECH">
                              School of Technology
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="degreeProgram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree Program</FormLabel>
                      <FormControl>
                        <Input placeholder="BS Computer Science" {...field} />
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
                          placeholder="email@up.edu.ph"
                          {...field}
                          value={email}
                          onChange={(e) => {
                            field.onChange(e);
                            console.log("Email input:", e.target.value);
                            setEmail(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            console.log("Password input:", e.target.value);
                            setPassword(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="facultyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty Number</FormLabel>
                      <FormControl>
                        <Input placeholder="20XX-XXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            <SelectItem value="CAS">
                              College of Arts and Sciences
                            </SelectItem>
                            <SelectItem value="CFOS">
                              College of Fisheries and Ocean Sciences
                            </SelectItem>
                            <SelectItem value="CM">
                              College of Management
                            </SelectItem>
                            <SelectItem value="SOTECH">
                              School of Technology
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Division of Physical Sciences and Mathematics"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

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
