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

export function calcProjectProgress(activities: Activity[]): number {
  if (activities.length === 0) return 0

  const totalHours = activities.reduce((sum, act) => sum + calcHorasTotais(act), 0)

  if (totalHours === 0) {
    const completed = activities.filter(a => a.status === 'Concluído').length
    return Math.round((completed / activities.length) * 100)
  }

  const completedHours = activities
    .filter(a => a.status === 'Concluído')
    .reduce((sum, act) => sum + calcHorasTotais(act), 0)

  return Math.round((completedHours / totalHours) * 100)
}

export function calcDataFim(
  dataInicio: string,
  horasTotais: number,
): { dataFim: string; dias: number } {
  const HOURS_PER_DAY = 8

  if (!dataInicio) return { dataFim: '', dias: 0 }
  if (horasTotais <= 0) return { dataFim: dataInicio, dias: 0 }

  const diasNecessarios = Math.ceil(horasTotais / HOURS_PER_DAY)
  const [y, m, d] = dataInicio.split('-').map(Number)
  let current = new Date(y, m - 1, d)

  // If start is on weekend, advance to next Monday
  while (current.getDay() === 0 || current.getDay() === 6) {
    current.setDate(current.getDate() + 1)
  }

  // Advance (diasNecessarios - 1) additional working days
  let remaining = diasNecessarios - 1
  while (remaining > 0) {
    current.setDate(current.getDate() + 1)
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      remaining--
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const dataFim = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`
  return { dataFim, dias: Math.round((horasTotais / HOURS_PER_DAY) * 10) / 10 }
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
