import { useNavigate } from 'react-router-dom'
import { Settings, Bell } from 'lucide-react'

interface NavProps {
  active?: 'Models' | 'Datasets' | 'Training' | 'Deployments'
}

const ROUTES: Record<string, string> = {
  Models:      '/models',
  Datasets:    '/',
  Training:    '/',
  Deployments: '/',
}

export default function Nav({ active }: NavProps) {
  const navigate = useNavigate()
  const links    = ['Models', 'Datasets', 'Training', 'Deployments'] as const

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: '56px',
      borderBottom: '1px solid #BEB5A9',
      background: '#fff8f2',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>

        {/* Logo — always goes home */}
        <span
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '20px', fontWeight: 700,
            color: '#291C0E', cursor: 'pointer',
          }}
        >
          AI Fusion
        </span>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {links.map(link => (
            <span
              key={link}
              onClick={() => navigate(ROUTES[link])}
              style={{
                fontFamily: 'DM Mono, monospace', fontSize: '13px',
                color: active === link ? '#291C0E' : '#A78D78',
                cursor: 'pointer',
                borderBottom: active === link
                  ? '2px solid #291C0E'
                  : '2px solid transparent',
                paddingBottom: '2px',
                transition: 'color 0.15s',
                userSelect: 'none',
              }}
            >
              {link}
            </span>
          ))}
        </div>
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Bell     size={18} color="#A78D78" strokeWidth={1.5} style={{ cursor: 'pointer' }} />
        <Settings size={18} color="#A78D78" strokeWidth={1.5} style={{ cursor: 'pointer' }} />
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#A78D78', border: '1px solid #BEB5A9',
          cursor: 'pointer',
        }} />
      </div>
    </nav>
  )
}
//Next session me we will fix that the site is not saving the data states 