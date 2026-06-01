import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AppIcon } from '../components/ui/AppIcon'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setSuccess(null)
    setPassword('')
    setConfirmPassword('')
    setConfirmEmail('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'signup') {
      if (email !== confirmEmail) {
        setError('Os e-mails não coincidem.')
        return
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.')
        return
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        return
      }
    }

    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      setLoading(false)
      if (error) {
        setError('E-mail ou senha incorretos.')
      } else {
        navigate('/')
      }
    } else {
      const { error } = await signUp(email, password)
      setLoading(false)
      if (error) {
        setError('Não foi possível criar a conta. Tente novamente.')
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.')
        switchMode('login')
      }
    }
  }

  const isSignup = mode === 'signup'

  return (
    <div className="min-h-screen bg-weg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* Marca WEG */}
          <img
            src="/logo-weg.png"
            alt="WEG"
            className="h-10 mx-auto mb-5 object-contain"
          />
          {/* Identidade do app */}
          <div className="inline-flex items-center gap-3 mb-2">
            <AppIcon className="w-11 h-11" />
            <span className="text-2xl font-bold text-gray-900">
              Simulation<span className="text-blue-600">Hub</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm">WMO-C · WEG Equipamentos Elétricos</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">
            {isSignup ? 'Criar conta' : 'Entrar na conta'}
          </h1>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-weg-green focus:border-transparent"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar e-mail</label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-weg-green focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-weg-green focus:border-transparent"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-weg-green focus:border-transparent"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-weg-green hover:bg-weg-dark disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {loading
                ? isSignup ? 'Criando conta...' : 'Entrando...'
                : isSignup ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {isSignup ? (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-weg-green font-medium hover:underline"
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Não tem conta?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-weg-green font-medium hover:underline"
                >
                  Criar conta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
