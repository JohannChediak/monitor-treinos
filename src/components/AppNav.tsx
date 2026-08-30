import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const links = [
  { to: '/', label: 'Meus Treinos' },
  { to: '/sessoes/nova', label: 'Nova Sessão' },
  { to: '/historico', label: 'Histórico' },
  { to: '/evolucao', label: 'Evolução' },
]

export function AppNav() {
  const { signOut } = useAuth()

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <nav className="flex flex-wrap gap-x-4 gap-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'text-sm font-medium text-muted-foreground hover:text-foreground',
                isActive && 'text-foreground underline underline-offset-4',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Button variant="outline" size="sm" onClick={() => signOut()}>
        Sair
      </Button>
    </header>
  )
}
