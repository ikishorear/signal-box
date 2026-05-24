"use client"

import * as React from "react"
import Link from "next/link"
import {
  Building2Icon,
  SearchIcon,
  UserPlusIcon,
  UserRoundIcon,
  UserCheckIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useFriends } from "@/components/friends-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  CURRENT_USER_ORG,
  getInitials,
  getOrganizationPeople,
  searchPeopleByPeopleId,
  type Person,
} from "@/lib/people"

function FriendAction({
  person,
  isFriend,
  onAdd,
}: {
  person: Person
  isFriend: boolean
  onAdd: (person: Person) => void
}) {
  if (isFriend) {
    return <Badge variant="secondary">Friends</Badge>
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="w-full"
      onClick={() => onAdd(person)}
    >
      <UserPlusIcon />
      Add friend
    </Button>
  )
}

function PeopleProfileCard({
  person,
  action,
}: {
  person: Person
  action?: React.ReactNode
}) {
  return (
    <Card size="sm" className="h-full w-full min-w-0 overflow-visible">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{person.name}</CardTitle>
            <CardDescription className="font-mono text-xs">
              {person.peopleId}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {person.description}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Building2Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{person.orgName}</span>
        </div>
      </CardContent>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  )
}

function PeopleGrid({
  people,
  emptyMessage,
  renderAction,
}: {
  people: Person[]
  emptyMessage: string
  renderAction: (person: Person) => React.ReactNode
}) {
  if (people.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {people.map((person) => (
        <PeopleProfileCard
          key={person.peopleId}
          person={person}
          action={renderAction(person)}
        />
      ))}
    </div>
  )
}

export function PeopleSearch() {
  const {
    friends,
    followRequests,
    isFriend,
    addFriend,
    removeFriend,
    acceptFollowRequest,
    declineFollowRequest,
  } = useFriends()
  const [query, setQuery] = React.useState("")
  const [hasSearched, setHasSearched] = React.useState(false)

  const organizationPeople = React.useMemo(() => getOrganizationPeople(), [])
  const results = React.useMemo(() => {
    if (!hasSearched) return []
    return searchPeopleByPeopleId(query)
  }, [query, hasSearched])

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()

    if (!query.trim()) {
      toast.error("Enter a PeopleID to search")
      return
    }

    setHasSearched(true)
  }

  function handleAddFriend(person: Person) {
    addFriend(person)
    toast.success(`${person.name} added as a friend`)
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 sm:gap-10">
      <section className="space-y-4 sm:space-y-5">
        <div className="space-y-1">
          <h2 className="text-base font-medium">Search globally by PeopleID</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Find people outside your organization, add them as friends, then
            invite them to projects.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-2xl">
          <div className="flex flex-col overflow-visible rounded-lg border bg-background shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 sm:flex-row sm:items-stretch">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value.toUpperCase())
                  setHasSearched(false)
                }}
                placeholder="PID-8F2K9X"
                className="h-10 rounded-none border-0 bg-transparent pl-9 font-mono uppercase shadow-none focus-visible:ring-0 sm:rounded-l-lg"
                autoComplete="off"
                aria-label="Search by PeopleID"
              />
            </div>
            <Separator orientation="horizontal" className="sm:hidden" />
            <Separator orientation="vertical" className="hidden h-auto self-stretch sm:block" />
            <Button
              type="submit"
              variant="ghost"
              className="h-10 shrink-0 rounded-none px-4 sm:rounded-r-lg"
            >
              Search
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Search works worldwide. Use a full or partial PeopleID.
          </p>
        </form>

        {hasSearched && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium">
                Search results
                {results.length > 0 && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    ({results.length})
                  </span>
                )}
              </h3>
              {query.trim() && (
                <span className="font-mono text-xs text-muted-foreground">
                  {query.trim().toUpperCase()}
                </span>
              )}
            </div>
            <PeopleGrid
              people={results}
              emptyMessage={`No person found with PeopleID matching "${query.trim().toUpperCase()}".`}
              renderAction={(person) => (
                <FriendAction
                  person={person}
                  isFriend={isFriend(person.peopleId)}
                  onAdd={handleAddFriend}
                />
              )}
            />
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-base font-medium">
              <UserCheckIcon className="size-4" />
              Requests
            </h2>
            <p className="text-sm text-muted-foreground">
              People who have requested to follow you.
            </p>
          </div>
          {followRequests.length > 0 && (
            <Badge className="w-fit sm:ml-auto">{followRequests.length} pending</Badge>
          )}
        </div>

        {followRequests.length > 0 ? (
          <PeopleGrid
            people={followRequests}
            emptyMessage=""
            renderAction={(person) => (
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    acceptFollowRequest(person.peopleId)
                    toast.success(`${person.name} is now your friend`)
                  }}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    declineFollowRequest(person.peopleId)
                    toast.success(`Declined request from ${person.name}`)
                  }}
                >
                  Decline
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No pending follow requests.
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="space-y-1">
            <h2 className="text-base font-medium">People from your organization</h2>
            <p className="text-sm text-muted-foreground">
              Teammates at {CURRENT_USER_ORG} you can connect with.
            </p>
          </div>
          <Badge variant="outline" className="w-fit sm:ml-auto">
            <Building2Icon />
            {CURRENT_USER_ORG}
          </Badge>
        </div>

        <PeopleGrid
          people={organizationPeople}
          emptyMessage={`No teammates found at ${CURRENT_USER_ORG}.`}
          renderAction={(person) => (
            <FriendAction
              person={person}
              isFriend={isFriend(person.peopleId)}
              onAdd={handleAddFriend}
            />
          )}
        />
      </section>

      <Separator />

      <section className="space-y-4 pb-2 sm:space-y-5">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-base font-medium">
            <UserRoundIcon className="size-4" />
            Your friends
          </h2>
          <p className="text-sm text-muted-foreground">
            Only friends can be invited when creating a project.{" "}
            <Link href="/dashboard" className="underline underline-offset-4">
              Go to Dashboard
            </Link>
          </p>
        </div>

        {friends.length > 0 ? (
          <PeopleGrid
            people={friends}
            emptyMessage=""
            renderAction={(person) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  removeFriend(person.peopleId)
                  toast.success(`${person.name} removed from friends`)
                }}
              >
                Remove
              </Button>
            )}
          />
        ) : (
          <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            You have no friends yet. Add teammates from your organization or
            search globally by PeopleID.
          </div>
        )}
      </section>
    </div>
  )
}
