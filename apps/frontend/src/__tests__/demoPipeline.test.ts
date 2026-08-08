import { describe, expect, it } from 'vitest';
import { runDemoPipeline } from '../services/demoPipeline';

describe('demo pipeline', () => {
  it('returns a role-specific demo snapshot with live-looking data', async () => {
    const data = await runDemoPipeline('technician');

    expect(data.role).toBe('technician');
    expect(data.status).toBe('connected');
    expect(data.machine?.name ?? '').toContain('TX-');
    expect(data.connectedSystems.length).toBeGreaterThan(0);
  });
});
