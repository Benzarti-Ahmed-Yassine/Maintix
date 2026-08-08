import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/authService';
import { useAuthStore } from '@/contexts/authStore';

interface RoleCard {
  id: string;
  title: string;
  titleLines: string[];
  description: string;
  route: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  glowColor: string;
}

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [entering, setEntering] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleEnter = async (card: RoleCard) => {
    if (entering) return;
    setEntering(card.id);
    try {
      const profile = await login({ username: card.id, password: 'demo' });
      setUser({ ...profile, role: card.id });
      navigate(card.route);
    } catch {
      setEntering(null);
    }
  };

  const cards = useMemo<RoleCard[]>(
    () => [
      {
        id: 'technician',
        title: 'TECHNICIAN',
        titleLines: ['TECHNICIAN'],
        description: 'Monitor machines, diagnose issues and receive AI assistance.',
        route: '/app/technician',
        icon: (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            {/* hard-hat person */}
            <circle cx="22" cy="13" r="5.5" stroke="#00B7FF" strokeWidth="1.8" fill="none" />
            <path d="M11 38c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="#00B7FF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* wrench */}
            <path d="M30 10 c2-1 5 1 4 4l-6 6-2-2 6-6" stroke="#00B7FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        ),
        accentColor: '#00B7FF',
        borderColor: 'rgba(0,183,255,0.4)',
        glowColor: 'rgba(0,183,255,0.14)',
      },
      {
        id: 'maintenance',
        title: 'MAINTENANCE MANAGER',
        titleLines: ['MAINTENANCE', 'MANAGER'],
        description: 'Plan maintenance, manage teams and reduce downtime.',
        route: '/app/maintenance',
        icon: (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            {/* gear / settings */}
            <circle cx="22" cy="22" r="7" stroke="#00C896" strokeWidth="1.8" fill="none" />
            <path d="M22 8v4M22 32v4M8 22h4M32 22h4" stroke="#00C896" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M13.2 13.2l2.8 2.8M28 28l2.8 2.8M13.2 30.8l2.8-2.8M28 16l2.8-2.8" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="22" cy="22" r="3" fill="#00C896" opacity="0.5" />
          </svg>
        ),
        accentColor: '#00C896',
        borderColor: 'rgba(0,200,150,0.4)',
        glowColor: 'rgba(0,200,150,0.14)',
      },
      {
        id: 'production',
        title: 'PRODUCTION MANAGER',
        titleLines: ['PRODUCTION', 'MANAGER'],
        description: 'Track production, analyze performance and optimize lines.',
        route: '/app/production',
        icon: (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            {/* factory building */}
            <rect x="6" y="20" width="10" height="18" rx="1" stroke="#4DAAFF" strokeWidth="1.8" fill="none" />
            <rect x="17" y="14" width="10" height="24" rx="1" stroke="#4DAAFF" strokeWidth="1.8" fill="none" />
            <rect x="28" y="8" width="10" height="30" rx="1" stroke="#4DAAFF" strokeWidth="1.8" fill="none" />
            <path d="M6 14l10-6 10 4 12-8" stroke="#4DAAFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6"  cy="14" r="2" fill="#4DAAFF" />
            <circle cx="16" cy="8"  r="2" fill="#4DAAFF" />
            <circle cx="26" cy="12" r="2" fill="#4DAAFF" />
            <circle cx="38" cy="4"  r="2" fill="#4DAAFF" />
          </svg>
        ),
        accentColor: '#4DAAFF',
        borderColor: 'rgba(77,170,255,0.4)',
        glowColor: 'rgba(77,170,255,0.14)',
      },
      {
        id: 'director',
        title: 'INDUSTRIAL DIRECTOR',
        titleLines: ['INDUSTRIAL', 'DIRECTOR'],
        description: 'Access KPIs, analyze impact and make strategic decisions.',
        route: '/app/director',
        icon: (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            {/* briefcase */}
            <rect x="6" y="16" width="32" height="22" rx="3" stroke="#F0A500" strokeWidth="1.8" fill="none" />
            <path d="M16 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke="#F0A500" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M6 26h32" stroke="#F0A500" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 26v2h8v-2" stroke="#F0A500" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
        accentColor: '#F0A500',
        borderColor: 'rgba(240,165,0,0.4)',
        glowColor: 'rgba(240,165,0,0.14)',
      },
    ],
    []
  );

  return (
    <div style={s.root}>
      {/* Grid overlay */}
      <div style={s.grid} />
      {/* Ambient glows */}
      <div style={{ ...s.glow, top: '-20%', left: '5%',   background: 'radial-gradient(circle, rgba(0,183,255,0.09) 0%, transparent 65%)' }} />
      <div style={{ ...s.glow, bottom: '-20%', right: '5%', background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 65%)' }} />

      <div style={s.inner}>

        {/* ── LOGO ── */}
        <div style={s.logoRow}>
          <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
            <polygon points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5" stroke="#00B7FF" strokeWidth="2" fill="none" />
            <polygon points="24,11 36,18 36,30 24,37 12,30 12,18" fill="rgba(0,183,255,0.18)" />
            <line x1="24" y1="3"    x2="24" y2="45"   stroke="#00B7FF" strokeWidth="1.5" />
            <line x1="5"  y1="13.5" x2="43" y2="34.5" stroke="#00B7FF" strokeWidth="1.5" />
            <line x1="43" y1="13.5" x2="5"  y2="34.5" stroke="#00B7FF" strokeWidth="1.5" />
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

        {/* ── ROLE CARDS ── */}
        <div style={s.cardsRow}>
          {cards.map((card) => {
            const isHovered  = hoveredCard === card.id;
            const isEntering = entering   === card.id;

            return (
              <div
                key={card.id}
                style={{
                  ...s.card,
                  borderColor: isHovered || isEntering ? card.borderColor : 'rgba(255,255,255,0.08)',
                  background: isHovered || isEntering
                    ? `linear-gradient(160deg, ${card.glowColor} 0%, rgba(14,20,38,0.95) 100%)`
                    : 'rgba(14,20,38,0.7)',
                  boxShadow: isHovered || isEntering
                    ? `0 0 36px ${card.glowColor}, 0 8px 32px rgba(0,0,0,0.5)`
                    : '0 4px 20px rgba(0,0,0,0.4)',
                  transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Icon */}
                <div style={s.iconWrap}>{card.icon}</div>

                {/* Title */}
                <h2 style={{ ...s.cardTitle, color: card.accentColor }}>
                  {card.titleLines.map((line, i) => (
                    <span key={i} style={{ display: 'block' }}>{line}</span>
                  ))}
                </h2>

                {/* Divider */}
                <div style={{ ...s.divider, background: card.accentColor }} />

                {/* Description */}
                <p style={s.cardDesc}>{card.description}</p>

                {/* Enter button */}
                <button
                  id={`enter-${card.id}`}
                  style={{
                    ...s.enterBtn,
                    background: isHovered || isEntering ? card.accentColor : 'transparent',
                    borderColor: card.accentColor,
                    color: isHovered || isEntering ? '#080D1A' : card.accentColor,
                    boxShadow: isHovered ? `0 4px 20px ${card.glowColor}` : 'none',
                    opacity: entering && entering !== card.id ? 0.4 : 1,
                    cursor: entering ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => handleEnter(card)}
                  disabled={!!entering}
                >
                  {isEntering ? 'Entering…' : 'Enter'}
                </button>
              </div>
            );
          })}
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

/* ───────────────────────────── styles */
const s: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    background: '#080D1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    overflow: 'hidden',
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(0,183,255,0.032) 1px,transparent 1px),' +
      'linear-gradient(90deg,rgba(0,183,255,0.032) 1px,transparent 1px)',
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
    gap: '32px',
    width: '100%',
    maxWidth: '1080px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
  },
  logoText: {
    fontSize: '23px',
    fontWeight: 800,
    letterSpacing: '0.22em',
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
  },
  headlineBlock: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  h1: {
    fontSize: '22px',
    fontWeight: 600,
    lineHeight: '1.4',
    color: 'rgba(215,230,255,0.92)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  tagline: {
    fontSize: '12px',
    color: 'rgba(130,155,195,0.65)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    margin: 0,
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    width: '100%',
  },
  card: {
    background: 'rgba(14,20,38,0.7)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '28px 22px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '0',
    transition: 'all 0.25s ease',
    backdropFilter: 'blur(12px)',
  },
  iconWrap: {
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 800,
    letterSpacing: '0.07em',
    margin: '0 0 14px',
    lineHeight: '1.4',
    textTransform: 'uppercase' as const,
  },
  divider: {
    width: '30px',
    height: '2px',
    borderRadius: '2px',
    marginBottom: '14px',
    opacity: 0.7,
  },
  cardDesc: {
    fontSize: '12.5px',
    lineHeight: '1.65',
    color: 'rgba(170,190,225,0.72)',
    margin: '0 0 22px',
    flexGrow: 1,
  },
  enterBtn: {
    width: '100%',
    padding: '10px',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    transition: 'all 0.2s ease',
    background: 'transparent',
  },
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
