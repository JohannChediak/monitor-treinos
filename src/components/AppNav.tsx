import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const links = [
  { to: '/', label: 'Meus Treinos' },
  { to: '/sessoes/nova', label: 'Nova Sessão' },
  { to: '/historico', label: 'Histórico' },
]

export function AppNav() {
  const { signOut } = useAuth()

  return (
    <header className="flex items-center justify-between border-b pb-4">
      <nav className="flex gap-4">
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
