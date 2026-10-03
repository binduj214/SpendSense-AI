import React, { useState, useRef, useEffect } from 'react'
import { aiApi } from '../services/api'
import { usePageTitle } from '../hooks/usePageTitle'

const SUGGESTED_QUESTIONS = [
  'How much did I spend this month?',
  'Where am I spending the most?',
  'Can I save ₹5,000 this month?',
  'What category increased the most?',
  'What is my budget status?',
  'How much do I earn?',
  'How many transactions do I have?',
  'If I reduce shopping by ₹2000, how much can I save?',
]

const INTENT_LABELS = {
  monthly_spending: 'Monthly Spending',
  highest_spending: 'Top Spending',
  savings_check: 'Savings Check',
  category_increase: 'Category Trend',
  budget_status: 'Budget Status',
  balance: 'Balance',
  income_summary: 'Income',
  transaction_count: 'Count',
  what_if_savings: 'What-If',
  general_summary: 'Summary',
}

export default function AIAssistant() {
  usePageTitle('AI Assistant')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hi! I'm your AI Financial Assistant.\n\nI can answer questions about your spending, income, budgets, and savings — all using your actual data, no external API needed.\n\nTry asking me something!",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (query) => {
    const q = (query || input).trim()
    if (!q || loading) return

    setInput('')
    setMessages(prev => [...prev, {
      role: 'user',
      text: q,
      timestamp: new Date(),
    }])
    setLoading(true)

    try {
      const result = await aiApi.askAssistant(q)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: result.response,
        intent: result.intent,
        timestamp: new Date(),
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `⚠️ I ran into an issue: ${err.message}. Please try again.`,
        timestamp: new Date(),
        isError: true,
      }])
    } finally {
      setLoading(false)
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      text: "Chat cleared! Ask me anything about your finances.",
      timestamp: new Date(),
    }])
  }

  const fmt = (date) => date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">Ask anything about your finances in plain English</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={clearChat}>
          🗑 Clear chat
        </button>
      </div>

      <div className="assistant-layout">
        {/* ── Chat panel ── */}
        <div className="chat-panel card" style={{ padding: 0 }}>
          {/* Messages area */}
          <div className="messages-area">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message-row ${msg.role}`}
              >
                {msg.role === 'assistant' && (
                  <div className="avatar">🤖</div>
                )}
                <div className="message-content">
                  <div className={`bubble ${msg.role}${msg.isError ? ' error' : ''}`}>
                    {msg.text}
                  </div>
                  <div className="message-meta">
                    {fmt(msg.timestamp)}
                    {msg.intent && INTENT_LABELS[msg.intent] && (
                      <span className="intent-tag">{INTENT_LABELS[msg.intent]}</span>
                    )}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="avatar user-avatar">👤</div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="message-row assistant">
                <div className="avatar">🤖</div>
                <div className="message-content">
                  <div className="bubble assistant typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="form-input chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your spending, budget, savings... (Enter to send)"
              disabled={loading}
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ flexShrink: 0 }}
            >
              {loading ? '⏳' : 'Send ↵'}
            </button>
          </div>
        </div>

        {/* ── Suggestions panel ── */}
        <div className="suggestions-panel">
          <div className="card" style={{ marginBottom: '16px' }}>
            <h3 className="card-title">💬 Try asking</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="card ai-info-card">
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🧠</div>
            <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
              How this works
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              The AI assistant reads your actual transaction, income, and budget data to answer questions — no external API or subscription needed.
              <br /><br />
              It uses intent detection to understand what you're asking, then queries your local SQLite database.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .assistant-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 20px;
          height: calc(100vh - 200px);
          min-height: 480px;
        }

        .chat-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          scroll-behavior: smooth;
        }

        /* ── Message rows ── */
        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }
        .message-row.user { flex-direction: row-reverse; }
        .message-row.assistant { flex-direction: row; }

        .avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--bg-main);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .user-avatar {
          background: #E8F4FD;
          border-color: #BBDEFB;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          max-width: 78%;
          gap: 4px;
        }
        .message-row.user .message-content { align-items: flex-end; }

        /* ── Bubbles ── */
        .bubble {
          padding: 11px 15px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07);
        }
        .bubble.user {
          background: var(--primary);
          color: white;
          border-radius: 16px 16px 4px 16px;
        }
        .bubble.assistant {
          background: var(--bg-main);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 16px 16px 16px 4px;
        }
        .bubble.error {
          background: var(--danger-light);
          border-color: #FFCDD2;
          color: var(--danger);
        }

        /* ── Typing indicator ── */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 14px 18px;
          min-width: 60px;
        }
        .typing-indicator span {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--primary-light);
          animation: typingBounce 1.2s ease-in-out infinite;
          display: inline-block;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }

        /* ── Message meta ── */
        .message-meta {
          font-size: 10.5px;
          color: var(--text-muted);
          display: flex; align-items: center; gap: 6px;
          padding: 0 4px;
        }
        .intent-tag {
          background: var(--border-light);
          border-radius: 10px;
          padding: 1px 7px;
          font-size: 10px;
          font-weight: 600;
          color: var(--primary);
        }

        /* ── Chat input area ── */
        .chat-input-area {
          padding: 14px 16px;
          border-top: 1px solid var(--border-light);
          display: flex;
          gap: 10px;
          background: var(--bg-card);
        }
        .chat-input {
          flex: 1;
          border-radius: 24px !important;
          padding-left: 16px !important;
        }

        /* ── Suggestions ── */
        .suggestions-panel {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .suggestion-btn {
          width: 100%;
          text-align: left;
          background: var(--bg-main);
          border: 1px solid var(--border-light);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12.5px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          font-family: inherit;
          line-height: 1.4;
        }
        .suggestion-btn:hover:not(:disabled) {
          background: var(--border-light);
          border-color: var(--primary);
          color: var(--primary);
        }
        .suggestion-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ai-info-card { border-left: 3px solid var(--primary); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .assistant-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .chat-panel { height: 60vh; min-height: 400px; }
          .suggestions-panel { display: none; }
        }
      `}</style>
    </div>
  )
}
