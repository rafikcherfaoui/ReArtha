import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function Rewards() {
  const { user, login } = useAuth()
  const [rewards, setRewards] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [view, setView] = useState('store') // 'store' | 'history'
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(null) // id of the reward being redeemed
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/rewards'),
      api.get('/user/redemptions'),
    ]).then(([rewardsRes, redemptionsRes]) => {
      setRewards(rewardsRes.data)
      setRedemptions(redemptionsRes.data)
      setLoading(false)
    })
  }, [])

  const handleRedeem = async (reward) => {
    if (user.points < reward.pointsCost) return
    if (!confirm(`Redeem "${reward.title}" for ${reward.pointsCost} points?`)) return

    setRedeeming(reward._id)
    setFeedback(null)
    try {
      const res = await api.post(`/user/rewards/${reward._id}/redeem`)

      // Refresh points in context
      const meRes = await api.get('/auth/me')
      login(localStorage.getItem('token'), meRes.data)

      setFeedback({ type: 'success', message: res.data.message })

      // Refresh redemption history
      const redemptionsRes = await api.get('/user/redemptions')
      setRedemptions(redemptionsRes.data)

      // Update stock in the local list
      setRewards((prev) =>
        prev.map((r) =>
          r._id === reward._id && r.stock !== -1
            ? { ...r, stock: r.stock - 1 }
            : r
        )
      )
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Redemption failed',
      })
    } finally {
      setRedeeming(null)
    }
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading rewards...</p>

  return (
    <div style={{ margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Rewards store</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>
            You have <strong style={{ color: '#2e7d32' }}>{user?.points ?? 0} points</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['store', 'history'].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
              background: view === v ? '#2e7d32' : '#fff',
              color: view === v ? '#fff' : '#333',
              border: '1px solid #ddd',
            }}>
              {v === 'store' ? 'Browse' : 'My redemptions'}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: '1rem',
          background: feedback.type === 'success' ? '#e8f5e9' : '#fce8e8',
          color: feedback.type === 'success' ? '#2e7d32' : '#c62828',
          fontWeight: 500, display: 'flex', justifyContent: 'space-between'
        }}>
          <span>{feedback.type === 'success' ? '🎉 ' : '❌ '}{feedback.message}</span>
          <button onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* ── Store view ── */}
      {view === 'store' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {rewards.map((reward) => {
            const canAfford = user?.points >= reward.pointsCost
            const outOfStock = reward.stock !== -1 && reward.stock < 1
            const isRedeeming = redeeming === reward._id

            return (
              <div key={reward._id} style={{
                border: '1px solid #eee', borderRadius: 12, overflow: 'hidden',
                background: '#fff', opacity: outOfStock ? 0.6 : 1,
                boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                <div style={{
                  height: 90, background: canAfford ? '#e8f5e9' : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
                }}>
                  Re<span style={{ color: 'var(--green-400)' }}>Artha</span>
                </div>
                <div style={{ padding: '0.875rem' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 14, lineHeight: 1.3 }}>{reward.title}</h3>
                  <p style={{ margin: '0 0 10px', fontSize: 12, color: '#777', lineHeight: 1.4 }}>
                    {reward.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontWeight: 700, fontSize: 15,
                      color: canAfford ? '#2e7d32' : '#999'
                    }}>
                      {reward.pointsCost} pts
                    </span>
                    <span style={{ fontSize: 11, color: '#bbb' }}>
                      {reward.stock === -1 ? '∞' : `${reward.stock} left`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || outOfStock || isRedeeming}
                    style={{
                      width: '100%', marginTop: 10, padding: '8px',
                      background: canAfford && !outOfStock ? '#2e7d32' : '#e0e0e0',
                      color: canAfford && !outOfStock ? '#fff' : '#999',
                      border: 'none', borderRadius: 6, cursor: canAfford && !outOfStock ? 'pointer' : 'not-allowed',
                      fontSize: 13, fontWeight: 500
                    }}
                  >
                    {isRedeeming ? 'Redeeming...' : outOfStock ? 'Out of stock' : !canAfford ? 'Not enough points' : 'Redeem'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Redemption history view ── */}
      {view === 'history' && (
        <div>
          {redemptions.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '2rem' }}>
              You haven't redeemed anything yet.
            </p>
          ) : (
            redemptions.map((r) => (
              <div key={r._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 10px', borderBottom: '1px solid #f0f0f0', background: '#fff', borderRadius: 10, marginBottom: 10, boxShadow: '1px 2px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{r.rewardId?.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#999' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#c62828' }}>
                    -{r.pointsSpent} pts
                  </p>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 4,
                    background: r.status === 'fulfilled' ? '#e8f5e9' : '#fff8e1',
                    color: r.status === 'fulfilled' ? '#2e7d32' : '#e65100',
                  }}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}