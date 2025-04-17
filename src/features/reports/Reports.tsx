import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
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
import { 
  BarChart3, 
  PieChart, 
  Download, 
  FileDown, 
  ChevronRight, 
  Calendar, 
  DollarSign, 
  Star, 
  Building,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

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

const Reports = () => {
  // Dark blue color palette variables
  const colors = {
    darkBlue1: '#0A1929', // Darkest blue
    darkBlue2: '#11294D', // Dark blue
    darkBlue3: '#1A3A6E', // Medium blue
    darkBlue4: '#2E4E8F', // Lighter accent blue
    lightAccent: '#4C9FE6', // Light blue accent
  };

  // Chart colors
  const chartColors = {
    venues: ['rgba(76, 159, 230, 0.8)', 'rgba(46, 78, 143, 0.8)', 'rgba(59, 130, 246, 0.8)'],
    budgets: ['rgba(125, 211, 252, 0.8)', 'rgba(56, 189, 248, 0.8)', 'rgba(14, 165, 233, 0.8)'],
    vendors: ['rgba(167, 139, 250, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(124, 58, 237, 0.8)'],
  };

  const [activeTab, setActiveTab] = useState('venues');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        duration: 0.5 
      } 
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 }
    }
  };
  // Mock data for frontend-only testing
  const mockAnalytics: AnalyticsData = {
    popularVenues: [
      { name: 'Sunset Garden Resort', count: 15 },
      { name: 'Ocean View Hall', count: 12 },
      { name: 'Mountain Retreat', count: 10 },
      { name: 'Lakeside Manor', count: 8 },
      { name: 'The Grand Pavilion', count: 7 },
    ],
    averageBudgets: [
      { range: '$5k-$10k', average: 7500 },
      { range: '$10k-$15k', average: 12500 },
      { range: '$15k-$20k', average: 17500 },
      { range: '$20k-$30k', average: 25000 },
      { range: '$30k+', average: 35000 },
    ],
    vendorPerformance: [
      { category: 'Venue', rating: 4.8 },
      { category: 'Photographer', rating: 4.5 },
      { category: 'Caterer', rating: 4.7 },
      { category: 'Florist', rating: 4.4 },
      { category: 'DJ/Band', rating: 4.6 },
    ],
  };

  // Fetch analytics data (replace with mock data for frontend-only)
  const {
    data: analytics = mockAnalytics,
    isLoading,
    error,
    refetch,
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
        label: 'Number of Bookings',
        data: analytics.popularVenues.map((v) => v.count),
        backgroundColor: chartColors.venues,
        borderColor: chartColors.venues.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
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
        backgroundColor: chartColors.budgets,
        borderColor: chartColors.budgets.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };

  // Vendor Performance Chart
  const vendorChartData = {
    labels: analytics.vendorPerformance.map((v) => v.category),
    datasets: [
      {
        label: 'Average Rating (out of 5)',
        data: analytics.vendorPerformance.map((v) => v.rating),
        backgroundColor: chartColors.vendors,
        borderColor: chartColors.vendors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Count', color: 'rgba(255, 255, 255, 0.8)' },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
      x: { 
        title: { display: true, text: 'Venue', color: 'rgba(255, 255, 255, 0.8)' },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      },
    },
    plugins: {
      legend: { 
        labels: { color: 'rgba(255, 255, 255, 0.9)' },
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(10, 25, 41, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { color: 'rgba(255, 255, 255, 0.9)' },
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(10, 25, 41, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };
  // Create and download PDF report
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFillColor(colors.darkBlue2);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('DreamDay Wedding Analytics Report', 105, 15, { align: 'center' });
      
      // Add date
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })}`, 105, 35, { align: 'center' });

      // Popular Venues Section
      doc.setFillColor(colors.darkBlue3);
      doc.setTextColor(255, 255, 255);
      doc.rect(10, 45, doc.internal.pageSize.getWidth() - 20, 8, 'F');
      doc.setFontSize(12);
      doc.text('Popular Wedding Venues', 15, 50);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      analytics.popularVenues.forEach((v, i) => {
        const y = 60 + i * 8;
        doc.text(`${v.name}`, 20, y);
        doc.text(`${v.count} bookings`, 150, y);
      });

      // Average Budgets Section
      doc.setFillColor(colors.darkBlue3);
      doc.setTextColor(255, 255, 255);
      doc.rect(10, 110, doc.internal.pageSize.getWidth() - 20, 8, 'F');
      doc.setFontSize(12);
      doc.text('Average Wedding Budgets', 15, 115);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      analytics.averageBudgets.forEach((b, i) => {
        const y = 125 + i * 8;
        doc.text(`${b.range}`, 20, y);
        doc.text(`$${b.average.toLocaleString()}`, 150, y);
      });

      // Vendor Performance Section
      doc.setFillColor(colors.darkBlue3);
      doc.setTextColor(255, 255, 255);
      doc.rect(10, 175, doc.internal.pageSize.getWidth() - 20, 8, 'F');
      doc.setFontSize(12);
      doc.text('Vendor Performance Ratings', 15, 180);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      analytics.vendorPerformance.forEach((v, i) => {
        const y = 190 + i * 8;
        doc.text(`${v.category}`, 20, y);
        doc.text(`${v.rating}/5 rating`, 150, y);
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text('DreamDay Wedding Analytics — www.dreamday.com', 105, 290, { align: 'center' });
      }
      
      doc.save('dreamday-analytics-report.pdf');
      
      toast.success('Report downloaded successfully!', {
        description: 'Your analytics report has been saved as a PDF.',
        icon: <FileDown className="h-5 w-5 text-green-500" />,
      });
    } catch (err) {
      toast.error('Failed to download report', {
        description: 'There was an error generating your PDF. Please try again.',
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)` }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-16 h-16 mb-4">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
            }}
            className="w-full h-full rounded-full border-t-2 border-r-2 border-blue-400"
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-400 text-2xl">R</span>
          </div>
        </div>
        <p className="text-blue-100/80">Loading analytics data...</p>
      </motion.div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)` }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl max-w-md text-center"
        style={{ background: `linear-gradient(135deg, rgba(42, 67, 101, 0.4) 0%, rgba(26, 41, 64, 0.4) 100%)` }}
      >
        <div className="mb-4 text-red-400 flex justify-center">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Analytics</h3>
        <p className="text-blue-100/70 mb-6">We couldn't load your analytics data. Please try again later.</p>
        <Button 
          className="w-full rounded-xl py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={() => refetch()}
        >
          <RefreshCw size={18} className="mr-2" />
          Try Again
        </Button>
      </motion.div>
    </div>
  );
  return (
    <div className="min-h-screen pt-20 p-6 relative overflow-hidden" style={{
      background: `linear-gradient(135deg, ${colors.darkBlue1} 0%, ${colors.darkBlue2} 100%)`
    }}>
      <Toaster richColors position="top-right" />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-8"
          initial={{ opacity: 0.04 }}
          animate={{
            opacity: [0.04, 0.06, 0.04],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle, ${colors.darkBlue4} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-8"
          initial={{ opacity: 0.04 }}
          animate={{
            opacity: [0.04, 0.07, 0.04],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            background: `radial-gradient(circle, ${colors.lightAccent} 0%, transparent 70%)`,
            filter: 'blur(70px)',
          }}
        ></motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10 space-y-8"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <motion.h2 
              className="text-xl font-medium text-blue-100/80"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Wedding Planning
            </motion.h2>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Analytics Dashboard
            </motion.h1>
          </div>
          
          <motion.div 
            variants={itemVariants}
            className="flex gap-3 items-center"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10 text-blue-100/90 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-blue-300" />
              <span>April 16, 2025</span>
            </div>
            
            <Button 
              variant="blue" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={downloadPDF}
            >
              <FileDown size={16} className='text-white' />
              <span className='text-white'>Export Report</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-lg rounded-3xl border border-white/10 p-6 flex items-center gap-4"
              style={{
                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
              }}
            >
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <Building size={24} className="text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-blue-100/70 text-sm">Top Venue</h3>
                <p className="text-lg font-semibold text-white">{analytics.popularVenues[0].name}</p>
                <p className="text-xs text-blue-100/60">{analytics.popularVenues[0].count} bookings this year</p>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-lg rounded-3xl border border-white/10 p-6 flex items-center gap-4"
              style={{
                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
              }}
            >
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                <DollarSign size={24} className="text-green-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-blue-100/70 text-sm">Average Budget</h3>
                <p className="text-lg font-semibold text-white">
                  ${(analytics.averageBudgets.reduce((sum, b) => sum + b.average, 0) / analytics.averageBudgets.length).toLocaleString()}
                </p>
                <p className="text-xs text-blue-100/60">Across all wedding types</p>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="backdrop-blur-lg rounded-3xl border border-white/10 p-6 flex items-center gap-4"
              style={{
                background: `linear-gradient(135deg, rgba(46, 78, 143, 0.2) 0%, rgba(26, 58, 110, 0.2) 100%)`,
              }}
            >
              <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                <Star size={24} className="text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-blue-100/70 text-sm">Top Rated Vendor</h3>
                <p className="text-lg font-semibold text-white">{analytics.vendorPerformance[0].category}</p>
                <p className="text-xs text-blue-100/60">{analytics.vendorPerformance[0].rating}/5 average rating</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Chart Tabs */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant={activeTab === 'venues' ? 'blue' : 'outline'}
              className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-300 ${
                activeTab === 'venues' ? 
                  'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow' : 
                  'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white'
              }`}
              onClick={() => setActiveTab('venues')}
            >
              <Building size={16} className="mr-1.5" />
              Popular Venues
            </Badge>
            <Badge 
              variant={activeTab === 'budgets' ? 'blue' : 'outline'}
              className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-300 ${
                activeTab === 'budgets' ? 
                  'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow' : 
                  'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white'
              }`}
              onClick={() => setActiveTab('budgets')}
            >
              <DollarSign size={16} className="mr-1.5" />
              Budget Analysis
            </Badge>
            <Badge 
              variant={activeTab === 'vendors' ? 'blue' : 'outline'}
              className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-300 ${
                activeTab === 'vendors' ? 
                  'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow' : 
                  'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white'
              }`}
              onClick={() => setActiveTab('vendors')}
            >
              <Star size={16} className="mr-1.5" />
              Vendor Performance
            </Badge>
          </div>
          
          <Card className="backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(42, 67, 101, 0.3) 0%, rgba(26, 41, 64, 0.4) 100%)`,
            }}
          >
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                {activeTab === 'venues' && (
                  <>
                    <BarChart3 size={20} className="text-blue-300" />
                    <span>Popular Wedding Venues</span>
                  </>
                )}
                {activeTab === 'budgets' && (
                  <>
                    <PieChart size={20} className="text-blue-300" />
                    <span>Wedding Budget Analysis</span>
                  </>
                )}
                {activeTab === 'vendors' && (
                  <>
                    <Star size={20} className="text-blue-300" />
                    <span>Vendor Performance Ratings</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'venues' && (
                  <motion.div
                    key="venues"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-[400px] relative"
                  >
                    <Bar data={venueChartData} options={chartOptions} />
                    <div className="absolute bottom-0 left-0 right-0 text-center mt-4 text-blue-100/60 text-sm">
                      <p>Showing booking frequency for top wedding venues</p>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'budgets' && (
                  <motion.div
                    key="budgets"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-[400px] flex flex-col items-center"
                  >
                    <div className="w-[350px] h-[350px] mx-auto">
                      <Doughnut data={budgetChartData} options={pieOptions} />
                    </div>
                    <div className="text-center mt-4 text-blue-100/60 text-sm">
                      <p>Average wedding budgets by price range</p>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'vendors' && (
                  <motion.div
                    key="vendors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-[400px] relative"
                  >
                    <Bar data={vendorChartData} options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: { ...chartOptions.scales.y.title, text: 'Rating' },
                          min: 0,
                          max: 5,
                          ticks: {
                            ...chartOptions.scales.y.ticks,
                            stepSize: 1
                          }
                        },
                        x: {
                          ...chartOptions.scales.x,
                          title: { ...chartOptions.scales.x.title, text: 'Vendor Category' }
                        }
                      }
                    }} />
                    <div className="absolute bottom-0 left-0 right-0 text-center mt-4 text-blue-100/60 text-sm">
                      <p>Average customer ratings for vendor categories (out of 5)</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={downloadPDF}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2"
                >
                  <Download size={18} />
                  <span>Download Detailed Analytics Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Info */}
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-blue-100/60 text-sm">
              Data refreshed daily. Last updated: April 16, 2025 at 12:00 PM
            </p>
            <p className="text-blue-100/40 text-xs mt-1">
              Analytics help planners and clients make data-driven decisions for their wedding planning
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Reports;
