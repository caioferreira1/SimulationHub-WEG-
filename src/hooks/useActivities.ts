import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types'

// ── Fetch activities for a project ───────────────────────────────────────────
export function useActivities(projectId: number) {
  return useQuery({
    queryKey: ['activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', projectId)
        .order('id', { ascending: false })
      if (error) throw error
      return data as Activity[]
    },
    enabled: !!projectId,
  })
}

// ── Create activity ──────────────────────────────────────────────────────────
type ActivityInput = Omit<Activity, 'id' | 'created_at'>

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ActivityInput) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data as Activity
    },
    onSuccess: (act) => {
      qc.invalidateQueries({ queryKey: ['activities', act.project_id] })
    },
  })
}

// ── Update activity ──────────────────────────────────────────────────────────
export function useUpdateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Activity> & { id: number }) => {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Activity
    },
    onSuccess: (act) => {
      qc.invalidateQueries({ queryKey: ['activities', act.project_id] })
    },
  })
}

// ── Delete activity ──────────────────────────────────────────────────────────
export function useDeleteActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: number; projectId: number }) => {
      const { error } = await supabase.from('activities').delete().eq('id', id)
      if (error) throw error
      return projectId
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ['activities', projectId] })
    },
  })
}
