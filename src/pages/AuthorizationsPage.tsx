import { useState } from 'react'
import { ShieldCheck, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useUserProfiles, useUpdateUserProfile } from '../hooks/useUserProfiles'
import { APP_PAGES } from '../types'
import type { UserProfile, UserRole } from '../types'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  colaborador: 'Colaborador',
}

const STATUS_BADGE: Record<UserProfile['status'], { label: string; className: string; icon: React.ElementType }> = {
  pending:  { label: 'Pendente',  className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Aprovado',  className: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected: { label: 'Recusado',  className: 'bg-red-100 text-red-700',      icon: XCircle },
}

interface RowState {
  role: UserRole
  page_access: string[]
}

export function AuthorizationsPage() {
  const { data: profiles = [], isLoading, error } = useUserProfiles()
  const updateProfile = useUpdateUserProfile()

  // Local editing state per user id
  const [rowState, setRowState] = useState<Record<string, RowState>>({})
  const [savedRows, setSavedRows] = useState<Set<string>>(new Set())

  function getRow(profile: UserProfile): RowState {
    return rowState[profile.id] ?? { role: profile.role, page_access: profile.page_access }
  }

  function setRow(id: string, patch: Partial<RowState>) {
    setRowState(prev => ({ ...prev, [id]: { ...getRow({ id } as UserProfile), ...patch } }))
    setSavedRows(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  function togglePage(id: string, pageId: string, currentAccess: string[]) {
    const next = currentAccess.includes(pageId)
      ? currentAccess.filter(p => p !== pageId)
      : [...currentAccess, pageId]
    setRow(id, { page_access: next })
  }

  async function handleSave(profile: UserProfile) {
    const row = getRow(profile)
    await updateProfile.mutateAsync({ id: profile.id, updates: { role: row.role, page_access: row.page_access } })
    setSavedRows(prev => new Set(prev).add(profile.id))
  }

  async function handleApprove(profile: UserProfile) {
    const row = getRow(profile)
    await updateProfile.mutateAsync({
      id: profile.id,
      updates: { status: 'approved', role: row.role, page_access: row.page_access },
    })
  }

  async function handleReject(profile: UserProfile) {
    await updateProfile.mutateAsync({ id: profile.id, updates: { status: 'rejected' } })
  }

  async function handleRestore(profile: UserProfile) {
    await updateProfile.mutateAsync({ id: profile.id, updates: { status: 'pending' } })
  }

  const pending  = profiles.filter(p => p.status === 'pending')
  const rest     = profiles.filter(p => p.status !== 'pending')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-weg-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 p-6">
        <AlertCircle size={18} />
        <span className="text-sm">Erro ao carregar perfis de usuário.</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-weg-green/10 rounded-lg flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-weg-green" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Autorizações</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie o acesso dos usuários ao SimulationHub</p>
        </div>
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-yellow-600" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Aguardando aprovação ({pending.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pending.map(profile => {
              const row = getRow(profile)
              const isSaving = updateProfile.isPending
              return (
                <div key={profile.id} className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/40 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{profile.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Solicitou acesso em {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    {/* Role select */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Perfil</label>
                      <select
                        value={row.role}
                        onChange={e => setRow(profile.id, { role: e.target.value as UserRole })}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-weg-green"
                      >
                        <option value="colaborador">Colaborador</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Page access */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400">Páginas</label>
                      <div className="flex gap-3">
                        {APP_PAGES.map(page => (
                          <label key={page.id} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={row.page_access.includes(page.id)}
                              onChange={() => togglePage(profile.id, page.id, row.page_access)}
                              className="accent-weg-green"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{page.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:pt-4">
                      <button
                        onClick={() => handleReject(profile)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        Rejeitar
                      </button>
                      <button
                        onClick={() => handleApprove(profile)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-weg-green rounded-lg hover:bg-weg-dark transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        Aprovar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* All users table */}
      {rest.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Todos os usuários</h2>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Perfil</th>
                  {APP_PAGES.map(page => (
                    <th key={page.id} className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {page.label}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rest.map(profile => {
                  const row = getRow(profile)
                  const badge = STATUS_BADGE[profile.status]
                  const BadgeIcon = badge.icon
                  const isSaving = updateProfile.isPending
                  const wasSaved = savedRows.has(profile.id)
                  const isDirty =
                    row.role !== profile.role ||
                    JSON.stringify([...row.page_access].sort()) !== JSON.stringify([...profile.page_access].sort())

                  return (
                    <tr key={profile.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-gray-900 dark:text-white font-medium truncate block max-w-[220px]">
                          {profile.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                          <BadgeIcon size={11} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.role}
                          onChange={e => setRow(profile.id, { role: e.target.value as UserRole })}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-weg-green"
                        >
                          <option value="colaborador">Colaborador</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      {APP_PAGES.map(page => (
                        <td key={page.id} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.page_access.includes(page.id)}
                            onChange={() => togglePage(profile.id, page.id, row.page_access)}
                            className="accent-weg-green w-4 h-4"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {profile.status === 'rejected' && (
                            <button
                              onClick={() => handleRestore(profile)}
                              disabled={isSaving}
                              className="text-xs text-yellow-600 hover:text-yellow-700 underline disabled:opacity-50"
                            >
                              Reativar
                            </button>
                          )}
                          {isDirty && (
                            <button
                              onClick={() => handleSave(profile)}
                              disabled={isSaving}
                              className="text-xs font-medium text-white bg-weg-green px-3 py-1 rounded-lg hover:bg-weg-dark transition-colors disabled:opacity-50"
                            >
                              Salvar
                            </button>
                          )}
                          {wasSaved && !isDirty && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} /> Salvo
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {profiles.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">Nenhum usuário encontrado.</div>
      )}
    </div>
  )
}
