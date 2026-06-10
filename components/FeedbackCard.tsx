'use client'

import { useState } from 'react'

interface Props {
  incidentId: string
  initialRating?: number
  initialComment?: string
  initialSubmitted?: boolean
  onSubmitted?: (rating: number, comment: string) => void
  compact?: boolean
}

export default function FeedbackCard({
  incidentId,
  initialRating,
  initialComment,
  initialSubmitted = false,
  onSubmitted,
  compact = false,
}: Props) {
  const [rating, setRating] = useState<number>(initialRating || 0)
  const [hover, setHover] = useState<number>(0)
  const [comment, setComment] = useState(initialComment || '')
  const [submitted, setSubmitted] = useState(initialSubmitted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!rating || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/incidents/${incidentId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to submit feedback.')
        return
      }
      setSubmitted(true)
      onSubmitted?.(rating, comment)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted && initialSubmitted) {
    return (
      <div data-testid="feedback-submitted" className={compact ? 'pt-4 mt-4 border-t border-gray-200' : 'card p-5 rounded-xl'}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Your Feedback</p>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <svg key={star} className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {comment && <p className="text-sm text-gray-600 italic">&ldquo;{comment}&rdquo;</p>}
      </div>
    )
  }

  return (
    <div
      data-testid="feedback-card"
      className={compact ? 'pt-4 mt-4 border-t border-gray-200' : 'card p-5 rounded-xl'}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-800">Rate Your Experience</p>
        <span className="text-xs text-gray-400">Optional</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">How would you rate this support session?</p>

      <div className="flex gap-1 mb-4" data-testid="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            data-testid={`star-${star}`}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <svg
              className={`w-7 h-7 transition-colors ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      <textarea
        data-testid="feedback-comment"
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share any additional thoughts... (optional)"
        rows={3}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 resize-none input-field mb-3 transition-all"
      />

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="flex justify-end">
        <button
          data-testid="feedback-submit-btn"
          onClick={handleSubmit}
          disabled={!rating || loading}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
