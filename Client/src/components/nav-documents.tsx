"use client"

import * as React from "react"
import Link from "next/link"
import { CirclePlusIcon, SearchIcon } from "lucide-react"

import { AddProjectDialog } from "@/components/add-project-dialog"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
  }[]
}) {
  const [search, setSearch] = React.useState("")

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items

    return items.filter((item) => item.name.toLowerCase().includes(query))
  }, [items, search])

  return (
    <SidebarGroup className="flex min-h-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>

      <div className="flex shrink-0 flex-col gap-2 px-2">
        <AddProjectDialog>
          <SidebarMenuButton
            tooltip="Add Project"
            className="h-8 w-full bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
          >
            <CirclePlusIcon />
            <span>Add Project</span>
          </SidebarMenuButton>
        </AddProjectDialog>

        <div className="relative w-full">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="h-8 w-full pl-8"
            aria-label="Search projects"
          />
        </div>
      </div>

      <SidebarGroupContent className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
        <SidebarMenu className="gap-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sidebar-foreground/70" disabled>
                <span>No projects found</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
