import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search, Filter, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useProjects, useUpdateProject } from '../hooks/useProjects'
import { useCompleteAllActivities } from '../hooks/useActivities'
import { StatusBadge, PrioridadeBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ProjectForm } from '../components/projects/ProjectForm'
import { formatDate } from '../lib/utils'
import {
  PROJECT_STATUSES, PROJECT_TIPOS, PROJECT_SECOES, COLABORADORES,
} from '../types'
import type { Project } from '../types'

type NavState = { filterStatus?: string; filterTipo?: string } | null

export function ProjectsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const navState = (location.state as NavState) ?? null

  const { data: projects = [], isLoading } = useProjects()
  const updateProject = useUpdateProject()
  const completeAllActivities = useCompleteAllActivities()

  const [showForm, setShowForm] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [completingId, setCompletingId] = useState<number | null>(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState(navState?.filterStatus ?? '')
  const [filterTipo, setFilterTipo] = useState(navState?.filterTipo ?? '')
  const [filterSecao, setFilterSecao] = useState('')
  const [filterColab, setFilterColab] = useState('')

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (search && !p.descricao.toLowerCase().includes(search.toLowerCase()) &&
          !p.solicitante.toLowerCase().includes(search.toLowerCase()) &&
          !p.project_code.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus && p.status !== filterStatus) return false
      if (filterTipo && p.tipo !== filterTipo) return false
      if (filterSecao && p.secao !== filterSecao) return false
      if (filterColab && p.colaborador !== filterColab) return false
      return true
    })
  }, [projects, search, filterStatus, filterTipo, filterSecao, filterColab])

  const hasFilters = filterStatus || filterTipo || filterSecao || filterColab

  async function handleComplete(e: React.MouseEvent, project: Project) {
    e.stopPropagation()
    setCompletingId(project.id)
    try {
      await completeAllActivities.mutateAsync(project.id)
      await updateProject.mutateAsync({ id: project.id, status: 'Concluído', andamento: 100 })
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Projetos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{projects.length} projetos cadastrados</p>
        </div>
        <button
          onClick={() => { setEditProject(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-weg-blue hover:bg-weg-blue-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo Projeto
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por descrição, solicitante ou ID..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-weg-blue focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Filter size={14} className="text-gray-400 dark:text-slate-500" />
          <Select value={filterStatus} onChange={setFilterStatus} placeholder="Status">
            {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filterTipo} onChange={setFilterTipo} placeholder="Tipo">
            {PROJECT_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select value={filterSecao} onChange={setFilterSecao} placeholder="Seção">
            {PROJECT_SECOES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filterColab} onChange={setFilterColab} placeholder="Colaborador">
            {COLABORADORES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          {hasFilters && (
            <button
              onClick={() => { setFilterStatus(''); setFilterTipo(''); setFilterSecao(''); setFilterColab('') }}
              className="text-xs text-weg-blue dark:text-blue-400 hover:text-weg-blue-dark underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-4 border-weg-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500">
            <p className="text-sm">Nenhum projeto encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">Linha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">Prioridade</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">Colaborador</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide w-32">Andamento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-400 text-xs uppercase tracking-wide">Entrada</th>
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map(project => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projetos/${project.id}`)}
                    className="group hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">{project.project_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-slate-200 truncate max-w-56">{project.descricao}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500">{project.solicitante}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{project.tipo}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400 whitespace-nowrap">{project.linha}</td>
                    <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                    <td className="px-4 py-3"><PrioridadeBadge prioridade={project.prioridade} /></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{project.colaborador}</td>
                    <td className="px-4 py-3">
                      <ProgressBar value={project.andamento} showLabel />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(project.data_entrada)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {project.status !== 'Concluído' && project.status !== 'Cancelado' && (
                          <button
                            onClick={(e) => handleComplete(e, project)}
                            title="Marcar como concluído"
                            className="p-1.5 rounded-md text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {completingId === project.id
                              ? <Loader2 size={14} className="animate-spin text-green-600" />
                              : <CheckCircle2 size={14} />
                            }
                          </button>
                        )}
                        <ChevronRight size={14} className="text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-right">
          Exibindo {filtered.length} de {projects.length} projetos
        </p>
      )}

      <ProjectForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditProject(null) }}
        project={editProject}
      />
    </div>
  )
}

function Select({
  value, onChange, placeholder, children
}: { value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs border border-gray-200 dark:border-slate-600 rounded-md px-2 py-1.5 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-weg-blue"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}
