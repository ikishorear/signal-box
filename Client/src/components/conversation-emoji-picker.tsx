"use client"

import dynamic from "next/dynamic"
import * as React from "react"
import { Theme } from "emoji-picker-react"
import { SmileIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-[320px] items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
      Loading emojis…
    </div>
  ),
})

export function ConversationEmojiPicker({
  onEmojiSelect,
}: {
  onEmojiSelect: (emoji: string) => void
}) {
  const { resolvedTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full"
          aria-label="Add emoji"
        >
          <SmileIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-auto overflow-hidden border-0 p-0 shadow-lg"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {mounted && open ? (
          <EmojiPicker
            onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
            theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
            width={320}
            height={400}
            searchPlaceholder="Search emojis..."
            previewConfig={{ showPreview: false }}
            lazyLoadEmojis
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
