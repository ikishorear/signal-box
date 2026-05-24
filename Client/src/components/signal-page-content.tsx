"use client"

import * as React from "react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { ChevronLeftIcon, RadioIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { useProjects } from "@/components/projects-provider"
import { SignalActionsMenu } from "@/components/signal-actions-menu"
import { SignalCommentsSection } from "@/components/signal-comments-section"
import { SignalDetailDialog } from "@/components/signal-detail-dialog"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getProjectSignalById } from "@/lib/project-signals"
import { getProjectHref } from "@/lib/projects"
import { SIGNALS_CHANGED_EVENT } from "@/lib/signals"

export function SignalPageContent() {
  const router = useRouter()
  const params = useParams<{ projectId: string; signalId: string }>()
  const { getProject } = useProjects()
  const projectId = params.projectId?.toLowerCase()
  const signalId = params.signalId
    ? decodeURIComponent(params.signalId)
    : undefined
  const project = projectId ? getProject(projectId) : undefined
  const [signalVersion, setSignalVersion] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    function refreshSignal() {
      setSignalVersion((value) => value + 1)
    }

    window.addEventListener(SIGNALS_CHANGED_EVENT, refreshSignal)

    return () => {
      window.removeEventListener(SIGNALS_CHANGED_EVENT, refreshSignal)
    }
  }, [])

  if (!project || !signalId) {
    notFound()
  }

  const signal = React.useMemo(
    () =>
      getProjectSignalById(project.id, project.name, signalId, {
        includeStorage: mounted,
      }),
    [project, signalId, signalVersion, mounted]
  )

  if (!mounted && !signal) {
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
          <SiteHeader title="Signal" />
          <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading signal...
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!signal) {
    notFound()
  }

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
        <SiteHeader title={signal.question} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto flex h-full w-full max-w-5xl min-h-0 flex-1 flex-col overflow-hidden px-4 sm:px-6">
            <div className="flex shrink-0 flex-wrap items-center gap-3 py-3">
              <Button variant="ghost" size="icon-sm" className="shrink-0" asChild>
                <Link
                  href={getProjectHref(project.id)}
                  aria-label={`Back to ${project.name}`}
                >
                  <ChevronLeftIcon />
                </Link>
              </Button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold tracking-tight">
                  {signal.question}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {signal.description}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <SignalActionsMenu
                  signalId={signal.id}
                  signalQuestion={signal.question}
                  editable={signal.editable}
                  onUpdated={() => setSignalVersion((value) => value + 1)}
                  onDeleted={() => router.push(getProjectHref(project.id))}
                />
                <SignalDetailDialog signal={signal} projectName={project.name}>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <RadioIcon />
                    Signal
                  </Button>
                </SignalDetailDialog>
              </div>
            </div>

            <SignalCommentsSection
              signalId={signal.id}
              signalQuestion={signal.question}
              members={project.members}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
