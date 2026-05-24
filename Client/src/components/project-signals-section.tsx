"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
  formatSignalDate,
  getSignalHref,
} from "@/lib/project-signals"
import {
  getUnreadCountForSignal,
  SIGNAL_READ_STATE_EVENT,
} from "@/lib/comments"
import { SignalActionsMenu } from "@/components/signal-actions-menu"

export type ProjectDisplaySignal = {
  id: string
  question: string
  description: string
  tags: string[]
  meta?: string
  createdAt: string
  updatedAt: string
  editable: boolean
  sortDate: number
}

type SortOption = "newest" | "oldest" | "question-asc" | "question-desc"

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "question-asc", label: "Question A–Z" },
  { value: "question-desc", label: "Question Z–A" },
]

function sortSignals(signals: ProjectDisplaySignal[], sortBy: SortOption) {
  const sorted = [...signals]

  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => b.sortDate - a.sortDate)
    case "oldest":
      return sorted.sort((a, b) => a.sortDate - b.sortDate)
    case "question-asc":
      return sorted.sort((a, b) => a.question.localeCompare(b.question))
    case "question-desc":
      return sorted.sort((a, b) => b.question.localeCompare(a.question))
    default:
      return sorted
  }
}

function getSearchTokens(query: string) {
  return query
    .split(/[\s,]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
}

function matchesSignalSearch(signal: ProjectDisplaySignal, query: string) {
  const tokens = getSearchTokens(query)
  if (tokens.length === 0) return true

  const fields = [
    signal.question,
    signal.description,
    signal.meta ?? "",
  ].map((value) => value.toLowerCase())

  const tags = signal.tags.map((tag) => tag.toLowerCase())

  return tokens.every((token) => {
    if (fields.some((field) => field.includes(token))) return true
    return tags.some((tag) => tag.includes(token))
  })
}

export function ProjectSignalsSection({
  projectId,
  signals,
  emptyMessage,
  onSignalsChanged,
}: {
  projectId: string
  signals: ProjectDisplaySignal[]
  emptyMessage: React.ReactNode
  onSignalsChanged?: () => void
}) {
  const [search, setSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortOption>("newest")
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(4)
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

  const filteredSignals = React.useMemo(() => {
    const query = search.trim()
    const filtered = query
      ? signals.filter((signal) => matchesSignalSearch(signal, query))
      : signals

    return sortSignals(filtered, sortBy)
  }, [signals, search, sortBy])

  const pageCount = Math.max(1, Math.ceil(filteredSignals.length / pageSize))
  const currentPageIndex = Math.min(pageIndex, pageCount - 1)

  const paginatedSignals = React.useMemo(() => {
    const start = currentPageIndex * pageSize
    return filteredSignals.slice(start, start + pageSize)
  }, [filteredSignals, currentPageIndex, pageSize])

  React.useEffect(() => {
    setPageIndex(0)
  }, [search, sortBy, pageSize])

  React.useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1))
    }
  }, [pageCount, pageIndex])

  if (signals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search signals and tags..."
            className="pl-8"
            aria-label="Search signals and tags"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="signal-sort" className="text-sm font-medium">
            Sort by
          </Label>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger id="signal-sort" size="sm" className="w-[160px]">
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
        </div>
      </div>

      {filteredSignals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
            {paginatedSignals.map((signal) => {
              void readVersion
              const unreadCount = mounted
                ? getUnreadCountForSignal(signal.id)
                : 0
              const signalHref = getSignalHref(projectId, signal.id)

              return (
              <Card
                key={signal.id}
                size="sm"
                className="flex h-full flex-col transition-shadow hover:shadow-md"
              >
                <CardHeader className="gap-2 pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={signalHref}
                      className="min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CardTitle className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug">
                        {signal.question}
                      </CardTitle>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1">
                      {unreadCount > 0 && (
                        <Badge className="tabular-nums">
                          {unreadCount} unread
                        </Badge>
                      )}
                      <SignalActionsMenu
                        signalId={signal.id}
                        signalQuestion={signal.question}
                        editable={signal.editable}
                        onUpdated={onSignalsChanged}
                        onDeleted={onSignalsChanged}
                      />
                    </div>
                  </div>
                  <Link
                    href={signalHref}
                    className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <CardDescription className="line-clamp-3 min-h-[3.75rem]">
                      {signal.description}
                    </CardDescription>
                  </Link>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-3">
                  <Link
                    href={signalHref}
                    className="flex flex-1 flex-col gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex min-h-[1.75rem] flex-wrap gap-1.5">
                      {signal.tags.length > 0 &&
                        signal.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                    <div className="mt-auto space-y-1">
                      <p className="line-clamp-1 min-h-4 text-xs text-muted-foreground">
                        {signal.meta ?? "\u00A0"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatSignalDate(signal.updatedAt)}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )})}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredSignals.length} signal(s) total
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="signals-per-page" className="text-sm font-medium">
                  Cards per page
                </Label>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-20"
                    id="signals-per-page"
                  >
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectGroup>
                      {[4, 6, 8, 12].map((size) => (
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
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No signals match &quot;{search.trim()}&quot;.
        </div>
      )}
    </div>
  )
}
