import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    topMetrics: [{ title: 'Asset readiness', value: '96%', description: 'Predictive maintenance coverage for critical equipment.' }],
    oeeLabels: ['Mon'],
    oeeValues: [88],
    backlogLabels: ['Week 1'],
    backlogValues: [16],
    activeAlerts: []
  })
}));

describe('Dashboard integration', () => {
  it('loads dashboard data from the API layer', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Asset readiness')).toBeInTheDocument();
    expect(screen.getByText('96%')).toBeInTheDocument();
  });
});
