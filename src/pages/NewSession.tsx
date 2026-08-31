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
import {
  createSessionWithSets,
  getUltimaSessaoExercicio,
  type SetInput,
  type UltimaSessaoExercicio,
} from '@/lib/sessions'
import { listWorkoutExercises, listWorkouts, type Workout, type WorkoutExercise } from '@/lib/workouts'

type LinhaSerie = {
  peso: string
  repeticoes: string
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function formatData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function linhasVaziasParaExercicio(exercise: WorkoutExercise): LinhaSerie[] {
  return Array.from({ length: exercise.series_alvo }, () => ({ peso: '', repeticoes: '' }))
}

/** Pré-preenche as linhas de edição com a carga da última vez, completando
 * com linhas vazias até bater com o número de séries configurado. */
function linhasIniciaisParaEdicao(
  exercise: WorkoutExercise,
  ultima: UltimaSessaoExercicio | null,
): LinhaSerie[] {
  if (!ultima) return linhasVaziasParaExercicio(exercise)

  const linhas = ultima.series.map((serie) => ({
    peso: String(serie.peso),
    repeticoes: String(serie.repeticoes),
  }))
  while (linhas.length < exercise.series_alvo) {
    linhas.push({ peso: '', repeticoes: '' })
  }
  return linhas
}

export function NewSession() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [date, setDate] = useState(todayIsoDate())
  const [linhasPorExercicio, setLinhasPorExercicio] = useState<Record<string, LinhaSerie[]>>({})
  const [ultimasPorExercicio, setUltimasPorExercicio] = useState<
    Record<string, UltimaSessaoExercicio | null>
  >({})
  const [editandoPorExercicio, setEditandoPorExercicio] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listWorkouts().then(setWorkouts)
  }, [])

  useEffect(() => {
    if (!workoutId) {
      setExercises([])
      setLinhasPorExercicio({})
      setUltimasPorExercicio({})
      setEditandoPorExercicio({})
      return
    }
    void listWorkoutExercises(workoutId).then(async (data) => {
      setExercises(data)
      const ultimas = await Promise.all(data.map((exercise) => getUltimaSessaoExercicio(exercise.id)))
      setUltimasPorExercicio(Object.fromEntries(data.map((exercise, i) => [exercise.id, ultimas[i]])))
      // Sem registro anterior: não há o que mostrar como texto, então já
      // abre direto em modo de edição com linhas em branco.
      setEditandoPorExercicio(Object.fromEntries(data.map((exercise, i) => [exercise.id, !ultimas[i]])))
      setLinhasPorExercicio(
        Object.fromEntries(data.map((exercise) => [exercise.id, linhasVaziasParaExercicio(exercise)])),
      )
    })
  }, [workoutId])

  function handleEditar(exercise: WorkoutExercise) {
    setLinhasPorExercicio((prev) => ({
      ...prev,
      [exercise.id]: linhasIniciaisParaEdicao(exercise, ultimasPorExercicio[exercise.id] ?? null),
    }))
    setEditandoPorExercicio((prev) => ({ ...prev, [exercise.id]: true }))
  }

  function handleRowChange(exerciseId: string, index: number, campo: keyof LinhaSerie, valor: string) {
    setLinhasPorExercicio((prev) => {
      const linhas = [...(prev[exerciseId] ?? [])]
      linhas[index] = { ...linhas[index], [campo]: valor }
      return { ...prev, [exerciseId]: linhas }
    })
  }

  function handleAddRow(exerciseId: string) {
    setLinhasPorExercicio((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] ?? []), { peso: '', repeticoes: '' }],
    }))
  }

  function handleRemoveRow(exerciseId: string, index: number) {
    setLinhasPorExercicio((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).filter((_, i) => i !== index),
    }))
  }

  async function handleSave() {
    if (!user || !workoutId) return

    const allSets: SetInput[] = []
    for (const exercise of exercises) {
      if (!editandoPorExercicio[exercise.id]) {
        // Exercício não editado hoje: repete a carga da última vez.
        const ultima = ultimasPorExercicio[exercise.id]
        for (const serie of ultima?.series ?? []) {
          allSets.push({
            workoutExerciseId: exercise.id,
            numeroSerie: serie.numeroSerie,
            peso: serie.peso,
            repeticoes: serie.repeticoes,
          })
        }
        continue
      }

      const linhas = linhasPorExercicio[exercise.id] ?? []
      let numeroSerie = 0
      for (const linha of linhas) {
        const peso = Number.parseFloat(linha.peso)
        const repeticoes = Number.parseInt(linha.repeticoes, 10)
        if (Number.isNaN(peso) || Number.isNaN(repeticoes)) continue
        numeroSerie += 1
        allSets.push({ workoutExerciseId: exercise.id, numeroSerie, peso, repeticoes })
      }
    }

    if (allSets.length === 0) {
      setError('Preencha ao menos uma série antes de salvar.')
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
          const linhas = linhasPorExercicio[exercise.id] ?? []
          const ultima = ultimasPorExercicio[exercise.id]
          const editando = editandoPorExercicio[exercise.id] ?? false

          return (
            <Card key={exercise.id}>
              <CardHeader className="flex-row items-start justify-between">
                <CardTitle className="text-base">{exercise.nome}</CardTitle>
                {!editando ? (
                  <Button variant="outline" size="sm" onClick={() => handleEditar(exercise)}>
                    Editar
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {!editando ? (
                  ultima ? (
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1 text-xs">
                        Última vez ({formatData(ultima.data)}), repete automaticamente se você não
                        editar:
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {ultima.series.map((serie) => (
                          <li key={serie.numeroSerie} className="flex items-center gap-2">
                            <span className="text-xs">Série {serie.numeroSerie}</span>
                            <span className="plate">
                              {serie.peso}
                              <span className="plate-unit">kg</span> × {serie.repeticoes}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                ) : (
                  <>
                    {linhas.map((linha, index) => (
                      <div key={index} className="flex items-end gap-2">
                        <span className="w-16 pb-2 text-sm text-muted-foreground">
                          Série {index + 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`peso-${exercise.id}-${index}`} className="text-xs">
                            Peso (kg)
                          </Label>
                          <Input
                            id={`peso-${exercise.id}-${index}`}
                            type="number"
                            inputMode="decimal"
                            className="w-24"
                            value={linha.peso}
                            onChange={(event) =>
                              handleRowChange(exercise.id, index, 'peso', event.target.value)
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label htmlFor={`reps-${exercise.id}-${index}`} className="text-xs">
                            Reps
                          </Label>
                          <Input
                            id={`reps-${exercise.id}-${index}`}
                            type="number"
                            inputMode="numeric"
                            className="w-20"
                            value={linha.repeticoes}
                            onChange={(event) =>
                              handleRowChange(exercise.id, index, 'repeticoes', event.target.value)
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(exercise.id, index)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => handleAddRow(exercise.id)}
                    >
                      + Série
                    </Button>
                  </>
                )}
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
