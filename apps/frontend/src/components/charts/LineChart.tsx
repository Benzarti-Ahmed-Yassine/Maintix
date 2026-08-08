import { Line } from 'react-chartjs-2';
import type { ChartDataset, ChartOptions } from 'chart.js';

interface LineChartProps {
  labels: string[];
  datasets: ChartDataset<'line'>[];
  height?: number;
}

export function LineChart({ labels, datasets, height = 260 }: LineChartProps) {
  const data = { labels, datasets };
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.12)' },
        ticks: { color: '#cbd5e1' }
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.12)' },
        ticks: { color: '#cbd5e1' }
      }
    }
  };

  return (
    <div className="h-full min-h-[260px]">
      <Line data={data} options={options} height={height} />
    </div>
  );
}
