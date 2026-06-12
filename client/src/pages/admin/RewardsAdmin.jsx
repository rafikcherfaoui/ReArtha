import { useEffect, useState } from 'react'
import api from '../../api/axios'

const emptyForm = {
  title: '', description: '', pointsCost: '', type: 'physical', stock: '-1', imageUrl: ''
}

export default function RewardsAdmin() {
  const [rewards, setRewards] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [view, setView] = useState('rewards') // 'rewards' | 'redemptions'
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchRewards = async () => {
    const res = await api.get('/rewards')
    setRewards(res.data)
  }

  const fetchRedemptions = async () => {
    const res = await api.get('/admin/redemptions')
    setRedemptions(res.data)
  }

  useEffect(() => { fetchRewards() }, [])

  const handleViewChange = (v) => {
    setView(v)
    if (v === 'redemptions') fetchRedemptions()
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (reward) => {
    setForm({
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
      type: reward.type,
      stock: String(reward.stock),
      imageUrl: reward.imageUrl || '',
    })
    setEditingId(reward._id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.pointsCost) return alert('Title and cost are required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        pointsCost: Number(form.pointsCost),
        stock: Number(form.stock),
      }
      if (editingId) {
        await api.put(`/admin/rewards/${editingId}`, payload)
      } else {
        await api.post('/admin/rewards', payload)
      }
      setShowForm(false)
      fetchRewards()
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this reward?')) return
    await api.delete(`/admin/rewards/${id}`)
    fetchRewards()
  }

  const handleFulfill = async (id) => {
    await api.put(`/admin/redemptions/${id}/fulfill`)
    fetchRedemptions()
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['rewards', 'redemptions'].map((v) => (
            <button key={v} onClick={() => handleViewChange(v)} style={{
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
              background: view === v ? '#1a1a2e' : '#fff',
              color: view === v ? '#fff' : '#333',
              border: '1px solid #ddd',
            }}>
              {v === 'rewards' ? 'Catalog' : 'Redemption requests'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Catalog view ── */}
      {view === 'rewards' && (
        <>
          <button onClick={openCreate} style={{
            marginBottom: '1rem', padding: '8px 18px', background: '#2e7d32',
            color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14
          }}>
            + Add reward
          </button>

          {/* Inline form */}
          {showForm && (
            <div style={{
              background: '#f0f4f0', border: '1px solid #d0d8e4',
              borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem'
            }}>
              <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit reward' : 'New reward'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input style={inputStyle} value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Points cost</label>
                  <input style={inputStyle} type="number" value={form.pointsCost}
                    onChange={(e) => setForm({ ...form, pointsCost: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="physical">Physical</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Stock (-1 = unlimited)</label>
                  <input style={inputStyle} type="number" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' }}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Image URL (optional)</label>
                  <input style={inputStyle} value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '8px 20px', background: '#2e7d32', color: '#fff',
                  border: 'none', borderRadius: 6, cursor: 'pointer'
                }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setShowForm(false)} style={{
                  padding: '8px 20px', background: '#fff', border: '1px solid #ddd',
                  borderRadius: 6, cursor: 'pointer'
                }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rewards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {rewards.map((r) => (
              <div key={r._id} style={{
                border: '1px solid #eee', borderRadius: 10, overflow: 'hidden',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                {r.imageUrl && (
                  <img src={r.imageUrl} alt={r.title}
                    style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                )}
                {!r.imageUrl && (
                  <div style={{ height: 80, background: '#f0f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    Re<span style={{ color: 'var(--green-400)' }}>Artha</span>
                  </div>
                )}
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: 15 }}>{r.title}</h3>
                    <span style={{
                      background: '#e8f5e9', color: '#2e7d32',
                      padding: '2px 8px', borderRadius: 4, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap'
                    }}>
                      {r.pointsCost} pts
                    </span>
                  </div>
                  <p style={{ color: '#666', fontSize: 13, margin: '6px 0' }}>{r.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#999' }}>
                      {r.stock === -1 ? 'Unlimited' : `${r.stock} left`} · {r.type}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(r)} style={smallBtnStyle('var(--green-600)', '#fffcfc')}>Edit</button>
                      <button onClick={() => handleDelete(r._id)} style={smallBtnStyle('var(--red-600)', '#ffffff')}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Redemption requests view ── */}
      {view === 'redemptions' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>User</th>
              <th style={{ padding: '8px 12px' }}>Reward</th>
              <th style={{ padding: '8px 12px' }}>Points spent</th>
              <th style={{ padding: '8px 12px' }}>Status</th>
              <th style={{ padding: '8px 12px' }}>Date</th>
              <th style={{ padding: '8px 12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map((r) => (
              <tr key={r._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ fontWeight: 500 }}>{r.userId?.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{r.userId?.email}</div>
                </td>
                <td style={{ padding: '8px 12px' }}>{r.rewardId?.title}</td>
                <td style={{ padding: '8px 12px', color: '#c62828', fontWeight: 600 }}>
                  -{r.pointsSpent}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                    background: r.status === 'fulfilled' ? '#e8f5e9' : '#fff8e1',
                    color: r.status === 'fulfilled' ? '#2e7d32' : '#e65100',
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', fontSize: 12, color: '#888' }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  {r.status === 'pending' && (
                    <button onClick={() => handleFulfill(r._id)}
                      style={smallBtnStyle('var(--green-600)', '#ffffff')}>
                      Mark fulfilled
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 12, color: '#555', marginBottom: 4, fontWeight: 500 }
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }
const smallBtnStyle = (bg, color) => ({
  fontSize: 12, padding: '3px 10px', background: bg, color,
  border: `1px solid ${color}30`, borderRadius: 4, cursor: 'pointer'
})