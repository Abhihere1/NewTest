'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import TopNav from '@/components/TopNav'
import TypingIndicator from '@/components/TypingIndicator'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import DynamicControls, { ControlData } from '@/components/DynamicControls'
import StatusBadge from '@/components/StatusBadge'
import EscalationOutcome from '@/components/EscalationOutcome'
import ResolutionOutcome from '@/components/ResolutionOutcome'
import FeedbackCard from '@/components/FeedbackCard'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  controls?: ControlData
  isEscalation?: boolean
  isResolution?: boolean
  escalationData?: Record<string, string>
}

interface User {
  userId: string
  email: string
  username: string
}

interface IncidentState {
  id: string
  category: string
  status: 'Open' | 'Escalated' | 'Resolved'
}

const CHAT_END_MSG = 'This conversation has ended.'

export default function MainPage() {
  const [user, setUser] = useState<User | null>(null)
  const [vdiStatus, setVdiStatus] = useState<'available' | 'missing'>('missing')
  const [isChatActive, setIsChatActive] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const [incident, setIncident] = useState<IncidentState | null>(null)
  const [incidentCount, setIncidentCount] = useState(0)
  const [chatEnded, setChatEnded] = useState(false)
  const [feedbackShown, setFeedbackShown] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => { scrollToBottom() }, [messages, isTyping])

  // Load user and KB status
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.userId) setUser(d)
    }).catch(() => {})
    fetch('/api/kb').then(r => r.json()).then(d => {
      setVdiStatus(d.vdi || 'missing')
    }).catch(() => {})
    fetch('/api/incidents').then(r => r.json()).then(d => {
      setIncidentCount(d.incidents?.length || 0)
    }).catch(() => {})
  }, [])

  // Resume logic: check sessionStorage on mount
  useEffect(() => {
    const resumeId = sessionStorage.getItem('resume_incident_id')
    if (!resumeId) return
    sessionStorage.removeItem('resume_incident_id')

    fetch(`/api/incidents/${resumeId}`)
      .then(r => r.json())
      .then(({ incident: inc }) => {
        if (!inc) return
        const restoredMessages: ChatMessage[] = (inc.history || []).map((h: { role: 'user' | 'assistant'; content: string; controls?: ControlData }) => ({
          role: h.role,
          content: h.content,
          controls: h.controls,
        }))
        setMessages(restoredMessages)
        setIncident({ id: inc.incident_id, category: inc.category, status: inc.status })
        setIsChatActive(true)
        if (inc.status !== 'Open') {
          setChatEnded(true)
        }
        setTimeout(scrollToBottom, 100)
      })
      .catch(() => {})
  }, [])

  const handleNewChat = useCallback(() => {
    setIsChatActive(false)
    setMessages([])
    setIncident(null)
    setChatEnded(false)
    setFeedbackShown(false)
    setFeedbackSubmitted(false)
    setInput('')
    setIsTyping(false)
  }, [])

  const sendMessage = useCallback(async (messageText: string, category?: string) => {
    if (isTyping || chatEnded) return
    const text = messageText.trim()
    if (!text) return

    // Mark any pending controls as completed
    setMessages(prev =>
      prev.map((msg, i) => {
        if (i === prev.length - 1 && msg.role === 'assistant' && msg.controls && !msg.controls.completed) {
          return { ...msg, controls: { ...msg.controls, completed: true } }
        }
        return msg
      })
    )

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsChatActive(true)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          incidentId: incident?.id || null,
          category: category || incident?.category || null,
        }),
      })

      const data = await res.json()
      setIsTyping(false)

      if (!res.ok) {
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: data.error || "I'm sorry, I encountered an error. Please try again.",
        }
        setMessages(prev => [...prev, errMsg])
        return
      }

      if (!incident || !incident.id) {
        setIncident({ id: data.incidentId, category: category || '', status: 'Open' })
        setIncidentCount(c => c + 1)
      }

      if (incident && data.status && data.status !== incident.status) {
        setIncident(prev => prev ? { ...prev, status: data.status } : prev)
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response,
        controls: data.controls,
        isEscalation: data.should_escalate,
        isResolution: data.should_resolve,
        escalationData: data.escalation_data,
      }

      setMessages(prev => [...prev, assistantMsg])

      if (data.should_escalate || data.should_resolve) {
        setChatEnded(true)
        setFeedbackShown(true)
        setIncident(prev => prev ? { ...prev, status: data.should_escalate ? 'Escalated' : 'Resolved' } : prev)
      }
    } catch (err) {
      console.error('[Chat error]', err)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered a connection error. Please try again.",
      }])
    }
  }, [incident, isTyping, chatEnded])

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleVdiTile = () => {
    sendMessage('I have a problem with my VDI', 'vdi')
  }

  const displayName = user?.username || user?.email?.split('@')[0] || ''

  return (
    <div className="flex flex-col h-full" data-testid="main-page">
      <TopNav onNewChat={handleNewChat} incidentCount={incidentCount} />

      {!isChatActive ? (
        /* === Landing State === */
        <main
          data-testid="landing-state"
          className="flex-1 flex flex-col items-center justify-center px-6"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 40%, #FFF5F5 0%, #F9FAFB 60%, #F3F4F6 100%)',
          }}
        >
          <div className="w-full max-w-2xl flex flex-col items-center text-center">
            {/* Patch mark */}
            <div
              data-testid="patch-mark"
              className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center mb-8"
            >
              <span className="text-white font-black text-2xl">P</span>
            </div>

            {/* Welcome block */}
            <div className="mb-10">
              <h1 data-testid="welcome-heading" className="text-2xl font-bold text-gray-900 mb-1">
                Welcome to the Discount Tire Information Center,{' '}
                <span className="text-red-600">{displayName}</span>.
              </h1>
              <p className="text-base text-gray-400 font-normal">
                My name is Patch. Let&apos;s get you taken care of.
              </p>
            </div>

            {/* VDI Tile */}
            <div className="flex justify-center mb-10">
              <button
                data-testid="vdi-tile"
                onClick={handleVdiTile}
                className="vdi-tile card rounded-2xl px-10 py-8 flex flex-col items-center gap-3 w-52 cursor-pointer"
              >
                <div className="text-4xl">🖥️</div>
                <p className="text-sm font-semibold text-gray-800">VDI</p>
                <span
                  data-testid="vdi-kb-badge"
                  className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    vdiStatus === 'available'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {vdiStatus === 'available' ? 'KB Available' : 'KB Missing'}
                </span>
              </button>
            </div>

            {/* Composer */}
            <div data-testid="landing-composer" className="w-full">
              <ComposerInput
                value={input}
                onChange={setInput}
                onSubmit={() => sendMessage(input)}
                onKeyDown={handleInputKeyDown}
                disabled={isTyping || chatEnded}
                placeholder="Describe your issue or select a category above..."
                inputRef={inputRef}
              />
            </div>
          </div>
        </main>
      ) : (
        /* === Active Chat State === */
        <div className="flex-1 flex flex-col overflow-hidden" data-testid="chat-state">
          {/* Incident header */}
          {incident && (
            <div
              data-testid="incident-header"
              className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-3 flex-shrink-0"
            >
              <span className="text-sm font-mono font-semibold text-gray-700">{incident.id}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{incident.category ? incident.category.toUpperCase() : 'General'}</span>
              <span className="text-gray-300">|</span>
              <StatusBadge status={incident.status} />
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto chat-scroll px-6 py-6 space-y-4"
            data-testid="messages-container"
          >
            <div className="max-w-3xl mx-auto w-full space-y-4">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' ? (
                    <div className="flex justify-end" data-testid={`user-msg-${i}`}>
                      <div
                        className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white font-medium"
                        style={{ background: '#DC2626' }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3" data-testid={`assistant-msg-${i}`}>
                      <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <div className="flex-1 max-w-[85%]">
                        <div
                          className="card rounded-xl rounded-tl-sm px-4 py-3"
                          style={{ borderLeft: '2px solid #DC2626' }}
                          data-testid="assistant-card"
                        >
                          <MarkdownRenderer content={msg.content} />
                        </div>

                        {/* Dynamic controls */}
                        {msg.controls && (
                          <DynamicControls
                            controls={msg.controls}
                            onSend={(text) => sendMessage(text)}
                            disabled={isTyping || chatEnded}
                          />
                        )}

                        {/* Escalation outcome card */}
                        {msg.isEscalation && incident && (
                          <EscalationOutcome
                            incidentId={incident.id}
                            category={incident.category}
                            createdAt={new Date().toLocaleString()}
                            escalationData={msg.escalationData || {}}
                          />
                        )}

                        {/* Resolution outcome card */}
                        {msg.isResolution && incident && (
                          <ResolutionOutcome
                            incidentId={incident.id}
                            category={incident.category}
                            createdAt={new Date().toLocaleString()}
                          />
                        )}

                        {/* Feedback card — appears after last outcome message */}
                        {(msg.isEscalation || msg.isResolution) && feedbackShown && !feedbackSubmitted && incident && (
                          <div className="mt-3">
                            <FeedbackCard
                              incidentId={incident.id}
                              onSubmitted={() => setFeedbackSubmitted(true)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && <TypingIndicator />}
            </div>
          </div>

          {/* Composer */}
          <div
            className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0"
            data-testid="chat-composer"
          >
            <div className="max-w-3xl mx-auto">
              {chatEnded ? (
                <p
                  data-testid="chat-ended-label"
                  className="text-sm text-gray-400 text-center py-2"
                >
                  {CHAT_END_MSG}
                </p>
              ) : (
                <ComposerInput
                  value={input}
                  onChange={setInput}
                  onSubmit={() => sendMessage(input)}
                  onKeyDown={handleInputKeyDown}
                  disabled={isTyping || chatEnded}
                  placeholder="Type your reply..."
                  inputRef={inputRef}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ComposerInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  disabled,
  placeholder,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  disabled: boolean
  placeholder: string
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <div
      className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 transition-all focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
      data-testid="composer"
    >
      <textarea
        ref={inputRef}
        data-testid="chat-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        style={{ resize: 'none', minHeight: 24, maxHeight: 120 }}
        className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none leading-relaxed disabled:opacity-50"
        onInput={(e) => {
          const el = e.currentTarget
          el.style.height = 'auto'
          el.style.height = Math.min(el.scrollHeight, 120) + 'px'
        }}
      />
      <button
        data-testid="send-btn"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  )
}
