import type { SetForAggregation } from '@/lib/aggregation'
import { supabase } from '@/lib/supabase'

export type SetInput = {
  workoutExerciseId: string
  numeroSerie: number
  peso: number
  repeticoes: number
}

export async function createSessionWithSets(
  userId: string,
  workoutId: string,
  data: string,
  sets: SetInput[],
): Promise<void> {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({ user_id: userId, workout_id: workoutId, data })
    .select()
    .single()
  if (sessionError) throw sessionError

  if (sets.length === 0) return

  const { error: setsError } = await supabase.from('session_sets').insert(
    sets.map((set) => ({
      session_id: session.id,
      workout_exercise_id: set.workoutExerciseId,
      numero_serie: set.numeroSerie,
      peso: set.peso,
      repeticoes: set.repeticoes,
    })),
  )
  if (setsError) throw setsError
}

export type SessionSummary = {
  id: string
  data: string
  workout: { id: string; nome: string } | null
}

export async function listSessions(): Promise<SessionSummary[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, data, workout:workouts(id, nome)')
    .order('data', { ascending: false })
  if (error) throw error
  return data as unknown as SessionSummary[]
}

export type SessionSetDetail = {
  id: string
  numero_serie: number
  peso: number
  repeticoes: number
  workout_exercise: { nome: string } | null
}

export async function listSessionSets(sessionId: string): Promise<SessionSetDetail[]> {
  const { data, error } = await supabase
    .from('session_sets')
    .select('id, numero_serie, peso, repeticoes, workout_exercise:workout_exercises(nome)')
    .eq('session_id', sessionId)
    .order('numero_serie')
  if (error) throw error
  return data as unknown as SessionSetDetail[]
}

export async function listSetsForExercise(workoutExerciseId: string): Promise<SetForAggregation[]> {
  const { data, error } = await supabase
    .from('session_sets')
    .select('peso, repeticoes, session:sessions(data)')
    .eq('workout_exercise_id', workoutExerciseId)
  if (error) throw error
  return (data as unknown as { peso: number; repeticoes: number; session: { data: string } | null }[])
    .filter((row) => row.session !== null)
    .map((row) => ({ data: row.session!.data, peso: row.peso, repeticoes: row.repeticoes }))
}

export type UltimaSerie = {
  numeroSerie: number
  peso: number
  repeticoes: number
}

export type UltimaSessaoExercicio = {
  data: string
  series: UltimaSerie[]
}

/** Séries da sessão mais recente em que esse exercício foi registrado, para
 * servir de referência ("última vez você fez X") ao registrar uma nova
 * sessão. Retorna null se o exercício nunca foi registrado.
 *
 * Importante: identifica a sessão mais recente por id (não só pela data),
 * já que pode existir mais de uma sessão na mesma data — usar só a data
 * juntaria séries de sessões diferentes num "última vez" inflado. */
export async function getUltimaSessaoExercicio(
  workoutExerciseId: string,
): Promise<UltimaSessaoExercicio | null> {
  const { data, error } = await supabase
    .from('session_sets')
    .select('numero_serie, peso, repeticoes, session:sessions(id, data, criado_em)')
    .eq('workout_exercise_id', workoutExerciseId)
  if (error) throw error

  const rows = (
    data as unknown as {
      numero_serie: number
      peso: number
      repeticoes: number
      session: { id: string; data: string; criado_em: string } | null
    }[]
  ).filter((row) => row.session !== null)

  if (rows.length === 0) return null

  const ultimaSessao = rows.reduce((maisRecente, row) => {
    const sessao = row.session!
    if (!maisRecente) return sessao
    if (sessao.data !== maisRecente.data) {
      return sessao.data > maisRecente.data ? sessao : maisRecente
    }
    return sessao.criado_em > maisRecente.criado_em ? sessao : maisRecente
  }, null as { id: string; data: string; criado_em: string } | null)!

  const series = rows
    .filter((row) => row.session!.id === ultimaSessao.id)
    .sort((a, b) => a.numero_serie - b.numero_serie)
    .map((row) => ({ numeroSerie: row.numero_serie, peso: row.peso, repeticoes: row.repeticoes }))

  return { data: ultimaSessao.data, series }
}
