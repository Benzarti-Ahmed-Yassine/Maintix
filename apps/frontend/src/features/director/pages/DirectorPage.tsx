import '@/components/charts/ChartRegistry';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { DemoSnapshot, runDemoPipeline } from '@/services/demoPipeline';

/* ─── mock data ─────────────────────────────────────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
const DAYS   = ['May 13','May 14','May 15','May 16','May 17','May 18','May 19'];

const AI_MSGS = [
  { role: 'user', text: 'What is the overall AI decision score?' },
  { role: 'ai', text: '92/100 — Excellent\n\nTop priorities:\n• Bearing replacement on TX-1250-A (immediate)\n• Line 4 restoration — $8.4K/day loss\n• Preventive cycle for 3 medium-risk machines\n• MTTR reduction target: 2.8h by Q3\n\nROI forecast: 312% vs last year.' },
];

const KPI_CARDS = [
  { label: 'Total Machines', value: '48',     icon: '⚙',  delta: '▲ 12%', up: true,  color: '#00B7FF' },
  { label: 'Total Downtime', value: '12.4h',  icon: '⏱',  delta: '▼ 8%',  up: false, color: '#ef4444' },
  { label: 'Maintenance Cost', value: '$24,650', icon: '💰', delta: '▲ 15%', up: false, color: '#f97316' },
  { label: 'OEE',            value: '76.8%',  icon: '📊', delta: '▲ 6.2%',up: true,  color: '#22c55e' },
  { label: 'Risk Exposure',  value: 'Low',    icon: '🛡',  delta: '—',     up: true,  color: '#22c55e' },
  { label: 'AI Recommendations', value: '23', icon: '🤖', delta: '▲ 45%', up: true,  color: '#00B7FF' },
  { label: 'ROI YTD',       value: '312%',   icon: '📈', delta: '▲ 28%', up: true,  color: '#a78bfa' },
];

const chartOpts: any = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } } },
  scales: {
    x: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};
const noScaleOpts: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10 } } } };

/* ─── tiny radial gauge (SVG) ────────────────────────────────────── */
function Gauge({ pct, label, color }: { pct: number; label: string; color: string }) {
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif">{pct}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="8" fontFamily="Inter,sans-serif">{label}</text>
      </svg>
    </div>
  );
}

export function DirectorPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(AI_MSGS);
  const [input, setInput] = useState('');
  const [demoData, setDemoData] = useState<DemoSnapshot | null>(null);

  useEffect(() => {
    let ignore = false;
    void runDemoPipeline('director').then((snapshot) => {
      if (!ignore) setDemoData(snapshot);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const sendMsg = () => {
    if (!input.trim()) return;
    const q = input.trim(); setInput('');
    setMessages(m => [...m,
      { role: 'user', text: q },
      { role: 'ai', text: 'Processing enterprise intelligence…\n\nTop insight: Overall equipment effectiveness is trending +6.2% YoY driven by predictive maintenance interventions. Recommend increasing AI model retraining frequency to capture seasonal patterns.' },
    ]);
  };

  const perfTrend = {
    labels: DAYS,
    datasets: [
      { label: 'OEE (%)',         data: [73, 74.5, 76, 75, 77.8, 76.5, 76.8], borderColor: '#00B7FF', tension: 0.4, pointRadius: 3, borderWidth: 2, fill: false },
      { label: 'Availability (%)',data: [87, 88, 89.5, 88, 90, 89, 89.1],      borderColor: '#a78bfa', tension: 0.4, pointRadius: 3, borderWidth: 1.5, fill: false },
      { label: 'Quality (%)',     data: [93, 94, 94.5, 94, 95, 94.5, 94.7],    borderColor: '#22c55e', tension: 0.4, pointRadius: 3, borderWidth: 1.5, fill: false },
      { label: 'Performance (%)',  data: [80, 81, 82, 80.5, 83, 82, 82.4],     borderColor: '#f97316', tension: 0.4, pointRadius: 3, borderWidth: 1.5, fill: false },
    ],
  };

  const costData = {
    labels: MONTHS,
    datasets: [
      { label: 'Maintenance Cost', data: [18000,20000,19500,21000,24650], backgroundColor: 'rgba(0,183,255,0.7)', borderRadius: 3, barThickness: 10 },
      { label: 'Downtime Cost',    data: [12000,14000,11000,15000,13200], backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 3, barThickness: 10 },
      { label: 'Operating Cost',   data: [30000,29000,31000,28000,32000], backgroundColor: 'rgba(99,102,241,0.5)', borderRadius: 3, barThickness: 10 },
    ],
  };

  const riskDist = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{ data: [12, 20, 16], backgroundColor: ['#ef4444','#f97316','#22c55e'], borderWidth: 0 }],
  };

  const finImpact = {
    labels: ['Savings', 'Remaining'],
    datasets: [{ data: [24650, 6000], backgroundColor: ['#22c55e','rgba(255,255,255,0.06)'], borderWidth: 0 }],
  };

  const UPCOMING = [
    { action: 'Review Maintenance Plan', date: 'May 20', icon: '📋' },
    { action: 'Inspect Critical Machine', date: 'May 21', icon: '🔍' },
    { action: 'Budget Review',           date: 'May 22', icon: '💰' },
    { action: 'AI Model Retrain',        date: 'May 23', icon: '🤖' },
  ];

  return (
    <div style={sd.root}>
      {/* TOP BAR */}
      <div style={sd.topBar}>
        <div>
          <div style={sd.pageTitle}>Industrial Director Overview</div>
          <div style={sd.pageSub}>Strategic insights and enterprise performance at a glance</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={sd.dateBadge}>📅 May 18 – May 25, 2024</div>
          <div style={sd.liveBadge}><span style={sd.liveDot} />Live</div>
          <div style={sd.notif}>🔔 <span style={sd.notifDot}>1</span></div>
          <div style={sd.userInfo}>Industrial Director</div>
          <div style={sd.avatar}>ID</div>
        </div>
      </div>

      <div style={sd.content}>
        {/* Enterprise KPIs */}
        <div style={sd.kpiRow}>
          {KPI_CARDS.map(k => (
            <div key={k.label} style={sd.kpiCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={sd.kpiIcon}>{k.icon}</span>
              </div>
              <div style={sd.kpiLabel}>{k.label}</div>
              <div style={{ ...sd.kpiValue, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: k.up ? '#22c55e' : '#ef4444', marginTop: 4 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Row 2: Performance + Cost + Risk Distribution */}
        <div style={sd.row3}>
          <div style={{ ...sd.card, flex: 2 }}>
            <div style={sd.cardTitle}>Overall Performance Trend</div>
            <div style={{ height: 180 }}>
              <Line data={perfTrend} options={chartOpts} />
            </div>
          </div>
          <div style={{ ...sd.card, flex: 2 }}>
            <div style={sd.cardTitle}>Cost Analysis (YTD)</div>
            <div style={{ height: 180 }}>
              <Bar data={costData} options={chartOpts} />
            </div>
          </div>
          <div style={{ ...sd.card, flex: 1 }}>
            <div style={sd.cardTitle}>Risk Distribution</div>
            <div style={{ height: 160 }}>
              <Doughnut data={riskDist} options={{ ...noScaleOpts, cutout: '55%', plugins: { ...noScaleOpts.plugins, legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10 } } } }} />
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 4 }}>Total Machines</div>
          </div>
        </div>

        {/* Row 3: AI Insights + Top Risks + Financial + Maintenance Eff + Upcoming */}
        <div style={sd.row5}>
          {/* AI Insights */}
          <div style={sd.card}>
            <div style={sd.cardTitle}>AI Insights Summary</div>
            {demoData && (
              <div style={sd.demoBanner}>
                <div style={sd.demoTitle}>Demo pipeline</div>
                <div style={sd.demoSummary}>{demoData.summary}</div>
                <button style={sd.demoButton} onClick={() => navigate(demoData.featureLinks[0].path)}>Open executive view</button>
              </div>
            )}
            {[
              { icon: '💡', text: '23 Recommendations', color: '#eab308' },
              { icon: '⚠', text: '7 Critical Alerts',  color: '#ef4444' },
              { icon: '📋', text: '4 Maintenance Plans',color: '#00B7FF' },
              { icon: '🔍', text: '12 Anomalies Detected', color: '#a78bfa' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: 'rgba(200,215,240,0.85)' }}>{item.text}</span>
              </div>
            ))}
            <button style={sd.insightBtn}>View All Insights</button>
          </div>

          {/* Top Risks */}
          <div style={sd.card}>
            <div style={sd.cardTitle}>Top Risks</div>
            {[
              { label: 'Bearing Failure', count: 12, color: '#ef4444' },
              { label: 'Machine Overheat', count: 8, color: '#f97316' },
              { label: 'Maintenance Delay', count: 6, color: '#eab308' },
              { label: 'Vibration Anomaly', count: 5, color: '#3b82f6' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, boxShadow: `0 0 5px ${r.color}`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'rgba(200,215,240,0.85)' }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>{r.count} Machines</div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Impact */}
          <div style={sd.card}>
            <div style={sd.cardTitle}>Financial Impact (YTD)</div>
            <div style={{ height: 100, margin: '4px 0' }}>
              <Doughnut data={finImpact} options={{ ...noScaleOpts, cutout: '65%', plugins: { legend: { display: false } } }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>$24,650</div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>Total Savings</div>
              <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>▲ 23% vs Last Year</div>
            </div>
          </div>

          {/* Maintenance Efficiency */}
          <div style={sd.card}>
            <div style={sd.cardTitle}>Maintenance Efficiency</div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <Gauge pct={87} label="Maint. Savings" color="#00B7FF" />
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>Target: 80% <span style={{ color: '#22c55e' }}>▲ +7%</span></div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button style={sd.calBtn}>View Calendar</button>
              <button style={sd.viewAllBtn}>View All</button>
            </div>
          </div>

          {/* Upcoming Actions */}
          <div style={sd.card}>
            <div style={sd.cardTitle}>Upcoming Actions</div>
            {UPCOMING.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < UPCOMING.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 14 }}>{u.icon}</span>
                <span style={{ flex: 1, fontSize: 11, color: 'rgba(200,215,240,0.8)' }}>{u.action}</span>
                <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', flexShrink: 0 }}>{u.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status banner */}
        <div style={sd.statusBanner}>
          <span style={sd.statusDot} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>All Systems Operational</span>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)', marginLeft: 'auto' }}>© 2024 Maintix. All rights reserved.</span>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)' }}>Enterprise Intelligence for Industrial Excellence</span>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.3)' }}>Maintix v2.0.0</span>
        </div>
      </div>
    </div>
  );
}

const sd: Record<string, React.CSSProperties> = {
  root: { background: 'var(--app-bg)', minHeight: '100vh', color: 'var(--app-text)', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-surface)' },
  pageTitle: { fontSize: 20, fontWeight: 700 },
  pageSub: { fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 2 },
  dateBadge: { fontSize: 12, color: 'rgba(200,215,240,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 10px' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '3px 10px' },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' },
  notif: { position: 'relative', cursor: 'pointer', fontSize: 16 },
  notifDot: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userInfo: { fontSize: 12, color: 'rgba(200,215,240,0.8)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#a78bfa,#00B7FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  content: { padding: 16, display: 'flex', flexDirection: 'column', gap: 14 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 },
  kpiCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px' },
  kpiIcon: { fontSize: 20 },
  kpiLabel: { fontSize: 10, color: 'rgba(148,163,184,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: 800, lineHeight: 1 },
  row3: { display: 'flex', gap: 12 },
  row5: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 },
  card: { background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px 16px' },
  demoBanner: { marginTop: 10, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,183,255,0.18)', background: 'rgba(0,183,255,0.08)' },
  demoTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#00B7FF' },
  demoSummary: { marginTop: 4, fontSize: 12, color: 'rgba(200,215,240,0.8)', lineHeight: 1.5 },
  demoButton: { marginTop: 8, alignSelf: 'flex-start', background: 'rgba(0,183,255,0.14)', border: '1px solid rgba(0,183,255,0.24)', borderRadius: 8, color: '#00B7FF', padding: '7px 10px', cursor: 'pointer', fontSize: 11 },
  cardTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)', marginBottom: 10 },
  insightBtn: { marginTop: 12, width: '100%', padding: '8px', background: 'rgba(0,183,255,0.1)', border: '1px solid rgba(0,183,255,0.2)', borderRadius: 8, color: '#00B7FF', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  calBtn: { flex: 1, padding: '7px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: 'rgba(200,215,240,0.7)', fontSize: 11, cursor: 'pointer' },
  viewAllBtn: { flex: 1, padding: '7px', background: '#00B7FF', border: 'none', borderRadius: 7, color: '#080D1A', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  statusBanner: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10 },
  statusDot: { width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' },
};
