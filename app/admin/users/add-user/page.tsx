"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft } from 'lucide-react'
import Link from "next/link"

import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  role: z.string({
    required_error: "Please select a role.",
  }),
  studentNumber: z.string().optional(),
  college: z.string({
    required_error: "Please select a college.",
  }),
  degree: z.string({
    required_error: "Please select a degree.",
  }),
  upMail: z.string().email({
    message: "Please enter a valid UP mail address.",
  }),
  temporaryPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

export default function AddUserPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      studentNumber: "",
      upMail: "",
      temporaryPassword: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Handle form submission
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <Link 
          href="/admin/users"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User&apos;s Information</CardTitle>
          <CardDescription>Please provide all the required information</CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
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
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Number (optional)</FormLabel>
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
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dpsm">DPSM</SelectItem>
                          {/* Add more colleges as needed */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bscs">BS Computer Science</SelectItem>
                          <SelectItem value="bsap">BS Applied Mathematics</SelectItem>
                          <SelectItem value="bss">BS Statistics</SelectItem>
                          {/* Add more degrees as needed */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="upMail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UP mail</FormLabel>
                      <FormControl>
                        <Input placeholder="upmail@up.edu.ph" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temporaryPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-center pt-4">
                <Button 
                  type="submit"
                  className="bg-[#35563F] hover:bg-[#2A4A33] px-8"
                >
                  Add user
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

