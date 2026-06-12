import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function Deposits() {
  const [deposits, setDeposits] = useState([])
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [newCodes, setNewCodes] = useState([]) // codes just generated, shown in a banner

  const fetchDeposits = async () => {
    const params = statusFilter ? `?status=${statusFilter}` : ''
    const res = await api.get(`/admin/deposits${params}`)
    setDeposits(res.data.deposits)
    setTotal(res.data.total)
  }

  useEffect(() => {
    fetchDeposits()
  }, [statusFilter])

  const handleGenerate = async () => {
    setGenerating(true)
    setNewCodes([])
    try {
      const res = await api.post('/admin/deposits/generate', { quantity })
      setNewCodes(res.data.map((d) => d.code))
      fetchDeposits()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  const handleValidate = async (id) => {
    await api.put(`/admin/deposits/${id}/validate`)
    fetchDeposits()
  }

  const handleReject = async (id) => {
    if (!confirm('Reject this deposit?')) return
    await api.put(`/admin/deposits/${id}/reject`)
    fetchDeposits()
  }

  const statusColor = (s) =>
    s === 'validated' ? 'green' : s === 'rejected' ? 'red' : 'orange'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: 16 }}>
      {/* Generate section */}
      <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}><b>Generate codes</b></h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <label><b>Quantity:</b></label>
          <input
            type="number"
            min={1}
            max={50}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: 80, padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button onClick={handleGenerate} disabled={generating} style={{
            padding: '8px 16px', background: 'var(--green-800)', color: '#fff',
            border: 'none', borderRadius: 6, cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
          }}>
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Show newly generated codes */}
        {newCodes.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong>New codes — hand these to citizens at the drop-off point:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {newCodes.map((code) => (
                <span key={code} style={{
                  fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold',
                  background: '#e8f5e9', padding: '4px 12px', borderRadius: 6,
                  border: '1px solid #a5d6a7', letterSpacing: 2
                }}>
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}>
        <span>Filter:</span>
        {['', 'pending', 'validated', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              background: statusFilter === s ? 'var(--green-800)' : '#fff',
              color: statusFilter === s ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            {s || 'All'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: '#666', fontSize: 14 }}>{total} total</span>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Code</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }}>Used by</th>
            <th style={{ padding: '8px 12px' }}>Points</th>
            <th style={{ padding: '8px 12px' }}>Date</th>
            <th style={{ padding: '8px 12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((d) => (
            <tr key={d._id} style={{ borderBottom: '2px solid #f0f0f0' }}>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 }}>
                {d.code}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{
                  color: statusColor(d.status),
                  background: `${statusColor(d.status)}18`,
                  padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500
                }}>
                  {d.status}
                </span>
              </td>
              <td style={{ padding: '8px 12px', color: '#555' }}>
                {d.userId ? `${d.userId.name}` : '—'}
              </td>
              <td style={{ padding: '8px 12px' }}>
                {d.pointsAwarded > 0 ? `+${d.pointsAwarded}` : '—'}
              </td>
              <td style={{ padding: '8px 12px', color: '#888', fontSize: 12 }}>
                {new Date(d.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '8px 12px' }}>
                {d.status === 'pending' && (
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleValidate(d._id)}
                      style={{ fontSize: 12, padding: '2px 8px', background: 'var(--green-600)', border: '1px solid #a5d6a7', borderRadius: 4, cursor: 'pointer', color: '#ffffff' }}>
                      Validate
                    </button>
                    <button onClick={() => handleReject(d._id)}
                      style={{ fontSize: 12, padding: '2px 8px', background: 'var(--red-600)', border: '1px solid #ffffff', borderRadius: 4, cursor: 'pointer', color: '#ffffff' }}>
                      Reject
                    </button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deposits.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>No deposits found</p>
      )}
    </div>
  )
}