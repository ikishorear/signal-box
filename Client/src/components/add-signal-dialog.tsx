"use client"

import * as React from "react"

import { AddSignalForm } from "@/components/add-signal-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddSignalDialog({
  projectId,
  children,
  onAdded,
}: {
  projectId: string
  children: React.ReactNode
  onAdded?: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const formKey = open ? "open" : "closed"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-4 pt-4 sm:px-6">
          <DialogTitle>Add signal</DialogTitle>
          <DialogDescription>
            Capture a question for the team to discuss in this project.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
          <AddSignalForm
            key={formKey}
            projectId={projectId}
            onSuccess={() => {
              setOpen(false)
              onAdded?.()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
