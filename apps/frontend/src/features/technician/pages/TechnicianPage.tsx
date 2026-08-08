import '@/components/charts/ChartRegistry';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { DemoSnapshot, runDemoPipeline } from '@/services/demoPipeline';

/* ─── helpers ─────────────────────────────────────────────────────── */
const rand = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(1);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function useLiveSensors() {
  const [s, setS] = useState({ vib: 11.2, temp: 62.5, curr: 4.2, rpm: 1450 });
  useEffect(() => {
    const id = setInterval(() => setS({
      vib:  +clamp(+(s.vib + rand(-0.5, 0.5)).toFixed(1), 9, 14).toFixed(1),
      temp: +clamp(+(s.temp + rand(-0.3, 0.3)).toFixed(1), 60, 65).toFixed(1),
      curr: +clamp(+(s.curr + rand(-0.1, 0.1)).toFixed(1), 3.8, 4.6).toFixed(1),
      rpm:  Math.round(clamp(s.rpm + rand(-10, 10), 1420, 1480)),
    }), 1200);
    return () => clearInterval(id);
  });
  return s;
}

function useLiveChart() {
  const labels = useRef<string[]>(
    Array.from({ length: 20 }, (_, i) => {
      const d = new Date(Date.now() - (19 - i) * 30000);
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    })
  );
  const vib  = useRef<number[]>(Array.from({ length: 20 }, () => rand(10, 13)));
  const temp = useRef<number[]>(Array.from({ length: 20 }, () => rand(60, 65)));

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      labels.current.push(`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
      labels.current.shift();
      vib.current.push(rand(10, 13.5)); vib.current.shift();
      temp.current.push(rand(60.5, 64.5)); temp.current.shift();
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return { labels: [...labels.current], vib: [...vib.current], temp: [...temp.current] };
}

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t.toLocaleTimeString();
}

/* ─── chat state ──────────────────────────────────────────────────── */
const INITIAL_MESSAGES = [
  { role: 'user', text: 'Why is the vibration high on the left side?' },
  { role: 'ai',   text: 'High vibration on the left side is most likely caused by:\n• Bearing wear\n• Misalignment\n• Loose mounting', full: true },
];

/* ─── sub-components ──────────────────────────────────────────────── */
function SensorTile({ label, value, unit, critical }: { label: string; value: number | string; unit: string; critical?: boolean }) {
  return (
    <div style={{ ...sc.tile, borderColor: critical ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)' }}>
      <div style={sc.tileLabel}>{label}</div>
      <div style={{ ...sc.tileValue, color: critical ? '#ef4444' : '#FFFFFF' }}>{value}</div>
      <div style={{ ...sc.tileUnit, color: critical ? '#ef4444' : 'rgba(150,175,215,0.6)' }}>{unit}{critical && ' ⚠ CRIT'}</div>
    </div>
  );
}

function ConnectedDot({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div style={sc.sysRow}>
      <div style={{ ...sc.dot, background: ok ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${ok ? '#22c55e' : '#ef4444'}` }} />
      <span style={sc.sysName}>{name}</span>
      <span style={{ ...sc.sysBadge, color: ok ? '#22c55e' : '#ef4444' }}>{ok ? 'Online' : 'Offline'}</span>
    </div>
  );
}

/* ─── sparkline (small inline chart) ─────────────────────────────── */
const SPARK = [88, 90, 87, 91, 89, 92, 90, 91.5, 92];

/* ─── main page ───────────────────────────────────────────────────── */
export function TechnicianPage() {
  const navigate = useNavigate();
  const sensors = useLiveSensors();
  const chart   = useLiveChart();
  const clock   = useClock();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [demoData, setDemoData] = useState<DemoSnapshot | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    void runDemoPipeline('technician').then((snapshot) => {
      if (!ignore) setDemoData(snapshot);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => { chatRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }); }, [messages]);

  const sendMsg = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    setMessages(m => [...m,
      { role: 'user', text: q },
      { role: 'ai', text: 'Analyzing machine TX-1250-A diagnostics…\n\nBased on sensor history and bearing wear patterns, I recommend replacing the left bearing assembly within 18 days. MTBF for this component at current vibration levels is 21 days.', full: false },
    ]);
  };

  const sparkPath = (() => {
    const w = 100, h = 32;
    const min = Math.min(...SPARK), max = Math.max(...SPARK);
    const pts = SPARK.map((v, i) => `${(i / (SPARK.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`);
    return 'M' + pts.join(' L');
  })();

  const liveChartData = {
    labels: chart.labels,
    datasets: [
      { label: 'Vibration (mm/s)', data: chart.vib,  borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', tension: 0.4, pointRadius: 0, fill: true, borderWidth: 2 },
      { label: 'Temperature (°C)', data: chart.temp, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.06)', tension: 0.4, pointRadius: 0, fill: false, borderWidth: 1.5 },
    ],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } }, tooltip: { mode: 'index' as const } },
    scales: {
      x: { ticks: { color: '#475569', font: { size: 9 }, maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  return (
    <div style={sc.root}>
      {/* ── TOP BAR ─────────────────────────────────────── */}
      <div style={sc.topBar}>
        <div style={sc.machineInfo}>
          <span style={sc.machineLabel}>Machine:</span>
          <span style={sc.machineId}>TX-1250-A</span>
          <div style={sc.statusBadge}>
            <span style={{ ...sc.statusDot, background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
            Status: <strong style={{ color: '#ef4444' }}>Critical</strong>
          </div>
        </div>
        <div style={sc.topRight}>
          <div style={sc.liveBadge}><span style={sc.liveDot} />Live</div>
          <div style={sc.clockBadge}>🕐 {clock}</div>
          <div style={sc.copilotBadge}>🤖 AI Copilot (RAG)</div>
          <div style={sc.avatar}>JR</div>
        </div>
      </div>

      {/* ── MAIN GRID ───────────────────────────────────── */}
      <div style={sc.mainGrid}>

        {/* ── LEFT COLUMN ─────────────────────────────── */}
        <div style={sc.leftCol}>

          {/* Machine 3D placeholder */}
          <div style={sc.machineCard}>
            <div style={sc.machineViz}>
              {/* Stylized machine SVG */}
              <svg viewBox="0 0 340 180" style={{ width: '100%', height: '100%' }}>
                {/* Body */}
                <rect x="40" y="50" width="260" height="100" rx="8" fill="#1a2540" stroke="rgba(0,183,255,0.3)" strokeWidth="1.5" />
                {/* Rollers */}
                <ellipse cx="80"  cy="100" rx="28" ry="28" fill="#0f1c35" stroke="rgba(0,183,255,0.4)" strokeWidth="1.5" />
                <ellipse cx="170" cy="100" rx="22" ry="22" fill="#0f1c35" stroke="rgba(0,183,255,0.25)" strokeWidth="1" />
                <ellipse cx="260" cy="100" rx="28" ry="28" fill="#0f1c35" stroke="rgba(0,183,255,0.4)" strokeWidth="1.5" />
                {/* Belt */}
                <path d="M80 72 Q170 58 260 72" stroke="rgba(100,150,200,0.4)" strokeWidth="3" fill="none" />
                <path d="M80 128 Q170 142 260 128" stroke="rgba(100,150,200,0.4)" strokeWidth="3" fill="none" />
                {/* Highlighted bearing - left side - RED/critical */}
                <ellipse cx="80" cy="100" rx="14" ry="14" fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth="2" />
                <ellipse cx="80" cy="100" rx="6"  ry="6"  fill="#ef4444" opacity="0.8" />
                {/* Bearing label */}
                <rect x="4" y="85" width="58" height="16" rx="4" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1" />
                <text x="33" y="97" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="Inter,sans-serif">Bearing Left ⚠</text>
                {/* Motor label */}
                <rect x="140" y="85" width="60" height="16" rx="4" fill="rgba(0,183,255,0.1)" stroke="rgba(0,183,255,0.3)" strokeWidth="1" />
                <text x="170" y="97" textAnchor="middle" fill="#00B7FF" fontSize="8" fontFamily="Inter,sans-serif">Motor</text>
                {/* Belt label */}
                <rect x="225" y="85" width="50" height="16" rx="4" fill="rgba(0,183,255,0.1)" stroke="rgba(0,183,255,0.3)" strokeWidth="1" />
                <text x="250" y="97" textAnchor="middle" fill="#00B7FF" fontSize="8" fontFamily="Inter,sans-serif">Belt</text>
                {/* Speed indicator */}
                <text x="170" y="170" textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="Inter,sans-serif">{sensors.rpm} RPM · Live</text>
              </svg>
            </div>
            {/* Action icons */}
            <div style={sc.machineActions}>
              {['⟳', '⊙', '◉', '⊞', '♻'].map((ic, i) => (
                <button key={i} style={sc.machineBtn}>{ic}</button>
              ))}
            </div>
            {demoData && (
              <div style={sc.demoBanner}>
                <div style={sc.demoTitle}>Demo pipeline</div>
                <div style={sc.demoSummary}>{demoData.summary}</div>
                <button style={sc.demoButton} onClick={() => navigate(demoData.featureLinks[0].path)}>Open full view</button>
              </div>
            )}
          </div>

          {/* Sensor tiles */}
          <div style={sc.sensorGrid}>
            <SensorTile label="Vibration" value={sensors.vib} unit="mm/s" critical />
            <SensorTile label="Temperature" value={sensors.temp} unit="°C" />
            <SensorTile label="Current" value={sensors.curr} unit="A" />
            <SensorTile label="Speed" value={sensors.rpm} unit="RPM" />
          </div>

          {/* Live time-series chart */}
          <div style={sc.card}>
            <div style={sc.cardTitle}>Live Sensor Data</div>
            <div style={{ height: 160 }}>
              <Line data={liveChartData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Alerts */}
          <div style={sc.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={sc.cardTitle}>Recent Alerts</div>
              <span style={sc.viewAll}>View all</span>
            </div>
            {[
              { time: '13:24', msg: 'Abnormal vibration detected', sev: 'critical' },
              { time: '13:22', msg: 'Temperature threshold exceeded', sev: 'warning' },
              { time: '13:15', msg: 'Current fluctuation', sev: 'warning' },
              { time: '13:05', msg: 'Maintenance required', sev: 'info' },
            ].map((a, i) => (
              <div key={i} style={sc.alertRow}>
                <span style={{ ...sc.alertDot, background: a.sev === 'critical' ? '#ef4444' : a.sev === 'warning' ? '#f97316' : '#3b82f6' }} />
                <span style={sc.alertTime}>{a.time}</span>
                <span style={sc.alertMsg}>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────── */}
        <div style={sc.rightCol}>

          {/* AI Diagnosis */}
          <div style={{ ...sc.card, borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
            <div style={sc.cardTitle}>AI Diagnosis</div>
            <div style={sc.diagRow}>
              <span style={sc.diagLabel}>Fault Type</span>
              <span style={{ ...sc.diagValue, color: '#ef4444' }}>Abnormal Vibration Detected<br /><span style={{ fontSize: 11, color: 'rgba(200,100,100,0.8)' }}>Bearing · Left Side</span></span>
            </div>
            <div style={sc.diagRow}>
              <span style={sc.diagLabel}>Confidence</span>
              <span style={{ ...sc.diagValue, color: '#f97316' }}>92%</span>
            </div>
            {/* Sparkline */}
            <svg viewBox="0 0 100 32" style={{ width: '100%', height: 36, margin: '4px 0' }}>
              <path d={sparkPath} fill="none" stroke="#ef4444" strokeWidth="1.5" />
              <path d={sparkPath + ` L100,32 L0,32 Z`} fill="rgba(239,68,68,0.1)" />
            </svg>
            <div style={sc.diagRow}>
              <span style={sc.diagLabel}>Remaining Useful Life</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>18 <span style={{ fontSize: 13, color: 'rgba(200,215,240,0.6)', fontWeight: 400 }}>days</span></span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#f97316' }}>78%</span>
              </div>
            </div>
            {/* RUL progress */}
            <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '78%', background: 'linear-gradient(90deg, #ef4444, #f97316)', borderRadius: 4 }} />
            </div>
          </div>

          {/* AI Copilot */}
          <div style={{ ...sc.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={sc.cardTitle}>🤖 AI Copilot (RAG)</div>
            <div ref={chatRef} style={sc.chatHistory}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  {m.role === 'user' ? (
                    <div style={sc.chatUser}>{m.text}</div>
                  ) : (
                    <div style={sc.chatAi}>
                      <div style={sc.chatAiText}>
                        {m.text.split('\n').map((line, j) => <div key={j}>{line}</div>)}
                      </div>
                      {m.full && <button style={sc.viewFullBtn}>View full answer</button>}
                    </div>
                  )}
                </div>
              ))}
              {/* Recommended Action (static) */}
              <div style={sc.recommendBox}>
                <div style={sc.recommendLabel}>Recommended Action</div>
                <div style={sc.recommendText}>Replace bearing and lubricate</div>
                <button style={sc.woBtn}>Create Work Order</button>
              </div>
            </div>
            <div style={sc.chatInputRow}>
              <input
                style={sc.chatInput}
                placeholder="Ask about this machine…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
              />
              <button style={sc.sendBtn} onClick={sendMsg}>↑</button>
            </div>
          </div>

          {/* Connected Systems */}
          <div style={sc.card}>
            <div style={sc.cardTitle}>Connected Systems</div>
            <ConnectedDot name="SAP PM"       ok={true} />
            <ConnectedDot name="MES"           ok={true} />
            <ConnectedDot name="CMMS (Maximo)" ok={false} />
            <ConnectedDot name="MQTT Broker"   ok={true} />
            <ConnectedDot name="OPC-UA"        ok={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── styles ──────────────────────────────────────────────────────── */
const sc: Record<string, React.CSSProperties> = {
  root: { background: 'var(--app-bg)', minHeight: '100vh', color: 'var(--app-text)', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-surface)' },
  machineInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  machineLabel: { fontSize: 12, color: 'rgba(148,163,184,0.7)' },
  machineId: { fontSize: 16, fontWeight: 700, color: '#FFFFFF' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12 },
  statusDot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },
  topRight: { display: 'flex', alignItems: 'center', gap: 10 },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '3px 10px' },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' },
  clockBadge: { fontSize: 12, color: 'rgba(200,215,240,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 10px' },
  copilotBadge: { fontSize: 12, color: '#00B7FF', background: 'rgba(0,183,255,0.08)', border: '1px solid rgba(0,183,255,0.2)', borderRadius: 20, padding: '3px 10px' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#00B7FF,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, padding: 16, flex: 1 },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 12 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px 16px' },
  cardTitle: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)', marginBottom: 12 },
  machineCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' },
  machineViz: { padding: '12px 16px', height: 180 },
  machineActions: { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 16px', display: 'flex', gap: 8 },
  demoBanner: { padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 },
  demoTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#00B7FF' },
  demoSummary: { fontSize: 12, color: 'rgba(200,215,240,0.8)', lineHeight: 1.5 },
  demoButton: { alignSelf: 'flex-start', background: 'rgba(0,183,255,0.14)', border: '1px solid rgba(0,183,255,0.24)', borderRadius: 8, color: '#00B7FF', padding: '7px 10px', cursor: 'pointer', fontSize: 11 },
  machineBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'rgba(200,215,240,0.6)', cursor: 'pointer', padding: '4px 10px', fontSize: 14 },
  sensorGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  tile: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: 12, padding: '14px 12px', textAlign: 'center' as const },
  tileLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'rgba(148,163,184,0.7)', marginBottom: 6 },
  tileValue: { fontSize: 26, fontWeight: 800, lineHeight: 1 },
  tileUnit: { fontSize: 10, marginTop: 4 },
  alertRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  alertDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  alertTime: { fontSize: 11, color: 'rgba(100,125,165,0.7)', width: 34, flexShrink: 0 },
  alertMsg: { fontSize: 12, color: 'rgba(200,215,240,0.8)' },
  viewAll: { fontSize: 11, color: '#00B7FF', cursor: 'pointer' },
  diagRow: { marginBottom: 10 },
  diagLabel: { display: 'block', fontSize: 10, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 3 },
  diagValue: { fontSize: 14, fontWeight: 600 },
  chatHistory: { flex: 1, overflowY: 'auto' as const, maxHeight: 260, marginBottom: 10, display: 'flex', flexDirection: 'column' as const, gap: 4 },
  chatUser: { background: 'rgba(0,183,255,0.1)', border: '1px solid rgba(0,183,255,0.2)', borderRadius: '10px 10px 2px 10px', padding: '8px 12px', fontSize: 12, color: '#FFFFFF', alignSelf: 'flex-end' as const, maxWidth: '85%' },
  chatAi: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '2px 10px 10px 10px', padding: '8px 12px' },
  chatAiText: { fontSize: 12, color: 'rgba(200,215,240,0.85)', lineHeight: 1.6 },
  viewFullBtn: { marginTop: 8, fontSize: 11, color: '#00B7FF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' },
  recommendBox: { background: 'rgba(0,183,255,0.06)', border: '1px solid rgba(0,183,255,0.15)', borderRadius: 10, padding: '10px 12px', marginTop: 4 },
  recommendLabel: { fontSize: 10, color: 'rgba(0,183,255,0.7)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 },
  recommendText: { fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 10 },
  woBtn: { width: '100%', padding: '9px', background: 'linear-gradient(135deg,#00B7FF,#0080cc)', border: 'none', borderRadius: 8, color: '#080D1A', fontWeight: 700, fontSize: 12, cursor: 'pointer', letterSpacing: '0.04em' },
  chatInputRow: { display: 'flex', gap: 6 },
  chatInput: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#FFFFFF', outline: 'none' },
  sendBtn: { width: 36, background: '#00B7FF', border: 'none', borderRadius: 8, color: '#080D1A', fontWeight: 800, cursor: 'pointer', fontSize: 16 },
  sysRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  sysName: { fontSize: 12, color: 'rgba(200,215,240,0.8)', flex: 1 },
  sysBadge: { fontSize: 10, fontWeight: 600 },
};
