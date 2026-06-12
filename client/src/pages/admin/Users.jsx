import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [adjusting, setAdjusting] = useState(null) // { userId, name }
  const [adjustment, setAdjustment] = useState({ amount: '', reason: '' })
  const [saving, setSaving] = useState(false)

  const fetchUsers = async (q = '') => {
    const res = await api.get(`/admin/users${q ? `?search=${q}` : ''}`)
    setUsers(res.data.users)
    setTotal(res.data.total)
  }

  useEffect(() => { fetchUsers() }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'freeze' : 'reactivate'
    if (!confirm(`${action} ${user.name}'s account?`)) return
    await api.put(`/admin/users/${user._id}/status`)
    fetchUsers(search)
  }

  const openAdjust = (user) => {
    setAdjusting(user)
    setAdjustment({ amount: '', reason: '' })
  }

  const handleAdjust = async () => {
    const amount = Number(adjustment.amount)
    if (!amount || amount === 0) return alert('Enter a non-zero amount')
    setSaving(true)
    try {
      await api.put(`/admin/users/${adjusting._id}/points`, {
        amount,
        reason: adjustment.reason || 'Manual adjustment by admin',
      })
      setAdjusting(null)
      fetchUsers(search)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust points')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Total users <span style={{ fontSize: 17, color: '#000000', fontWeight: 400 }}>{total}</span></h1>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: 250, padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc'
          }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>User</th>
            <th style={{ padding: '8px 12px' }}>Points</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}>Joined</th>
            <th style={{ padding: '8px 12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{u.email}</div>
              </td>
              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2e7d32' }}>
                {u.points}
              </td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                  background: u.isActive ? '#e8f5e9' : '#fce8e8',
                  color: u.isActive ? '#2e7d32' : '#c62828',
                }}>
                  {u.isActive ? 'Active' : 'Frozen'}
                </span>
              </td>
              <td style={{ padding: '10px 12px', color: '#888', fontSize: 12 }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openAdjust(u)}
                    style={btnStyle('var(--blue-800)', '#000000')}
                  >
                    Adjust pts
                  </button>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    style={u.isActive ? btnStyle('var(--red-600)', '#ffffff') : btnStyle('var(--green-600)', '#ffffff')}
                  >
                    {u.isActive ? 'Freeze' : 'Reactivate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p style={{ textAlign: 'center', color: '#bbb', marginTop: '2rem' }}>No users found</p>
      )}

      {/* Points adjustment modal */}
      {adjusting && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '2rem',
            width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Adjust points</h2>
            <p style={{ color: '#666', marginTop: 0 }}>
              User: <strong>{adjusting.name}</strong> — current balance: <strong style={{ color: '#2e7d32' }}>{adjusting.points} pts</strong>
            </p>
            <label style={labelStyle}>Amount (use negative to deduct)</label>
            <input
              type="number"
              placeholder="e.g. 20 or -10"
              value={adjustment.amount}
              onChange={(e) => setAdjustment({ ...adjustment, amount: e.target.value })}
              style={inputStyle}
            />
            <label style={{ ...labelStyle, marginTop: 12 }}>Reason (optional)</label>
            <input
              placeholder="e.g. Bonus for event participation"
              value={adjustment.reason}
              onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
              <button onClick={handleAdjust} disabled={saving} style={{
                flex: 1, padding: '10px', background: '#1a1a2e', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500
              }}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
              <button onClick={() => setAdjusting(null)} style={{
                flex: 1, padding: '10px', background: '#f5f5f5', color: '#333',
                border: 'none', borderRadius: 8, cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const btnStyle = (bg, color) => ({
  fontSize: 12, padding: '4px 10px', background: bg,
  color, border: `1px solid ${color}30`, borderRadius: 4, cursor: 'pointer'
})
const labelStyle = { display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }
const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #ddd',
  borderRadius: 8, fontSize: 14, boxSizing: 'border-box'
}