"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FloatingInput } from "@/components/ui/floating-input"

export default function Component() {
    return (
        <div className="flex min-h-screen">
            {/* Left Section */}
            <div className="relative hidden w-1/2 lg:block">
                <Image
                    src="/login-design.png"
                    alt="Login Design"
                    fill
                    className="object-fill"
                />
                <h1 className="relative z-10 pl-24 pt-40 text-6xl font-bold text-white">Welcome Back!</h1>
            </div>

            {/* Right Section */}
            <div className="flex w-full flex-col items-center justify-center px-4 lg:w-1/2">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex justify-center pb-6">
                        <h1 className="text-8xl font-black text-[#7B1113]">UPV</h1>
                        <Image
                            src="/logo.png"
                            alt="UPV OATS Logo"
                            width={200}
                            height={200}
                            className="h-20 w-auto pt-3 pl-2"
                        />
                    </div>

                    <div className="mb-4"></div>

                    <form className="space-y-8">

                        <FloatingInput
                            label="Email"
                            id="email"
                            type="email"
                            required
                        />

                        <div className="mb-4"></div>

                        <FloatingInput
                            label="Password"
                            id="password"
                            type="password"
                            required
                        />

                        <div className="mb-4"></div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" className="border-gray-400 data-[state=checked]:bg-[#7B1113] data-[state=checked]:border-[#7B1113]" />
                                <label htmlFor="remember" className="text-sm text-gray-600">
                                    Remember Me
                                </label>
                            </div>
                            <Link href="#" className="text-sm text-blue-400 transition duration-500 hover:text-[#7B1113]">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                type="submit"
                                className="w-1/3 rounded-lg bg-[#7B1113] py-6 text-white fira_sans transition duration-500 hover:bg-[#014421]"
                            >
                                LOGIN
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}