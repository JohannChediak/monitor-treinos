import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Evolution } from '@/pages/Evolution'
import { History } from '@/pages/History'
import { Login } from '@/pages/Login'
import { NewSession } from '@/pages/NewSession'
import { WorkoutEditor } from '@/pages/WorkoutEditor'
import { Workouts } from '@/pages/Workouts'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </main>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route path="/" element={<Workouts />} />
      <Route path="/treinos/:workoutId" element={<WorkoutEditor />} />
      <Route path="/sessoes/nova" element={<NewSession />} />
      <Route path="/historico" element={<History />} />
      <Route path="/evolucao" element={<Evolution />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="hazard-strip" />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
