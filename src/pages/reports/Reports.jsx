import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [reportData, setReportData] = useState({
    dashboard: null,
    profitLoss: null,
    sales: null,
    payments: null,
    inventory: null,
    customers: null
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [dashboardRes, profitLossRes, salesRes, paymentsRes, inventoryRes, customersRes] = await Promise.all([
        reportsAPI.getDashboard(),
        reportsAPI.getProfitLoss({ startDate: dateRange.start, endDate: dateRange.end }),
        reportsAPI.getSales({ startDate: dateRange.start, endDate: dateRange.end }),
        reportsAPI.getPayments({ startDate: dateRange.start, endDate: dateRange.end }),
        reportsAPI.getInventory(),
        reportsAPI.getCustomers()
      ]);

      setReportData({
        dashboard: dashboardRes.data,
        profitLoss: profitLossRes.data,
        sales: salesRes.data,
        payments: paymentsRes.data,
        inventory: inventoryRes.data,
        customers: customersRes.data
      });
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'profitLoss', label: 'Profit & Loss', icon: DollarSign },
    { id: 'sales', label: 'Sales Report', icon: TrendingUp },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Users },
    { id: 'customers', label: 'Customers', icon: Users }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) return <LoadingSpinner />;

  const renderDashboard = () => {
    const data = reportData.dashboard;
    if (!data) return <div>No dashboard data available</div>;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{data.revenue?.total?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{data.expenses?.total?.toLocaleString() || 0}</p>
              </div>
              <TrendingDown className="text-red-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${(data.profit?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{data.profit?.total?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Receivables</p>
                <p className="text-2xl font-bold text-orange-600">₹{data.pendingReceivables?.totalReceivable?.toLocaleString() || 0}</p>
              </div>
              <Users className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'This Month', revenue: data.revenue?.thisMonth || 0, expenses: data.expenses?.thisMonth || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {data.recentOrders?.slice(0, 5).map((order, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.type}</p>
                  </div>
                  <p className="font-semibold">₹{order.total?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfitLoss = () => {
    const data = reportData.profitLoss;
    if (!data) return <div>No profit & loss data available</div>;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Profit & Loss Statement</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Revenue</span>
              <span className="text-green-600 font-semibold">₹{data.revenue?.total?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Cost of Goods Sold</span>
              <span className="text-red-600 font-semibold">₹{data.cogs?.total?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Gross Profit</span>
              <span className="font-semibold">₹{data.profit?.gross?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Operating Expenses</span>
              <span className="text-red-600 font-semibold">₹{data.expenses?.total?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Net Profit</span>
              <span className={data.profit?.net >= 0 ? 'text-green-600' : 'text-red-600'}>
                ₹{data.profit?.net?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Profit Margin</span>
              <span className="font-semibold">{data.profit?.margin?.toFixed(2) || 0}%</span>
            </div>
          </div>
        </div>

        {data.expenses?.breakdown && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.expenses.breakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalAmount"
                >
                  {data.expenses.breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderSales = () => {
    const data = reportData.sales;
    if (!data) return <div>No sales data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{data.summary?.totalOrders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">₹{data.summary?.totalRevenue?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Average Order Value</p>
            <p className="text-2xl font-bold">₹{data.summary?.averageOrderValue?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Total Quantity</p>
            <p className="text-2xl font-bold">{data.summary?.totalQuantity || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
            <div className="space-y-3">
              {data.topCustomers?.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{customer.customer?.name}</p>
                    <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                  </div>
                  <p className="font-semibold">₹{customer.totalRevenue?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Materials</h3>
            <div className="space-y-3">
              {data.topMaterials?.slice(0, 5).map((material, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{material.material?.name}</p>
                    <p className="text-sm text-gray-600">{material.totalQuantity} {material.material?.unit}</p>
                  </div>
                  <p className="font-semibold">₹{material.totalRevenue?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPayments = () => {
    const data = reportData.payments;
    if (!data) return <div>No payments data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.summary?.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">
                {item._id === 'received' ? 'Payments Received' : 'Payments Made'}
              </h3>
              <p className="text-2xl font-bold text-green-600">₹{item.totalAmount?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">{item.count} transactions</p>
            </div>
          ))}
        </div>

        {data.methodBreakdown && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.methodBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalAmount"
                >
                  {data.methodBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderInventory = () => {
    const data = reportData.inventory;
    if (!data) return <div>No inventory data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Total Materials</p>
            <p className="text-2xl font-bold">{data.summary?.totalMaterials || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-600">{data.summary?.lowStockCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Zero Stock Items</p>
            <p className="text-2xl font-bold text-red-600">{data.summary?.zeroStockCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Inventory Value</p>
            <p className="text-2xl font-bold text-green-600">₹{data.summary?.totalInventoryValue?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Low Stock Materials</h3>
            <div className="space-y-3">
              {data.lowStock?.slice(0, 5).map((material, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-sm text-gray-600">{material.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{material.currentStock} {material.unit}</p>
                    <p className="text-xs text-gray-500">Min: {material.minStockLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">High Value Materials</h3>
            <div className="space-y-3">
              {data.highValue?.slice(0, 5).map((material, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <div>
                    <p className="font-medium">{material.name}</p>
                    <p className="text-sm text-gray-600">{material.currentStock} {material.unit}</p>
                  </div>
                  <p className="font-semibold text-green-600">
                    ₹{((material.basePrice || 0) * (material.currentStock || 0)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    const data = reportData.customers;
    if (!data) return <div>No customers data available</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold">{data.summary?.totalCustomers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Active Customers</p>
            <p className="text-2xl font-bold text-green-600">{data.summary?.activeCustomers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-sm text-gray-600">Customers with Dues</p>
            <p className="text-2xl font-bold text-red-600">{data.summary?.customersWithDues || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Customers by Revenue</h3>
            <div className="space-y-3">
              {data.topCustomers?.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{customer.customer?.name}</p>
                    <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                  </div>
                  <p className="font-semibold">₹{customer.totalRevenue?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Pending Payments</h3>
            <div className="space-y-3">
              {data.pendingPayments?.slice(0, 5).map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-medium">{payment.customer?.name}</p>
                    <p className="text-sm text-gray-600">{payment.orderCount} orders</p>
                  </div>
                  <p className="font-semibold text-red-600">₹{payment.totalDue?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'profitLoss': return renderProfitLoss();
      case 'sales': return renderSales();
      case 'payments': return renderPayments();
      case 'inventory': return renderInventory();
      case 'customers': return renderCustomers();
      default: return renderDashboard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and analytics</p>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={fetchReports}
            className="flex items-center gap-2"
          >
            <Download size={20} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default Reports;