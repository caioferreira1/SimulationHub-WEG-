import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { useCreateActivity, useUpdateActivity } from '../../hooks/useActivities'
import { PROJECT_STATUSES, COLABORADORES } from '../../types'
import type { Activity } from '../../types'
import { calcHorasColab, calcHorasTotais, calcDataFim, formatDate } from '../../lib/utils'

const schema = z.object({
  descricao:     z.string().min(1, 'Obrigatório'),
  apres_inicial: z.number().min(0),
  geometria:     z.number().min(0),
  setup:         z.number().min(0),
  solucao:       z.number().min(0),
  pos:           z.number().min(0),
  apres_final:   z.number().min(0),
  dias:          z.number().min(0),
  data_inicio:   z.string().nullable().optional(),
  data_fim:      z.string().nullable().optional(),
  status:        z.string().min(1),
  colaborador:   z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

const HORA_FIELDS: { key: keyof FormData; label: string }[] = [
  { key: 'apres_inicial', label: 'Apres. Inicial' },
  { key: 'geometria',     label: 'Geometria' },
  { key: 'setup',         label: 'Setup' },
  { key: 'solucao',       label: 'Solução (proc.)' },
  { key: 'pos',           label: 'Pós-proc.' },
  { key: 'apres_final',   label: 'Apres. Final' },
]

interface Props {
  open: boolean
  onClose: () => void
  projectId: number
  activity?: Activity | null
}

export function ActivityForm({ open, onClose, projectId, activity }: Props) {
  const isEdit = !!activity
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: '', apres_inicial: 0, geometria: 0, setup: 0,
      solucao: 0, pos: 0, apres_final: 0, dias: 0,
      data_inicio: null, data_fim: null, status: 'Planejado', colaborador: null,
    },
  })

  useEffect(() => {
    if (open && activity) {
      reset({
        descricao: activity.descricao,
        apres_inicial: activity.apres_inicial,
        geometria: activity.geometria,
        setup: activity.setup,
        solucao: activity.solucao,
        pos: activity.pos,
        apres_final: activity.apres_final,
        dias: activity.dias,
        data_inicio: activity.data_inicio ?? null,
        data_fim: activity.data_fim ?? null,
        status: activity.status,
        colaborador: activity.colaborador ?? null,
      })
    } else if (open && !activity) {
      reset({
        descricao: '', apres_inicial: 0, geometria: 0, setup: 0,
        solucao: 0, pos: 0, apres_final: 0, dias: 0,
        data_inicio: null, data_fim: null, status: 'Planejado', colaborador: null,
      })
    }
  }, [open, activity, reset])

  const values = watch()
  const horasColab = calcHorasColab(values as any)
  const horasTotais = calcHorasTotais(values as any)

  // Auto-calculate data_fim and dias from data_inicio + hours
  const dataInicio = values.data_inicio ?? ''
  const computed = dataInicio ? calcDataFim(dataInicio, horasTotais) : null

  useEffect(() => {
    if (!dataInicio) return
    const { dataFim, dias } = calcDataFim(dataInicio, horasTotais)
    setValue('data_fim', dataFim || null)
    setValue('dias', dias)
  }, [dataInicio, horasTotais, setValue])

  async function onSubmit(data: FormData) {
    try {
      if (isEdit) {
        await updateActivity.mutateAsync({
          id: activity!.id,
          ...data,
          data_inicio: data.data_inicio || null,
          data_fim: data.data_fim || null,
          colaborador: data.colaborador || null,
        } as any)
      } else {
        await createActivity.mutateAsync({
          project_id: projectId,
          ...data,
          data_inicio: data.data_inicio || null,
          data_fim: data.data_fim || null,
          colaborador: data.colaborador || null,
        } as any)
      }
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Atividade' : 'Nova Atividade'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <Field label="Descrição do trabalho" error={errors.descricao?.message}>
          <input {...register('descricao')} className={inp()} placeholder="Ex: Simulação estrutural - Rodada 1" />
        </Field>

        {/* Horas por fase */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Horas por fase</div>
          <div className="grid grid-cols-3 gap-3">
            {HORA_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type="number" step="0.25" min="0"
                  {...register(key, { valueAsNumber: true })}
                  className={inp()}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview horas */}
        <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 text-xs">Horas colaborador</span>
            <div className="font-semibold text-gray-900">{horasColab.toFixed(2)} h</div>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Horas totais (incl. proc.)</span>
            <div className="font-semibold text-gray-900">{horasTotais.toFixed(2)} h</div>
          </div>
        </div>

        {/* Data início + preview calculado */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Data início">
            <input type="date" {...register('data_inicio')} className={inp()} />
          </Field>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data fim <span className="text-gray-400">(calculada)</span></label>
            <div className={`${inp()} bg-gray-50 text-gray-500 cursor-default select-none`}>
              {computed ? formatDate(computed.dataFim) : '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Dias úteis <span className="text-gray-400">(calculados)</span></label>
            <div className={`${inp()} bg-gray-50 text-gray-500 cursor-default select-none`}>
              {computed ? computed.dias.toFixed(1) : '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status" error={errors.status?.message}>
            <select {...register('status')} className={inp()}>
              {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Colaborador">
            <select {...register('colaborador')} className={inp()}>
              <option value="">— selecionar —</option>
              {COLABORADORES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            className="px-5 py-2 text-sm bg-weg-green hover:bg-weg-dark text-white rounded-lg font-medium transition-colors disabled:opacity-60">
            {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
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

function inp() {
  return 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-weg-green focus:border-transparent'
}
