import { Button } from '@/components/ui/button'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Login } from '@/pages/Login'

function AuthenticatedHome() {
  const { user, signOut } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Monitor de Treinos</h1>
      <p className="text-muted-foreground">Sessão iniciada como {user?.email}.</p>
      <p className="text-sm text-muted-foreground">
        Em construção: treinos, sessões e gráfico de evolução chegam nos próximos passos.
      </p>
      <Button variant="outline" onClick={() => signOut()}>
        Sair
      </Button>
    </main>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </main>
    )
  }

  return user ? <AuthenticatedHome /> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
