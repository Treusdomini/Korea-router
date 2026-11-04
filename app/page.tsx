'use client'

import { useState, useEffect } from 'react'

interface Mapping {
  id: string
  englishUrl: string
  koreanUrl: string
  createdAt: string
}

export default function Dashboard() {
  const [list, setList] = useState<Mapping[]>([])
  const [en, setEn] = useState('')
  const [ko, setKo] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchList() {
    try {
      const res = await fetch('/api/list')
      const data = await res.json()
      // Always expect an array from /api/list
      setList(Array.isArray(data) ? data : [])
    } catch {
      setList([])
      setMessage('Failed to load mappings')
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  async function create() {
    if (!en || !ko) {
      setMessage('Both URLs are required')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ englishUrl: en, koreanUrl: ko }),
      })

      const data = await res.json()

      if (res.ok) {
        setEn('')
        setKo('')
        // Show the short link immediately so the user sees it
        const short = data.link || `/${data.id}`
        setMessage(`Link created: ${short}`)
        // Refresh list so the new row appears with full URLs
        await fetchList()
      } else {
        setMessage(data.error || 'Failed to create')
      }
    } catch {
      setMessage('Network error')
    }

    setLoading(false)
  }

  async function del(id: string) {
    if (!confirm('Delete this link?')) return

    setDeletingId(id)
    setMessage('')

    try {
      const res = await fetch(`/api/delete?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Link deleted')
        setList((prev) => prev.filter((m) => m.id !== id))
      } else {
        const err = await res.json().catch(() => ({}))
        setMessage(err.error || 'Failed to delete')
        await fetchList()
      }
    } catch {
      setMessage('Network error while deleting')
      await fetchList()
    }

    setDeletingId(null)
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="logo">
          <span className="bracket">[</span>
          <span className="title">KOREA_ROUTER</span>
          <span className="bracket">]</span>
        </div>
        <div className="subtitle">GEO-LINK // SYS.v1.0</div>
      </header>

      <section className="panel create-panel">
        <div className="panel-header">
          <span className="panel-tag">NEW_LINK</span>
        </div>
        <div className="panel-body">
          <label className="label">ENGLISH_URL</label>
          <input
            className="input"
            placeholder="https://example.com/en"
            value={en}
            onChange={(e) => setEn(e.target.value)}
          />
          <label className="label">KOREAN_URL</label>
          <input
            className="input"
            placeholder="https://example.com/ko"
            value={ko}
            onChange={(e) => setKo(e.target.value)}
          />
          <button
            className="btn primary"
            onClick={create}
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : '>> CREATE_SHORT_LINK'}
          </button>
          {message && (
            <p
              className={`msg ${
                message.toLowerCase().includes('created') ||
                message.toLowerCase().includes('deleted')
                  ? 'ok'
                  : 'err'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </section>

      <section className="panel list-panel">
        <div className="panel-header">
          <span className="panel-tag">ACTIVE_MAPPINGS</span>
          <span className="count">{list.length} entries</span>
        </div>
        <div className="table-wrap">
          {list.length === 0 ? (
            <div className="empty">NO_MAPPINGS_FOUND // create one above</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ENGLISH</th>
                  <th>KOREAN</th>
                  <th>SHORT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id}>
                    <td className="id-cell">{m.id}</td>
                    <td className="url-cell" title={m.englishUrl}>
                      {m.englishUrl || '—'}
                    </td>
                    <td className="url-cell" title={m.koreanUrl}>
                      {m.koreanUrl || '—'}
                    </td>
                    <td>
                      <a
                        className="short-link"
                        href={`/${m.id}`}
                        target="_blank"
                        rel="noopener"
                      >
                        /{m.id}
                      </a>
                    </td>
                    <td>
                      <button
                        className="btn danger"
                        onClick={() => del(m.id)}
                        disabled={deletingId === m.id}
                      >
                        {deletingId === m.id ? '...' : 'DEL'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <footer className="footer">
        <span>STATUS: ONLINE</span>
        <span className="blink">_</span>
      </footer>

      <style jsx>{`
        .dashboard {
          max-width: 960px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
          position: relative;
        }

        .header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--neon-cyan);
          text-shadow: var(--glow-cyan);
        }

        .bracket {
          color: var(--neon-pink);
          text-shadow: var(--glow-pink);
        }

        .title {
          margin: 0 0.25rem;
        }

        .subtitle {
          margin-top: 0.4rem;
          font-size: 0.85rem;
          color: var(--muted);
          letter-spacing: 0.3em;
        }

        .panel {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 4px;
          margin-bottom: 1.75rem;
          box-shadow:
            0 0 0 1px rgba(0, 240, 255, 0.08),
            0 0 24px rgba(0, 240, 255, 0.06);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          background: linear-gradient(90deg, rgba(0, 240, 255, 0.08), transparent);
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }

        .panel-tag {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: var(--neon-cyan);
          text-shadow: 0 0 6px #00f0ff88;
        }

        .count {
          font-size: 0.75rem;
          color: var(--muted);
        }

        .panel-body {
          padding: 1.25rem 1rem;
        }

        .label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          color: var(--neon-pink);
          margin-bottom: 0.35rem;
          margin-top: 0.75rem;
        }

        .label:first-of-type {
          margin-top: 0;
        }

        .input {
          width: 100%;
          padding: 0.7rem 0.85rem;
          background: #080810;
          border: 1px solid #2a2a40;
          border-radius: 2px;
          color: var(--text);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .input:focus {
          border-color: var(--neon-cyan);
          box-shadow: 0 0 0 1px var(--neon-cyan), 0 0 12px #00f0ff33;
        }

        .input::placeholder {
          color: #444466;
        }

        .btn {
          display: inline-block;
          padding: 0.65rem 1.1rem;
          border: 1px solid transparent;
          border-radius: 2px;
          cursor: pointer;
          font-weight: 600;
          letter-spacing: 0.08em;
          transition: all 0.15s;
        }

        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .btn.primary {
          width: 100%;
          margin-top: 1.1rem;
          background: transparent;
          border-color: var(--neon-cyan);
          color: var(--neon-cyan);
          text-shadow: 0 0 6px #00f0ff88;
        }

        .btn.primary:hover:not(:disabled) {
          background: rgba(0, 240, 255, 0.12);
          box-shadow: var(--glow-cyan);
        }

        .btn.danger {
          padding: 0.3rem 0.65rem;
          font-size: 0.75rem;
          background: transparent;
          border-color: var(--danger);
          color: var(--danger);
        }

        .btn.danger:hover:not(:disabled) {
          background: rgba(255, 51, 102, 0.15);
          box-shadow: 0 0 10px #ff336655;
        }

        .msg {
          margin: 0.9rem 0 0;
          font-size: 0.85rem;
          word-break: break-all;
        }

        .msg.ok {
          color: var(--neon-green);
          text-shadow: var(--glow-green);
        }

        .msg.err {
          color: var(--danger);
        }

        .table-wrap {
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .table th {
          text-align: left;
          padding: 0.7rem 0.9rem;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: var(--muted);
          border-bottom: 1px solid rgba(0, 240, 255, 0.15);
          background: rgba(0, 0, 0, 0.25);
        }

        .table td {
          padding: 0.75rem 0.9rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
          color: var(--text);
        }

        .table tr:hover td {
          background: rgba(0, 240, 255, 0.03);
        }

        .id-cell {
          color: var(--neon-yellow);
          font-family: 'Orbitron', monospace;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .url-cell {
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #c8c8ff;
          font-size: 0.8rem;
        }

        .short-link {
          color: var(--neon-cyan);
          text-decoration: none;
          text-shadow: 0 0 6px #00f0ff66;
          white-space: nowrap;
        }

        .short-link:hover {
          text-decoration: underline;
        }

        .empty {
          padding: 2.5rem 1rem;
          text-align: center;
          color: var(--muted);
          letter-spacing: 0.1em;
        }

        .footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.75rem;
          color: var(--muted);
          letter-spacing: 0.2em;
        }

        .blink {
          animation: blink 1.1s step-end infinite;
          color: var(--neon-green);
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        @media (max-width: 640px) {
          .logo {
            font-size: 1.4rem;
          }
          .url-cell {
            max-width: 140px;
          }
        }
      `}</style>
    </div>
  )
}
