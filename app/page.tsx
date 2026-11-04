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

  async function fetchList() {
    const res = await fetch('/api/list')
    const data = await res.json()
    setList(data)
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

    const res = await fetch('/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ englishUrl: en, koreanUrl: ko }),
    })

    if (res.ok) {
      setEn('')
      setKo('')
      setMessage('Link created successfully')
      fetchList()
    } else {
      const err = await res.json()
      setMessage(err.error || 'Failed to create')
    }

    setLoading(false)
  }

  async function del(id: string) {
    if (!confirm('Delete this link?')) return

    await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    fetchList()
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Korea Link Router</h1>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <input
          placeholder="English URL (https://...)"
          value={en}
          onChange={(e) => setEn(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: 8, border: '1px solid #cbd5e1', borderRadius: 8 }}
        />
        <input
          placeholder="Korean URL (https://...)"
          value={ko}
          onChange={(e) => setKo(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: 12, border: '1px solid #cbd5e1', borderRadius: 8 }}
        />
        <button
          onClick={create}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Creating...' : 'Create Short Link'}
        </button>
        {message && (
          <p style={{ marginTop: 12, color: message.includes('success') ? 'green' : 'red' }}>
            {message}
          </p>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
              <td style={{ padding: 12 }}>{m.id}</td>
              <td style={{ padding: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <code>{m.englishUrl}</code>
              </td>
              <td style={{ padding: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <code>{m.koreanUrl}</code>
              </td>
              <td style={{ padding: 12 }}>
                <a href={`/${m.id}`} target="_blank" rel="noopener">
                  /{m.id}
                </a>
              </td>
              <td style={{ padding: 12 }}>
                <button
                  onClick={() => del(m.id)}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}