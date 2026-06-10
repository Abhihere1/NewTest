'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  onNewChat?: () => void
  incidentCount?: number
}

export default function TopNav({ onNewChat, incidentCount }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [fetchedCount, setFetchedCount] = useState(0)

  useEffect(() => {
    if (incidentCount !== undefined) return
    fetch('/api/incidents')
      .then(r => r.json())
      .then(d => setFetchedCount(d.incidents?.length || 0))
      .catch(() => {})
  }, [incidentCount])

  const count = incidentCount ?? fetchedCount

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat()
      if (pathname !== '/') router.push('/')
    } else {
      router.push('/')
    }
  }

  const isHome = pathname === '/'
  const isIncidents = pathname.startsWith('/incidents')

  return (
    <nav
      data-testid="top-nav"
      className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between flex-shrink-0"
      style={{ minHeight: 56 }}
    >
      <Link href="/" data-testid="nav-logo-link" className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors">
        <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
          <span className="text-white text-xs font-black">P</span>
        </div>
        <span className="text-sm font-bold tracking-tight">Patch</span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/incidents"
          data-testid="nav-incidents-link"
          className={`relative px-4 py-1.5 text-sm font-medium transition-colors rounded-md ${
            isIncidents
              ? 'text-red-600 border-b-2 border-red-600 rounded-none pb-[5px]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Incidents
          {count > 0 && (
            <span
              data-testid="incidents-count-badge"
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center"
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>

        <button
          data-testid="nav-new-chat-btn"
          onClick={handleNewChat}
          className={`px-4 py-1.5 text-sm font-medium transition-colors rounded-md ${
            isHome && !isIncidents
              ? 'text-red-600 border-b-2 border-red-600 rounded-none pb-[5px]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          New Chat
        </button>

        <button
          data-testid="nav-logout-btn"
          onClick={handleLogout}
          className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-md"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
