"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { z } from "zod"

import { SignalAttachmentsField } from "@/components/signal-attachments-field"
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
import {
  getSignalById,
  parseTagsInput,
  updateSignal,
  type SignalAttachment,
} from "@/lib/signals"

const formSchema = z.object({
  question: z
    .string()
    .min(5, "Question must be at least 5 characters.")
    .max(120, "Question must be at most 120 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description must be at most 500 characters."),
  tags: z
    .string()
    .min(1, "Add at least one tag.")
    .refine((value) => parseTagsInput(value).length > 0, {
      message: "Add at least one tag.",
    }),
})

export function UpdateSignalForm({
  signalId,
  onSuccess,
}: {
  signalId: string
  onSuccess?: () => void
}) {
  const existing = React.useMemo(() => getSignalById(signalId), [signalId])
  const [attachments, setAttachments] = React.useState<SignalAttachment[]>(
    () => existing?.attachments ?? []
  )

  const form = useForm({
    defaultValues: {
      question: existing?.question ?? "",
      description: existing?.description ?? "",
      tags: existing?.tags.join(", ") ?? "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const updated = updateSignal(signalId, {
        question: value.question,
        description: value.description,
        tags: parseTagsInput(value.tags),
        attachments: attachments.length ? attachments : undefined,
      })

      if (!updated) {
        toast.error("Signal not found")
        return
      }

      toast.success("Signal updated")
      onSuccess?.()
    },
  })

  if (!existing) {
    return (
      <p className="text-sm text-muted-foreground">
        This signal could not be loaded.
      </p>
    )
  }

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
          name="question"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Question</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Should we ship offline sync in v2?"
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
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Add context, constraints, or background..."
                  rows={4}
                  className="field-sizing-fixed max-h-[140px] min-h-[100px] resize-none overflow-y-auto"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

        <form.Field
          name="tags"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="product, mobile, launch"
                  autoComplete="off"
                />
                <FieldDescription>
                  Separate tags with commas.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <SignalAttachmentsField
        attachments={attachments}
        onChange={setAttachments}
      />

      <div className="flex justify-end gap-2">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  )
}
