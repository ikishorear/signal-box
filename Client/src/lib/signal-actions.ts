import {
  clearSignalReadState,
  deleteCommentsForSignal,
} from "@/lib/comments"
import { deleteSignal } from "@/lib/signals"

export function removeSignalWithCleanup(signalId: string): boolean {
  if (!deleteSignal(signalId)) return false

  deleteCommentsForSignal(signalId)
  clearSignalReadState(signalId)
  return true
}
