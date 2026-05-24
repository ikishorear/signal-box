"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { EyeIcon, EyeOffIcon, KeyRoundIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { AUTH_CHANGED_EVENT, changePassword, getAuthSession } from "@/lib/auth"
import {
  getCurrentUser,
  getInitials,
  getUserDisplayName,
  PROFILE_CHANGED_EVENT,
  updateCurrentUserProfile,
} from "@/lib/people"

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Username must be at least 2 characters.")
    .max(64, "Username must be at most 64 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description must be at most 500 characters."),
  orgName: z
    .string()
    .min(2, "Company must be at least 2 characters.")
    .max(120, "Company must be at most 120 characters."),
})

const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters."),
    confirmPassword: z
      .string()
      .min(1, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

function ProfileHero({
  displayName,
  peopleId,
}: {
  displayName: string
  peopleId: string
}) {
  const initials = getInitials(displayName)

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/30 px-6 py-8 text-center">
      <Avatar className="size-28 shrink-0 ring-4 ring-background">
        <AvatarFallback className="rounded-full bg-primary/10 text-3xl font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight">{displayName}</p>
        <Badge variant="outline" className="font-mono text-xs">
          {peopleId}
        </Badge>
      </div>
    </div>
  )
}

function ProfileDetail({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    </div>
  )
}

function AccountProfileView({
  onEdit,
  onChangePassword,
}: {
  onEdit: () => void
  onChangePassword: () => void
}) {
  const profile = getCurrentUser()
  const session = getAuthSession()
  const displayName = getUserDisplayName(session?.username ?? null)

  return (
    <div className="space-y-6">
      <ProfileHero displayName={displayName} peopleId={profile.peopleId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <ProfileDetail label="Username" value={displayName} />
        <ProfileDetail label="Company" value={profile.orgName} />
        <ProfileDetail
          label="Description"
          value={profile.description}
          className="sm:col-span-2"
        />
      </div>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onChangePassword}>
          <KeyRoundIcon className="size-4" />
          Change password
        </Button>
        <Button type="button" onClick={onEdit}>
          <PencilIcon className="size-4" />
          Edit profile
        </Button>
      </div>
    </div>
  )
}

function AccountProfileEditForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void
  onSuccess: () => void
}) {
  const profile = getCurrentUser()
  const session = getAuthSession()
  const displayName = getUserDisplayName(session?.username ?? null)

  const form = useForm({
    defaultValues: {
      name: displayName,
      description: profile.description,
      orgName: profile.orgName,
    },
    validators: {
      onSubmit: profileFormSchema,
    },
    onSubmit: async ({ value }) => {
      updateCurrentUserProfile(value)
      toast.success("Profile updated")
      onSuccess()
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <ProfileHero displayName={displayName} peopleId={profile.peopleId} />

      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="name"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="orgName"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Company</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="organization"
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
              <Field data-invalid={isInvalid} className="sm:col-span-2">
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  rows={5}
                  className="field-sizing-fixed min-h-[120px] resize-none"
                />
                <FieldDescription>
                  Tell teammates about your role, focus, or how you work.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}

function PasswordField({
  id,
  label,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
  isInvalid: boolean
  errors: Array<{ message?: string } | undefined>
  autoComplete: string
}) {
  const [visible, setVisible] = React.useState(false)

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={isInvalid}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 size-9 hover:bg-transparent"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </Button>
      </div>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  )
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: passwordFormSchema,
    },
    onSubmit: async ({ value }) => {
      const result = changePassword(value.currentPassword, value.newPassword)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Password updated")
      form.reset()
      onOpenChange(false)
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field
              name="currentPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <PasswordField
                    id={field.name}
                    label="Current password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    isInvalid={isInvalid}
                    errors={field.state.meta.errors}
                    autoComplete="current-password"
                  />
                )
              }}
            />

            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <PasswordField
                    id={field.name}
                    label="New password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    isInvalid={isInvalid}
                    errors={field.state.meta.errors}
                    autoComplete="new-password"
                  />
                )
              }}
            />

            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <PasswordField
                    id={field.name}
                    label="Confirm new password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    isInvalid={isInvalid}
                    errors={field.state.meta.errors}
                    autoComplete="new-password"
                  />
                )
              }}
            />
          </FieldGroup>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [version, setVersion] = React.useState(0)
  const [isEditing, setIsEditing] = React.useState(false)
  const [passwordOpen, setPasswordOpen] = React.useState(false)

  React.useEffect(() => {
    function refresh() {
      setVersion((value) => value + 1)
    }

    window.addEventListener(PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener(AUTH_CHANGED_EVENT, refresh)

    return () => {
      window.removeEventListener(PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh)
    }
  }, [])

  React.useEffect(() => {
    if (!open) {
      setIsEditing(false)
      setPasswordOpen(false)
    }
  }, [open])

  const contentKey = open ? `account-${version}-${isEditing ? "edit" : "view"}` : "closed"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-5">
            <DialogTitle className="text-xl">Account</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your profile details."
                : "View your profile details."}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {isEditing ? (
              <AccountProfileEditForm
                key={contentKey}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => setIsEditing(false)}
              />
            ) : (
              <AccountProfileView
                key={contentKey}
                onEdit={() => setIsEditing(true)}
                onChangePassword={() => setPasswordOpen(true)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  )
}
