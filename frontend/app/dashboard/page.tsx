"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/dashboard-layout"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null // or a loading spinner
  }


  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>{/* Dashboard content */}</div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

