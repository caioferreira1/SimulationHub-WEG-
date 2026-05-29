import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Plus, Copy, Check, Trash2, Clock,
  FolderOpen, CalendarDays,
} from 'lucide-react'
import { useProject } from '../hooks/useProjects'
import { useActivities, useDeleteActivity } from '../hooks/useActivities'
import { ProjectForm } from '../components/projects/ProjectForm'
import { ActivityForm } from '../components/activities/ActivityForm'
import { StatusBadge, PrioridadeBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import {
  formatDate, getPastaTrabalho, calcHorasColab, calcHorasTotais, calcProjectHours,
} from '../lib/utils'
import type { Activity } from '../types'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = Number(id)

  const { data: project, isLoading: loadingProject } = useProject(projectId)
  const { data: activities = [], isLoading: loadingActivities } = useActivities(projectId)
  const deleteActivity = useDeleteActivity()

  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)
  const [copiedPasta, setCopiedPasta] = useState(false)

  if (loadingProject) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-4 border-weg-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return <div className="p-6 text-gray-500">Projeto não encontrado.</div>
  }

  const pastaTrabalho = getPastaTrabalho(project.project_code, project.tipo, project.caracteristica, project.linha)
  const hours = calcProjectHours(activities)

  function copyPasta() {
    navigator.clipboard.writeText(pastaTrabalho)
    setCopiedPasta(true)
    setTimeout(() => setCopiedPasta(false), 2000)
  }

  async function handleDeleteActivity(actId: number) {
    if (!confirm('Excluir esta atividade?')) return
    await deleteActivity.mutateAsync({ id: actId, projectId })
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Back */}
      <button
        onClick={() => navigate('/projetos')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Projetos
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-gray-400">{project.project_code}</span>
              <StatusBadge status={project.status} />
              <PrioridadeBadge prioridade={project.prioridade} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{project.descricao}</h1>

            {/* Pasta */}
            <div className="flex items-center gap-2 mt-2 bg-weg-light rounded-lg px-3 py-2 w-fit max-w-full">
              <FolderOpen size={14} className="text-weg-dark flex-shrink-0" />
              <code className="text-xs text-weg-dark font-mono truncate">{pastaTrabalho}</code>
              <button onClick={copyPasta} className="p-0.5 hover:text-weg-dark text-weg-green/70 flex-shrink-0">
                {copiedPasta ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowProjectForm(true)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <Edit2 size={14} /> Editar
          </button>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100">
          <MetaItem label="Tipo">{project.tipo}</MetaItem>
          <MetaItem label="Linha">{project.linha}</MetaItem>
          <MetaItem label="Seção">{project.secao}</MetaItem>
          <MetaItem label="Característica">{project.caracteristica}</MetaItem>
          <MetaItem label="Solicitante">{project.solicitante}</MetaItem>
          <MetaItem label="Colaborador">{project.colaborador}</MetaItem>
          <MetaItem label="Data entrada">{formatDate(project.data_entrada)}</MetaItem>
          <MetaItem label="Data final">{formatDate(project.data_final)}</MetaItem>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Andamento</span>
            <span>{project.andamento}%</span>
          </div>
          <ProgressBar value={project.andamento} />
        </div>
      </div>

      {/* Hours summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <HourCard label="Horas colaborador" value={hours.horasColabTotal} icon={<Clock size={16} />} />
        <HourCard label="Horas processamento" value={hours.horasProcessTotal} icon={<Clock size={16} />} />
        <HourCard label="Horas em aberto" value={hours.horasAbertas} color="yellow" icon={<CalendarDays size={16} />} />
        <HourCard label="Horas concluídas" value={hours.horasFechadas} color="green" icon={<Check size={16} />} />
      </div>

      {/* Activities */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Atividades</h2>
            <p className="text-xs text-gray-400">{activities.length} atividade{activities.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => { setEditActivity(null); setShowActivityForm(true) }}
            className="flex items-center gap-1.5 text-sm bg-weg-green hover:bg-weg-dark text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} /> Nova atividade
          </button>
        </div>

        {loadingActivities ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-4 border-weg-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Nenhuma atividade ainda.</p>
            <p className="text-xs mt-1">Clique em "Nova atividade" para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">H. Colab</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">H. Total</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Período</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Colaborador</th>
                  <th className="px-4 py-2.5 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map(act => {
                  const hColab = calcHorasColab(act)
                  const hTotal = calcHorasTotais(act)
                  return (
                    <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-800">{act.descricao}</td>
                      <td className="px-4 py-3 text-right text-gray-600 font-mono text-xs">{hColab.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 font-mono text-xs">{hTotal.toFixed(1)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(act.data_inicio)} → {formatDate(act.data_fim)}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={act.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{act.colaborador ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditActivity(act); setShowActivityForm(true) }}
                            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectForm
        open={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        project={project}
      />
      <ActivityForm
        open={showActivityForm}
        onClose={() => { setShowActivityForm(false); setEditActivity(null) }}
        projectId={projectId}
        activity={editActivity}
      />
    </div>
  )
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm text-gray-800 font-medium">{children}</div>
    </div>
  )
}

function HourCard({
  label, value, color = 'default', icon
}: { label: string; value: number; color?: 'default' | 'green' | 'yellow'; icon: React.ReactNode }) {
  const colors = {
    default: 'bg-white border-gray-200',
    green: 'bg-weg-light border-weg-green/30',
    yellow: 'bg-yellow-50 border-yellow-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>
      <div className="text-xl font-bold text-gray-900">{value.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-1">h</span></div>
    </div>
  )
}
