import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { UserProfile, UserRole, UserStatus } from '../types'

export function useUserProfiles() {
  return useQuery({
    queryKey: ['user_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as UserProfile[]
    },
  })
}

interface UpdateProfileArgs {
  id: string
  updates: Partial<Pick<UserProfile, 'role' | 'status' | 'page_access'>>
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateProfileArgs) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profiles'] })
    },
  })
}

export type { UserRole, UserStatus }
