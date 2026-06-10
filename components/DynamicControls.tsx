'use client'

import { useState } from 'react'

export interface ControlData {
  type: 'probable_options' | 'single_select' | 'structured_form'
  options?: string[]
  completed: boolean
  input_card_variables?: { label: string; key: string; required: boolean }[]
  total_cards?: number
  partial_values?: Record<string, string>[]
}

interface Props {
  controls: ControlData
  onSend: (message: string) => void
  disabled?: boolean
  readonly?: boolean
}

function FormCard({
  index,
  fields,
  values,
  onChange,
  isComplete,
}: {
  index: number
  fields: { label: string; key: string; required: boolean }[]
  values: Record<string, string>
  onChange: (key: string, val: string) => void
  isComplete: boolean
}) {
  return (
    <div
      data-testid={`form-card-${index}`}
      className={`card p-4 rounded-xl mb-3 transition-all ${isComplete ? 'border-green-400' : 'border-gray-200'}`}
      style={{ borderWidth: isComplete ? 2 : 1, borderColor: isComplete ? '#4ADE80' : '#E5E7EB' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">Device {index + 1}</span>
        {isComplete && (
          <span className="text-green-600 text-xs font-semibold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Complete
          </span>
        )}
      </div>
      {fields.map(field => (
        <div key={field.key} className="mb-2">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            data-testid={`form-field-${index}-${field.key}`}
            type="text"
            value={values[field.key] || ''}
            onChange={e => onChange(field.key, e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 input-field transition-all"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </div>
      ))}
    </div>
  )
}

export default function DynamicControls({ controls, onSend, disabled = false, readonly = false }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>[]>(
    () => {
      const count = controls.total_cards || 1
      if (controls.partial_values && controls.partial_values.length > 0) {
        return controls.partial_values
      }
      return Array.from({ length: count }, () => ({}))
    }
  )
  const [submitted, setSubmitted] = useState(false)

  if (controls.completed || submitted) {
    // Show readonly state
    if (controls.type === 'probable_options' || controls.type === 'single_select') {
      return (
        <div data-testid="controls-completed" className="flex flex-wrap gap-2 mt-3">
          {(controls.options || []).map(opt => (
            <button
              key={opt}
              disabled
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
            >
              {opt}
            </button>
          ))}
        </div>
      )
    }
    return null
  }

  if (controls.type === 'probable_options') {
    return (
      <div data-testid="probable-options" className="flex flex-wrap gap-2 mt-3">
        {(controls.options || []).map(opt => (
          <button
            key={opt}
            data-testid={`option-btn-${opt}`}
            disabled={disabled || readonly}
            onClick={() => {
              if (disabled || readonly) return
              setSubmitted(true)
              onSend(opt)
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (controls.type === 'single_select') {
    return (
      <div data-testid="single-select" className="mt-3">
        <div className="card rounded-xl p-3">
          <select
            data-testid="single-select-dropdown"
            value={selected || ''}
            onChange={e => setSelected(e.target.value)}
            disabled={disabled || readonly}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 input-field mb-3"
          >
            <option value="">Select an option...</option>
            {(controls.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            data-testid="single-select-confirm"
            disabled={!selected || disabled || readonly}
            onClick={() => {
              if (!selected) return
              setSubmitted(true)
              onSend(selected)
            }}
            className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    )
  }

  if (controls.type === 'structured_form') {
    const fields = controls.input_card_variables || []
    const cardCount = controls.total_cards || 1

    const isCardComplete = (vals: Record<string, string>) =>
      fields.filter(f => f.required).every(f => vals[f.key]?.trim())

    const allComplete = formValues.every(isCardComplete)

    const handleFieldChange = (cardIdx: number, key: string, val: string) => {
      setFormValues(prev => prev.map((card, i) => i === cardIdx ? { ...card, [key]: val } : card))
    }

    const handleSubmit = () => {
      if (!allComplete) return
      const summary = formValues.map((vals, i) => {
        const parts = fields.map(f => `${f.label}: ${vals[f.key] || ''}`)
        return `Device ${i + 1}: ${parts.join(', ')}`
      }).join(' | ')
      setSubmitted(true)
      onSend(summary)
    }

    return (
      <div data-testid="structured-form" className="mt-3">
        {Array.from({ length: cardCount }, (_, i) => (
          <FormCard
            key={i}
            index={i}
            fields={fields}
            values={formValues[i] || {}}
            onChange={(key, val) => handleFieldChange(i, key, val)}
            isComplete={isCardComplete(formValues[i] || {})}
          />
        ))}
        <button
          data-testid="structured-form-submit"
          disabled={!allComplete || disabled || readonly}
          onClick={handleSubmit}
          className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit {cardCount > 1 ? `${cardCount} Devices` : 'Details'}
        </button>
      </div>
    )
  }

  return null
}
