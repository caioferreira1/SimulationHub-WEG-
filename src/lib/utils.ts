import type { Activity, ProjectStatus } from '../types'

export function getPastaTrabalho(
  code: string,
  tipo: string,
  caracteristica: string,
  linha: string
): string {
  return `${code}-${tipo}-${caracteristica}-${linha}`
}

export function formatProjectCode(num: number): string {
  return `ID${String(num).padStart(4, '0')}`
}

export function calcHorasColab(activity: Pick<Activity, 'apres_inicial' | 'geometria' | 'setup' | 'pos' | 'apres_final'>): number {
  return (
    (activity.apres_inicial || 0) +
    (activity.geometria || 0) +
    (activity.setup || 0) +
    (activity.pos || 0) +
    (activity.apres_final || 0)
  )
}

export function calcHorasTotais(activity: Pick<Activity, 'apres_inicial' | 'geometria' | 'setup' | 'solucao' | 'pos' | 'apres_final'>): number {
  return (
    (activity.apres_inicial || 0) +
    (activity.geometria || 0) +
    (activity.setup || 0) +
    (activity.solucao || 0) +
    (activity.pos || 0) +
    (activity.apres_final || 0)
  )
}

export function calcProjectHours(activities: Activity[]) {
  let horasColabTotal = 0
  let horasProcessTotal = 0
  let horasAbertas = 0
  let horasFechadas = 0

  for (const act of activities) {
    const colab = calcHorasColab(act)
    const total = calcHorasTotais(act)
    horasColabTotal += colab
    horasProcessTotal += act.solucao || 0

    if (act.status === 'Concluído') {
      horasFechadas += total
    } else {
      horasAbertas += total
    }
  }

  return { horasColabTotal, horasProcessTotal, horasAbertas, horasFechadas }
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function statusColor(status: ProjectStatus | string): string {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800'
    case 'Em andamento': return 'bg-blue-100 text-blue-800'
    case 'Planejado': return 'bg-gray-100 text-gray-700'
    case 'Hold': return 'bg-yellow-100 text-yellow-800'
    case 'Cancelado': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function prioridadeColor(prioridade: string): string {
  if (prioridade.startsWith('1')) return 'text-red-600 font-semibold'
  if (prioridade.startsWith('2')) return 'text-yellow-600'
  return 'text-gray-500'
}
