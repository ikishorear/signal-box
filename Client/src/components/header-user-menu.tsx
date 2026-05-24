"use client"

import * as React from "react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AUTH_CHANGED_EVENT, getAuthSession } from "@/lib/auth"
import {
  getInitials,
  getUserDisplayName,
  PROFILE_CHANGED_EVENT,
} from "@/lib/people"

export function HeaderUserMenu() {
  const [mounted, setMounted] = React.useState(false)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    function refresh() {
      setVersion((value) => value + 1)
    }

    window.addEventListener(AUTH_CHANGED_EVENT, refresh)
    window.addEventListener(PROFILE_CHANGED_EVENT, refresh)

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh)
      window.removeEventListener(PROFILE_CHANGED_EVENT, refresh)
    }
  }, [])

  const session = React.useMemo(() => {
    void version
    return mounted ? getAuthSession() : null
  }, [mounted, version])

  const displayName = React.useMemo(() => {
    return getUserDisplayName(session?.username ?? null)
  }, [session])

  const initials = getInitials(displayName)

  if (!mounted) {
    return (
      <div className="flex h-9 items-center gap-2 px-2">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        <div className="hidden h-4 w-20 animate-pulse rounded bg-muted sm:block" />
      </div>
    )
  }

  if (!session) {
    return (
      <Button variant="outline" size="sm" className="rounded-lg" asChild>
        <Link href="/auth">Sign in</Link>
      </Button>
    )
  }

  return (
    <div
      className="flex h-9 max-w-[12rem] items-center gap-2 px-2 select-none"
      aria-label={`Signed in as ${displayName}`}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="rounded-full bg-primary/10 text-xs font-medium text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="hidden truncate text-sm font-medium sm:inline">
        {displayName}
      </span>
    </div>
  )
}
