import { CURRENT_USER_PEOPLE_ID, getCurrentUser } from "@/lib/people"

export type SignalAttachment = {
  name: string
  size: number
}

export type SignalComment = {
  id: string
  signalId: string
  parentId: string | null
  authorPeopleId: string
  authorName: string
  content: string
  attachments?: SignalAttachment[]
  createdAt: string
}

export type CommentTreeNode = SignalComment & {
  replies: CommentTreeNode[]
}

const COMMENTS_STORAGE_KEY = "signal-box-signal-comments"
const READ_STATE_STORAGE_KEY = "signal-box-signal-read-state"

export const SIGNAL_READ_STATE_EVENT = "signal-box-read-state-changed"

type SignalReadState = Record<string, string>

const SEED_COMMENTS: SignalComment[] = [
  {
    id: "seed-thread-1-root",
    signalId: "thread-1",
    parentId: null,
    authorPeopleId: "PID-8F2K9X",
    authorName: "Eddie Lake",
    content:
      "Offline sync would be huge for field teams. We hear this in almost every beta interview.",
    createdAt: "2026-05-24T10:05:00Z",
  },
  {
    id: "seed-thread-1-reply-1",
    signalId: "thread-1",
    parentId: "seed-thread-1-root",
    authorPeopleId: "PID-3M7R2A",
    authorName: "Sarah Chen",
    content:
      "We could start with read-only cache for v2 and add write sync later.",
    createdAt: "2026-05-24T10:18:00Z",
  },
  {
    id: "seed-thread-1-reply-2",
    signalId: "thread-1",
    parentId: "seed-thread-1-reply-1",
    authorPeopleId: "PID-6J1Q4D",
    authorName: "Jamik Tashpulatov",
    content: "Happy to prototype the read-only path this sprint if we align on scope.",
    createdAt: "2026-05-24T10:42:00Z",
  },
  {
    id: "seed-thread-2-root",
    signalId: "thread-2",
    parentId: null,
    authorPeopleId: "PID-6J1Q4D",
    authorName: "Jamik Tashpulatov",
    content: "$12/month feels right for solo users, but teams may need a higher tier.",
    createdAt: "2026-05-24T09:10:00Z",
  },
  {
    id: "seed-thread-2-reply-1",
    signalId: "thread-2",
    parentId: "seed-thread-2-root",
    authorPeopleId: "PID-8F2K9X",
    authorName: "Eddie Lake",
    content: "Agreed — we should test a $29 team plan with shared workspaces.",
    createdAt: "2026-05-24T09:25:00Z",
  },
]

function readAllComments(): SignalComment[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(COMMENTS_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored) as SignalComment[]
  } catch {
    return []
  }
}

function writeAllComments(comments: SignalComment[]) {
  window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments))
}

function getSeedCommentsForSignal(signalId: string) {
  return SEED_COMMENTS.filter((comment) => comment.signalId === signalId)
}

export function getCommentsForSignal(signalId: string): SignalComment[] {
  const stored = readAllComments().filter((comment) => comment.signalId === signalId)

  if (stored.length > 0) {
    return stored.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }

  return getSeedCommentsForSignal(signalId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export function getLatestCommentForSignal(
  signalId: string
): SignalComment | undefined {
  const comments = getCommentsForSignal(signalId)
  return comments.at(-1)
}

function readSignalReadState(): SignalReadState {
  if (typeof window === "undefined") return {}

  try {
    const stored = window.localStorage.getItem(READ_STATE_STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored) as SignalReadState
  } catch {
    return {}
  }
}

function writeSignalReadState(state: SignalReadState) {
  window.localStorage.setItem(READ_STATE_STORAGE_KEY, JSON.stringify(state))
}

function notifyReadStateChanged() {
  window.dispatchEvent(new Event(SIGNAL_READ_STATE_EVENT))
}

export function markSignalAsRead(signalId: string) {
  if (typeof window === "undefined") return

  const state = readSignalReadState()
  state[signalId] = new Date().toISOString()
  writeSignalReadState(state)
  notifyReadStateChanged()
}

export function clearSignalReadState(signalId: string) {
  if (typeof window === "undefined") return

  const state = readSignalReadState()
  delete state[signalId]
  writeSignalReadState(state)
  notifyReadStateChanged()
}

export function deleteCommentsForSignal(signalId: string) {
  if (typeof window === "undefined") return

  const next = readAllComments().filter((comment) => comment.signalId !== signalId)
  writeAllComments(next)
  notifyReadStateChanged()
}

export function getUnreadCountForSignal(signalId: string) {
  const comments = getCommentsForSignal(signalId)
  const lastReadAt = readSignalReadState()[signalId]
  const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : null

  return comments.filter((comment) => {
    if (comment.authorPeopleId === CURRENT_USER_PEOPLE_ID) return false
    if (lastReadTime === null) return true
    return new Date(comment.createdAt).getTime() > lastReadTime
  }).length
}

export function getTotalUnreadCount(signalIds: string[]) {
  const uniqueIds = [...new Set(signalIds)]
  return uniqueIds.reduce(
    (total, signalId) => total + getUnreadCountForSignal(signalId),
    0
  )
}

export function addComment(input: {
  signalId: string
  parentId: string | null
  content: string
  attachments?: SignalAttachment[]
}): SignalComment {
  const user = getCurrentUser()
  const trimmed = input.content.trim()
  const attachments = input.attachments?.length ? input.attachments : undefined

  const comment: SignalComment = {
    id: crypto.randomUUID(),
    signalId: input.signalId,
    parentId: input.parentId,
    authorPeopleId: user.peopleId,
    authorName: user.name,
    content: trimmed,
    attachments,
    createdAt: new Date().toISOString(),
  }

  const existing = readAllComments()
  const hasStoredForSignal = existing.some(
    (item) => item.signalId === input.signalId
  )

  const base = hasStoredForSignal
    ? existing
    : [...existing, ...getSeedCommentsForSignal(input.signalId)]

  writeAllComments([...base, comment])
  notifyReadStateChanged()
  return comment
}

export function buildCommentTree(comments: SignalComment[]): CommentTreeNode[] {
  const byId = new Map<string, CommentTreeNode>()

  for (const comment of comments) {
    byId.set(comment.id, { ...comment, replies: [] })
  }

  const roots: CommentTreeNode[] = []

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (nodes: CommentTreeNode[]) => {
    nodes.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    for (const node of nodes) {
      sortNodes(node.replies)
    }
  }

  sortNodes(roots)
  return roots
}

export function formatCommentDate(isoDate: string) {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date)
}

export function formatChatTime(isoDate: string) {
  const date = new Date(isoDate)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(isToday ? {} : { month: "short", day: "numeric" }),
  }).format(date)
}

export type ChatMessage = SignalComment & {
  parent?: Pick<SignalComment, "id" | "authorName" | "content">
}

export function getChatMessagesForSignal(signalId: string): ChatMessage[] {
  const comments = getCommentsForSignal(signalId)
  const byId = new Map(comments.map((comment) => [comment.id, comment]))

  return comments.map((comment) => {
    const parent = comment.parentId ? byId.get(comment.parentId) : undefined

    return {
      ...comment,
      parent: parent
        ? {
            id: parent.id,
            authorName: parent.authorName,
            content: parent.content,
          }
        : undefined,
    }
  })
}

export function shouldGroupMessages(
  current: SignalComment,
  previous: SignalComment | undefined
) {
  if (!previous) return false
  if (current.authorPeopleId !== previous.authorPeopleId) return false

  const gap =
    new Date(current.createdAt).getTime() -
    new Date(previous.createdAt).getTime()

  return gap < 5 * 60_000
}
