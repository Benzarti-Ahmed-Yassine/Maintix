import '@/components/charts/ChartRegistry';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { DemoSnapshot, runDemoPipeline } from '@/services/demoPipeline';

/* ─── mock data ───────────────────────────────────────────────────── */
const RISK_TABLE = [
  { id: 'TX-1250-A', risk: 85, days: 3,  status: 'Critical',  rul: '3 days'  },
  { id: 'TX-0679-B', risk: 72, days: 18, status: 'High',      rul: '18 days' },
  { id: 'TX-0981-C', risk: 65, days: 24, status: 'High',      rul: '24 days' },
  { id: 'TX-1123-D', risk: 41, days: 40, status: 'Medium',    rul: '40 days' },
  { id: 'TX-0777-E', risk: 32, days: 60, status: 'Low',       rul: '60 days' },
];

const GANTT = [
  { machine: 'TX-1250-A', task: 'Bearing Replacement', color: '#ef4444', start: 13, span: 3 },
  { machine: 'TX-0679-B', task: 'Motor Inspection',    color: '#f97316', start: 15, span: 4 },
  { machine: 'TX-0981-C', task: 'Belt Replacement',    color: '#eab308', start: 18, span: 3 },
  { machine: 'TX-1123-D', task: 'Preventive Check',    color: '#3b82f6', start: 20, span: 5 },
  { machine: 'TX-0777-E', task: 'Lubrication',         color: '#22c55e', start: 22, span: 2 },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
const AI_MSGS = [
  { role: 'user', text: 'Which machines are most at risk?' },
  { role: 'ai',   text: 'Based on analysis, these machines have the highest risk:\n\n1. TX-1250-A (85%) → Critical\n2. TX-0679-B (72%) → High\n3. TX-0981-C (65%) → High\n\nActions:\n• Prioritize TX-1250-A bearing replacement\n• Schedule bearing swap on TX-0679-B\n• Monitor vibration on TX-0679-B' },
];

const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } } },
  scales: {
    x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

function KpiCard({ label, value, color, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={sm.kpiCard}>
      <div style={sm.kpiLabel}>{label}</div>
      <div style={{ ...sm.kpiValue, color: color ?? '#FFFFFF' }}>{value}</div>
      {sub && <div style={sm.kpiSub}>{sub}</div>}
    </div>
  );
}

function ConnectedDot({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div style={sm.sysRow}>
      <div style={{ ...sm.dot, background: ok ? '#22c55e' : '#ef4444', boxShadow: `0 0 5px ${ok ? '#22c55e' : '#ef4444'}` }} />
      <span style={sm.sysName}>{name}</span>
      <span style={{ fontSize: 10, color: ok ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{ok ? '●' : '○'}</span>
    </div>
  );
}

export function MaintenancePage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(AI_MSGS);
  const [input, setInput] = useState('');
  const [demoData, setDemoData] = useState<DemoSnapshot | null>(null);

  useEffect(() => {
    let ignore = false;
    void runDemoPipeline('maintenance').then((snapshot) => {
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
      { role: 'ai',   text: 'Analyzing fleet maintenance data…\n\nTop recommendation: Schedule TX-1250-A bearing replacement immediately. Estimated downtime cost if failed: $14,200. Planned replacement cost: $2,800.' },
    ]);
  };

  const downtimeTrend = {
    labels: ['May 10','May 13','May 16','May 19','May 22','May 25'],
    datasets: [{ label: 'Downtime (h)', data: [12, 18, 14, 22, 16, 20], borderColor: '#00B7FF', backgroundColor: 'rgba(0,183,255,0.08)', tension: 0.4, fill: true, pointRadius: 3, borderWidth: 2 }],
  };

  const mtbfData = {
    labels: MONTHS,
    datasets: [
      { label: 'MTBF (h)', data: [280, 260, 270, 245, 256], backgroundColor: 'rgba(0,183,255,0.7)', borderRadius: 4, barThickness: 16 },
      { label: 'MTTR (h)', data: [3.8, 4.1, 3.6, 3.9, 3.4], backgroundColor: 'rgba(249,115,22,0.7)', borderRadius: 4, barThickness: 16 },
    ],
  };

  const causesData = {
    labels: ['Bearing Wear', 'Misalignment', 'Overheating', 'Loose Parts', 'Other'],
    datasets: [{ data: [38, 22, 18, 12, 10], backgroundColor: ['#ef4444','#f97316','#eab308','#3b82f6','#6366f1'], borderWidth: 0 }],
  };

  const statusColor: Record<string, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };

  return (
    <div style={sm.root}>
      {/* TOP BAR */}
      <div style={sm.topBar}>
        <div>
          <div style={sm.pageTitle}>Maintenance Manager</div>
          <div style={sm.pageSub}>Fleet risk, planning & predictive maintenance</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={sm.liveBadge}><span style={sm.liveDot} />Live</div>
          <div style={sm.avatar}>MM</div>
        </div>
      </div>

      <div style={sm.content}>
        {/* KPIs */}
        <div style={sm.kpiRow}>
          <KpiCard label="Total Machines" value={48} />
          <KpiCard label="Critical Alerts" value={7}  color="#ef4444" />
          <KpiCard label="High Risk"       value={12} color="#f97316" />
          <KpiCard label="Planned Tasks"   value={12} color="#eab308" />
          <KpiCard label="MTBF (h)"        value={256} />
          <KpiCard label="MTTR (h)"        value={3.4} />
        </div>

        {/* Main grid */}
        <div style={sm.mainGrid}>
          {/* Left 2/3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Risk Ranking + Gantt */}
            <div style={sm.splitRow}>
              {/* Risk table */}
              <div style={{ ...sm.card, flex: 1 }}>
                <div style={sm.cardTitle}>Risk Ranking</div>
                {demoData && (
                  <div style={sm.demoBanner}>
                    <div style={sm.demoTitle}>Demo pipeline</div>
                    <div style={sm.demoSummary}>{demoData.summary}</div>
                    <button style={sm.demoButton} onClick={() => navigate(demoData.featureLinks[0].path)}>Open full detail</button>
                  </div>
                )}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: 'rgba(148,163,184,0.6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['#', 'Machine ID', 'Risk Score', 'RUL', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, fontSize: 10, letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RISK_TABLE.map((row, i) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '9px 8px', color: 'rgba(148,163,184,0.5)' }}>{i + 1}</td>
                        <td style={{ padding: '9px 8px', color: '#FFFFFF', fontWeight: 600 }}>{row.id}</td>
                        <td style={{ padding: '9px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${row.risk}%`, background: statusColor[row.status], borderRadius: 3 }} />
                            </div>
                            <span style={{ color: statusColor[row.status], fontWeight: 700 }}>{row.risk}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 8px', color: 'rgba(200,215,240,0.7)' }}>{row.days} days</td>
                        <td style={{ padding: '9px 8px' }}>
                          <span style={{ background: `${statusColor[row.status]}22`, color: statusColor[row.status], borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Gantt plan */}
              <div style={{ ...sm.card, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={sm.cardTitle}>Maintenance Plan</div>
                  <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>May 2024</div>
                </div>
                {/* Day headers */}
                <div style={{ display: 'flex', marginBottom: 8, paddingLeft: 90 }}>
                  {Array.from({ length: 14 }, (_, i) => i + 13).map(d => (
                    <div key={d} style={{ flex: 1, fontSize: 8, color: 'rgba(148,163,184,0.4)', textAlign: 'center' }}>{d}</div>
                  ))}
                </div>
                {GANTT.map((row) => (
                  <div key={row.machine} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ width: 90, fontSize: 11, color: 'rgba(200,215,240,0.7)', flexShrink: 0 }}>{row.machine}</div>
                    <div style={{ flex: 1, height: 22, position: 'relative', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <div style={{
                        position: 'absolute',
                        left: `${((row.start - 13) / 14) * 100}%`,
                        width: `${(row.span / 14) * 100}%`,
                        height: '100%',
                        background: `${row.color}33`,
                        border: `1px solid ${row.color}66`,
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', paddingLeft: 6,
                      }}>
                        <span style={{ fontSize: 9, color: row.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.task}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts row */}
            <div style={sm.splitRow}>
              <div style={{ ...sm.card, flex: 1 }}>
                <div style={sm.cardTitle}>Downtime Trend (h)</div>
                <div style={{ height: 140 }}>
                  <Line data={downtimeTrend} options={chartDefaults as any} />
                </div>
              </div>
              <div style={{ ...sm.card, flex: 1 }}>
                <div style={sm.cardTitle}>MTBF vs MTTR</div>
                <div style={{ height: 140 }}>
                  <Bar data={mtbfData} options={chartDefaults as any} />
                </div>
              </div>
              <div style={{ ...sm.card, flex: '0 0 200px' }}>
                <div style={sm.cardTitle}>Top Failure Causes</div>
                <div style={{ height: 140 }}>
                  <Doughnut data={causesData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10 } } } }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={sm.rightCol}>
            {/* AI Copilot */}
            <div style={{ ...sm.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={sm.cardTitle}>🤖 AI Copilot (RAG)</div>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 340, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {messages.map((m, i) => (
                  <div key={i}>
                    {m.role === 'user'
                      ? <div style={sm.chatUser}>{m.text}</div>
                      : <div style={sm.chatAi}>{m.text.split('\n').map((l, j) => <div key={j} style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(200,215,240,0.85)' }}>{l}</div>)}</div>
                    }
                  </div>
                ))}
                <button style={sm.viewFullBtn}>View full analysis</button>
              </div>
              <div style={sm.chatRow}>
                <input style={sm.chatInput} placeholder="Ask about the fleet…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
                <button style={sm.sendBtn} onClick={sendMsg}>↑</button>
              </div>
            </div>

            {/* Connected Systems */}
            <div style={sm.card}>
              <div style={sm.cardTitle}>Connected Systems</div>
              <ConnectedDot name="SAP PM"       ok={true} />
              <ConnectedDot name="MES"           ok={true} />
              <ConnectedDot name="CMMS (Maximo)" ok={true} />
              <ConnectedDot name="MQTT Broker"   ok={true} />
              <ConnectedDot name="OPC-UA"        ok={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sm: Record<string, React.CSSProperties> = {
  root: { background: 'var(--app-bg)', minHeight: '100vh', color: 'var(--app-text)', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-surface)' },
  pageTitle: { fontSize: 18, fontWeight: 700, color: '#FFFFFF' },
  pageSub: { fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 2 },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '3px 10px' },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#00B7FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  content: { padding: 16, display: 'flex', flexDirection: 'column', gap: 14 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 },
  kpiCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' },
  kpiLabel: { fontSize: 10, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  kpiValue: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  kpiSub: { fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 4 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 },
  splitRow: { display: 'flex', gap: 12 },
  card: { background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px 16px' },
  demoBanner: { marginTop: 10, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,183,255,0.18)', background: 'rgba(0,183,255,0.08)' },
  demoTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#00B7FF' },
  demoSummary: { marginTop: 4, fontSize: 12, color: 'rgba(200,215,240,0.8)', lineHeight: 1.5 },
  demoButton: { marginTop: 8, alignSelf: 'flex-start', background: 'rgba(0,183,255,0.14)', border: '1px solid rgba(0,183,255,0.24)', borderRadius: 8, color: '#00B7FF', padding: '7px 10px', cursor: 'pointer', fontSize: 11 },
  cardTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)', marginBottom: 12 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 12 },
  chatUser: { background: 'rgba(0,183,255,0.1)', border: '1px solid rgba(0,183,255,0.2)', borderRadius: '10px 10px 2px 10px', padding: '8px 10px', fontSize: 12, color: '#FFFFFF' },
  chatAi: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px 10px 10px 10px', padding: '8px 10px' },
  viewFullBtn: { background: 'none', border: '1px solid rgba(0,183,255,0.2)', borderRadius: 6, color: '#00B7FF', fontSize: 11, padding: '6px 10px', cursor: 'pointer', width: '100%', marginTop: 4 },
  chatRow: { display: 'flex', gap: 6 },
  chatInput: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#FFFFFF', outline: 'none' },
  sendBtn: { width: 34, background: '#00B7FF', border: 'none', borderRadius: 8, color: '#080D1A', fontWeight: 800, cursor: 'pointer', fontSize: 15 },
  sysRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  sysName: { fontSize: 12, color: 'rgba(200,215,240,0.8)', flex: 1 },
};
