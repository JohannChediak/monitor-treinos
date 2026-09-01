import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AppNav } from '@/components/AppNav'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { agregarPorSemana, type SemanaResumo } from '@/lib/aggregation'
import { listAllWorkoutExercises, type ExerciseOption } from '@/lib/workouts'
import { listSetsForExercise } from '@/lib/sessions'

type Metrica = 'cargaMaxima' | 'volume'

function formatSemana(iso: string) {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${mes}`
}

export function Evolution() {
  const [exercises, setExercises] = useState<ExerciseOption[]>([])
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [resumo, setResumo] = useState<SemanaResumo[]>([])
  const [metrica, setMetrica] = useState<Metrica>('cargaMaxima')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listAllWorkoutExercises().then(setExercises)
  }, [])

  useEffect(() => {
    if (!exerciseId) {
      setResumo([])
      return
    }
    setLoading(true)
    listSetsForExercise(exerciseId)
      .then((sets) => setResumo(agregarPorSemana(sets)))
      .catch(() => setError('Não foi possível carregar a evolução desse exercício.'))
      .finally(() => setLoading(false))
  }, [exerciseId])

  const dadosGrafico = useMemo(
    () => resumo.map((r) => ({ ...r, semana: formatSemana(r.semanaInicio) })),
    [resumo],
  )

  const gruposPorTreino = useMemo(() => {
    const grupos = new Map<string, { workoutNome: string; exercises: ExerciseOption[] }>()
    for (const exercise of exercises) {
      const grupo = grupos.get(exercise.workoutId) ?? {
        workoutNome: exercise.workoutNome,
        exercises: [],
      }
      grupo.exercises.push(exercise)
      grupos.set(exercise.workoutId, grupo)
    }
    return Array.from(grupos.values())
  }, [exercises])

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-6">
      <AppNav />

      <h1 className="text-2xl font-semibold">Evolução</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Select value={exerciseId ?? undefined} onValueChange={setExerciseId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Escolha um exercício" />
            </SelectTrigger>
            <SelectContent>
              {gruposPorTreino.map((grupo) => (
                <SelectGroup key={grupo.workoutNome}>
                  <SelectLabel>{grupo.workoutNome}</SelectLabel>
                  {grupo.exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.nome}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={metrica} onValueChange={(value) => setMetrica(value as Metrica)}>
          <TabsList>
            <TabsTrigger value="cargaMaxima">Carga máxima</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!exerciseId ? (
        <p className="text-muted-foreground">Escolha um exercício para ver sua evolução.</p>
      ) : loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : resumo.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma série registrada ainda para esse exercício.
        </p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="semana" className="text-xs" />
              <YAxis
                className="text-xs"
                label={{
                  value: metrica === 'cargaMaxima' ? 'kg' : 'kg × reps',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value) => [
                  metrica === 'cargaMaxima' ? `${value}kg` : `${value}`,
                  metrica === 'cargaMaxima' ? 'Carga máxima' : 'Volume',
                ]}
              />
              <Line
                type="monotone"
                dataKey={metrica}
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  )
}
