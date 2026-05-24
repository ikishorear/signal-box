"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"
import { SearchIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { useFriends } from "@/components/friends-provider"
import { useProjects } from "@/components/projects-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getInitials, personToInvitee, type Person } from "@/lib/people"
import { getProjectHref } from "@/lib/projects"

const inviteeSchema = z.object({
  id: z.string(),
  peopleId: z.string(),
  name: z.string(),
  email: z.string().email(),
})

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters.")
    .max(64, "Project name must be at most 64 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description must be at most 500 characters."),
  invitees: z.array(inviteeSchema),
})

export type ProjectFormValues = z.infer<typeof formSchema>

export type Invitee = z.infer<typeof inviteeSchema>

function InvitePeopleField({
  invitees,
  onAdd,
  onRemove,
}: {
  invitees: Invitee[]
  onAdd: (person: Person) => void
  onRemove: (index: number) => void
}) {
  const { friends } = useFriends()
  const [search, setSearch] = React.useState("")
  const invitedIds = React.useMemo(
    () => new Set(invitees.map((person) => person.peopleId)),
    [invitees]
  )

  const results = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []

    return friends
      .filter(
        (person) =>
          !invitedIds.has(person.peopleId) &&
          (person.name.toLowerCase().includes(query) ||
            person.peopleId.toLowerCase().includes(query))
      )
      .slice(0, 5)
  }, [search, invitedIds, friends])

  return (
    <Field>
      <FieldLabel htmlFor="invite-search">Invite people</FieldLabel>
      <FieldDescription>
        Only friends can be invited. Add people on the{" "}
        <Link href="/people" className="underline underline-offset-4">
          People
        </Link>{" "}
        page first by searching their PeopleID.
      </FieldDescription>

      {friends.length === 0 && (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          You have no friends yet.{" "}
          <Link href="/people" className="font-medium text-foreground underline underline-offset-4">
            Search by PeopleID
          </Link>{" "}
          to add friends before inviting them to a project.
        </div>
      )}

      {invitees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {invitees.map((person, index) => (
            <Badge
              key={person.peopleId}
              variant="secondary"
              className="h-7 gap-1.5 pr-1 pl-1.5"
            >
              <Avatar size="sm" className="size-5">
                <AvatarFallback className="text-[10px]">
                  {getInitials(person.name)}
                </AvatarFallback>
              </Avatar>
              <span>{person.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-5 rounded-full"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${person.name}`}
              >
                <XIcon />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {friends.length > 0 && (
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="invite-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search friends by name or PeopleID..."
            className="pl-8"
            autoComplete="off"
          />

          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-md">
              {results.map((person) => (
                <button
                  key={person.peopleId}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    onAdd(person)
                    setSearch("")
                  }}
                >
                  <Avatar size="sm">
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{person.name}</div>
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      {person.peopleId}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Field>
  )
}

export function AddProjectForm({
  onSuccess,
}: {
  onSuccess?: (values: ProjectFormValues) => void
}) {
  const router = useRouter()
  const { addProject } = useProjects()
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      invitees: [] as Invitee[],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const project = addProject({
        name: value.name,
        description: value.description,
        members: value.invitees.map((invitee) => ({
          peopleId: invitee.peopleId,
          name: invitee.name,
          email: invitee.email,
        })),
      })
      toast.success(`Project "${value.name}" created`)
      onSuccess?.(value)
      router.push(getProjectHref(project.id))
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name of the project</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="ApplePie"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Project description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Describe what this project is about..."
                  className="min-h-[100px]"
                />
                <FieldDescription>
                  Share the goal, scope, or context for this project.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="invitees"
          mode="array"
          children={(field) => (
            <InvitePeopleField
              invitees={field.state.value}
              onAdd={(person) => {
                if (
                  !field.state.value.some(
                    (item) => item.peopleId === person.peopleId
                  )
                ) {
                  field.pushValue(personToInvitee(person))
                }
              }}
              onRemove={(index) => field.removeValue(index)}
            />
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button type="submit">Create project</Button>
      </div>
    </form>
  )
}
