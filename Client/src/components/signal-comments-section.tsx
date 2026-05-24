"use client"

import * as React from "react"
import {
  CopyIcon,
  FileIcon,
  PaperclipIcon,
  ReplyIcon,
  SendIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConversationEmojiPicker } from "@/components/conversation-emoji-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  addComment,
  formatChatTime,
  getChatMessagesForSignal,
  markSignalAsRead,
  shouldGroupMessages,
  type ChatMessage,
  type SignalAttachment,
} from "@/lib/comments"
import type { ProjectMember } from "@/lib/projects"
import { CURRENT_USER_PEOPLE_ID, getInitials } from "@/lib/people"
import { cn } from "@/lib/utils"

function truncateQuote(text: string, max = 80) {
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}…`
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getDateDividerLabel(isoDate: string) {
  const date = new Date(isoDate)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  }).format(date)
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border/50" />
      <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  )
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
  onChange: (value: string) => void
) {
  const start = textarea.selectionStart ?? textarea.value.length
  const end = textarea.selectionEnd ?? textarea.value.length
  const nextValue =
    textarea.value.slice(0, start) + text + textarea.value.slice(end)

  onChange(nextValue)

  requestAnimationFrame(() => {
    textarea.focus()
    const cursor = start + text.length
    textarea.setSelectionRange(cursor, cursor)
  })
}

function AttachmentList({
  attachments,
  isOwn,
}: {
  attachments: SignalAttachment[]
  isOwn: boolean
}) {
  if (!attachments.length) return null

  return (
    <div className="mt-2 space-y-1.5">
      {attachments.map((file) => (
        <div
          key={`${file.name}-${file.size}`}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs",
            isOwn ? "bg-primary-foreground/10" : "bg-background/60"
          )}
        >
          <FileIcon className="size-3.5 shrink-0 opacity-70" />
          <span className="truncate font-medium">{file.name}</span>
          <span className="shrink-0 opacity-70">
            {formatFileSize(file.size)}
          </span>
        </div>
      ))}
    </div>
  )
}

function getMessageCopyText(message: ChatMessage) {
  if (message.content.trim()) return message.content

  if (message.attachments?.length) {
    return message.attachments.map((file) => file.name).join("\n")
  }

  return ""
}

function ChatBubble({
  message,
  grouped,
  onReply,
  isMenuOpen,
  onMenuOpenChange,
}: {
  message: ChatMessage
  grouped: boolean
  onReply: (message: ChatMessage) => void
  isMenuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
}) {
  const isOwn = message.authorPeopleId === CURRENT_USER_PEOPLE_ID
  const hasContent = message.content.length > 0
  const copyText = getMessageCopyText(message)

  async function handleCopy() {
    if (!copyText) {
      toast.error("Nothing to copy.")
      return
    }

    try {
      await navigator.clipboard.writeText(copyText)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Could not copy message.")
    }
  }

  function handleReply() {
    onReply(message)
  }

  return (
    <div
      className={cn(
        "group flex gap-2.5",
        isOwn ? "flex-row-reverse" : "flex-row",
        grouped ? "mt-1" : "mt-4"
      )}
    >
      {!isOwn && (
        <Avatar className={cn("size-8 shrink-0", grouped && "invisible")}>
          <AvatarFallback className="text-[10px]">
            {getInitials(message.authorName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex max-w-[min(78%,34rem)] flex-col gap-1",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!grouped && !isOwn && (
          <span className="px-1 text-xs font-medium text-muted-foreground">
            {message.authorName}
          </span>
        )}

        <DropdownMenu open={isMenuOpen} onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onContextMenu={(event) => {
                event.preventDefault()
                onMenuOpenChange(true)
              }}
              onClick={(event) => {
                event.preventDefault()
              }}
              onPointerDown={(event) => {
                if (event.button === 0) {
                  event.preventDefault()
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
                  event.preventDefault()
                  onMenuOpenChange(true)
                }
              }}
              className={cn(
                "rounded-2xl px-3.5 py-2.5 text-left text-sm leading-relaxed transition-opacity",
                isOwn
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted/80 text-foreground",
                grouped && (isOwn ? "rounded-tr-2xl" : "rounded-tl-2xl"),
                !hasContent && message.attachments?.length && "py-2",
                isMenuOpen && "ring-2 ring-ring/60"
              )}
            >
              {message.parent && (
                <div
                  className={cn(
                    "mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-xs opacity-90",
                    isOwn
                      ? "border-primary-foreground/40 bg-primary-foreground/10"
                      : "border-primary/40 bg-background/50"
                  )}
                >
                  <div className="font-medium">{message.parent.authorName}</div>
                  <div className="line-clamp-2 opacity-80">
                    {truncateQuote(message.parent.content)}
                  </div>
                </div>
              )}
              {hasContent && (
                <span className="whitespace-pre-wrap break-words [font-family:inherit,'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]">
                  {message.content}
                </span>
              )}
              {message.attachments && (
                <AttachmentList attachments={message.attachments} isOwn={isOwn} />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isOwn ? "end" : "start"}
            sideOffset={4}
            className="w-auto min-w-[9rem] p-1"
          >
            <DropdownMenuItem
              disabled={!copyText}
              onSelect={() => {
                void handleCopy()
              }}
            >
              <CopyIcon />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleReply}>
              <ReplyIcon />
              Reply
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span
          className={cn(
            "px-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
            isOwn && "text-right"
          )}
        >
          {formatChatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}

function MessageComposer({
  draft,
  onDraftChange,
  attachments,
  onAttachmentsChange,
  replyTo,
  onCancelReply,
  onSend,
  inputRef,
  placeholder,
}: {
  draft: string
  onDraftChange: (value: string) => void
  attachments: SignalAttachment[]
  onAttachmentsChange: (files: SignalAttachment[]) => void
  replyTo: ChatMessage | null
  onCancelReply: () => void
  onSend: () => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  placeholder: string
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  function handleEmojiSelect(emoji: string) {
    const textarea = inputRef.current
    if (!textarea) {
      onDraftChange(draft + emoji)
      return
    }
    insertAtCursor(textarea, emoji, onDraftChange)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    const next = files.map((file) => ({
      name: file.name,
      size: file.size,
    }))

    onAttachmentsChange([...attachments, ...next])
    event.target.value = ""
  }

  function removeAttachment(index: number) {
    onAttachmentsChange(attachments.filter((_, i) => i !== index))
  }

  const canSend = draft.trim().length >= 1 || attachments.length > 0

  return (
    <div className="shrink-0 pb-4 pt-2">
      {replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm">
          <div className="min-w-0 flex-1 border-l-2 border-primary/60 pl-2">
            <div className="text-xs font-medium text-muted-foreground">
              Replying to {replyTo.authorName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {truncateQuote(replyTo.content, 100)}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={onCancelReply}
            aria-label="Cancel reply"
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 rounded-full bg-muted/60 py-1 pr-1 pl-2.5 text-xs"
            >
              <FileIcon className="size-3.5 text-muted-foreground" />
              <span className="max-w-[10rem] truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-5 rounded-full"
                onClick={() => removeAttachment(index)}
                aria-label={`Remove ${file.name}`}
              >
                <XIcon className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl bg-muted/40 px-2 py-2 sm:px-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach document"
        >
          <PaperclipIcon className="size-4" />
        </Button>

        <ConversationEmojiPicker onEmojiSelect={handleEmojiSelect} />

        <textarea
          ref={inputRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          aria-label={placeholder}
          className="field-sizing-content max-h-32 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground [font-family:inherit,'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif]"
        />

        <Button
          type="button"
          size="icon"
          className="size-9 shrink-0 rounded-full"
          disabled={!canSend}
          aria-label="Send message"
          onClick={onSend}
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function SignalCommentsSection({
  signalId,
  signalQuestion,
  members,
}: {
  signalId: string
  signalQuestion: string
  members: ProjectMember[]
}) {
  const [version, setVersion] = React.useState(0)
  const [draft, setDraft] = React.useState("")
  const [attachments, setAttachments] = React.useState<SignalAttachment[]>([])
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null)
  const [activeMessageMenuId, setActiveMessageMenuId] = React.useState<
    string | null
  >(null)
  const [mounted, setMounted] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const messages = React.useMemo(() => {
    if (!mounted) return []
    void version
    return getChatMessagesForSignal(signalId)
  }, [signalId, version, mounted])

  React.useEffect(() => {
    if (!mounted) return
    const node = scrollRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages.length, version, mounted])

  React.useEffect(() => {
    if (!mounted) return
    markSignalAsRead(signalId)
  }, [signalId, mounted, messages.length])

  function refreshMessages() {
    setVersion((value) => value + 1)
  }

  function handleSend() {
    const trimmed = draft.trim()

    if (trimmed.length < 1 && attachments.length === 0) {
      toast.error("Add a message or attach a document.")
      return
    }

    addComment({
      signalId,
      parentId: replyTo?.id ?? null,
      content: trimmed,
      attachments: attachments.length ? attachments : undefined,
    })

    setDraft("")
    setAttachments([])
    setReplyTo(null)
    refreshMessages()
  }

  function handleReply(message: ChatMessage) {
    setReplyTo(message)
    inputRef.current?.focus()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"
      >
        <div className="mb-6 rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Signal
          </p>
          <p className="mt-1 text-sm font-medium">{signalQuestion}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {members.length} people discussing this signal
          </p>
        </div>

        {!mounted ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={cn(
                  "h-14 animate-pulse rounded-2xl bg-muted/40",
                  item % 2 === 0 ? "ml-auto w-[70%]" : "w-[75%]"
                )}
              />
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div>
            {messages.map((message, index) => {
              const previous = messages[index - 1]
              const showDateDivider =
                !previous || !isSameDay(message.createdAt, previous.createdAt)

              return (
                <React.Fragment key={message.id}>
                  {showDateDivider && (
                    <DateDivider
                      label={getDateDividerLabel(message.createdAt)}
                    />
                  )}
                  <ChatBubble
                    message={message}
                    grouped={shouldGroupMessages(message, previous)}
                    onReply={handleReply}
                    isMenuOpen={activeMessageMenuId === message.id}
                    onMenuOpenChange={(open) =>
                      setActiveMessageMenuId(open ? message.id : null)
                    }
                  />
                </React.Fragment>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[14rem] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Be the first to respond to this signal.
          </div>
        )}
      </div>

      <MessageComposer
        draft={draft}
        onDraftChange={setDraft}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={handleSend}
        inputRef={inputRef}
        placeholder={`Message about “${truncateQuote(signalQuestion, 40)}”...`}
      />
    </div>
  )
}
