import { Bar } from 'react-chartjs-2';
import type { ChartDataset, ChartOptions } from 'chart.js';

interface BarChartProps {
  labels: string[];
  datasets: ChartDataset<'bar'>[];
  height?: number;
}

export function BarChart({ labels, datasets, height = 280 }: BarChartProps) {
  const data = { labels, datasets };
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#cbd5e1' }
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.12)' },
        ticks: { color: '#cbd5e1' }
      }
    }
  };

  return (
    <div className="h-full min-h-[280px]">
      <Bar data={data} options={options} height={height} />
    </div>
  );
}
