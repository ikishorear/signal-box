"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DEMO_PASSWORD,
  DEMO_USERNAME,
  signIn,
} from "@/lib/auth"

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(32, "Username must be at most 32 characters.")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, dots, underscores, and hyphens."
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
  rememberMe: z.boolean(),
})

export function AuthForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)

      try {
        const success = signIn(
          value.username,
          value.password,
          value.rememberMe
        )

        if (!success) {
          toast.error("Invalid username or password")
          return
        }

        toast.success("Signed in successfully")
        router.push("/dashboard")
      } finally {
        setIsSubmitting(false)
      }
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
      <FieldGroup>
        <form.Field
          name="username"
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
                  autoComplete="username"
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  3–32 characters. Letters, numbers, dots, underscores, and
                  hyphens only.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pr-10"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 size-9 hover:bg-transparent"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </Button>
                </div>
                <FieldDescription>
                  At least 8 characters.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="rememberMe"
          children={(field) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) =>
                  field.handleChange(checked === true)
                }
                disabled={isSubmitting}
              />
              <Label
                htmlFor={field.name}
                className="text-sm font-normal leading-none"
              >
                Remember me on this device
              </Label>
            </div>
          )}
        />
      </FieldGroup>

      <div className="space-y-3">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Demo account:{" "}
          <span className="font-medium text-foreground">{DEMO_USERNAME}</span> /{" "}
          <span className="font-medium text-foreground">{DEMO_PASSWORD}</span>
        </p>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        By signing in, you agree to use Signal Box for your team&apos;s signal
        threads.{" "}
        <Link
          href="/dashboard"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Continue as guest
        </Link>
      </p>
    </form>
  )
}
