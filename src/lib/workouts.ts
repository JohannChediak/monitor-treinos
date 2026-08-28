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

export async function addWorkoutExercise(workoutId: string, nome: string): Promise<WorkoutExercise> {
  const exercises = await listWorkoutExercises(workoutId)
  const ordem = exercises.length
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({ workout_id: workoutId, nome, ordem })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameWorkoutExercise(id: string, nome: string): Promise<void> {
  const { error } = await supabase.from('workout_exercises').update({ nome }).eq('id', id)
  if (error) throw error
}

export async function deleteWorkoutExercise(id: string): Promise<void> {
  const { error } = await supabase.from('workout_exercises').delete().eq('id', id)
  if (error) throw error
}

export async function reorderWorkoutExercises(exercises: WorkoutExercise[]): Promise<void> {
  await Promise.all(
    exercises.map((exercise, ordem) =>
      supabase.from('workout_exercises').update({ ordem }).eq('id', exercise.id),
    ),
  )
}
