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
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "student",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      studentNumber: "",
      college: "",
      degreeProgram: "",
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      console.log("User created successfully:", data.user);

      // Show success message
      toast?.success(
        `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`
      );

      // Reset form and navigate
      setFormChanged(false);
      form.reset();
      router.push("/admin/users");
    } catch (error: any) {
      console.error(`Error adding ${role}:`, error);

      // Show error message
      toast?.error(`Failed to create ${role}`);

      // Set form error if it's an email already exists error
      if (error.message?.includes("already in use")) {
        form.setError("email", {
          type: "manual",
          message: "This email address is already registered",
        });
      }
    } finally {
      setIsSubmitting(false);
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
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
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
                <TabsTrigger value="student" disabled={isSubmitting}>
                  Student
                </TabsTrigger>
                <TabsTrigger value="faculty" disabled={isSubmitting}>
                  Faculty
                </TabsTrigger>
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
                    <Input
                      placeholder="Juan"
                      {...field}
                      disabled={isSubmitting}
                    />
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
                    <Input
                      placeholder="Dela Cruz"
                      {...field}
                      disabled={isSubmitting}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@up.edu.ph"
                      {...field}
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
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
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="20XX-XXXXX"
                          {...field}
                          disabled={isSubmitting}
                        />
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
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select college" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="College of Arts and Sciences">
                              CAS
                            </SelectItem>
                            <SelectItem value="College of Fisheries and Ocean Sciences">
                              CFOS
                            </SelectItem>
                            <SelectItem value="College of Management">
                              CM
                            </SelectItem>
                            <SelectItem value="School of Technology">
                              SOTECH
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
                        <Input
                          placeholder="BS Computer Science"
                          {...field}
                          disabled={isSubmitting}
                        />
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
                  name="facultyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="20XX-XXXXX"
                          {...field}
                          disabled={isSubmitting}
                        />
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
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
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
            <Button
              variant="outline"
              onClick={handleBack}
              className="mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
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

export default AddUserForm;
