"use client"

import * as React from "react"
import {
  Building2Icon,
  SearchIcon,
  UserPlusIcon,
  UserRoundIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useFriends } from "@/components/friends-provider"
import { useProjects } from "@/components/projects-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getInitials, getPersonByPeopleId, type Person } from "@/lib/people"
import type { ProjectMember } from "@/lib/projects"

function ProjectMemberRow({ member }: { member: ProjectMember }) {
  const profile = getPersonByPeopleId(member.peopleId)

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Avatar>
        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{member.name}</div>
        <div className="truncate font-mono text-xs text-muted-foreground">
          {member.peopleId}
        </div>
        {profile && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2Icon className="size-3.5 shrink-0" />
            <span className="truncate">{profile.orgName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function matchesMemberSearch(member: ProjectMember, query: string) {
  const profile = getPersonByPeopleId(member.peopleId)
  const haystack = [
    member.name,
    member.peopleId,
    member.email,
    profile?.orgName ?? "",
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

function personToMember(person: Person): ProjectMember {
  return {
    peopleId: person.peopleId,
    name: person.name,
    email: person.email,
  }
}

export function ProjectPeopleDialog({
  projectId,
  projectName,
  members,
  children,
}: {
  projectId: string
  projectName: string
  members: ProjectMember[]
  children: React.ReactNode
}) {
  const { friends } = useFriends()
  const { addProjectMember } = useProjects()
  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState<"list" | "add">("list")
  const [search, setSearch] = React.useState("")

  const memberIds = React.useMemo(
    () => new Set(members.map((member) => member.peopleId)),
    [members]
  )

  const filteredMembers = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return members
    return members.filter((member) => matchesMemberSearch(member, query))
  }, [members, search])

  const availableFriends = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    return friends.filter((friend) => {
      if (memberIds.has(friend.peopleId)) return false
      if (!query) return true

      return [friend.name, friend.peopleId, friend.email, friend.orgName]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [friends, memberIds, search])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearch("")
      setView("list")
    }
  }

  function handleAddPerson(person: Person) {
    addProjectMember(projectId, personToMember(person))
    toast.success(`${person.name} added to ${projectName}`)
    setView("list")
    setSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundIcon className="size-4" />
            {view === "add" ? "Add people" : "People"}
          </DialogTitle>
          <DialogDescription>
            {view === "add"
              ? `Add friends to ${projectName}. Only friends can be invited.`
              : `Everyone on ${projectName} (${members.length})`}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              view === "add"
                ? "Search friends by name or PeopleID..."
                : "Search by name, PeopleID, or org..."
            }
            className="pl-8"
            autoComplete="off"
            aria-label="Search people"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {view === "list" ? (
            members.length > 0 ? (
              filteredMembers.length > 0 ? (
                <div className="space-y-2 pr-1">
                  {filteredMembers.map((member) => (
                    <ProjectMemberRow key={member.peopleId} member={member} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                  No people match &quot;{search.trim()}&quot;.
                </div>
              )
            ) : (
              <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                No people have been added to this project yet.
              </div>
            )
          ) : availableFriends.length > 0 ? (
            <div className="space-y-2 pr-1">
              {availableFriends.map((friend) => (
                <div
                  key={friend.peopleId}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{getInitials(friend.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{friend.name}</div>
                      <div className="truncate font-mono text-xs text-muted-foreground">
                        {friend.peopleId}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddPerson(friend)}
                  >
                    <UserPlusIcon />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
              {friends.length === 0
                ? "Add friends on the People page first."
                : search.trim()
                  ? `No friends match "${search.trim()}".`
                  : "All of your friends are already on this project."}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {view === "add" ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setView("list")
                setSearch("")
              }}
            >
              Back to list
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:mr-auto sm:w-auto"
                onClick={() => {
                  setView("add")
                  setSearch("")
                }}
              >
                <UserPlusIcon />
                Add people
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
