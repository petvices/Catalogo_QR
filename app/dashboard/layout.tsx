import type React from "react"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import DashboardNav from "@/components/dashboard-nav"
import { LoadingProvider } from "@/components/loading-overlay"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <div className="flex-1 container mx-auto py-8 px-4">
        <LoadingProvider>{children}</LoadingProvider>
      </div>
    </div>
  )
}
