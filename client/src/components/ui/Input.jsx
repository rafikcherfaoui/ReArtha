export default function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          padding: '9px 12px',
          border: `1px solid ${error ? 'var(--red-600)' : 'var(--gray-200)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: 'border-color 0.15s',
          background: 'var(--white)',
          color: 'var(--gray-900)',
          width: '100%',
          ...props.style,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--green-500)'; props.onFocus?.(e) }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--red-600)' : 'var(--gray-200)'; props.onBlur?.(e) }}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--red-600)' }}>{error}</span>}
    </div>
  )
}