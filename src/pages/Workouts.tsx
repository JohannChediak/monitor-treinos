import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { createWorkout, deleteWorkout, listWorkouts, type Workout } from '@/lib/workouts'

export function Workouts() {
  const { user, signOut } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [novoNome, setNovoNome] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      setWorkouts(await listWorkouts())
      setError(null)
    } catch {
      setError('Não foi possível carregar seus treinos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!user || !novoNome.trim()) return
    try {
      await createWorkout(user.id, novoNome.trim())
      setNovoNome('')
      await refresh()
    } catch {
      setError('Não foi possível criar o treino.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteWorkout(id)
      await refresh()
    } catch {
      setError('Não foi possível remover o treino.')
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meus Treinos</h1>
        <Button variant="outline" onClick={() => signOut()}>
          Sair
        </Button>
      </header>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          placeholder="Nome do treino (ex: Treino A, Peito e Tríceps)"
          value={novoNome}
          onChange={(event) => setNovoNome(event.target.value)}
        />
        <Button type="submit" disabled={!novoNome.trim()}>
          Criar
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : workouts.length === 0 ? (
        <p className="text-muted-foreground">Nenhum treino ainda. Crie o primeiro acima.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{workout.nome}</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/treinos/${workout.id}`}>Editar exercícios</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(workout.id)}>
                    Excluir
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
