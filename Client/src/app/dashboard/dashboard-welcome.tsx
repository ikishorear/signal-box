"use client"

import * as React from "react"
import { SparklesIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AUTH_CHANGED_EVENT, getAuthSession } from "@/lib/auth"
import {
  getTotalUnreadCount,
  SIGNAL_READ_STATE_EVENT,
} from "@/lib/comments"
import { getUserDisplayName, PROFILE_CHANGED_EVENT } from "@/lib/people"
import { threadSignalId } from "@/lib/project-signals"
import { getStoredSignalIds, SIGNALS_CHANGED_EVENT } from "@/lib/signals"

type DashboardThread = {
  id: number
}

function getWelcomeMessage(name: string | null, unreadCount: number) {
  const greeting = name ? `Welcome back, ${name}` : "Welcome back"

  if (unreadCount === 0) {
    return {
      headline: `${greeting}.`,
      subline: "You're all caught up — nothing needs your attention right now.",
    }
  }

  const signalLabel = unreadCount === 1 ? "signal" : "signals"

  return {
    headline: `${greeting}.`,
    subline: `You have ${unreadCount} ${signalLabel} to catch up on. Take your time — your team is waiting to hear from you.`,
  }
}

export function DashboardWelcome({ threads }: { threads: DashboardThread[] }) {
  const [mounted, setMounted] = React.useState(false)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    function refresh() {
      setVersion((value) => value + 1)
    }

    window.addEventListener(SIGNAL_READ_STATE_EVENT, refresh)
    window.addEventListener(AUTH_CHANGED_EVENT, refresh)
    window.addEventListener(PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener(SIGNALS_CHANGED_EVENT, refresh)
    window.addEventListener("focus", refresh)

    return () => {
      window.removeEventListener(SIGNAL_READ_STATE_EVENT, refresh)
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh)
      window.removeEventListener(PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener(SIGNALS_CHANGED_EVENT, refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [])

  const { headline, subline } = React.useMemo(() => {
    void version

    if (!mounted) {
      return {
        headline: "Welcome back.",
        subline: "Checking for signals that need your attention...",
      }
    }

    const session = getAuthSession()
    const displayName = getUserDisplayName(session?.username ?? null)

    const signalIds = [
      ...threads.map((thread) => threadSignalId(thread.id)),
      ...getStoredSignalIds(),
    ]

    const unreadCount = getTotalUnreadCount(signalIds)

    return getWelcomeMessage(displayName, unreadCount)
  }, [threads, mounted, version])

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="gap-3 sm:flex-row sm:items-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <SparklesIcon className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight">
            {headline}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {subline}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}
