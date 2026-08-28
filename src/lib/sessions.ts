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
