import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { reportsAPI, ordersAPI, paymentsAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, ordersRes, paymentsRes] = await Promise.all([
        reportsAPI.getDashboard(),
        ordersAPI.getAll({ limit: 5 }),
        paymentsAPI.getAll({ limit: 5 })
      ]);
      
      setStats(dashboardRes.data);
      setRecentOrders(ordersRes.data.orders || []);
      
      // Create chart data from real stats
      const data = dashboardRes.data;
      setChartData([
        { 
          name: 'This Month', 
          receivable: data.pendingReceivables?.totalReceivable || 0, 
          payable: data.pendingPayables?.totalPayable || 0 
        },
        { 
          name: 'Revenue', 
          receivable: data.revenue?.thisMonth || 0, 
          payable: data.expenses?.thisMonth || 0 
        }
      ]);
      
      // Create recent activities from orders and payments
      const activities = [];
      ordersRes.data.orders?.forEach(order => {
        activities.push({
          action: `${order.type === 'sale' ? 'Sale' : 'Purchase'} order ${order.status}`,
          customer: order.type === 'sale' ? order.customerId?.name : order.supplierId?.name,
          amount: `₹${order.total?.toLocaleString()}`,
          time: new Date(order.createdAt).toLocaleDateString(),
          type: 'order'
        });
      });
      
      paymentsRes.data.payments?.forEach(payment => {
        activities.push({
          action: `Payment ${payment.type}`,
          customer: payment.customerId?.name || payment.supplierId?.name,
          amount: `₹${payment.amount?.toLocaleString()}`,
          time: new Date(payment.createdAt).toLocaleDateString(),
          type: 'payment'
        });
      });
      
      setRecentActivities(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Cement', value: 400, color: '#0088FE' },
    { name: 'Steel', value: 300, color: '#00C49F' },
    { name: 'Bricks', value: 300, color: '#FFBB28' },
    { name: 'Sand', value: 200, color: '#FF8042' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Financial Overview</h3>
            <div className="flex space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Receivable</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Payable</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="receivable" fill="#10B981" name="Receivable" />
              <Bar dataKey="payable" fill="#EF4444" name="Payable" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Materials Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Materials Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    activity.type === 'order' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{activity.amount}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;