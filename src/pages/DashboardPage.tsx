import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Play, PauseCircle, CheckCircle2, TrendingUp, Activity,
  X, Search, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { useProjects, useProjectStats } from '../hooks/useProjects'
import { StatusBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatDate, getPastaTrabalho } from '../lib/utils'
import { PROJECT_TIPOS } from '../types'
import type { Project } from '../types'
import { useTheme } from '../contexts/ThemeContext'

const STATUS_COLORS: Record<string, string> = {
  'Em andamento': '#009640',
  'Planejado':    '#3b82f6',
  'Hold':         '#f59e0b',
  'Concluído':    '#6ee7b7',
  'Cancelado':    '#ef4444',
}

interface ChartPanel {
  title: string
  projects: Project[]
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { data: projects = [], isLoading } = useProjects()
  const stats = useProjectStats(projects)
  const [activeTipoIdx, setActiveTipoIdx] = useState<number | null>(null)
  const [activeStatusIdx, setActiveStatusIdx] = useState<number | null>(null)
  const [chartPanel, setChartPanel] = useState<ChartPanel | null>(null)

  const tipoData = PROJECT_TIPOS
    .map(tipo => ({ tipo, total: projects.filter(p => p.tipo === tipo).length }))
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total)

  const statusData = [
    { name: 'Em andamento', value: stats.emAndamento },
    { name: 'Planejado',    value: stats.planejado },
    { name: 'Hold',         value: stats.hold },
    { name: 'Concluído',    value: stats.concluido },
    { name: 'Cancelado',    value: projects.filter(p => p.status === 'Cancelado').length },
  ].filter(d => d.value > 0)

  const recent = projects.slice(0, 6)

  const tickStyle = { fontSize: 11, fill: isDark ? '#94a3b8' : '#6b7280' }
  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#1a1a1a',
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-slate-900">
        <div className="w-6 h-6 border-4 border-weg-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Visão geral das simulações WMO-C</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de projetos"
          value={stats.total}
          icon={<FolderKanban size={18} />}
          color="blue"
          onClick={() => navigate('/projetos')}
        />
        <StatCard
          label="Em andamento"
          value={stats.emAndamento}
          icon={<Play size={18} />}
          color="blue"
          onClick={() => navigate('/projetos', { state: { filterStatus: 'Em andamento' } })}
        />
        <StatCard
          label="Hold"
          value={stats.hold}
          icon={<PauseCircle size={18} />}
          color="yellow"
          onClick={() => navigate('/projetos', { state: { filterStatus: 'Hold' } })}
        />
        <StatCard
          label="Concluídos"
          value={stats.concluido}
          icon={<CheckCircle2 size={18} />}
          color="green"
          onClick={() => navigate('/projetos', { state: { filterStatus: 'Concluído' } })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar chart — clicável por tipo */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-weg-blue dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Projetos por tipo</h2>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">Clique em uma barra para ver os projetos</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={tipoData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              onClick={(data) => {
                const payload = data?.activePayload?.[0]?.payload
                if (payload?.tipo) {
                  const filtered = projects.filter(p => p.tipo === payload.tipo)
                  setChartPanel({ title: `Tipo: ${payload.tipo}`, projects: filtered })
                }
              }}
            >
              <XAxis dataKey="tipo" tick={tickStyle} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#1e293b' : '#f3f4f6' }} formatter={(value: number) => [value, 'Projetos']} />
              <Bar
                dataKey="total"
                radius={[4, 4, 0, 0]}
                name="Projetos"
                cursor="pointer"
                onMouseEnter={(_: unknown, idx: number) => setActiveTipoIdx(idx)}
                onMouseLeave={() => setActiveTipoIdx(null)}
              >
                {tipoData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={activeTipoIdx === i ? '#001D5E' : i === 0 ? '#003087' : '#6B9FE4'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — clicável por status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-weg-blue dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Distribuição por status</h2>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">Clique em um segmento para ver os projetos</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                cursor="pointer"
                onMouseEnter={(_: unknown, idx: number) => setActiveStatusIdx(idx)}
                onMouseLeave={() => setActiveStatusIdx(null)}
                onClick={(entry: { name: string }) => {
                  const filtered = projects.filter(p => p.status === entry.name)
                  setChartPanel({ title: `Status: ${entry.name}`, projects: filtered })
                }}
              >
                {statusData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] ?? '#94a3b8'}
                    opacity={activeStatusIdx === null || activeStatusIdx === i ? 1 : 0.55}
                    stroke={activeStatusIdx === i ? '#374151' : 'none'}
                    strokeWidth={activeStatusIdx === i ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [value, name]} />
              <Legend
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent projects */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Projetos recentes</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {recent.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/projetos/${project.id}`)}
              className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <span className="font-mono text-xs text-gray-400 dark:text-slate-500 w-16">{project.project_code}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{project.descricao}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 truncate">{getPastaTrabalho(project.project_code, project.tipo, project.caracteristica, project.linha)}</div>
              </div>
              <StatusBadge status={project.status} />
              <span className="text-xs text-gray-400 dark:text-slate-500 hidden md:block">{formatDate(project.data_entrada)}</span>
              <ProgressBar value={project.andamento} className="w-20 hidden md:flex" showLabel />
            </div>
          ))}
        </div>
        {projects.length > 6 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={() => navigate('/projetos')}
              className="text-xs text-weg-blue dark:text-blue-400 hover:text-weg-blue-dark underline"
            >
              Ver todos os projetos →
            </button>
          </div>
        )}
      </div>

      {/* Chart filter panel */}
      {chartPanel && (
        <ChartFilterPanel
          title={chartPanel.title}
          projects={chartPanel.projects}
          onClose={() => setChartPanel(null)}
        />
      )}
    </div>
  )
}

function ChartFilterPanel({
  title,
  projects,
  onClose,
}: {
  title: string
  projects: Project[]
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = projects.filter(p =>
    p.descricao.toLowerCase().includes(search.toLowerCase()) ||
    p.project_code.toLowerCase().includes(search.toLowerCase()) ||
    p.colaborador.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">{filtered.length} projeto(s)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              autoFocus
              placeholder="Pesquisar projetos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-weg-blue"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-slate-700">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
              Nenhum projeto encontrado
            </div>
          ) : (
            filtered.map(project => (
              <div
                key={project.id}
                onClick={() => { navigate(`/projetos/${project.id}`); onClose() }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <span className="font-mono text-xs text-gray-400 dark:text-slate-500 w-16 flex-shrink-0">
                  {project.project_code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{project.descricao}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500">{project.colaborador || '—'}</div>
                </div>
                <StatusBadge status={project.status} />
                <ChevronRight size={14} className="text-gray-300 dark:text-slate-600 flex-shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, color, onClick,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow'
  onClick?: () => void
}) {
  const colors = {
    blue:   'bg-weg-blue-light text-weg-blue dark:bg-weg-blue/20 dark:text-blue-400',
    green:  'bg-weg-light text-weg-green dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}
