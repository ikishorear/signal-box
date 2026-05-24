export type Person = {
  peopleId: string
  name: string
  description: string
  orgName: string
  location: string
  email: string
}

export const CURRENT_USER_PEOPLE_ID = "PID-0K1SH9"
export const CURRENT_USER_ORG = "Signal Box"

export type CurrentUser = {
  peopleId: string
  name: string
  email: string
  description: string
  orgName: string
}

const PROFILE_STORAGE_KEY = "signal-box-user-profile"

export const PROFILE_CHANGED_EVENT = "signal-box-profile-changed"

const DEFAULT_USER: CurrentUser = {
  peopleId: CURRENT_USER_PEOPLE_ID,
  name: "You",
  email: "you@signalbox.app",
  description:
    "Product lead connecting signals to team conversations at Signal Box.",
  orgName: CURRENT_USER_ORG,
}

function readStoredProfile(): Partial<CurrentUser> | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as Partial<CurrentUser>
  } catch {
    return null
  }
}

function writeStoredProfile(profile: Partial<CurrentUser>) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

function notifyProfileChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
}

export function getCurrentUser(): CurrentUser {
  const stored = readStoredProfile()

  return {
    ...DEFAULT_USER,
    ...stored,
    peopleId: CURRENT_USER_PEOPLE_ID,
  }
}

export function updateCurrentUserProfile(input: {
  name: string
  description: string
  orgName: string
}) {
  writeStoredProfile({
    name: input.name.trim(),
    description: input.description.trim(),
    orgName: input.orgName.trim(),
  })
  notifyProfileChanged()
}

export function formatDisplayName(username: string) {
  return username.charAt(0).toUpperCase() + username.slice(1)
}

export function getUserDisplayName(sessionUsername?: string | null) {
  const profile = getCurrentUser()

  if (profile.name !== DEFAULT_USER.name) {
    return profile.name
  }

  if (sessionUsername) {
    return formatDisplayName(sessionUsername)
  }

  return profile.name
}

export const GLOBAL_PEOPLE: Person[] = [
  {
    peopleId: "PID-8F2K9X",
    name: "Eddie Lake",
    description: "Product designer focused on onboarding flows and mobile UX.",
    orgName: "Northwind Labs",
    location: "San Francisco, US",
    email: "eddie.lake@example.com",
  },
  {
    peopleId: "PID-3M7R2A",
    name: "Sarah Chen",
    description: "Engineering lead building realtime collaboration tools.",
    orgName: "Signal Box",
    location: "Singapore",
    email: "sarah.chen@example.com",
  },
  {
    peopleId: "PID-9W4N6B",
    name: "Marcus Webb",
    description: "Growth strategist experimenting with community-led launches.",
    orgName: "Harbor Analytics",
    location: "London, UK",
    email: "marcus.webb@example.com",
  },
  {
    peopleId: "PID-2H5P8C",
    name: "Priya Nair",
    description: "Full-stack developer working on data pipelines and dashboards.",
    orgName: "NovaLaunch",
    location: "Bengaluru, IN",
    email: "priya.nair@example.com",
  },
  {
    peopleId: "PID-6J1Q4D",
    name: "Jamik Tashpulatov",
    description: "Founder exploring ideas at the intersection of AI and productivity.",
    orgName: "Tash Studio",
    location: "Tashkent, UZ",
    email: "jamik@example.com",
  },
  {
    peopleId: "PID-4L8S3E",
    name: "Alex Rivera",
    description: "Customer success manager helping teams adopt new workflows.",
    orgName: "Orbit CRM",
    location: "Mexico City, MX",
    email: "alex.rivera@example.com",
  },
  {
    peopleId: "PID-7T2V5F",
    name: "Jordan Kim",
    description: "Security engineer reviewing access controls and compliance.",
    orgName: "Shieldpath",
    location: "Seoul, KR",
    email: "jordan.kim@example.com",
  },
  {
    peopleId: "PID-5R9X1G",
    name: "Amina Hassan",
    description: "Research analyst tracking emerging markets and user behavior.",
    orgName: "Cairo Insights",
    location: "Cairo, EG",
    email: "amina.hassan@example.com",
  },
  {
    peopleId: "PID-1Y6Z7H",
    name: "Luca Rossi",
    description: "Brand designer crafting visual systems for early-stage startups.",
    orgName: "Studio Rossi",
    location: "Milan, IT",
    email: "luca.rossi@example.com",
  },
  {
    peopleId: "PID-0D3B8J",
    name: "Yuki Tanaka",
    description: "Backend engineer optimizing APIs for high-traffic applications.",
    orgName: "Pixel Harbor",
    location: "Tokyo, JP",
    email: "yuki.tanaka@example.com",
  },
  {
    peopleId: "PID-8C2M4K",
    name: "Nina Patel",
    description: "Product manager shaping signal workflows and thread experiences.",
    orgName: "Signal Box",
    location: "Austin, US",
    email: "nina.patel@example.com",
  },
  {
    peopleId: "PID-5F7N1P",
    name: "David Okonkwo",
    description: "Frontend engineer building the dashboard and people experiences.",
    orgName: "Signal Box",
    location: "Berlin, DE",
    email: "david.okonkwo@example.com",
  },
  {
    peopleId: "PID-2G9Q6R",
    name: "Maya Lopez",
    description: "Design ops lead keeping product UI consistent across teams.",
    orgName: "Signal Box",
    location: "Barcelona, ES",
    email: "maya.lopez@example.com",
  },
]

export const DEFAULT_FOLLOW_REQUEST_IDS = [
  "PID-8F2K9X",
  "PID-9W4N6B",
  "PID-2H5P8C",
  "PID-1Y6Z7H",
]

export function getOrganizationPeople(orgName = CURRENT_USER_ORG) {
  return GLOBAL_PEOPLE.filter(
    (person) =>
      person.orgName === orgName && person.peopleId !== CURRENT_USER_PEOPLE_ID
  )
}

export function getPersonByPeopleId(peopleId: string) {
  const normalized = peopleId.trim().toUpperCase()
  return GLOBAL_PEOPLE.find((person) => person.peopleId === normalized)
}

export function searchPeopleByPeopleId(query: string) {
  const normalized = query.trim().toUpperCase()
  if (!normalized) return []

  return GLOBAL_PEOPLE.filter(
    (person) =>
      person.peopleId.includes(normalized) &&
      person.peopleId !== CURRENT_USER_PEOPLE_ID
  )
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function personToInvitee(person: Person) {
  return {
    id: person.peopleId,
    peopleId: person.peopleId,
    name: person.name,
    email: person.email,
  }
}
