import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'cadastro'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = mode === 'login' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)

    if (error) {
      setError(error)
      return
    }

    if (mode === 'cadastro') {
      setSignupDone(true)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Monitor de Treinos</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Entre com sua conta' : 'Crie sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signupDone ? (
            <p className="text-sm text-muted-foreground">
              Conta criada. Confira seu email para confirmar o cadastro antes de entrar.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" disabled={submitting}>
                {mode === 'login' ? 'Entrar' : 'Cadastrar'}
              </Button>

              <button
                type="button"
                className="text-sm text-muted-foreground underline underline-offset-4"
                onClick={() => {
                  setMode(mode === 'login' ? 'cadastro' : 'login')
                  setError(null)
                }}
              >
                {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
