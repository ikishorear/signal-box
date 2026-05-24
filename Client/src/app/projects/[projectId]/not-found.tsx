import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ProjectNotFound() {
  return (
    <SidebarProvider
      className="h-svh max-h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex min-h-0 flex-1 flex-col">
        <SiteHeader title="Project not found" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-lg font-medium">This project does not exist</h2>
            <p className="text-sm text-muted-foreground">
              The project you are looking for may have been removed or the URL
              may be incorrect.
            </p>
            <Button asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
