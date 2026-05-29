import { useNavigate } from 'react-router-dom'
import { FolderKanban, Play, PauseCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useProjects, useProjectStats } from '../hooks/useProjects'
import { StatusBadge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatDate, getPastaTrabalho } from '../lib/utils'
import { PROJECT_TIPOS } from '../types'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: projects = [], isLoading } = useProjects()
  const stats = useProjectStats(projects)

  // Bar chart: projects by tipo
  const tipoData = PROJECT_TIPOS
    .map(tipo => ({ tipo, total: projects.filter(p => p.tipo === tipo).length }))
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total)

  // Recent projects
  const recent = projects.slice(0, 6)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-4 border-weg-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral das simulações WMO-C</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de projetos"
          value={stats.total}
          icon={<FolderKanban size={18} />}
          color="blue"
        />
        <StatCard
          label="Em andamento"
          value={stats.emAndamento}
          icon={<Play size={18} />}
          color="blue"
        />
        <StatCard
          label="Hold"
          value={stats.hold}
          icon={<PauseCircle size={18} />}
          color="yellow"
        />
        <StatCard
          label="Concluídos"
          value={stats.concluido}
          icon={<CheckCircle2 size={18} />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-weg-green" />
            <h2 className="text-sm font-semibold text-gray-900">Projetos por tipo</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tipoData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="tipo" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Projetos">
                {tipoData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#009640' : '#6ee7b7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Distribuição por status</h2>
          <div className="space-y-3">
            {[
              { status: 'Em andamento', count: stats.emAndamento },
              { status: 'Planejado',    count: stats.planejado },
              { status: 'Hold',         count: stats.hold },
              { status: 'Concluído',    count: stats.concluido },
              { status: 'Cancelado',    count: projects.filter(p => p.status === 'Cancelado').length },
            ].map(({ status, count }) => (
              <div key={status} className="flex items-center gap-3">
                <StatusBadge status={status} className="w-28 justify-center" />
                <ProgressBar value={stats.total ? (count / stats.total) * 100 : 0} className="flex-1" />
                <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Projetos recentes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recent.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/projetos/${project.id}`)}
              className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span className="font-mono text-xs text-gray-400 w-16">{project.project_code}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{project.descricao}</div>
                <div className="text-xs text-gray-400 truncate">{getPastaTrabalho(project.project_code, project.tipo, project.caracteristica, project.linha)}</div>
              </div>
              <StatusBadge status={project.status} />
              <span className="text-xs text-gray-400 hidden md:block">{formatDate(project.data_entrada)}</span>
              <ProgressBar value={project.andamento} className="w-20 hidden md:flex" showLabel />
            </div>
          ))}
        </div>
        {projects.length > 6 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => navigate('/projetos')}
              className="text-xs text-weg-green hover:text-weg-dark underline"
            >
              Ver todos os projetos →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, color
}: { label: string; value: number; icon: React.ReactNode; color: 'blue' | 'green' | 'yellow' }) {
  const colors = {
    blue:   'bg-blue-50   text-blue-600',
    green:  'bg-weg-light text-weg-green',
    yellow: 'bg-yellow-50 text-yellow-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
