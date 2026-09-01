import { supabase } from '@/lib/supabase'

export type Workout = {
  id: string
  nome: string
  ordem: number
  criado_em: string
}

export type WorkoutExercise = {
  id: string
  workout_id: string
  nome: string
  ordem: number
  series_alvo: number
}

export async function listWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase.from('workouts').select('*').order('ordem')
  if (error) throw error
  return data
}

export async function getWorkout(id: string): Promise<Workout | null> {
  const { data, error } = await supabase.from('workouts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createWorkout(userId: string, nome: string): Promise<Workout> {
  const workouts = await listWorkouts()
  const ordem = workouts.length
  const { data, error } = await supabase
    .from('workouts')
    .insert({ user_id: userId, nome, ordem })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameWorkout(id: string, nome: string): Promise<void> {
  const { error } = await supabase.from('workouts').update({ nome }).eq('id', id)
  if (error) throw error
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) throw error
}

export async function listWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('ordem')
  if (error) throw error
  return data
}

export async function addWorkoutExercise(
  workoutId: string,
  nome: string,
  seriesAlvo: number,
): Promise<WorkoutExercise> {
  const exercises = await listWorkoutExercises(workoutId)
  const ordem = exercises.length
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({ workout_id: workoutId, nome, ordem, series_alvo: seriesAlvo })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameWorkoutExercise(id: string, nome: string): Promise<void> {
  const { error } = await supabase.from('workout_exercises').update({ nome }).eq('id', id)
  if (error) throw error
}

export async function updateSeriesAlvo(id: string, seriesAlvo: number): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .update({ series_alvo: seriesAlvo })
    .eq('id', id)
  if (error) throw error
}

export async function deleteWorkoutExercise(id: string): Promise<void> {
  const { error } = await supabase.from('workout_exercises').delete().eq('id', id)
  if (error) throw error
}

export type ExerciseOption = {
  id: string
  nome: string
  ordem: number
  workoutId: string
  workoutNome: string
  workoutOrdem: number
}

export async function listAllWorkoutExercises(): Promise<ExerciseOption[]> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('id, nome, ordem, workout:workouts(id, nome, ordem)')
  if (error) throw error
  return (
    data as unknown as {
      id: string
      nome: string
      ordem: number
      workout: { id: string; nome: string; ordem: number } | null
    }[]
  )
    .map((row) => ({
      id: row.id,
      nome: row.nome,
      ordem: row.ordem,
      workoutId: row.workout?.id ?? '',
      workoutNome: row.workout?.nome ?? '',
      workoutOrdem: row.workout?.ordem ?? 0,
    }))
    .sort((a, b) => a.workoutOrdem - b.workoutOrdem || a.ordem - b.ordem)
}

export async function reorderWorkoutExercises(exercises: WorkoutExercise[]): Promise<void> {
  await Promise.all(
    exercises.map((exercise, ordem) =>
      supabase.from('workout_exercises').update({ ordem }).eq('id', exercise.id),
    ),
  )
}
