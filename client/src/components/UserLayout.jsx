import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { path: '/dashboard',        label: 'Dashboard', end: true },
  { path: '/rewards', label: 'Rewards' },
  { path: '/map',     label: 'Collection map' },
  { path: '/profile', label: 'Profile' },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 'var(--navbar-h)',
        background: 'var(--green-800)',
        borderBottom: '1px solid var(--green-700)',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          width: '100%', maxWidth: 1200, margin: '0 auto',
          padding: '0 2rem', display: 'flex', alignItems: 'center', gap: 40,
        }}>
          {/* Logo */}
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 17, letterSpacing: '-0.3px', flexShrink: 0 }}>
            Re<span style={{ color: 'var(--green-400)' }}>Artha</span>
          </span>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {navLinks.map(({ path, label, end }) => (
              <NavLink key={path} to={path} end={end} style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.15s',
                borderBottom: isActive ? '2px solid var(--green-400)' : '2px solid transparent',
              })}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              background: 'var(--green-700)', color: 'var(--green-100)',
              padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            }}>
              {user?.points ?? 0} pts
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{user?.name}</span>
            <button onClick={handleLogout} style={{
              background: 'var(--green-700)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)', padding: '5px 12px',
              borderRadius: 'var(--radius-md)', fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}