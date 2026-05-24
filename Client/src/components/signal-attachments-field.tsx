"use client"

import * as React from "react"
import {
  CameraIcon,
  ExternalLinkIcon,
  FileIcon,
  LinkIcon,
  MessageCircleIcon,
  Music2Icon,
  PaperclipIcon,
  PlusIcon,
  Share2Icon,
  VideoIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createFileAttachments,
  createLinkAttachment,
  formatAttachmentSize,
  type SignalAttachment,
  type SignalLinkPlatform,
} from "@/lib/signals"
import { cn } from "@/lib/utils"

function LinkPlatformIcon({
  platform,
  className,
}: {
  platform?: SignalLinkPlatform
  className?: string
}) {
  switch (platform) {
    case "youtube":
      return <VideoIcon className={className} />
    case "twitter":
      return <MessageCircleIcon className={className} />
    case "linkedin":
      return <Share2Icon className={className} />
    case "instagram":
      return <CameraIcon className={className} />
    case "tiktok":
      return <Music2Icon className={className} />
    case "facebook":
      return <Share2Icon className={className} />
    default:
      return <LinkIcon className={className} />
  }
}

export function SignalAttachmentsList({
  attachments,
  onRemove,
  className,
}: {
  attachments: SignalAttachment[]
  onRemove?: (id: string) => void
  className?: string
}) {
  if (!attachments.length) return null

  return (
    <div className={cn("space-y-2", className)}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
        >
          {attachment.type === "file" ? (
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <LinkPlatformIcon
              platform={attachment.platform}
              className="size-4 shrink-0 text-muted-foreground"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{attachment.name}</div>
            {attachment.type === "file" && attachment.size !== undefined && (
              <div className="text-xs text-muted-foreground">
                {formatAttachmentSize(attachment.size)}
              </div>
            )}
            {attachment.type === "link" && attachment.url && (
              <div className="truncate text-xs text-muted-foreground">
                {attachment.url}
              </div>
            )}
          </div>

          {attachment.type === "link" && attachment.url && (
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={`Open ${attachment.name}`}
            >
              <ExternalLinkIcon className="size-4" />
            </a>
          )}

          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => onRemove(attachment.id)}
              aria-label={`Remove ${attachment.name}`}
            >
              <XIcon className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

export function SignalAttachmentsField({
  attachments,
  onChange,
}: {
  attachments: SignalAttachment[]
  onChange: (attachments: SignalAttachment[]) => void
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [linkDraft, setLinkDraft] = React.useState("")
  const [linkError, setLinkError] = React.useState<string | null>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    onChange([...attachments, ...createFileAttachments(files)])
    event.target.value = ""
  }

  function handleAddLink() {
    const attachment = createLinkAttachment(linkDraft)
    if (!attachment) {
      setLinkError("Enter a valid YouTube or social media URL.")
      return
    }

    if (
      attachments.some(
        (item) => item.type === "link" && item.url === attachment.url
      )
    ) {
      setLinkError("This link is already attached.")
      return
    }

    onChange([...attachments, attachment])
    setLinkDraft("")
    setLinkError(null)
  }

  function removeAttachment(id: string) {
    onChange(attachments.filter((attachment) => attachment.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-sm font-medium">Attachments</div>
        <p className="text-xs text-muted-foreground">
          Add local files, YouTube videos, or social media links.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xls,.xlsx,.ppt,.pptx,.csv,.zip"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <PaperclipIcon />
          Add files
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={linkDraft}
          onChange={(event) => {
            setLinkDraft(event.target.value)
            if (linkError) setLinkError(null)
          }}
          placeholder="Paste YouTube or social media link..."
          aria-label="Paste YouTube or social media link"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              handleAddLink()
            }
          }}
        />
        <Button type="button" variant="secondary" size="sm" onClick={handleAddLink}>
          <PlusIcon />
          Add link
        </Button>
      </div>

      {linkError && <p className="text-xs text-destructive">{linkError}</p>}

      <SignalAttachmentsList
        attachments={attachments}
        onRemove={removeAttachment}
      />
    </div>
  )
}
