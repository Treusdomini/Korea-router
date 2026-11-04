'use client'

import { useState, useEffect, useCallback } from 'react'

interface Mapping {
  id: string
  englishUrl: string
  koreanUrl: string
  createdAt: string
}

export default function Dashboard() {
  const [list, setList] = useState<Mapping[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [en, setEn] = useState('')
  const [ko, setKo] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [createdLink, setCreatedLink] = useState('')

  const fetchList = useCallback(async () => {
    setListLoading(true)
    setListError('')
    try {
      const res = await fetch('/api/list', { cache: 'no-store' })
      // BUG FIX: the API returns { error } with a 500 — without this guard a
      // failed request crashed the page on `list.map`.
      const data: unknown = await res.json()
      setList(Array.isArray(data) ? (data as Mapping[]) : [])
      if (!res.ok) {
        setListError(
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Failed to load links'
        )
      }
    } catch {
      setList([])
      setListError('Failed to load links')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  async function create() {
    if (!en || !ko) {
      setMessage('Both URLs are required')
      return
    }

    setLoading(true)
    setMessage('')
    setCreatedLink('')

    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ englishUrl: en, koreanUrl: ko }),
      })

      const data: unknown = await res.json().catch(() => null)

      if (res.ok && data && typeof data === 'object' && 'link' in data) {
        setEn('')
        setKo('')
        setMessage('Link created successfully')
        setCreatedLink(String((data as { link: unknown }).link))
        fetchList()
      } else {
        setMessage(
          data && typeof data === 'object' && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Failed to create'
        )
      }
    } catch {
      setMessage('Failed to create')
    } finally {
      setLoading(false)
    }
  }

  async function del(id: string) {
    if (!window.confirm('Delete this link?')) return

    await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    fetchList()
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Korea Link Router</h1>
      <p style={{ color: '#64748b', marginTop: 0, marginBottom: '1.5rem' }}>
        Short links redirect visitors from Korea to the Korean destination, everyone else to the English one.
      </p>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <input
          type="url"
          placeholder="English URL (https://...)"
          value={en}
          onChange={(e) => setEn(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: 8, border: '1px solid #cbd5e1', borderRadius: 8, minHeight: 44 }}
        />
        <input
          type="url"
          placeholder="Korean URL (https://...)"
          value={ko}
          onChange={(e) => setKo(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: 12, border: '1px solid #cbd5e1', borderRadius: 8, minHeight: 44 }}
        />
        <button
          onClick={create}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            minHeight: 44,
            background: loading ? '#93c5fd' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Creating...' : 'Create Short Link'}
        </button>
        {message && (
          <p style={{ marginTop: 12, marginBottom: 0, color: message.includes('success') ? 'green' : 'red' }}>
            {message}
          </p>
        )}
        {createdLink && (
          <p style={{ marginTop: 8, marginBottom: 0 }}>
            Your link:{' '}
            <a href={createdLink} target="_blank" rel="noopener" style={{ wordBreak: 'break-all' }}>
              {createdLink}
            </a>{' '}
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(createdLink)}
              style={{ padding: '4px 10px', minHeight: 32, border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc', cursor: 'pointer' }}
            >
              Copy
            </button>
          </p>
        )}
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Your links</h2>
      {listError && <p style={{ color: 'red' }}>{listError}</p>}
      {listLoading ? (
        <p style={{ color: '#64748b' }}>Loading…</p>
      ) : list.length === 0 && !listError ? (
        <p style={{ color: '#64748b' }}>No links yet — create your first one above.</p>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
                <th style={{ padding: 12, textAlign: 'left' }}>English</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Korean</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Short Link</th>
                <th style={{ padding: 12 }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{m.id}</td>
                  <td style={{ padding: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <code style={{ wordBreak: 'break-all' }}>{m.englishUrl}</code>
                  </td>
                  <td style={{ padding: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <code style={{ wordBreak: 'break-all' }}>{m.koreanUrl}</code>
                  </td>
                  <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                    <a href={`/${m.id}`} target="_blank" rel="noopener">
                      /{m.id}
                    </a>
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => del(m.id)}
                      style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', minHeight: 44, borderRadius: 6, cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
