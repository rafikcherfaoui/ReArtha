import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../api/axios'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function AdminHome() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data))
  }, [])

  if (!stats) return <p style={{ color: 'var(--gray-400)' }}>Loading…</p>

  const chartData = buildChartData(stats.depositsPerDay)

  const kpis = [
    { label: 'Registered users',   value: stats.totalUsers,         accent: 'var(--green-600)' },
    { label: 'Total deposits',     value: stats.totalDeposits,      accent: 'var(--green-500)' },
    { label: 'Pending deposits',   value: stats.pendingDeposits,    accent: 'var(--amber-600)' },
    { label: 'Points awarded',     value: stats.totalPointsAwarded, accent: '#7c3aed' },
    { label: 'Total redemptions',  value: stats.totalRedemptions,   accent: 'var(--green-400)' },
    { label: 'Pending fulfillment',value: stats.pendingRedemptions, accent: 'var(--red-600)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        {kpis.map(({ label, value, accent }) => (
          <Card key={label} style={{ borderTop: `3px solid ${accent}`, padding: '1.25rem' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              {label}
            </p>
            <p style={{ fontSize: 30, fontWeight: 700, color: accent }}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Chart + recent activity side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
        <Card>
          <h2 style={{ marginBottom: '1.25rem' }}>Deposits — last 7 days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13 }}
                cursor={{ fill: 'var(--green-50)' }}
              />
              <Bar dataKey="deposits" fill="var(--green-600)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <h2 style={{ marginBottom: '1.25rem' }}>Recent activity</h2>
          {stats.recentActivity.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No activity yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {stats.recentActivity.map((tx) => (
                <div key={tx._id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', padding: '9px 0',
                  borderBottom: '1px solid var(--gray-100)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.userId?.name ?? 'Unknown'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.reason}
                    </div>
                  </div>
                  <Badge variant={tx.type === 'earn' ? 'success' : 'danger'}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.points}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function buildChartData(depositsPerDay) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const found = depositsPerDay.find((x) => x._id === key)
    return { day: label, deposits: found?.count ?? 0 }
  })
}