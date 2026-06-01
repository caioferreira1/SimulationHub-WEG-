// ============================================================
// USER PROFILES
// ============================================================
export type UserRole = 'admin' | 'colaborador'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  page_access: string[]
  created_at: string
  updated_at: string
}

export const APP_PAGES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projetos', label: 'Projetos' },
] as const

export type AppPageId = (typeof APP_PAGES)[number]['id']

// ============================================================
// PROJECTS & ACTIVITIES
// ============================================================
export type ProjectStatus =
  | 'Planejado'
  | 'Em andamento'
  | 'Hold'
  | 'Concluído'
  | 'Cancelado'

export type ActivityStatus =
  | 'Planejado'
  | 'Em andamento'
  | 'Hold'
  | 'Concluído'
  | 'Cancelado'

export type ProjectTipo =
  | 'Estrutural'
  | 'CFD'
  | 'Toleranciamento'
  | 'Injecao'
  | 'Eletromagnetica'
  | 'Ensaio'
  | 'GVM'
  | 'GVE'
  | 'Boletim'
  | 'Patentes'
  | 'Outros'
  | 'Cursos'

export type ProjectSecao = 'Comercial' | 'Externo' | 'Appliance'

export type ProjectCaracteristica =
  | 'Desenvolvimento'
  | 'Apoio'
  | 'Consulta'
  | 'Inovacao'
  | 'Ensaio'
  | 'Treinamento'

export type ProjectPrioridade = '1. Alta' | '2. Média' | '3. Baixa'

export interface Project {
  id: number
  project_code: string
  descricao: string
  tipo: ProjectTipo
  linha: string
  secao: ProjectSecao
  caracteristica: ProjectCaracteristica
  data_entrada: string
  prioridade: ProjectPrioridade
  solicitante: string
  status: ProjectStatus
  colaborador: string
  andamento: number
  data_final: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface Activity {
  id: number
  project_id: number
  descricao: string
  apres_inicial: number
  geometria: number
  setup: number
  solucao: number
  pos: number
  apres_final: number
  dias: number
  data_inicio: string | null
  data_fim: string | null
  status: ActivityStatus
  colaborador: string | null
  created_at: string
}

export interface ProjectWithStats extends Project {
  activities?: Activity[]
  horas_colab_total: number
  horas_proces_total: number
  horas_abertas: number
  horas_fechadas: number
}

export const PROJECT_TIPOS: ProjectTipo[] = [
  'Estrutural', 'CFD', 'Toleranciamento', 'Injecao', 'Eletromagnetica',
  'Ensaio', 'GVM', 'GVE', 'Boletim', 'Patentes', 'Outros', 'Cursos',
]

export const PROJECT_SECOES: ProjectSecao[] = ['Comercial', 'Externo', 'Appliance']

export const PROJECT_CARACTERISTICAS: ProjectCaracteristica[] = [
  'Desenvolvimento', 'Apoio', 'Consulta', 'Inovacao', 'Ensaio', 'Treinamento',
]

export const PROJECT_PRIORIDADES: ProjectPrioridade[] = ['1. Alta', '2. Média', '3. Baixa']

export const PROJECT_STATUSES: ProjectStatus[] = [
  'Planejado', 'Em andamento', 'Hold', 'Concluído', 'Cancelado',
]

export const COLABORADORES = ['andreyb', 'lfazolo', 'wholler', 'caioof', 'pauletti']

export const LINHAS_SUGERIDAS = [
  'W01', 'W22', 'W30', 'W30 Radial', 'W30 Slim', 'WFL', 'WMP', 'WCA1', 'WCA2',
  'WSC2', 'WSC3', 'WFF2', 'WCF1', 'NEMA 36', 'N36 WMX', 'AC PM', 'BLDC', 'Compact',
  'Mini', 'Stihl', 'Liberty', 'Busch', 'Pfeiffer', 'Leybold', 'Geral', 'Especial', 'Consulta',
]
