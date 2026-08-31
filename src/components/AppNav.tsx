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
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <nav className="flex flex-wrap gap-x-5 gap-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'border-b-2 border-transparent pb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground',
                isActive && 'border-primary text-foreground',
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
