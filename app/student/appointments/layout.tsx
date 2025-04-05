import { ReactNode } from "react"

interface AppointmentsLayoutProps {
  children: ReactNode
}

export default function AppointmentsLayout({ children }: AppointmentsLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      {children}
    </main>
  )
}
