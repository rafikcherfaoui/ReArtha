export default function Button({
  children, variant = 'primary', size = 'md',
  disabled, onClick, type = 'button', fullWidth, style
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, fontWeight: 500, border: 'none', borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'background 0.15s, opacity 0.15s',
    width: fullWidth ? '100%' : undefined,
  }

  const sizes = {
    sm: { padding: '5px 12px', fontSize: 13 },
    md: { padding: '8px 16px', fontSize: 14 },
    lg: { padding: '11px 22px', fontSize: 15 },
  }

  const variants = {
    primary:   { background: 'var(--green-600)', color: '#fff' },
    secondary: { background: 'var(--gray-100)', color: 'var(--gray-700)', border: '1px solid var(--gray-200)' },
    danger:    { background: 'var(--red-50)', color: 'var(--red-600)', border: '1px solid #fca5a5' },
    ghost:     { background: 'transparent', color: 'var(--gray-500)' },
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  )
}