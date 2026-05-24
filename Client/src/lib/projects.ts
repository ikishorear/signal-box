export type ProjectMember = {
  peopleId: string
  name: string
  email: string
}

export type Project = {
  id: string
  name: string
  description: string
  members: ProjectMember[]
}

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "applepie",
    name: "ApplePie",
    description:
      "Mobile-first productivity app focused on offline workflows and simple team collaboration.",
    members: [
      {
        peopleId: "PID-8F2K9X",
        name: "Eddie Lake",
        email: "eddie.lake@example.com",
      },
      {
        peopleId: "PID-6J1Q4D",
        name: "Jamik Tashpulatov",
        email: "jamik@example.com",
      },
      {
        peopleId: "PID-9W4N6B",
        name: "Marcus Webb",
        email: "marcus.webb@example.com",
      },
      {
        peopleId: "PID-3M7R2A",
        name: "Sarah Chen",
        email: "sarah.chen@example.com",
      },
    ],
  },
  {
    id: "shampoo",
    name: "Shampoo",
    description:
      "Consumer subscription product exploring pricing, retention, and launch messaging.",
    members: [
      {
        peopleId: "PID-2H5P8C",
        name: "Priya Nair",
        email: "priya.nair@example.com",
      },
      {
        peopleId: "PID-4L8S3E",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
      },
    ],
  },
]

export function slugifyProjectName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function getProjectHref(projectId: string) {
  return `/projects/${projectId}`
}

export function findProjectById(
  projects: Project[],
  projectId: string
): Project | undefined {
  const normalized = projectId.trim().toLowerCase()
  return projects.find((project) => project.id === normalized)
}

export function mergeProjects(
  stored: Project[],
  defaults = DEFAULT_PROJECTS
): Project[] {
  const byId = new Map<string, Project>()

  for (const project of defaults) {
    byId.set(project.id, project)
  }

  for (const project of stored) {
    const existing = byId.get(project.id)
    byId.set(project.id, {
      ...existing,
      ...project,
      members: project.members?.length ? project.members : existing?.members ?? [],
    })
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

export function getProjectsForStorage(projects: Project[]): Project[] {
  return projects.filter((project) => {
    const defaultProject = DEFAULT_PROJECTS.find((item) => item.id === project.id)
    if (!defaultProject) return true

    const membersChanged =
      JSON.stringify(project.members) !== JSON.stringify(defaultProject.members)
    const descriptionChanged = project.description !== defaultProject.description

    return membersChanged || descriptionChanged
  })
}
