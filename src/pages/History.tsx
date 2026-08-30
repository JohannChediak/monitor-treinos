import { useEffect, useState } from 'react'
import { AppNav } from '@/components/AppNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listSessionSets, listSessions, type SessionSetDetail, type SessionSummary } from '@/lib/sessions'

function formatData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function History() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [setsByExpanded, setSetsByExpanded] = useState<SessionSetDetail[]>([])
  const [loadingSets, setLoadingSets] = useState(false)

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleExpand(sessionId: string) {
    if (expandedId === sessionId) {
      setExpandedId(null)
      return
    }
    setExpandedId(sessionId)
    setLoadingSets(true)
    try {
      setSetsByExpanded(await listSessionSets(sessionId))
    } catch {
      setError('Não foi possível carregar as séries dessa sessão.')
    } finally {
      setLoadingSets(false)
    }
  }

  const setsPorExercicio = setsByExpanded.reduce<Record<string, SessionSetDetail[]>>((acc, set) => {
    const nome = set.workout_exercise?.nome ?? 'Exercício'
    acc[nome] = [...(acc[nome] ?? []), set]
    return acc
  }, {})

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-6 p-6">
      <AppNav />

      <h1 className="text-2xl font-semibold">Histórico</h1>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : sessions.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma sessão registrada ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    {formatData(session.data)} — {session.workout?.nome ?? 'Treino removido'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(session.id)}>
                    {expandedId === session.id ? 'Fechar' : 'Ver séries'}
                  </Button>
                </CardHeader>
                {expandedId === session.id ? (
                  <CardContent>
                    {loadingSets ? (
                      <p className="text-sm text-muted-foreground">Carregando...</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {Object.entries(setsPorExercicio).map(([nome, sets]) => (
                          <div key={nome}>
                            <p className="text-sm font-medium">{nome}</p>
                            <ul className="text-sm text-muted-foreground">
                              {sets.map((set) => (
                                <li key={set.id}>
                                  Série {set.numero_serie}: {set.peso}kg × {set.repeticoes}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
