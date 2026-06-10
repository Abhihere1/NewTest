export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3" data-testid="typing-indicator">
      {/* Avatar spacer */}
      <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-white text-xs font-bold">P</span>
      </div>
      <div className="card px-4 py-3 rounded-xl max-w-xs">
        <div className="dot-pulse flex gap-1 items-center" style={{ height: 20 }}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
