import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gray-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 1rem' }}>
        {/* Brand */}
        

        {/* Card */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-lg)', padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--green-800)', letterSpacing: '-0.5px' }}>
            Re<span style={{ color: 'var(--green-500)' }}>Artha</span>
          </span>
          <p style={{ margin: '6px 0 0', color: 'var(--gray-500)', fontSize: 14 }}>
            Sign in to your account
          </p>
        </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {error && (
              <p style={{ color: 'var(--red-600)', fontSize: 13, background: 'var(--red-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--gray-500)', fontSize: 13 }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--green-600)', fontWeight: 500 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}