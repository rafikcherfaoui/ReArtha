import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function Profile() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      const res = await api.put('/user/profile', form)
      login(localStorage.getItem('token'), res.data)
      setFeedback({ type: 'success', message: 'Profile updated successfully' })
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }))
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>My profile</h1>

      {/* Stats summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, marginBottom: '2rem', marginTop: '1rem'
      }}>
        {[
          { label: 'Points balance', value: user?.points ?? 0, color: '#2e7d32' },
          { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '—', color: '#1565c0' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: `${color}`, borderRadius: 10, padding: '1rem',
            border: `2px solid ${color}`
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#ffffff' }}><b>{label}</b></p>
            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{value}</p>
          </div>
        ))}
      </div>

      {feedback && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: '1rem',
          background: feedback.type === 'success' ? '#e8f5e9' : '#fce8e8',
          color: feedback.type === 'success' ? '#2e7d32' : '#c62828',
          fontWeight: 500,
        }}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 15, marginBottom: '1rem', color: '#444' }}>Personal info</h2>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Full name</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Phone number</label>
            <input
              style={inputStyle}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+213 ..."
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Email</label>
            <input
              style={{ ...inputStyle, background: '#f5f5f5', color: '#999' }}
              value={user?.email || ''}
              disabled
            />
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#bbb' }}>Email cannot be changed</p>
          </div>
        </section>

        <section style={{
          marginBottom: '1.5rem', paddingTop: '1.5rem',
          borderTop: '1px solid #f0f0f0'
        }}>
          <h2 style={{ fontSize: 15, marginBottom: '4px', color: '#444' }}>Change password</h2>
          <p style={{ margin: '0 0 1rem', fontSize: 13, color: '#999' }}>
            Leave blank to keep your current password.
          </p>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Current password</label>
            <input
              type="password"
              style={inputStyle}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>New password</label>
            <input
              type="password"
              style={inputStyle}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Min 6 characters"
            />
          </div>
        </section>

        <button type="submit" disabled={saving} style={{
          width: '100%', padding: '12px', background: 'var(--green-800)', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
        }}>
          <b>{saving ? 'Saving...' : 'Save changes'}</b>
        </button>
      </form>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6
}
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd',
  borderRadius: 8, fontSize: 14, boxSizing: 'border-box'
}