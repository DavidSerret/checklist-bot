export interface DbUser {
  id: string
  discord_id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  guild_id: string
  created_by: string
  created_at: string
  sprints: string[]
}

export interface Section {
  id: string
  project_id: string
  name: string
  description: string | null
  sprint: string
  order: number
  created_at: string
}

export interface Subsection {
  id: string
  section_id: string
  name: string
  description: string | null
  parent_id: string | null
  order: number
  created_at: string
}

export interface SubsectionNode extends Subsection {
  tasks: Task[]
  children: SubsectionNode[]
}

export interface Task {
  id: string
  section_id: string
  subsection_id: string | null
  title: string
  description: string | null
  completed: boolean
  assigned_to: string | null
  weight: number
  created_at: string
  assignee?: DbUser | null
}

export type ProgressColor = 'red' | 'yellow' | 'orange' | 'green'

export function getProgressColor(pct: number): ProgressColor {
  if (pct >= 100) return 'green'
  if (pct >= 67) return 'orange'
  if (pct >= 34) return 'yellow'
  return 'red'
}

export function getProgressHex(pct: number): string {
  if (pct >= 100) return '#57F287'
  if (pct >= 67) return '#FF7043'
  if (pct >= 34) return '#FEE75C'
  return '#ED4245'
}

export function computeSectionProgress(tasks: Task[]): number {
  if (!tasks.length) return 0
  return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
}

export function collectNodeTasks(node: SubsectionNode): Task[] {
  return [...node.tasks, ...node.children.flatMap(collectNodeTasks)]
}

export function collectAllSectionTasks(directTasks: Task[], subsections: SubsectionNode[]): Task[] {
  return [...directTasks, ...subsections.flatMap(collectNodeTasks)]
}
