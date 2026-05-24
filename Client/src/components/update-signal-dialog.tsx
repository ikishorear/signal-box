"use client"

import * as React from "react"

import { UpdateSignalForm } from "@/components/update-signal-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function UpdateSignalDialog({
  signalId,
  open,
  onOpenChange,
  onUpdated,
}: {
  signalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}) {
  const formKey = open ? signalId : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-4 pt-4 sm:px-6">
          <DialogTitle>Update signal</DialogTitle>
          <DialogDescription>
            Edit the question, description, tags, or attachments.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
          <UpdateSignalForm
            key={formKey}
            signalId={signalId}
            onSuccess={() => {
              onOpenChange(false)
              onUpdated?.()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
