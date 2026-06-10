'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const signedUp = searchParams.get('signed_up') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed.')
        return
      }
      router.push('/')
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
        data-testid="login-left-panel"
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #FFFBF9 0%, #FFF5F5 40%, #FEF2F2 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle tire-track texture overlay */}
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
          <p data-testid="left-panel-eyebrow" className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-4">
            Discount Tire Information Center
          </p>
          <h1 data-testid="left-panel-heading" className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            IT support, resolved faster.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Patch guides you through step-by-step troubleshooting — most issues resolved in under 5 minutes.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold text-gray-900">85%</p>
              <p className="text-xs text-gray-400 mt-0.5">Self-resolution rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">&lt;5 min</p>
              <p className="text-xs text-gray-400 mt-0.5">Avg. resolution time</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-300">
          © {new Date().getFullYear()} Discount Tire
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white" data-testid="login-right-panel">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-base font-bold text-gray-900">Patch</span>
          </div>

          <h2 data-testid="login-heading" className="text-2xl font-bold text-gray-900 mb-1">Sign in to Patch</h2>
          <p className="text-sm text-gray-500 mb-6">Discount Tire associates only</p>

          {signedUp && (
            <div data-testid="signup-success-msg" className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
              Account created! Sign in to continue.
            </div>
          )}

          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="login-email">
                Email
              </label>
              <input
                data-testid="login-email-input"
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@discounttire.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 input-field transition-all"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="login-password">
                Password
              </label>
              <input
                data-testid="login-password-input"
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 input-field transition-all"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p data-testid="login-error-msg" className="text-sm text-red-600">{error}</p>
            )}

            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link data-testid="signup-link" href="/signup" className="font-semibold text-red-600 hover:text-red-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
