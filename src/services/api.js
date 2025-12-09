import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api';

 const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    toast.error(error.response?.data?.message || 'Something went wrong');
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Suppliers APIs
export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  addMaterial: (id, data) => api.post(`/suppliers/${id}/materials`, data),
  removeMaterial: (id, materialId) => api.delete(`/suppliers/${id}/materials/${materialId}`),
};

// Supplier Transactions APIs
export const supplierTransactionsAPI = {
  createTransaction: (data) => api.post('/supplier-transactions/transaction', data),
  getSupplierTransactions: (supplierId) => api.get(`/supplier-transactions/${supplierId}`),
  addPayment: (data) => api.post('/supplier-transactions/payment', data),
  getAllTransactions: () => api.get('/supplier-transactions/transactions'),
};

// Customers APIs
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getBalance: (id) => api.get(`/customers/${id}/balance`),
  updateCreditLimit: (id, data) => api.put(`/customers/${id}/credit-limit`, data),
};

// Materials APIs
export const materialsAPI = {
  getAll: (params) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  updateStock: (id, data) => api.put(`/materials/${id}/stock`, data),
  getLowStock: () => api.get('/materials/low-stock'),
  getCategories: () => api.get('/materials/categories'),
};

// Orders APIs
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  createPurchase: (data) => api.post('/orders/purchase', data),
  createSale: (data) => api.post('/orders/sale', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getStats: () => api.get('/orders/stats'),
};

// Payments APIs
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getPending: (params) => api.get('/payments/pending', { params }),
  getStats: () => api.get('/payments/stats'),
  sendReminder: (orderId) => api.post(`/payments/reminder/${orderId}`),
};

// Expenses APIs
export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: (params) => api.get('/expenses/stats', { params }),
  getCategories: () => api.get('/expenses/categories'),
  downloadReceipt: (id) => api.get(`/expenses/${id}/receipt`),
  bulkImport: (data) => api.post('/expenses/bulk-import', data),
};

// Invoices APIs
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  generatePDF: (id) => api.post(`/invoices/${id}/generate-pdf`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`),
  send: (id, data) => api.post(`/invoices/${id}/send`, data),
  getStats: () => api.get('/invoices/stats'),
};

// Reports APIs
export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params }),
  getSales: (params) => api.get('/reports/sales', { params }),
  getPayments: (params) => api.get('/reports/payments', { params }),
  getInventory: () => api.get('/reports/inventory'),
  getCustomers: () => api.get('/reports/customers'),
};

// Users APIs (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  createClient: (data) => api.post('/users/create-client', data),
  updateSubscription: (id, data) => api.put(`/users/${id}/subscription`, data),
  updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Admin APIs (Super Admin only)
export const adminAPI = {
  // User Registration by Admin
  registerUser: (data) => api.post('/auth/register', data),
  
  // Admin Login as Client
  loginAsClient: (data) => api.post('/auth/admin/login-as-client', data),
  
  // Get All Users with Filters
  getAllUsers: (params) => api.get('/users', { params }),
  
  // Admin Dashboard Stats
  getDashboardStats: () => api.get('/admin-dashboard'),
  
  // Get Users by Status (Active/Inactive)
  getUsersByStatus: (params) => api.get('/admin-dashboard/users', { params }),
  
  // Legacy APIs
  createSuperAdmin: (data) => api.post('/admin/create-superadmin', data),
  getAllClients: (params) => api.get('/admin/clients', { params }),
  getClientById: (id) => api.get(`/admin/clients/${id}`),
  getClientActivity: (id) => api.get(`/admin/clients/${id}/activity`),
  updateClientSubscription: (id, data) => api.put(`/admin/clients/${id}/subscription`, data),
  toggleClientStatus: (id) => api.put(`/admin/clients/${id}/toggle-status`),
  getSystemStats: (params) => api.get('/admin/stats', { params }),
  getSystemSettings: () => api.get('/admin/settings'),
  triggerNotifications: (data) => api.post('/admin/notifications/trigger', data),
};

export default api;