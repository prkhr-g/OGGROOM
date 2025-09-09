'use client'

import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return <>{children}</>
}