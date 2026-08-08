import '@/components/charts/ChartRegistry';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { DemoSnapshot, runDemoPipeline } from '@/services/demoPipeline';

/* ─── mock data ─────────────────────────────────────────────────── */
const LINE_STATUS = [
  { id: 'Line 1', status: 'Running', oee: 82.5, trend: '+2.1%', color: '#22c55e' },
  { id: 'Line 2', status: 'Warning', oee: 74.1, trend: '-1.3%', color: '#eab308' },
  { id: 'Line 3', status: 'Warning', oee: 71.8, trend: '-3.2%', color: '#eab308' },
  { id: 'Line 4', status: 'Down',    oee: 0,    trend: '-100%', color: '#ef4444' },
  { id: 'Line 5', status: 'Running', oee: 81.9, trend: '+0.8%', color: '#22c55e' },
];

const DAYS = ['May 18','May 19','May 20','May 21','May 22','May 23','May 24','May 25'];
const AI_MSGS = [
  { role: 'user', text: 'Why is Line 4 productivity low?' },
  { role: 'ai', text: 'Line 4 is down due to machine TX-1123-D failure.\n\nRoot cause: Bearing wear detected yesterday.\nThis is caused by 48.2% wear factor.\n\nSources:\n1. Downtime Report\n2. TX-1123-D History\n3. Failure Analysis', full: true },
];

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } } },
  scales: {
    x: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

function KpiCard({ label, value, delta, deltaUp, sub }: { label: string; value: string; delta?: string; deltaUp?: boolean; sub?: string }) {
  return (
    <div style={sp.kpiCard}>
      <div style={sp.kpiLabel}>{label}</div>
      <div style={sp.kpiValue}>{value}</div>
      {delta && <div style={{ fontSize: 10, color: deltaUp ? '#22c55e' : '#ef4444', marginTop: 3 }}>{deltaUp ? '▲' : '▼'} {delta}</div>}
      {sub && <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function ProductionPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(AI_MSGS);
  const [input, setInput] = useState('');
  const [activeSource, setActiveSource] = useState<number | null>(null);
  const [demoData, setDemoData] = useState<DemoSnapshot | null>(null);

  useEffect(() => {
    let ignore = false;
    void runDemoPipeline('production').then((snapshot) => {
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
      { role: 'user', text: q, full: false },
      { role: 'ai', text: 'Analyzing production line data…\n\nLine 3 is underperforming due to setup & adjustment losses (32%) and changeover delays (28%). Recommend optimizing changeover procedure on Line 3 to recover 7.2% OEE.', full: true },
    ]);
  };

  const oeeTrend = {
    labels: DAYS,
    datasets: [
      { label: 'OEE (%)',    data: [76.1, 77.8, 78.6, 75.2, 79.1, 78.6, 77.4, 78.6], borderColor: '#00B7FF',  tension: 0.4, pointRadius: 3, borderWidth: 2, backgroundColor: 'rgba(0,183,255,0.06)', fill: true },
    ],
  };

  const prodVsTarget = {
    labels: DAYS.slice(-5),
    datasets: [
      { label: 'Actual Output', data: [118000,122000,121000,119000,125430], backgroundColor: 'rgba(0,183,255,0.7)', borderRadius: 3, barThickness: 14 },
      { label: 'Target',        data: [125000,125000,125000,125000,125000], backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 3, barThickness: 14 },
    ],
  };

  const downtimeCauses = {
    labels: ['Machine Failure','Changeover','Material Shortage','Setup & Adjustment','Other'],
    datasets: [{ data: [38, 24, 18, 12, 8], backgroundColor: ['#ef4444','#f97316','#3b82f6','#eab308','#6366f1'], borderWidth: 0 }],
  };

  const recommendations = [
    { text: 'Repair TX-1122-D to restore Line 4', priority: 'Critical' },
    { text: 'Balance workload between Line 1 and Line 2', priority: 'High' },
    { text: 'Reduce changeover time on Line 3', priority: 'Medium' },
    { text: 'Increase preventive maintenance on TX-1250-A', priority: 'Medium' },
  ];
  const prioColor: Record<string, string> = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308' };

  return (
    <div style={sp.root}>
      {/* TOP BAR */}
      <div style={sp.topBar}>
        <div>
          <div style={sp.pageTitle}>Production Manager</div>
          <div style={sp.pageSub}>May 18 – May 25, 2024</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={sp.liveBadge}><span style={sp.liveDot} />Live</div>
          <div style={sp.avatar}>PM</div>
        </div>
      </div>

      <div style={sp.content}>
        {/* KPIs */}
        <div style={sp.kpiRow}>
          <KpiCard label="OEE"          value="78.6%" delta="5.2%"  deltaUp />
          <KpiCard label="Availability" value="89.1%" delta="3.1%"  deltaUp />
          <KpiCard label="Performance"  value="82.4%" delta="2.7%"  deltaUp />
          <KpiCard label="Quality"      value="94.7%" delta="1.4%"  deltaUp />
          <KpiCard label="Total Output" value="125,430" sub="units" />
          <KpiCard label="Downtime"     value="12.4 h" delta="8%"  deltaUp={false} />
        </div>

        {/* Main grid */}
        <div style={sp.mainGrid}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Line Status + OEE Trend */}
            <div style={sp.splitRow}>
              {/* Line Status table */}
              <div style={{ ...sp.card, flex: '0 0 300px' }}>
                <div style={sp.cardTitle}>Production Line Status</div>
                {demoData && (
                  <div style={sp.demoBanner}>
                    <div style={sp.demoTitle}>Demo pipeline</div>
                    <div style={sp.demoSummary}>{demoData.summary}</div>
                    <button style={sp.demoButton} onClick={() => navigate(demoData.featureLinks[0].path)}>Open full detail</button>
                  </div>
                )}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: 'rgba(148,163,184,0.5)', fontSize: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Line', 'Status', 'OEE %', 'Δ'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '5px 8px', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LINE_STATUS.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '8px', color: '#FFFFFF', fontWeight: 600 }}>{row.id}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ background: `${row.color}22`, color: row.color, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>{row.status}</span>
                        </td>
                        <td style={{ padding: '8px', color: row.status === 'Down' ? '#ef4444' : '#FFFFFF', fontWeight: 700 }}>
                          {row.status === 'Down' ? '—' : `${row.oee}%`}
                        </td>
                        <td style={{ padding: '8px', fontSize: 11, color: row.trend.startsWith('+') ? '#22c55e' : '#ef4444' }}>{row.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* OEE Trend */}
              <div style={{ ...sp.card, flex: 1 }}>
                <div style={sp.cardTitle}>OEE Trend</div>
                <div style={{ height: 160 }}>
                  <Line data={oeeTrend} options={chartOpts as any} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div style={sp.splitRow}>
              <div style={{ ...sp.card, flex: 1 }}>
                <div style={sp.cardTitle}>Production vs Target</div>
                <div style={{ height: 150 }}>
                  <Bar data={prodVsTarget} options={chartOpts as any} />
                </div>
              </div>
              <div style={{ ...sp.card, flex: '0 0 210px' }}>
                <div style={sp.cardTitle}>Downtime by Cause</div>
                <div style={{ height: 150 }}>
                  <Doughnut data={downtimeCauses} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 10 } } } }} />
                </div>
              </div>
            </div>

            {/* Bottleneck + Recommendations */}
            <div style={sp.splitRow}>
              {/* Bottleneck */}
              <div style={{ ...sp.card, flex: 1, borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
                <div style={sp.cardTitle}>Bottleneck Analysis</div>
                <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 700, marginBottom: 8 }}>Bottleneck: <span style={{ color: '#FFFFFF' }}>Machine: TX-1123-D</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  {[['Reason', 'Bearing Wear'], ['Impact', 'High'], ['Line', 'Line 4'], ['Est. Loss', '$8,400/day']].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(200,215,240,0.75)', marginBottom: 10 }}>Recommendation: Repair machine or reallocate production</div>
                <button style={sp.detailBtn}>View Details</button>
              </div>

              {/* AI Recommendations */}
              <div style={{ ...sp.card, flex: 1 }}>
                <div style={sp.cardTitle}>AI Recommendations</div>
                {recommendations.map((r, i) => (
                  <div key={i} style={sp.recRow}>
                    <span style={{ ...sp.recDot, background: prioColor[r.priority] }} />
                    <span style={sp.recText}>{r.text}</span>
                    <span style={{ fontSize: 9, color: prioColor[r.priority], fontWeight: 600, flexShrink: 0 }}>{r.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Copilot */}
          <div style={sp.rightCol}>
            <div style={{ ...sp.card, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={sp.cardTitle}>🤖 AI Copilot (RAG)</div>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {messages.map((m, i) => (
                  <div key={i}>
                    {m.role === 'user'
                      ? <div style={sp.chatUser}>{m.text}</div>
                      : <div style={sp.chatAi}>
                          {m.text.split('\n').map((l, j) => <div key={j} style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(200,215,240,0.85)' }}>{l}</div>)}
                          {(m as any).full && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)', marginBottom: 4 }}>SOURCES</div>
                              {['Downtime Report','TX-1123-D History','Failure Analysis'].map((src, si) => (
                                <div key={si} style={{ fontSize: 11, color: '#00B7FF', marginBottom: 2, cursor: 'pointer' }}>📄 {src}</div>
                              ))}
                              <button style={sp.viewFullBtn}>View full report</button>
                            </div>
                          )}
                        </div>
                    }
                  </div>
                ))}
              </div>
              <div style={sp.chatRow}>
                <input style={sp.chatInput} placeholder="Ask about production lines…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
                <button style={sp.sendBtn} onClick={sendMsg}>↑</button>
              </div>
            </div>

            {/* Connected */}
            <div style={sp.card}>
              <div style={sp.cardTitle}>Connected Systems</div>
              {[['SAP PM', true], ['MES', true], ['CMMS (Maximo)', true], ['MQTT Broker', true], ['OPC-UA', true]].map(([n, ok]) => (
                <div key={n as string} style={sp.sysRow}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444', boxShadow: `0 0 5px ${ok ? '#22c55e' : '#ef4444'}` }} />
                  <span style={sp.sysName}>{n as string}</span>
                  <span style={{ fontSize: 10, color: ok ? '#22c55e' : '#ef4444' }}>●</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sp: Record<string, React.CSSProperties> = {
  root: { background: 'var(--app-bg)', minHeight: '100vh', color: 'var(--app-text)', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--app-border)', background: 'var(--app-surface)' },
  pageTitle: { fontSize: 18, fontWeight: 700 },
  pageSub: { fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 2 },
  liveBadge: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '3px 10px' },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  content: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 },
  kpiCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px' },
  kpiLabel: { fontSize: 10, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 },
  kpiValue: { fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 290px', gap: 12 },
  splitRow: { display: 'flex', gap: 10 },
  card: { background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px 16px' },
  demoBanner: { marginTop: 10, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(0,183,255,0.18)', background: 'rgba(0,183,255,0.08)' },
  demoTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#00B7FF' },
  demoSummary: { marginTop: 4, fontSize: 12, color: 'rgba(200,215,240,0.8)', lineHeight: 1.5 },
  demoButton: { marginTop: 8, alignSelf: 'flex-start', background: 'rgba(0,183,255,0.14)', border: '1px solid rgba(0,183,255,0.24)', borderRadius: 8, color: '#00B7FF', padding: '7px 10px', cursor: 'pointer', fontSize: 11 },
  cardTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)', marginBottom: 10 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 10 },
  detailBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 12, padding: '7px 14px', cursor: 'pointer', fontWeight: 600 },
  recRow: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  recDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 3 },
  recText: { fontSize: 12, color: 'rgba(200,215,240,0.85)', flex: 1, lineHeight: 1.5 },
  chatUser: { background: 'rgba(0,183,255,0.1)', border: '1px solid rgba(0,183,255,0.2)', borderRadius: '10px 10px 2px 10px', padding: '8px 10px', fontSize: 12, color: '#FFFFFF' },
  chatAi: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px 10px 10px 10px', padding: '8px 10px' },
  viewFullBtn: { marginTop: 8, background: 'none', border: '1px solid rgba(0,183,255,0.2)', borderRadius: 6, color: '#00B7FF', fontSize: 11, padding: '5px 10px', cursor: 'pointer', width: '100%' },
  chatRow: { display: 'flex', gap: 6 },
  chatInput: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#FFFFFF', outline: 'none' },
  sendBtn: { width: 34, background: '#00B7FF', border: 'none', borderRadius: 8, color: '#080D1A', fontWeight: 800, cursor: 'pointer', fontSize: 15 },
  sysRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  sysName: { fontSize: 12, color: 'rgba(200,215,240,0.8)', flex: 1 },
};
