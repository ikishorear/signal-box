"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EyeIcon,
  FolderIcon,
  MessageSquareTextIcon,
  SearchIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getLatestCommentForSignal,
  getUnreadCountForSignal,
  SIGNAL_READ_STATE_EVENT,
  type SignalComment,
} from "@/lib/comments"
import { getInitials } from "@/lib/people"
import { getThreadSignalHref, threadSignalId } from "@/lib/project-signals"

export type DashboardThread = {
  id: number
  project: string
  signal: string
  thread: string
  author: string
  datetime: string
}

type DashboardThreadCard = DashboardThread & {
  signalId: string
  latestReply: SignalComment | null
  unreadCount: number
}

type SortField = "datetime" | "project" | "signal" | "author" | "reply"

const sortOptions: { value: SortField; label: string }[] = [
  { value: "datetime", label: "Latest activity" },
  { value: "project", label: "Project" },
  { value: "signal", label: "Signal" },
  { value: "author", label: "Author" },
  { value: "reply", label: "Latest reply" },
]

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function getActivityDate(thread: DashboardThreadCard) {
  return thread.latestReply?.createdAt ?? thread.datetime
}

function enrichThread(
  thread: DashboardThread,
  includeReplies: boolean
): DashboardThreadCard {
  const signalId = threadSignalId(thread.id)
  const latestReply = includeReplies
    ? getLatestCommentForSignal(signalId) ?? null
    : null
  const unreadCount = includeReplies ? getUnreadCountForSignal(signalId) : 0

  return { ...thread, signalId, latestReply, unreadCount }
}

function matchesThreadSearch(thread: DashboardThreadCard, query: string) {
  const haystack = [
    thread.project,
    thread.signal,
    thread.author,
    thread.latestReply?.authorName ?? "",
    thread.latestReply?.content ?? "",
    formatDateTime(getActivityDate(thread)),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

function sortThreads(
  threads: DashboardThreadCard[],
  sortBy: SortField,
  descending: boolean
) {
  const sorted = [...threads]

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "datetime":
        comparison =
          new Date(getActivityDate(a)).getTime() -
          new Date(getActivityDate(b)).getTime()
        break
      case "project":
        comparison = a.project.localeCompare(b.project)
        break
      case "signal":
        comparison = a.signal.localeCompare(b.signal)
        break
      case "author":
        comparison = (a.latestReply?.authorName ?? a.author).localeCompare(
          b.latestReply?.authorName ?? b.author
        )
        break
      case "reply":
        comparison = (a.latestReply?.content ?? "").localeCompare(
          b.latestReply?.content ?? ""
        )
        break
    }

    return descending ? -comparison : comparison
  })

  return sorted
}

function LatestReplyPreview({
  reply,
  ready,
}: {
  reply: SignalComment | null
  ready: boolean
}) {
  const boxClassName =
    "flex min-h-[8.25rem] flex-col rounded-lg px-3 py-2.5"

  if (!ready) {
    return (
      <div
        className={`${boxClassName} justify-center bg-muted/40 text-xs text-muted-foreground`}
      >
        Loading latest reply...
      </div>
    )
  }

  if (!reply) {
    return (
      <div
        className={`${boxClassName} justify-center border border-dashed text-xs text-muted-foreground`}
      >
        No replies yet.
      </div>
    )
  }

  return (
    <div className={`${boxClassName} bg-muted/40`}>
      <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquareTextIcon className="size-3.5 shrink-0" />
        <span className="font-medium">Latest reply</span>
      </div>
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <Avatar className="size-6 shrink-0">
          <AvatarFallback className="text-[10px]">
            {getInitials(reply.authorName)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-xs font-medium">{reply.authorName}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDateTime(reply.createdAt)}
        </span>
      </div>
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed">
        {reply.content}
      </p>
    </div>
  )
}

export function DashboardThreadCards({
  threads,
}: {
  threads: DashboardThread[]
}) {
  const [search, setSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortField>("datetime")
  const [sortDesc, setSortDesc] = React.useState(true)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(8)
  const [mounted, setMounted] = React.useState(false)
  const [readVersion, setReadVersion] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    function refreshUnreadCounts() {
      setReadVersion((value) => value + 1)
    }

    window.addEventListener(SIGNAL_READ_STATE_EVENT, refreshUnreadCounts)
    window.addEventListener("focus", refreshUnreadCounts)

    return () => {
      window.removeEventListener(SIGNAL_READ_STATE_EVENT, refreshUnreadCounts)
      window.removeEventListener("focus", refreshUnreadCounts)
    }
  }, [])

  const threadCards = React.useMemo(() => {
    void readVersion
    return threads.map((thread) => enrichThread(thread, mounted))
  }, [threads, mounted, readVersion])

  const filteredThreads = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? threadCards.filter((thread) => matchesThreadSearch(thread, query))
      : threadCards

    return sortThreads(filtered, sortBy, sortDesc)
  }, [threadCards, search, sortBy, sortDesc])

  const pageCount = Math.max(1, Math.ceil(filteredThreads.length / pageSize))
  const currentPageIndex = Math.min(pageIndex, pageCount - 1)

  const paginatedThreads = React.useMemo(() => {
    const start = currentPageIndex * pageSize
    return filteredThreads.slice(start, start + pageSize)
  }, [filteredThreads, currentPageIndex, pageSize])

  React.useEffect(() => {
    setPageIndex(0)
  }, [search, sortBy, sortDesc, pageSize])

  React.useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1))
    }
  }, [pageCount, pageIndex])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search signals and replies..."
            className="pl-8"
            aria-label="Search signals and replies"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="dashboard-sort" className="text-sm font-medium">
            Sort by
          </Label>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortField)}
          >
            <SelectTrigger id="dashboard-sort" size="sm" className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDesc((value) => !value)}
          >
            {sortDesc ? "Desc" : "Asc"}
          </Button>
        </div>
      </div>

      {filteredThreads.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedThreads.map((thread) => (
              <Card key={thread.id} size="sm" className="flex h-full flex-col">
                <CardHeader className="gap-2 pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="w-fit font-normal">
                      <FolderIcon className="size-3" />
                      {thread.project}
                    </Badge>
                    {mounted && thread.unreadCount > 0 && (
                      <Badge className="shrink-0 tabular-nums">
                        {thread.unreadCount} unread
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug">
                    {thread.signal}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-3">
                  <LatestReplyPreview
                    reply={thread.latestReply}
                    ready={mounted}
                  />
                  <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClockIcon className="size-3.5 shrink-0" />
                    <span className="line-clamp-1">
                      {mounted
                        ? `Last activity ${formatDateTime(getActivityDate(thread))}`
                        : formatDateTime(thread.datetime)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto w-full">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={getThreadSignalHref(thread.project, thread.id)}>
                      <EyeIcon />
                      View
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredThreads.length} signal(s) total
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="dashboard-page-size" className="text-sm font-medium">
                  Cards per page
                </Label>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-20"
                    id="dashboard-page-size"
                  >
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectGroup>
                      {[6, 8, 12, 18].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {currentPageIndex + 1} of {pageCount}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden size-8 sm:flex"
                  size="icon"
                  onClick={() => setPageIndex(0)}
                  disabled={currentPageIndex === 0}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => setPageIndex((page) => Math.max(0, page - 1))}
                  disabled={currentPageIndex === 0}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() =>
                    setPageIndex((page) => Math.min(pageCount - 1, page + 1))
                  }
                  disabled={currentPageIndex >= pageCount - 1}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 sm:flex"
                  size="icon"
                  onClick={() => setPageIndex(pageCount - 1)}
                  disabled={currentPageIndex >= pageCount - 1}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed px-6 py-20 text-center text-sm text-muted-foreground">
          No signals match &quot;{search.trim()}&quot;.
        </div>
      )}
    </div>
  )
}
