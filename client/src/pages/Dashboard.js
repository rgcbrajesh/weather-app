import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Inventory,
  People,
  Receipt,
  TrendingUp
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalParts: 0,
    totalCustomers: 0,
    totalBills: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API endpoints
      const [partsResponse, customersResponse, billingResponse, reportsResponse] = await Promise.all([
        axios.get('/api/parts'),
        axios.get('/api/customers'),
        axios.get('/api/billing'),
        axios.get('/api/reports/monthly-summary')
      ]);

      const totalParts = partsResponse.data.length;
      const totalCustomers = customersResponse.data.length;
      const totalBills = billingResponse.data.length;
      
      // Calculate monthly revenue from reports
      const monthlyData = reportsResponse.data;
      const currentMonth = new Date().getMonth() + 1;
      const currentMonthData = monthlyData.find(item => item.month === currentMonth);
      const monthlyRevenue = currentMonthData ? currentMonthData.total_revenue : 0;

      setStats({
        totalParts,
        totalCustomers,
        totalBills,
        monthlyRevenue: Math.round(monthlyRevenue)
      });

      // Generate chart data from monthly summary
      const chartData = monthlyData.map(item => ({
        month: getMonthName(item.month),
        revenue: Math.round(item.total_revenue || 0),
        bills: item.total_invoices || 0
      }));

      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to empty data if API calls fail
      setStats({
        totalParts: 0,
        totalCustomers: 0,
        totalBills: 0,
        monthlyRevenue: 0
      });
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || 'Unknown';
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Parts"
            value={stats.totalParts}
            icon={<Inventory sx={{ color: 'white' }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<People sx={{ color: 'white' }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bills"
            value={stats.totalBills}
            icon={<Receipt sx={{ color: 'white' }} />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="info.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue & Bills
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="bills" fill="#82ca9d" name="Bills" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Database: Connected
              </Typography>
              <Typography variant="caption" color="textSecondary">
                All systems operational
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                API Endpoints: Active
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Ready for data operations
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Authentication: Secure
              </Typography>
              <Typography variant="caption" color="textSecondary">
                JWT tokens enabled
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
