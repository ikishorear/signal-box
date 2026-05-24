export type SignalLinkPlatform =
  | "youtube"
  | "twitter"
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "other"

export type SignalAttachment = {
  id: string
  type: "file" | "link"
  name: string
  url?: string
  size?: number
  platform?: SignalLinkPlatform
}

export type Signal = {
  id: string
  projectId: string
  question: string
  description: string
  tags: string[]
  attachments?: SignalAttachment[]
  createdAt: string
  updatedAt: string
}

const SIGNALS_STORAGE_KEY = "signal-box-signals"

export const SIGNALS_CHANGED_EVENT = "signal-box-signals-changed"

function notifySignalsChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(SIGNALS_CHANGED_EVENT))
}

const LINK_PLATFORM_PATTERNS: { platform: SignalLinkPlatform; pattern: RegExp }[] =
  [
    { platform: "youtube", pattern: /(?:youtube\.com|youtu\.be)/i },
    { platform: "twitter", pattern: /(?:twitter\.com|x\.com)/i },
    { platform: "linkedin", pattern: /linkedin\.com/i },
    { platform: "instagram", pattern: /instagram\.com/i },
    { platform: "tiktok", pattern: /tiktok\.com/i },
    { platform: "facebook", pattern: /(?:facebook\.com|fb\.com)/i },
  ]

const PLATFORM_LABELS: Record<SignalLinkPlatform, string> = {
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  other: "Link",
}

function readAllSignals(): Signal[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(SIGNALS_STORAGE_KEY)
    if (!stored) return []
    return (JSON.parse(stored) as Signal[]).map((signal) => ({
      ...signal,
      updatedAt: signal.updatedAt ?? signal.createdAt,
    }))
  } catch {
    return []
  }
}

function writeAllSignals(signals: Signal[]) {
  window.localStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(signals))
}

export function getSignalsForProject(projectId: string): Signal[] {
  return readAllSignals()
    .filter((signal) => signal.projectId === projectId.toLowerCase())
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    )
}

export function getSignalById(signalId: string): Signal | undefined {
  return readAllSignals().find((signal) => signal.id === signalId)
}

export function getStoredSignalIds(): string[] {
  return readAllSignals().map((signal) => signal.id)
}

export function detectLinkPlatform(url: string): SignalLinkPlatform {
  for (const { platform, pattern } of LINK_PLATFORM_PATTERNS) {
    if (pattern.test(url)) return platform
  }
  return "other"
}

export function getLinkPlatformLabel(platform: SignalLinkPlatform) {
  return PLATFORM_LABELS[platform]
}

export function normalizeLinkUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    const url = new URL(withProtocol)
    return url.toString()
  } catch {
    return ""
  }
}

export function createLinkAttachment(url: string): SignalAttachment | null {
  const normalized = normalizeLinkUrl(url)
  if (!normalized) return null

  const platform = detectLinkPlatform(normalized)

  return {
    id: crypto.randomUUID(),
    type: "link",
    name: getLinkPlatformLabel(platform),
    url: normalized,
    platform,
  }
}

export function createFileAttachments(files: File[]): SignalAttachment[] {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    type: "file" as const,
    name: file.name,
    size: file.size,
  }))
}

export function formatAttachmentSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function addSignal(input: {
  projectId: string
  question: string
  description: string
  tags: string[]
  attachments?: SignalAttachment[]
}): Signal {
  const attachments = input.attachments?.length ? input.attachments : undefined

  const now = new Date().toISOString()

  const signal: Signal = {
    id: crypto.randomUUID(),
    projectId: input.projectId.toLowerCase(),
    question: input.question.trim(),
    description: input.description.trim(),
    tags: input.tags,
    attachments,
    createdAt: now,
    updatedAt: now,
  }

  const next = [...readAllSignals(), signal]
  writeAllSignals(next)
  notifySignalsChanged()
  return signal
}

export function updateSignal(
  signalId: string,
  input: {
    question: string
    description: string
    tags: string[]
    attachments?: SignalAttachment[]
  }
): Signal | undefined {
  const signals = readAllSignals()
  const index = signals.findIndex((signal) => signal.id === signalId)
  if (index === -1) return undefined

  const attachments = input.attachments?.length ? input.attachments : undefined
  const updated: Signal = {
    ...signals[index],
    question: input.question.trim(),
    description: input.description.trim(),
    tags: input.tags,
    attachments,
    updatedAt: new Date().toISOString(),
  }

  signals[index] = updated
  writeAllSignals(signals)
  notifySignalsChanged()
  return updated
}

export function deleteSignal(signalId: string): boolean {
  const signals = readAllSignals()
  const next = signals.filter((signal) => signal.id !== signalId)
  if (next.length === signals.length) return false

  writeAllSignals(next)
  notifySignalsChanged()
  return true
}

export function parseTagsInput(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}
