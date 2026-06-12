export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default:  { background: 'var(--gray-100)', color: 'var(--gray-700)' },
    success:  { background: 'var(--green-50)', color: 'var(--green-700)' },
    warning:  { background: 'var(--amber-50)', color: 'var(--amber-600)' },
    danger:   { background: 'var(--red-50)', color: 'var(--red-600)' },
    info:     { background: '#eff6ff', color: '#1d4ed8' },
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500,
      ...variants[variant],
    }}>
      {children}
    </span>
  )
}