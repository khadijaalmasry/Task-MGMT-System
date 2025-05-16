import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function ChartComponent({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Projects', 'Students', 'Tasks', 'Finished Projects'],
        datasets: [{
          label: 'Count',
          data: [
            data.projects.length,
            data.students.length,
            data.tasks.length,
            data.projects.filter(project => project.status === 'Completed').length
          ],
          backgroundColor: [
            'rgba(0, 128, 128, 0.25)',
            'rgba(0, 0, 255, 0.25)',
            'rgba(255, 255, 0, 0.25)',
            'rgba(128, 0, 128, 0.25)'
          ],
          borderColor: [
            'rgba(0, 128, 128, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(255, 255, 0, 1)',
            'rgba(128, 0, 128, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Cleanup function to destroy the chart instance
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} style={{ maxHeight: '53vh' }} />;
}

export default ChartComponent;
