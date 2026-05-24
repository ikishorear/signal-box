"use client"

import * as React from "react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import {
  FolderKanbanIcon,
  PlusIcon,
  RadioIcon,
  UserRoundIcon,
} from "lucide-react"

import { AddSignalDialog } from "@/components/add-signal-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import {
  ProjectSignalsSection,
  type ProjectDisplaySignal,
} from "@/components/project-signals-section"
import { ProjectPeopleDialog } from "@/components/project-people-dialog"
import { useProjects } from "@/components/projects-provider"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  formatSignalDate,
  getProjectSignals,
  type ProjectSignal,
} from "@/lib/project-signals"
import { SIGNALS_CHANGED_EVENT } from "@/lib/signals"

function toDisplaySignal(signal: ProjectSignal): ProjectDisplaySignal {
  const metaParts = [formatSignalDate(signal.createdAt)]
  if (signal.author) {
    metaParts.unshift(signal.author)
  }

  return {
    id: signal.id,
    question: signal.question,
    description: signal.description,
    tags: signal.tags,
    meta: metaParts.join(" · "),
    createdAt: signal.createdAt,
    updatedAt: signal.updatedAt,
    editable: signal.editable,
    sortDate: new Date(signal.updatedAt).getTime(),
  }
}

export function ProjectPageContent() {
  const params = useParams<{ projectId: string }>()
  const { getProject } = useProjects()
  const projectId = params.projectId?.toLowerCase()
  const project = projectId ? getProject(projectId) : undefined
  const [signalVersion, setSignalVersion] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const signals = React.useMemo(() => {
    if (!project || !projectId) return []

    return getProjectSignals(projectId, project.name, {
      includeStorage: mounted,
    }).map(toDisplaySignal)
  }, [project, projectId, signalVersion, mounted])

  React.useEffect(() => {
    function refreshSignals() {
      setSignalVersion((value) => value + 1)
    }

    window.addEventListener(SIGNALS_CHANGED_EVENT, refreshSignals)

    return () => {
      window.removeEventListener(SIGNALS_CHANGED_EVENT, refreshSignals)
    }
  }, [])

  if (!project) {
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
        <SiteHeader title={project.name} />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="mx-auto w-full max-w-7xl p-4 pb-12 sm:p-6 sm:pb-14 md:p-8 md:pb-16 lg:p-10">
            <div className="flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FolderKanbanIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      /projects/{project.id}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <section className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="flex items-center gap-2 text-base font-medium">
                      <RadioIcon className="size-4" />
                      Signals & threads
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Active discussions in this project.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ProjectPeopleDialog
                      projectId={project.id}
                      projectName={project.name}
                      members={project.members}
                    >
                      <Button variant="outline" size="sm">
                        <UserRoundIcon />
                        People
                      </Button>
                    </ProjectPeopleDialog>
                    <AddSignalDialog
                      projectId={project.id}
                      onAdded={() => setSignalVersion((v) => v + 1)}
                    >
                      <Button size="sm">
                        <PlusIcon />
                        Add signal
                      </Button>
                    </AddSignalDialog>
                  </div>
                </div>

                <ProjectSignalsSection
                  projectId={project.id}
                  signals={signals}
                  onSignalsChanged={() => setSignalVersion((v) => v + 1)}
                  emptyMessage={
                    <>
                      No signals yet for this project. Use{" "}
                      <span className="font-medium text-foreground">
                        Add signal
                      </span>{" "}
                      to create one, or{" "}
                      <Link
                        href="/dashboard"
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        view the dashboard
                      </Link>
                      .
                    </>
                  }
                />
              </section>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
