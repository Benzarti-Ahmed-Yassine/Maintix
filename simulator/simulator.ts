import WebSocket from 'ws';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const WS_URL = process.env.WS_URL || 'ws://localhost:4000/ws';

interface MachineState {
  code: string;
  name: string;
  vibRMS: number;
  tempBearing: number;
  tempMotor: number;
  current: number;
  speedRpm: number;
  scenario: string;
}

const machinesState: Record<string, MachineState> = {
  'PCL-GMX-001': { code: 'PCL-GMX-001', name: 'Picanol GamMax-8-R-190 #01', vibRMS: 11.2, tempBearing: 62.5, tempMotor: 51.0, current: 4.4, speedRpm: 1450, scenario: 'BEARING_DEGRADATION' },
  'TX-1250-A': { code: 'TX-1250-A', name: 'OptiMax-i 1250 Loom A12', vibRMS: 11.2, tempBearing: 62.5, tempMotor: 51.0, current: 4.4, speedRpm: 1450, scenario: 'BEARING_DEGRADATION' },
  'TX-0672-B': { code: 'TX-0672-B', name: 'Ring Spinning Frame B06', vibRMS: 3.2, tempBearing: 52.0, tempMotor: 50.0, current: 5.1, speedRpm: 1400, scenario: 'WARNING' },
  'TX-0981-C': { code: 'TX-0981-C', name: 'Rapier Weaving Loom C09', vibRMS: 2.8, tempBearing: 48.0, tempMotor: 46.0, current: 4.8, speedRpm: 1420, scenario: 'WARNING' },
  'TX-1123-D': { code: 'TX-1123-D', name: 'Stenter Frame D11', vibRMS: 7.4, tempBearing: 68.0, tempMotor: 62.0, current: 6.8, speedRpm: 1100, scenario: 'CRITICAL' },
  'TX-0777-E': { code: 'TX-0777-E', name: 'Automated Winder E07', vibRMS: 0.9, tempBearing: 38.0, tempMotor: 40.0, current: 3.8, speedRpm: 1500, scenario: 'NORMAL' },
};

let wsClient: WebSocket | null = null;

function connectWebSocket() {
  try {
    wsClient = new WebSocket(WS_URL);
    wsClient.on('open', () => {
      console.log('📡 Simulator connected to MAINTIX Backend WebSocket');
    });

    wsClient.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        if (message.type === 'DEMO_SCENARIO_TRIGGERED') {
          const { scenario, machine } = message.payload;
          const targetCode = machine?.code || 'PCL-GMX-001';
          console.log(`⚡ Simulator received scenario update: ${scenario} for ${targetCode}`);

          if (machinesState[targetCode]) {
            machinesState[targetCode].scenario = scenario;
            if (scenario === 'BEARING_DEGRADATION' || scenario === 'CRITICAL') {
              machinesState[targetCode].vibRMS = 11.2;
              machinesState[targetCode].tempBearing = 62.5;
              machinesState[targetCode].tempMotor = 51.0;
              machinesState[targetCode].current = 4.4;
            } else if (scenario === 'NORMAL_OPERATION' || scenario === 'NORMAL' || scenario === 'RECOVERY') {
              machinesState[targetCode].vibRMS = 1.4;
              machinesState[targetCode].tempBearing = 42.0;
              machinesState[targetCode].tempMotor = 45.0;
              machinesState[targetCode].current = 4.0;
            } else if (scenario === 'MOTOR_OVERHEATING') {
              machinesState[targetCode].vibRMS = 3.2;
              machinesState[targetCode].tempBearing = 48.0;
              machinesState[targetCode].tempMotor = 82.0;
              machinesState[targetCode].current = 5.8;
            }
          }
        }
      } catch (err) {
        // ignore parse error
      }
    });

    wsClient.on('close', () => {
      setTimeout(connectWebSocket, 3000);
    });

    wsClient.on('error', () => {});
  } catch (err) {
    setTimeout(connectWebSocket, 3000);
  }
}

connectWebSocket();

console.log('🏭 MAINTIX Industrial IoT Telemetry Simulator Engine Active...');
console.log('Simulating continuous telemetry stream for 6 textile assets (PCL-GMX-001, TX-1250-A, TX-0672-B, TX-0981-C, TX-1123-D, TX-0777-E)...');

setInterval(() => {
  for (const code of Object.keys(machinesState)) {
    const state = machinesState[code];
    const noiseVib = (Math.random() - 0.5) * 0.15;
    const noiseTemp = (Math.random() - 0.5) * 0.2;

    const liveVib = Math.max(0.2, parseFloat((state.vibRMS + noiseVib).toFixed(2)));
    const liveTemp = Math.max(20, parseFloat((state.tempBearing + noiseTemp).toFixed(1)));
    const liveCurrent = Math.max(1, parseFloat((state.current + (Math.random() - 0.5) * 0.05).toFixed(2)));
    const liveRpm = Math.round(state.speedRpm + (Math.random() - 0.5) * 6);

    const payload = {
      machineCode: code,
      vibRMS: liveVib,
      vibX: parseFloat((liveVib * 0.75).toFixed(2)),
      vibY: parseFloat((liveVib * 0.82).toFixed(2)),
      vibZ: parseFloat((liveVib * 0.55).toFixed(2)),
      tempBearing: liveTemp,
      tempMotor: state.tempMotor,
      current: liveCurrent,
      speedRpm: liveRpm,
      healthIndex: liveVib > 4.5 ? 22.0 : 96.5,
      anomalyScore: liveVib > 4.5 ? 0.92 : 0.03,
      isAnomaly: liveVib > 4.5,
      severity: liveVib > 7.1 ? 'CRITICAL' : liveVib > 4.5 ? 'HIGH' : 'LOW',
      estimatedRulDays: liveVib > 4.5 ? 18 : 85,
      timestamp: new Date()
    };

    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(JSON.stringify({
        type: 'LIVE_TELEMETRY',
        payload
      }));
    }
  }
}, 2000);
