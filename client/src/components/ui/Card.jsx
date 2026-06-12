export default function Card({ children, style, padding = '1.5rem' }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  )
}