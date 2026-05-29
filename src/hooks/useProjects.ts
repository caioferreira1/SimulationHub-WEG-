import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Project, ProjectStatus } from '../types'
import { formatProjectCode } from '../lib/utils'

// ── Fetch all projects ───────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false })
      if (error) throw error
      return data as Project[]
    },
  })
}

// ── Fetch single project ─────────────────────────────────────────────────────
export function useProject(id: number) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Project
    },
    enabled: !!id,
  })
}

// ── Get next project code ────────────────────────────────────────────────────
export async function getNextProjectCode(): Promise<string> {
  const { data } = await supabase
    .from('projects')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
  const lastId = data?.[0]?.id ?? 0
  return formatProjectCode(lastId + 1)
}

// ── Create project ───────────────────────────────────────────────────────────
type ProjectInput = Omit<Project, 'id' | 'project_code' | 'created_at' | 'updated_at' | 'created_by'>

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProjectInput) => {
      const project_code = await getNextProjectCode()
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...input, project_code })
        .select()
        .single()
      if (error) throw error
      return data as Project
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

// ── Update project ───────────────────────────────────────────────────────────
export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: number }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Project
    },
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', project.id] })
    },
  })
}

// ── Delete project ───────────────────────────────────────────────────────────
export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

// ── Stats helpers ────────────────────────────────────────────────────────────
export function useProjectStats(projects: Project[] | undefined) {
  if (!projects) return { total: 0, emAndamento: 0, hold: 0, concluido: 0, planejado: 0 }
  const count = (s: ProjectStatus) => projects.filter(p => p.status === s).length
  return {
    total: projects.length,
    emAndamento: count('Em andamento'),
    hold: count('Hold'),
    concluido: count('Concluído'),
    planejado: count('Planejado'),
  }
}
