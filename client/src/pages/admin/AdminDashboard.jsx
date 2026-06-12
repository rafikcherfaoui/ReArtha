import { useAuth } from '../../context/AuthContext'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'

const sidebarLinks = [
  { path: '/admin',          label: 'Overview',       end: true },
  { path: '/admin/deposits', label: 'Deposit codes' },
  { path: '/admin/users',    label: 'Users' },
  { path: '/admin/rewards',  label: 'Rewards' },
  { path: '/admin/map',      label: 'Collection map' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const activeLink = sidebarLinks.find(link => link.path === location.pathname) 
  const currentLabel = activeLink ? activeLink.label : 'Dashboard'
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'var(--green-900)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 17, letterSpacing: '-0.3px' }}>
            Re<span style={{ color: 'var(--green-400)' }}>Artha</span>
          </span>
        </div>

        {/* Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sidebarLinks.map(({ path, label, end }) => (
            <NavLink key={path} to={path} end={end} style={({ isActive }) => ({
              display: 'block',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--green-400)' : '3px solid transparent',
              transition: 'all 0.15s',
              paddingLeft: isActive ? '9px' : '12px',
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user strip */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: 13, color: 'rgb(255, 255, 255)', marginBottom: 6, display: 'block' }}>
            Logged in as <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.email}</strong>
          </span>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '7px', background: 'transparent',mousehover: { background: 'rgba(132, 129, 129, 0.1)' },
            border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)',
            borderRadius: 'var(--radius-md)', fontSize: 13, cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 'var(--navbar-h)', background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex', alignItems: 'center',
          padding: '0 2rem',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ fontSize: 20, color: 'rgb(0, 0, 0)', marginTop: 2, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <strong>{currentLabel}</strong>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}