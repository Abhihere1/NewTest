import MarkdownRenderer from './MarkdownRenderer'
import DynamicControls, { ControlData } from './DynamicControls'

interface HistoryEntry {
  role: 'user' | 'assistant'
  content: string
  controls?: ControlData
}

interface Props {
  history: HistoryEntry[]
  readonly?: boolean
}

export default function ConversationCard({ history, readonly = true }: Props) {
  return (
    <div data-testid="conversation-card" className="card rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Conversation History</p>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto chat-scroll" style={{ maxHeight: 520 }}>
        {history.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
        )}
        {history.map((entry, i) => (
          <div key={i}>
            {entry.role === 'user' ? (
              <div className="flex justify-end" data-testid={`history-user-${i}`}>
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white font-medium"
                  style={{ background: '#DC2626' }}
                >
                  {entry.content}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3" data-testid={`history-assistant-${i}`}>
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <div className="flex-1">
                  <div
                    className="card rounded-xl rounded-tl-sm px-4 py-3"
                    style={{ borderLeft: '2px solid #DC2626' }}
                  >
                    <MarkdownRenderer content={entry.content} />
                  </div>
                  {entry.controls && (
                    <DynamicControls
                      controls={{ ...entry.controls, completed: readonly ? true : entry.controls.completed }}
                      onSend={() => {}}
                      disabled={readonly}
                      readonly={readonly}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
