"use client"

import type { ReactNode } from "react"
import {
  CalendarClockIcon,
  RadioIcon,
  UserRoundIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SignalAttachmentsList } from "@/components/signal-attachments-field"
import { formatSignalDate, type ProjectSignal } from "@/lib/project-signals"

export function SignalDetailDialog({
  signal,
  projectName,
  children,
}: {
  signal: ProjectSignal
  projectName: string
  children: ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <RadioIcon className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle>{signal.question}</DialogTitle>
              <DialogDescription>{projectName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm leading-relaxed">{signal.description}</p>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarClockIcon className="size-4 shrink-0" />
              <span>{formatSignalDate(signal.createdAt)}</span>
            </div>
            {signal.author && (
              <div className="flex items-center gap-1.5">
                <UserRoundIcon className="size-4 shrink-0" />
                <span>{signal.author}</span>
              </div>
            )}
          </div>

          {signal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {signal.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {signal.attachments && signal.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Attachments</p>
              <SignalAttachmentsList attachments={signal.attachments} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
