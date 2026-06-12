import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

export default function Dashboard() {
  const { user, login } = useAuth()
  const [code, setCode] = useState('')
  const [transactions, setTransactions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    api.get('/user/transactions').then((res) => setTransactions(res.data))
  }, [])

  const handleRedeem = async (e) => {
    e.preventDefault()
    if (code.length !== 8) return
    setSubmitting(true); setFeedback(null)
    try {
      const res = await api.post('/user/deposits/redeem', { code })
      const meRes = await api.get('/auth/me')
      login(localStorage.getItem('token'), meRes.data)
      setFeedback({ type: 'success', message: res.data.message })
      setCode('')
      const txRes = await api.get('/user/transactions')
      setTransactions(txRes.data)
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Invalid code' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Page header */}
      <div>
        <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>
          Track your deposits and redeem rewards below.
        </p>
      </div>

      {/* Top row: balance + quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>

        {/* Balance card */}
        <Card style={{ background: 'var(--green-800)', border: 'none', color: '#fff' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--green-100)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Points balance
          </p>
          <p style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>
            {user?.points ?? 0}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            Earn 15 pts per deposit
          </p>
        </Card>

        {/* Code entry card */}
        <Card>
          <h2 style={{ marginBottom: 6 }}>Enter deposit code</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1rem', fontSize: 13 }}>
            Received a code at a collection center? Enter it here to earn points.
          </p>
          <form onSubmit={handleRedeem} style={{ display: 'flex', gap: 8 }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="AB12CD34"
              maxLength={8}
              style={{
                flex: 1, fontFamily: 'monospace', fontSize: 20, fontWeight: 600,
                letterSpacing: 4, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', textAlign: 'center',
                outline: 'none', textTransform: 'uppercase',
              }}
            />
            <Button type="submit" disabled={submitting || code.length !== 8} size="lg">
              {submitting ? '…' : 'Redeem'}
            </Button>
          </form>
          {feedback && (
            <div style={{
              marginTop: 12, padding: '9px 14px', borderRadius: 'var(--radius-md)',
              background: feedback.type === 'success' ? 'var(--green-50)' : 'var(--red-50)',
              color: feedback.type === 'success' ? 'var(--green-700)' : 'var(--red-600)',
              fontSize: 13, fontWeight: 500, borderLeft: `3px solid ${feedback.type === 'success' ? 'var(--green-500)' : 'var(--red-600)'}`,
            }}>
              {feedback.message}
            </div>
          )}
        </Card>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { to: '/rewards', label: 'Rewards store', sub: 'Spend your points', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="8" cy="21" r="1" />
  <circle cx="19" cy="21" r="1" />
  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
</svg>
 },
          { to: '/map', label: 'Find a center', sub: 'Collection locations', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
  <circle cx="12" cy="10" r="3" />
</svg>
 },
          { to: '/profile', label: 'My profile', sub: 'Edit account details', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</svg>
 },
        ].map(({ to, label, sub, icon }) => (
          <Link key={to} to={to}>
            <Card style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '1rem 1.25rem', transition: 'box-shadow 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            >
              <span style={{ fontSize: 26 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 12 }}>{sub}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Transaction history */}
      <Card>
        <h2 style={{ marginBottom: '1.25rem' }}>Recent activity</h2>
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem 0' }}>
            No activity yet — redeem your first deposit code above.
          </p>
        ) : (
          <div>
            {transactions.slice(0, 8).map((tx, i) => (
              <div key={tx._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0',
                borderBottom: i < Math.min(transactions.length, 8) - 1 ? '1px solid var(--gray-100)' : 'none',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: tx.type === 'earn' ? 'var(--green-50)' : 'var(--red-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>
                    {tx.type === 'earn' ? '↑' : '↓'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{tx.reason}</div>
                    <div style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                      {new Date(tx.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontWeight: 600, fontSize: 15,
                  color: tx.type === 'earn' ? 'var(--green-600)' : 'var(--red-600)',
                }}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}