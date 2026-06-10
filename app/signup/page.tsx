'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password) {
      setError('All fields are required.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Signup failed.')
        return
      }
      router.push('/login?signed_up=1')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div
        data-testid="signup-left-panel"
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #FFFBF9 0%, #FFF5F5 40%, #FEF2F2 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: `repeating-linear-gradient(45deg, #DC2626 0, #DC2626 1px, transparent 0, transparent 50%)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
              <span className="text-white font-black text-base">P</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Patch</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-4">
            Discount Tire Information Center
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            IT support, resolved faster.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Create your account to start using Patch — your AI-powered IT support companion.
          </p>
        </div>

        <div className="relative z-10 text-xs text-gray-300">
          © {new Date().getFullYear()} Discount Tire
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white" data-testid="signup-right-panel">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-base font-bold text-gray-900">Patch</span>
          </div>

          <h2 data-testid="signup-heading" className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">Discount Tire associates only</p>

          <form data-testid="signup-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="signup-username">
                Username
              </label>
              <input
                data-testid="signup-username-input"
                id="signup-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 input-field transition-all"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="signup-email">
                Email
              </label>
              <input
                data-testid="signup-email-input"
                id="signup-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@discounttire.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 input-field transition-all"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="signup-password">
                Password
              </label>
              <input
                data-testid="signup-password-input"
                id="signup-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 input-field transition-all"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p data-testid="signup-error-msg" className="text-sm text-red-600">{error}</p>
            )}

            <button
              data-testid="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link data-testid="login-link" href="/login" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
