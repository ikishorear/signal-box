"use client"

import * as React from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { UpdateSignalDialog } from "@/components/update-signal-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeSignalWithCleanup } from "@/lib/signal-actions"

export function SignalActionsMenu({
  signalId,
  signalQuestion,
  editable,
  onUpdated,
  onDeleted,
}: {
  signalId: string
  signalQuestion: string
  editable: boolean
  onUpdated?: () => void
  onDeleted?: () => void
}) {
  const [updateOpen, setUpdateOpen] = React.useState(false)

  if (!editable) return null

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${signalQuestion}"? This will remove the signal and its replies.`
    )
    if (!confirmed) return

    if (!removeSignalWithCleanup(signalId)) {
      toast.error("Could not delete signal")
      return
    }

    toast.success("Signal deleted")
    onDeleted?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Signal actions"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              setUpdateOpen(true)
            }}
          >
            <PencilIcon />
            Update signal
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault()
              handleDelete()
            }}
          >
            <Trash2Icon />
            Delete signal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateSignalDialog
        signalId={signalId}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onUpdated={onUpdated}
      />
    </>
  )
}
