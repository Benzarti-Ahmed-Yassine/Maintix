import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaintenancePage } from '../features/maintenance/pages/MaintenancePage';
import * as mockApi from '../services/mockApi';

vi.mock('../services/mockApi', async () => {
  const actual = await vi.importActual<typeof import('../services/mockApi')>('../services/mockApi');
  return {
    ...actual,
    fetchMaintenanceOverview: vi.fn().mockResolvedValue({
      backlog: 14,
      scheduledJobs: 9,
      availability: 96,
      assetRisk: 21,
    }),
  };
});

describe('MaintenancePage', () => {
  it('renders the maintenance overview cards with realistic plant data', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MaintenancePage />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Backlog items')).toBeInTheDocument();
    expect(await screen.findByText('14')).toBeInTheDocument();
    expect(await screen.findByText('96%')).toBeInTheDocument();
    expect(screen.getByText('Real-time risk signals')).toBeInTheDocument();
    expect(mockApi.fetchMaintenanceOverview).toHaveBeenCalled();
  });
});
