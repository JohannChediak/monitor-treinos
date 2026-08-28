import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppNav } from '@/components/AppNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { createSessionWithSets, type SetInput } from '@/lib/sessions'
import { listWorkoutExercises, listWorkouts, type Workout, type WorkoutExercise } from '@/lib/workouts'

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function NewSession() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [date, setDate] = useState(todayIsoDate())
  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetInput[]>>({})
  const [pesoInput, setPesoInput] = useState<Record<string, string>>({})
  const [repsInput, setRepsInput] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listWorkouts().then(setWorkouts)
  }, [])

  useEffect(() => {
    if (!workoutId) {
      setExercises([])
      return
    }
    void listWorkoutExercises(workoutId).then(setExercises)
    setSetsByExercise({})
  }, [workoutId])

  function handleAddSet(exerciseId: string) {
    const peso = Number.parseFloat(pesoInput[exerciseId] ?? '')
    const repeticoes = Number.parseInt(repsInput[exerciseId] ?? '', 10)
    if (Number.isNaN(peso) || Number.isNaN(repeticoes)) return

    setSetsByExercise((prev) => {
      const existing = prev[exerciseId] ?? []
      const novaSerie: SetInput = {
        workoutExerciseId: exerciseId,
        numeroSerie: existing.length + 1,
        peso,
        repeticoes,
      }
      return { ...prev, [exerciseId]: [...existing, novaSerie] }
    })
    setPesoInput((prev) => ({ ...prev, [exerciseId]: '' }))
    setRepsInput((prev) => ({ ...prev, [exerciseId]: '' }))
  }

  function handleRemoveSet(exerciseId: string, index: number) {
    setSetsByExercise((prev) => {
      const existing = prev[exerciseId] ?? []
      const reordered = existing
        .filter((_, i) => i !== index)
        .map((set, i) => ({ ...set, numeroSerie: i + 1 }))
      return { ...prev, [exerciseId]: reordered }
    })
  }

  async function handleSave() {
    if (!user || !workoutId) return
    const allSets = Object.values(setsByExercise).flat()
    if (allSets.length === 0) {
      setError('Adicione ao menos uma série antes de salvar.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await createSessionWithSets(user.id, workoutId, date, allSets)
      setSaved(true)
      setTimeout(() => navigate('/'), 1200)
    } catch {
      setError('Não foi possível salvar a sessão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-6">
      <AppNav />

      <h1 className="text-2xl font-semibold">Registrar Sessão</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label>Treino</Label>
          <Select value={workoutId ?? undefined} onValueChange={setWorkoutId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Escolha um treino" />
            </SelectTrigger>
            <SelectContent>
              {workouts.map((workout) => (
                <SelectItem key={workout.id} value={workout.id}>
                  {workout.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {workoutId && exercises.length === 0 ? (
        <p className="text-muted-foreground">
          Esse treino ainda não tem exercícios. Adicione exercícios a ele em "Meus Treinos".
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        {exercises.map((exercise) => {
          const sets = setsByExercise[exercise.id] ?? []
          return (
            <Card key={exercise.id}>
              <CardHeader>
                <CardTitle className="text-base">{exercise.nome}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {sets.length > 0 ? (
                  <ul className="flex flex-col gap-1 text-sm">
                    {sets.map((set, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>
                          Série {set.numeroSerie}: {set.peso}kg × {set.repeticoes}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSet(exercise.id, index)}
                        >
                          Remover
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`peso-${exercise.id}`} className="text-xs">
                      Peso (kg)
                    </Label>
                    <Input
                      id={`peso-${exercise.id}`}
                      type="number"
                      inputMode="decimal"
                      className="w-24"
                      value={pesoInput[exercise.id] ?? ''}
                      onChange={(event) =>
                        setPesoInput((prev) => ({ ...prev, [exercise.id]: event.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`reps-${exercise.id}`} className="text-xs">
                      Reps
                    </Label>
                    <Input
                      id={`reps-${exercise.id}`}
                      type="number"
                      inputMode="numeric"
                      className="w-20"
                      value={repsInput[exercise.id] ?? ''}
                      onChange={(event) =>
                        setRepsInput((prev) => ({ ...prev, [exercise.id]: event.target.value }))
                      }
                    />
                  </div>
                  <Button size="sm" onClick={() => handleAddSet(exercise.id)}>
                    + Série
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-muted-foreground">Sessão salva!</p> : null}

      {workoutId && exercises.length > 0 ? (
        <Button onClick={handleSave} disabled={saving}>
          Salvar sessão
        </Button>
      ) : null}
    </main>
  )
}
