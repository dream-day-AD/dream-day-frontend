import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  popularVenues: { name: string; count: number }[];
  averageBudgets: { range: string; average: number }[];
  vendorPerformance: { category: string; rating: number }[];
}

// Mock data for frontend-only testing
const mockAnalytics: AnalyticsData = {
  popularVenues: [
    { name: 'Sunset Venue', count: 15 },
    { name: 'Ocean Hall', count: 10 },
    { name: 'Garden Pavilion', count: 8 },
  ],
  averageBudgets: [
    { range: '$5k-$10k', average: 7500 },
    { range: '$10k-$15k', average: 12500 },
    { range: '$15k+', average: 18000 },
  ],
  vendorPerformance: [
    { category: 'Venue', rating: 4.8 },
    { category: 'Photographer', rating: 4.5 },
    { category: 'Caterer', rating: 4.7 },
  ],
};

const Reports = () => {
  // Fetch analytics data (replace with mock data for frontend-only)
  const {
    data: analytics = mockAnalytics,
    isLoading,
    error,
  } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get('/reports/analytics');
      return response.data;
    },
    enabled: false, // Disable until backend is ready
  });

  // Popular Venues Chart
  const venueChartData = {
    labels: analytics.popularVenues.map((v) => v.name),
    datasets: [
      {
        label: 'Bookings',
        data: analytics.popularVenues.map((v) => v.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // Average Budgets Chart
  const budgetChartData = {
    labels: analytics.averageBudgets.map((b) => b.range),
    datasets: [
      {
        label: 'Average Budget ($)',
        data: analytics.averageBudgets.map((b) => b.average),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  // Vendor Performance Chart
  const vendorChartData = {
    labels: analytics.vendorPerformance.map((v) => v.category),
    datasets: [
      {
        label: 'Average Rating',
        data: analytics.vendorPerformance.map((v) => v.rating),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Value', color: '#fff' },
      },
      x: { title: { display: true, text: 'Category', color: '#fff' } },
    },
    plugins: {
      legend: { labels: { color: '#fff' } },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Wedding Planner Analytics Report', 10, 10);

    doc.setFontSize(12);
    doc.text('Popular Venues', 10, 20);
    analytics.popularVenues.forEach((v, i) => {
      doc.text(`${v.name}: ${v.count} bookings`, 10, 30 + i * 10);
    });

    doc.text('Average Budgets', 10, 60);
    analytics.averageBudgets.forEach((b, i) => {
      doc.text(`${b.range}: $${b.average.toLocaleString()}`, 10, 70 + i * 10);
    });

    doc.text('Vendor Performance', 10, 100);
    analytics.vendorPerformance.forEach((v, i) => {
      doc.text(`${v.category}: ${v.rating}/5`, 10, 110 + i * 10);
    });

    doc.save('dreamday-analytics-report.pdf');
    toast.success('Report downloaded successfully!');
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading reports...</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">Error loading reports</div>
    );

  return (
    <div className="p-6 space-y-6">
      <Toaster richColors position="top-right" />
      <h2 className="text-2xl font-semibold">Reporting and Analytics</h2>

      <Card className="bg-[var(--card-bg)] border-none">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold">Popular Venues</h3>
            <Bar data={venueChartData} options={chartOptions} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold">Average Budgets</h3>
            <Pie
              data={budgetChartData}
              options={{ ...chartOptions, scales: undefined }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold">Vendor Performance</h3>
            <Bar data={vendorChartData} options={chartOptions} />
          </motion.div>

          <Button onClick={downloadPDF} className="mt-4">
            Download Report as PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
