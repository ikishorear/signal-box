"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { AccountDialog } from "@/components/account-dialog"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { SignalBoxLogo } from "@/components/signal-box-logo"
import { useProjects } from "@/components/projects-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth"
import { getProjectHref } from "@/lib/projects"
import { useTheme } from "next-themes"
import {
  LayoutDashboardIcon,
  UsersIcon,
  FileChartColumnIcon,
  CircleUserRoundIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "People",
      url: "/people",
      icon: <UsersIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { projects } = useProjects()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)

  React.useEffect(() => {
    setThemeMounted(true)
  }, [])

  const isDark = themeMounted && resolvedTheme === "dark"

  const projectItems = projects.map((project) => ({
    name: project.name,
    url: getProjectHref(project.id),
    icon: <FileChartColumnIcon />,
    isActive: pathname === getProjectHref(project.id),
  }))

  function handleLogout() {
    signOut()
    router.push("/auth")
  }

  function handleToggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  const navSecondary = [
    {
      title: isDark ? "Light mode" : "Dark mode",
      icon: isDark ? <SunIcon /> : <MoonIcon />,
      onClick: handleToggleTheme,
    },
    {
      title: "Account",
      icon: <CircleUserRoundIcon />,
      onClick: () => setAccountOpen(true),
    },
    {
      title: "Log out",
      icon: <LogOutIcon />,
      onClick: handleLogout,
      destructive: true,
    },
  ]

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <SignalBoxLogo className="size-5 text-primary" />
                <span className="text-base font-semibold">Signal Box </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-2">
        <NavMain items={data.navMain} />
        <NavDocuments items={projectItems} />
        <NavSecondary items={navSecondary} className="shrink-0" />
      </SidebarContent>
      </Sidebar>
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  )
}
