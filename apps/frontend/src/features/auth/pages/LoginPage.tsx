import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import { useAuthStore } from '@/contexts/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login({ username, password });
      setUser(profile);
      navigate('/app');
    } catch {
      setError('Unable to sign in. Check username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Grid overlay */}
      <div style={s.grid} />

      {/* Ambient glows */}
      <div style={{ ...s.glow, top: '-20%', left: '10%',  background: 'radial-gradient(circle, rgba(0,183,255,0.10) 0%, transparent 65%)' }} />
      <div style={{ ...s.glow, bottom: '-20%', right: '10%', background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 65%)' }} />

      <div style={s.inner}>

        {/* ── LOGO ── */}
        <div style={s.logoRow}>
          {/* Hex-star icon */}
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
            <polygon points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5"
              stroke="#00B7FF" strokeWidth="2" fill="none" />
            <polygon points="24,11 36,18 36,30 24,37 12,30 12,18"
              fill="rgba(0,183,255,0.18)" />
            <line x1="24" y1="3"  x2="24" y2="45" stroke="#00B7FF" strokeWidth="1.4" />
            <line x1="5"  y1="13.5" x2="43" y2="34.5" stroke="#00B7FF" strokeWidth="1.4" />
            <line x1="43" y1="13.5" x2="5"  y2="34.5" stroke="#00B7FF" strokeWidth="1.4" />
            <circle cx="24" cy="24" r="3.5" fill="#00B7FF" />
          </svg>
          <span style={s.logoText}>MAINTIX</span>
        </div>

        {/* ── HEADLINE ── */}
        <div style={s.headlineBlock}>
          <h1 style={s.h1}>
            AI Decision Intelligence Extension<br />for Industrial Operations
          </h1>
          <p style={s.tagline}>Connect. Predict. Optimize.</p>
        </div>

        {/* ── SIGN-IN CARD ── */}
        <div style={s.card}>
          <div style={s.cardInner}>

            {/* Card header */}
            <div style={s.cardHeader}>
              <h2 style={s.h2}>Sign in to your workspace</h2>
              <p style={s.cardSub}>
                Enter your credentials to access the role-based command center.
              </p>
            </div>

            {/* Form */}
            <form style={s.form} onSubmit={handleSubmit} noValidate>

              {/* Username */}
              <div style={s.field}>
                <label htmlFor="username" style={s.label}>Username</label>
                <input
                  id="username"
                  style={s.input}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jordan.reyes"
                  required
                  autoComplete="username"
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#00B7FF';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0,183,255,0.18)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password */}
              <div style={s.field}>
                <label htmlFor="password" style={s.label}>Password</label>
                <input
                  id="password"
                  style={s.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = '#00B7FF';
                    (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0,183,255,0.18)';
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)';
                    (e.target as HTMLInputElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              {error && <p style={s.error}>{error}</p>}

              <button
                id="sign-in-btn"
                type="submit"
                disabled={loading}
                style={{
                  ...s.btn,
                  opacity: loading ? 0.65 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'linear-gradient(135deg,#00d4ff 0%,#00e8b0 100%)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'linear-gradient(135deg,#00B7FF 0%,#00CFF0 100%)';
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={s.footer}>
          <p style={s.footerTop}>Secure &nbsp;•&nbsp; Real-time &nbsp;•&nbsp; Intelligent</p>
          <p style={s.footerBot}>Powered by AI &nbsp;•&nbsp; Integrated with your systems</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── styles */
const s: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    background: '#080D1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    overflow: 'hidden',
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(0,183,255,0.035) 1px,transparent 1px),' +
      'linear-gradient(90deg,rgba(0,183,255,0.035) 1px,transparent 1px)',
    backgroundSize: '52px 52px',
    pointerEvents: 'none',
  },
  glow: {
    position: 'absolute',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  inner: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    width: '100%',
    maxWidth: '520px',
  },
  /* Logo */
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 800,
    letterSpacing: '0.22em',
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
  },
  /* Headline */
  headlineBlock: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  h1: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '1.4',
    color: 'rgba(215,230,255,0.92)',
    margin: 0,
    letterSpacing: '-0.01em',
    textAlign: 'center' as const,
  },
  tagline: {
    fontSize: '12px',
    color: 'rgba(130,155,195,0.65)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    margin: 0,
  },
  /* Card */
  card: {
    width: '100%',
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,183,255,0.06)',
    overflow: 'hidden',
  },
  cardInner: {
    padding: '36px 36px 32px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '28px',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  h2: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  cardSub: {
    fontSize: '13px',
    color: 'rgba(145,170,210,0.72)',
    lineHeight: '1.6',
    margin: 0,
  },
  /* Form */
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '7px',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: 500,
    color: 'rgba(185,205,235,0.85)',
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 15px',
    fontSize: '14px',
    color: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  btn: {
    marginTop: '4px',
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg,#00B7FF 0%,#00CFF0 100%)',
    border: 'none',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#080D1A',
    letterSpacing: '0.03em',
    transition: 'background 0.2s, transform 0.15s',
    boxShadow: '0 4px 24px rgba(0,183,255,0.4)',
  },
  error: {
    fontSize: '12.5px',
    color: '#FF7070',
    margin: 0,
  },
  /* Footer */
  footer: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  footerTop: {
    fontSize: '12px',
    color: 'rgba(125,150,190,0.6)',
    margin: 0,
    letterSpacing: '0.05em',
  },
  footerBot: {
    fontSize: '11px',
    color: 'rgba(95,120,165,0.45)',
    margin: 0,
    letterSpacing: '0.04em',
  },
};
