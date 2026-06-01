import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { AppIcon } from '../ui/AppIcon'

const NAV_ITEMS = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard', pageId: 'dashboard' },
  { to: '/projetos', icon: FolderKanban,    label: 'Projetos',  pageId: 'projetos'  },
]

export function Sidebar() {
  const { signOut, user, profile } = useAuth()

  const isAdmin = profile?.role === 'admin'

  const visibleNav = isAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter(item => profile?.page_access.includes(item.pageId))

  return (
    <aside className="w-56 min-h-screen bg-weg-blue dark:bg-weg-blue-dark flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 space-y-3">
        <img
          src="/logo-weg.png"
          alt="WEG"
          className="h-6 object-contain brightness-0 invert"
        />
        <div className="flex items-center gap-2">
          <AppIcon className="w-8 h-8 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              Simulation<span className="text-blue-300">Hub</span>
            </div>
            <div className="text-[10px] text-white/50 tracking-wide">WMO-C</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {/* Admin-only link */}
        {isAdmin && (
          <NavLink
            to="/autorizacoes"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <ShieldCheck size={16} />
            Autorizações
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        {isAdmin && (
          <div className="text-[10px] text-white/30 px-3 mb-0.5 uppercase tracking-wider">Admin</div>
        )}
        <div className="text-xs text-white/40 px-3 mb-1 truncate">{user?.email}</div>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white/65 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
