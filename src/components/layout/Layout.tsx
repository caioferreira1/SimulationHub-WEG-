import { Outlet } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useTheme } from '../../contexts/ThemeContext'

export function Layout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex min-h-screen bg-weg-surface dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex justify-end items-center px-6 h-12">
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
