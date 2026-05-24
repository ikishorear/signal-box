import type { CSSProperties } from "react"

import { DashboardThreadCards } from "./dashboard-thread-cards"
import { DashboardWelcome } from "./dashboard-welcome"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      className="h-svh max-h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex min-h-0 flex-1 flex-col">
        <SiteHeader title="Dashboard" />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="mx-auto w-full max-w-7xl p-4 pb-12 sm:p-6 sm:pb-14 md:p-8 md:pb-16 lg:p-10">
            <div className="flex flex-col gap-8">
              <DashboardWelcome threads={data} />
              <DashboardThreadCards threads={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
