export type AuthSession = {
  username: string
  signedInAt: string
}

const SESSION_STORAGE_KEY = "signal-box-auth-session"
const SESSION_ONLY_STORAGE_KEY = "signal-box-auth-session-tab"
const PASSWORD_STORAGE_KEY = "signal-box-auth-password"

export const AUTH_CHANGED_EVENT = "signal-box-auth-changed"

export const DEMO_USERNAME = "demo"
export const DEMO_PASSWORD = "password123"

function getStoredPassword(): string {
  if (typeof window === "undefined") return DEMO_PASSWORD

  return window.localStorage.getItem(PASSWORD_STORAGE_KEY) ?? DEMO_PASSWORD
}

export function verifyPassword(password: string): boolean {
  return password === getStoredPassword()
}

function notifyAuthChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

function readSessionFrom(storage: Storage, key: string): AuthSession | null {
  try {
    const stored = storage.getItem(key)
    if (!stored) return null
    return JSON.parse(stored) as AuthSession
  } catch {
    return null
  }
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  return (
    readSessionFrom(window.localStorage, SESSION_STORAGE_KEY) ??
    readSessionFrom(window.sessionStorage, SESSION_ONLY_STORAGE_KEY)
  )
}

export function isAuthenticated() {
  return getAuthSession() !== null
}

export function signIn(
  username: string,
  password: string,
  rememberMe = true
) {
  const normalizedUsername = username.trim().toLowerCase()

  if (normalizedUsername !== DEMO_USERNAME || password !== getStoredPassword()) {
    return false
  }

  const session: AuthSession = {
    username: normalizedUsername,
    signedInAt: new Date().toISOString(),
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
  window.sessionStorage.removeItem(SESSION_ONLY_STORAGE_KEY)

  const storage = rememberMe ? window.localStorage : window.sessionStorage
  const key = rememberMe ? SESSION_STORAGE_KEY : SESSION_ONLY_STORAGE_KEY

  storage.setItem(key, JSON.stringify(session))
  notifyAuthChanged()
  return true
}

export function signOut() {
  if (typeof window === "undefined") return

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
  window.sessionStorage.removeItem(SESSION_ONLY_STORAGE_KEY)
  notifyAuthChanged()
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): { success: true } | { success: false; error: string } {
  if (typeof window === "undefined") {
    return { success: false, error: "Password change is unavailable." }
  }

  if (!verifyPassword(currentPassword)) {
    return { success: false, error: "Current password is incorrect." }
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      error: "New password must be different from your current password.",
    }
  }

  window.localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword)
  return { success: true }
}
