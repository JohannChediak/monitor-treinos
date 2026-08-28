import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  addWorkoutExercise,
  deleteWorkoutExercise,
  getWorkout,
  listWorkoutExercises,
  reorderWorkoutExercises,
  type Workout,
  type WorkoutExercise,
} from '@/lib/workouts'

export function WorkoutEditor() {
  const { workoutId } = useParams<{ workoutId: string }>()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [novoNome, setNovoNome] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void refresh()
  }, [workoutId])

  async function refresh() {
    if (!workoutId) return
    setLoading(true)
    try {
      const [workoutData, exerciseData] = await Promise.all([
        getWorkout(workoutId),
        listWorkoutExercises(workoutId),
      ])
      setWorkout(workoutData)
      setExercises(exerciseData)
      setError(null)
    } catch {
      setError('Não foi possível carregar este treino.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (!workoutId || !novoNome.trim()) return
    try {
      await addWorkoutExercise(workoutId, novoNome.trim())
      setNovoNome('')
      await refresh()
    } catch {
      setError('Não foi possível adicionar o exercício.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteWorkoutExercise(id)
      await refresh()
    } catch {
      setError('Não foi possível remover o exercício.')
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= exercises.length) return
    const reordered = [...exercises]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setExercises(reordered)
    try {
      await reorderWorkoutExercises(reordered)
    } catch {
      setError('Não foi possível reordenar os exercícios.')
      await refresh()
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </main>
    )
  }

  if (!workout) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Treino não encontrado.</p>
        <Button asChild variant="outline">
          <Link to="/">Voltar</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">← Meus treinos</Link>
        </Button>
        <h1 className="text-2xl font-semibold">{workout.nome}</h1>
      </header>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Nome do exercício (ex: Supino reto)"
          value={novoNome}
          onChange={(event) => setNovoNome(event.target.value)}
        />
        <Button type="submit" disabled={!novoNome.trim()}>
          Adicionar
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {exercises.length === 0 ? (
        <p className="text-muted-foreground">Nenhum exercício ainda. Adicione o primeiro acima.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {exercises.map((exercise, index) => (
            <li
              key={exercise.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span>{exercise.nome}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                  aria-label="Mover para cima"
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === exercises.length - 1}
                  onClick={() => handleMove(index, 1)}
                  aria-label="Mover para baixo"
                >
                  ↓
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(exercise.id)}>
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
