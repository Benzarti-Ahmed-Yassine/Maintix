import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/contexts/authStore';

/* ── icons (inline SVG, keeps zero-dependency) ───────────────────── */
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS: Record<string, string> = {
  dashboard:   'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  machines:    'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  alerts:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  ai:          'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2v1a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z',
  procedures:  'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4',
  reports:     'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  settings:    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  history:     'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  signout:     'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  maintenance: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z',
  workorders:  'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M12 12h.01M12 16h.01',
  analytics:   'M18 20V10 M12 20V4 M6 20v-6',
  technicians: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  risk:        'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  production:  'M2 20h.01 M7 20v-4 M12 20v-8 M17 20V8 M22 4v16',
  oee:         'M22 12h-4l-3 9L9 3l-3 9H2',
  quality:     'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  downtime:    'M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4',
  kpis:        'M4 9h16 M4 15h16 M10 3 8 21 M14 3l-2 18',
  finance:     'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
};

type NavGroup = { label: string; items: { label: string; path: string; icon: string }[] };

const ROLE_NAV: Record<string, NavGroup[]> = {
  technician: [
    { label: 'Workspace', items: [
      { label: 'Dashboard',   path: '/app/technician',    icon: 'dashboard' },
      { label: 'Machines',    path: '/app/connected-systems', icon: 'machines' },
      { label: 'Alerts',      path: '/app/notifications', icon: 'alerts' },
      { label: 'AI Assistant',path: '/app/copilot',       icon: 'ai' },
      { label: 'Procedures',  path: '/app/knowledge-base',icon: 'procedures' },
      { label: 'History',     path: '/app/reports',       icon: 'history' },
      { label: 'Reports',     path: '/app/reports',       icon: 'reports' },
      { label: 'Settings',    path: '/app/settings',      icon: 'settings' },
    ]},
  ],
  maintenance: [
    { label: 'Overview', items: [
      { label: 'Overview',        path: '/app/maintenance',    icon: 'dashboard' },
      { label: 'Machines',        path: '/app/connected-systems', icon: 'machines' },
      { label: 'Alerts & Risks',  path: '/app/notifications', icon: 'alerts' },
      { label: 'Work Orders',     path: '/app/reports',       icon: 'workorders' },
      { label: 'Maintenance Plan',path: '/app/maintenance',   icon: 'maintenance' },
      { label: 'Technicians',     path: '/app/maintenance',   icon: 'technicians' },
      { label: 'Spare Parts',     path: '/app/knowledge-base',icon: 'procedures' },
      { label: 'Analytics',       path: '/app/reports',       icon: 'analytics' },
      { label: 'Reports',         path: '/app/reports',       icon: 'reports' },
      { label: 'Settings',        path: '/app/settings',      icon: 'settings' },
    ]},
  ],
  production: [
    { label: 'Performance', items: [
      { label: 'Overview',     path: '/app/production', icon: 'dashboard' },
      { label: 'Production Lines', path: '/app/production', icon: 'production' },
      { label: 'Performance',  path: '/app/production', icon: 'analytics' },
      { label: 'OEE (TRS)',    path: '/app/production', icon: 'oee' },
      { label: 'Downtime',     path: '/app/production', icon: 'downtime' },
      { label: 'Quality',      path: '/app/production', icon: 'quality' },
      { label: 'Reports',      path: '/app/reports',    icon: 'reports' },
      { label: 'Settings',     path: '/app/settings',   icon: 'settings' },
    ]},
  ],
  director: [
    { label: 'Enterprise', items: [
      { label: 'Overview',     path: '/app/director', icon: 'dashboard' },
      { label: 'KPIs',         path: '/app/director', icon: 'kpis' },
      { label: 'Analytics',    path: '/app/director', icon: 'analytics' },
      { label: 'AI Insights',  path: '/app/director', icon: 'ai' },
      { label: 'Reports',      path: '/app/reports',  icon: 'reports' },
      { label: 'Investments',  path: '/app/director', icon: 'finance' },
      { label: 'Risk Analysis',path: '/app/director', icon: 'risk' },
      { label: 'Operations',   path: '/app/director', icon: 'production' },
      { label: 'Systems',      path: '/app/connected-systems', icon: 'machines' },
      { label: 'Alerts',       path: '/app/notifications', icon: 'alerts' },
      { label: 'Settings',     path: '/app/settings', icon: 'settings' },
    ]},
  ],
};

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const role = user?.role ?? 'technician';
  const groups: NavGroup[] = ROLE_NAV[role] ?? ROLE_NAV['technician'];

  return (
    <aside style={s.aside}>
      {/* Logo */}
      <div style={s.logoRow}>
        <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
          <polygon points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5" stroke="#00B7FF" strokeWidth="2.5" fill="none" />
          <polygon points="24,11 36,18 36,30 24,37 12,30 12,18" fill="rgba(0,183,255,0.2)" />
          <line x1="24" y1="3" x2="24" y2="45" stroke="#00B7FF" strokeWidth="1.5" />
          <line x1="5" y1="13.5" x2="43" y2="34.5" stroke="#00B7FF" strokeWidth="1.5" />
          <line x1="43" y1="13.5" x2="5" y2="34.5" stroke="#00B7FF" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" fill="#00B7FF" />
        </svg>
        <div>
          <div style={s.logoName}>MAINTIX</div>
          <div style={s.logoSub}>AI Decision Intelligence</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {groups.map((group) => (
          <div key={group.label}>
            {groups.length > 1 && <p style={s.groupLabel}>{group.label}</p>}
            {group.items.map((item) => (
              <NavLink
                key={item.label + item.path}
                to={item.path}
                end={item.path === '/app/technician' || item.path === '/app/maintenance' || item.path === '/app/production' || item.path === '/app/director'}
                style={({ isActive }) => ({
                  ...s.navItem,
                  ...(isActive ? s.navItemActive : {}),
                })}
              >
                <span style={{ color: 'inherit', opacity: 0.8 }}>
                  <Icon d={ICONS[item.icon]} />
                </span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* AI Decision Score (Director only) */}
      {role === 'director' && (
        <div style={s.scoreBox}>
          <div style={s.scoreLabel}>AI Decision Score</div>
          <div style={s.scoreValue}>92<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>/100</span></div>
          <div style={s.scoreBar}><div style={s.scoreBarFill} /></div>
          <div style={{ ...s.scoreLabel, color: '#4ade80', marginTop: 4 }}>Excellent</div>
        </div>
      )}

      {/* Sign out */}
      <button
        style={s.signOut}
        onClick={() => { signOut(); navigate('/'); }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <Icon d={ICONS.signout} />
        Sign out
      </button>
    </aside>
  );
}

const s: Record<string, React.CSSProperties> = {
  aside: {
    width: '220px',
    minWidth: '220px',
    background: 'var(--app-surface)',
    borderRight: '1px solid var(--app-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px 16px',
    gap: '4px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    overflowY: 'auto',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 8px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '8px',
  },
  logoName: {
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: '0.18em',
    color: '#FFFFFF',
  },
  logoSub: {
    fontSize: '9px',
    color: 'rgba(130,155,195,0.6)',
    letterSpacing: '0.05em',
    marginTop: '1px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  groupLabel: {
    fontSize: '9.5px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(100,125,170,0.6)',
    padding: '10px 10px 4px',
    margin: 0,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '9px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--app-text-muted)',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  navItemActive: {
    background: 'rgba(0,183,255,0.12)',
    color: '#00B7FF',
    fontWeight: 600,
  },
  scoreBox: {
    background: 'rgba(0,183,255,0.06)',
    border: '1px solid rgba(0,183,255,0.15)',
    borderRadius: '12px',
    padding: '14px',
    margin: '8px 0',
  },
  scoreLabel: {
    fontSize: '10px',
    color: 'rgba(150,175,215,0.7)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  scoreValue: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#00B7FF',
    lineHeight: 1,
    marginBottom: '8px',
  },
  scoreBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    width: '92%',
    background: 'linear-gradient(90deg, #00B7FF, #4ade80)',
    borderRadius: '4px',
  },
  signOut: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 10px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(150,170,210,0.6)',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '4px',
    transition: 'background 0.15s',
  },
};
