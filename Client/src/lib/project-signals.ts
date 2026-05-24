import threadData from "@/app/dashboard/data.json"
import {
  getSignalsForProject,
  type Signal,
  type SignalAttachment,
} from "@/lib/signals"
import { slugifyProjectName } from "@/lib/projects"

type ThreadRow = (typeof threadData)[number]

export type ProjectSignal = {
  id: string
  projectId: string
  question: string
  description: string
  tags: string[]
  attachments?: SignalAttachment[]
  author?: string
  createdAt: string
  updatedAt: string
  editable: boolean
}

const THREAD_ID_PREFIX = "thread-"

export function threadSignalId(threadId: number) {
  return `${THREAD_ID_PREFIX}${threadId}`
}

export function isThreadSignalId(signalId: string) {
  return signalId.startsWith(THREAD_ID_PREFIX)
}

export function getSignalHref(projectId: string, signalId: string) {
  return `/projects/${projectId}/signals/${encodeURIComponent(signalId)}`
}

export function getThreadSignalHref(projectName: string, threadId: number) {
  return getSignalHref(slugifyProjectName(projectName), threadSignalId(threadId))
}

function threadToSignal(thread: ThreadRow, projectId: string): ProjectSignal {
  return {
    id: threadSignalId(thread.id),
    projectId,
    question: thread.signal,
    description: thread.thread,
    tags: [],
    author: thread.author,
    createdAt: thread.datetime,
    updatedAt: thread.datetime,
    editable: false,
  }
}

function storageToSignal(signal: Signal): ProjectSignal {
  return {
    id: signal.id,
    projectId: signal.projectId,
    question: signal.question,
    description: signal.description,
    tags: signal.tags,
    attachments: signal.attachments,
    createdAt: signal.createdAt,
    updatedAt: signal.updatedAt ?? signal.createdAt,
    editable: true,
  }
}

export function getProjectSignals(
  projectId: string,
  projectName: string,
  options?: { includeStorage?: boolean }
): ProjectSignal[] {
  const normalizedId = projectId.toLowerCase()
  const normalizedName = projectName.toLowerCase()
  const includeStorage = options?.includeStorage ?? true

  const fromThreads = (threadData as ThreadRow[])
    .filter((thread) => thread.project.toLowerCase() === normalizedName)
    .map((thread) => threadToSignal(thread, normalizedId))

  const fromStorage = includeStorage
    ? getSignalsForProject(normalizedId).map(storageToSignal)
    : []

  return [...fromStorage, ...fromThreads]
}

export function getProjectSignalById(
  projectId: string,
  projectName: string,
  signalId: string,
  options?: { includeStorage?: boolean }
): ProjectSignal | undefined {
  return getProjectSignals(projectId, projectName, options).find(
    (signal) => signal.id === signalId
  )
}

export function formatSignalDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate))
}
