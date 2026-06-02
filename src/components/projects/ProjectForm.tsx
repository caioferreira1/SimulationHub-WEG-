import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { useCreateProject, useUpdateProject, getNextProjectCode } from '../../hooks/useProjects'
import {
  PROJECT_TIPOS, PROJECT_SECOES, PROJECT_CARACTERISTICAS,
  PROJECT_PRIORIDADES, PROJECT_STATUSES, COLABORADORES, LINHAS_SUGERIDAS,
} from '../../types'
import type { Project } from '../../types'
import { getPastaTrabalho } from '../../lib/utils'

const schema = z.object({
  descricao:     z.string().min(3, 'Mínimo 3 caracteres'),
  tipo:          z.string().min(1, 'Obrigatório'),
  linha:         z.string().min(1, 'Obrigatório'),
  secao:         z.string().min(1, 'Obrigatório'),
  caracteristica:z.string().min(1, 'Obrigatório'),
  data_entrada:  z.string().min(1, 'Obrigatório'),
  prioridade:    z.string().min(1, 'Obrigatório'),
  solicitante:   z.string().min(1, 'Obrigatório'),
  status:        z.string().min(1, 'Obrigatório'),
  colaborador:   z.string().min(1, 'Obrigatório'),
  data_final:    z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  project?: Project | null
}

export function ProjectForm({ open, onClose, project }: Props) {
  const isEdit = !!project
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const [nextCode, setNextCode] = useState('')
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: '', tipo: 'Estrutural', linha: 'W01', secao: 'Comercial',
      caracteristica: 'Desenvolvimento', data_entrada: new Date().toISOString().split('T')[0],
      prioridade: '2. Média', solicitante: '', status: 'Planejado',
      colaborador: COLABORADORES[0], data_final: null,
    },
  })

  // Load project data for edit
  useEffect(() => {
    if (open && project) {
      reset({
        descricao: project.descricao,
        tipo: project.tipo,
        linha: project.linha,
        secao: project.secao,
        caracteristica: project.caracteristica,
        data_entrada: project.data_entrada,
        prioridade: project.prioridade,
        solicitante: project.solicitante,
        status: project.status,
        colaborador: project.colaborador,
        data_final: project.data_final ?? null,
      })
    } else if (open && !project) {
      reset({
        descricao: '', tipo: 'Estrutural', linha: 'W01', secao: 'Comercial',
        caracteristica: 'Desenvolvimento', data_entrada: new Date().toISOString().split('T')[0],
        prioridade: '2. Média', solicitante: '', status: 'Planejado',
        colaborador: COLABORADORES[0], data_final: null,
      })
      getNextProjectCode().then(setNextCode)
    }
  }, [open, project, reset])

  const tipo = watch('tipo')
  const linha = watch('linha')
  const caracteristica = watch('caracteristica')
  const displayCode = isEdit ? project!.project_code : (nextCode || '...')
  const pastaTrabalho = getPastaTrabalho(displayCode, tipo, caracteristica, linha)

  async function onSubmit(data: FormData) {
    try {
      if (isEdit) {
        await updateProject.mutateAsync({ id: project!.id, ...data, data_final: data.data_final || null } as any)
      } else {
        await createProject.mutateAsync({ ...data, andamento: 0, data_final: data.data_final || null } as any)
      }
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  function copyPasta() {
    navigator.clipboard.writeText(pastaTrabalho)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Projeto' : 'Novo Projeto'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Pasta preview */}
        <div className="bg-weg-light border border-weg-green/30 rounded-lg px-4 py-3">
          <div className="text-xs text-weg-dark font-medium mb-1">Pasta de trabalho gerada</div>
          <div className="flex items-center gap-2">
            <code className="text-sm text-weg-dark font-mono flex-1 break-all">{pastaTrabalho}</code>
            <button type="button" onClick={copyPasta} className="p-1.5 rounded-md hover:bg-weg-green/20 text-weg-dark transition-colors flex-shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">ID: <span className="font-mono">{displayCode}</span></div>
        </div>

        {/* Row 1 */}
        <Field label="Descrição" error={errors.descricao?.message}>
          <input {...register('descricao')} className={input()} placeholder="Ex: Análise estrutural tampa traseira" />
        </Field>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo" error={errors.tipo?.message}>
            <select {...register('tipo')} className={input()}>
              {PROJECT_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Linha" error={errors.linha?.message}>
            <div className="flex gap-1">
              <select
                value={LINHAS_SUGERIDAS.includes(watch('linha')) ? watch('linha') : '__custom'}
                onChange={e => {
                  if (e.target.value !== '__custom') setValue('linha', e.target.value, { shouldValidate: true })
                }}
                className={input() + ' flex-1'}
              >
                {LINHAS_SUGERIDAS.map(l => <option key={l} value={l}>{l}</option>)}
                <option value="__custom">Outro...</option>
              </select>
              {(!LINHAS_SUGERIDAS.includes(watch('linha'))) && (
                <input
                  {...register('linha')}
                  placeholder="Linha"
                  className={input() + ' flex-1'}
                />
              )}
            </div>
          </Field>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Seção" error={errors.secao?.message}>
            <select {...register('secao')} className={input()}>
              {PROJECT_SECOES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Característica" error={errors.caracteristica?.message}>
            <select {...register('caracteristica')} className={input()}>
              {PROJECT_CARACTERISTICAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="Data de entrada" error={errors.data_entrada?.message}>
            <input type="date" {...register('data_entrada')} className={input()} />
          </Field>
          <Field label="Prioridade" error={errors.prioridade?.message}>
            <select {...register('prioridade')} className={input()}>
              {PROJECT_PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Data final" error={errors.data_final?.message}>
            <input type="date" {...register('data_final')} className={input()} />
          </Field>
        </div>

        {/* Row 5 */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Solicitante" error={errors.solicitante?.message}>
            <input {...register('solicitante')} className={input()} placeholder="Ex: PATRICKL" />
          </Field>
          <Field label="Colaborador" error={errors.colaborador?.message}>
            <select {...register('colaborador')} className={input()}>
              {COLABORADORES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        {/* Row 6 */}
        <Field label="Status" error={errors.status?.message}>
          <select {...register('status')} className={input()}>
            {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-5 py-2 text-sm bg-weg-green hover:bg-weg-dark text-white rounded-lg font-medium transition-colors disabled:opacity-60">
            {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar projeto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

function input() {
  return 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-weg-green focus:border-transparent'
}
