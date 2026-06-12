interface BadgeProps {
  label: string
  variant?: 'active' | 'neutral' | 'success' | 'error'
}

const colors = {
  active:  { bg: '#6E473B', color: '#E1D4C2' },
  neutral: { bg: '#BEB5A9', color: '#291C0E' },
  success: { bg: '#A78D78', color: '#fff8f2' },
  error:   { bg: '#291C0E', color: '#E1D4C2' },
}

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const c = colors[variant]
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontFamily: 'DM Mono, monospace',
      fontSize: '11px', fontWeight: 500,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: '4px',
      display: 'inline-block',
    }}>
      {label}
    </span>
  )
}