"use client"

import * as React from "react"

import {
  DEFAULT_PROJECTS,
  getProjectsForStorage,
  mergeProjects,
  slugifyProjectName,
  type Project,
  type ProjectMember,
} from "@/lib/projects"

const PROJECTS_STORAGE_KEY = "signal-box-projects"

type ProjectsContextValue = {
  projects: Project[]
  addProject: (input: {
    name: string
    description: string
    members?: ProjectMember[]
  }) => Project
  addProjectMember: (projectId: string, member: ProjectMember) => void
  getProject: (projectId: string) => Project | undefined
}

const ProjectsContext = React.createContext<ProjectsContextValue | null>(null)

function readProjectsFromStorage(): Project[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!stored) return []

    return JSON.parse(stored) as Project[]
  } catch {
    return []
  }
}

function writeProjectsToStorage(projects: Project[]) {
  window.localStorage.setItem(
    PROJECTS_STORAGE_KEY,
    JSON.stringify(getProjectsForStorage(projects))
  )
}

function updateProjects(
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  updater: (current: Project[]) => Project[]
) {
  setProjects((current) => {
    const next = updater(current)
    writeProjectsToStorage(next)
    return [...next].sort((a, b) => a.name.localeCompare(b.name))
  })
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>(() =>
    typeof window !== "undefined"
      ? mergeProjects(readProjectsFromStorage())
      : DEFAULT_PROJECTS
  )

  React.useEffect(() => {
    setProjects(mergeProjects(readProjectsFromStorage()))
  }, [])

  const addProject = React.useCallback(
    (input: {
      name: string
      description: string
      members?: ProjectMember[]
    }) => {
      const project: Project = {
        id: slugifyProjectName(input.name),
        name: input.name.trim(),
        description: input.description.trim(),
        members: input.members ?? [],
      }

      updateProjects(setProjects, (current) => {
        const existing = current.find((item) => item.id === project.id)
        return existing
          ? current.map((item) => (item.id === project.id ? project : item))
          : [...current, project]
      })

      return project
    },
    []
  )

  const addProjectMember = React.useCallback(
    (projectId: string, member: ProjectMember) => {
      updateProjects(setProjects, (current) =>
        current.map((project) => {
          if (project.id !== projectId.toLowerCase()) return project
          if (project.members.some((item) => item.peopleId === member.peopleId)) {
            return project
          }
          return {
            ...project,
            members: [...project.members, member],
          }
        })
      )
    },
    []
  )

  const getProject = React.useCallback(
    (projectId: string) =>
      projects.find((project) => project.id === projectId.toLowerCase()),
    [projects]
  )

  const value = React.useMemo(
    () => ({
      projects,
      addProject,
      addProjectMember,
      getProject,
    }),
    [projects, addProject, addProjectMember, getProject]
  )

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = React.useContext(ProjectsContext)
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider.")
  }
  return context
}
