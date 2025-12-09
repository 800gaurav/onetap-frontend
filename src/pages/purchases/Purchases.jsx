import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart, CreditCard, Eye, Filter, X, Search } from 'lucide-react';
import { supplierTransactionsAPI, suppliersAPI, materialsAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const Purchases = () => {
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    supplierId: '',
    materialId: '',
    dateFrom: '',
    dateTo: ''
  });

  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    materialId: '',
    quantity: '',
    rate: '',
    note: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    supplierId: '',
    amount: '',
    paymentMethod: 'cash',
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, suppliersRes, materialsRes] = await Promise.all([
        supplierTransactionsAPI.getAllTransactions(),
        suppliersAPI.getAll({ limit: 100 }),
        materialsAPI.getAll()
      ]);
      
      setTransactions(transactionsRes.data.transactions || []);
      setSuppliers(suppliersRes.data.suppliers || []);
      setMaterials(materialsRes.data.materials || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      await supplierTransactionsAPI.createTransaction(purchaseForm);
      toast.success('Purchase recorded successfully');
      setShowPurchaseModal(false);
      setPurchaseForm({ supplierId: '', materialId: '', quantity: '', rate: '', note: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to record purchase');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await supplierTransactionsAPI.addPayment(paymentForm);
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentForm({ supplierId: '', amount: '', paymentMethod: 'cash', note: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const viewSupplierDetails = async (supplierId) => {
    try {
      const response = await supplierTransactionsAPI.getSupplierTransactions(supplierId);
      setSupplierDetails(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load supplier details');
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const getMaterialName = (materialId) => {
    const material = materials.find(m => m._id === materialId);
    return material?.name || 'Unknown Material';
  };

  const clearFilters = () => {
    setFilters({ supplierId: '', materialId: '', dateFrom: '', dateTo: '' });
    setSearchTerm('');
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      getSupplierName(transaction.supplierId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMaterialName(transaction.materialId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = !filters.supplierId || transaction.supplierId === filters.supplierId;
    const matchesMaterial = !filters.materialId || transaction.materialId === filters.materialId;
    
    const transactionDate = new Date(transaction.date);
    const matchesDateFrom = !filters.dateFrom || transactionDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || transactionDate <= new Date(filters.dateTo);
    
    return matchesSearch && matchesSupplier && matchesMaterial && matchesDateFrom && matchesDateTo;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="mr-2 text-purple-600" size={28} />
            Purchases
          </h1>
          <p className="text-gray-600 mt-1">Manage material purchases and supplier payments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CreditCard size={20} className="mr-2" />
            Add Payment
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} className="mr-2" />
            New Purchase
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <select
                  value={filters.supplierId}
                  onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filters.materialId}
                  onChange={(e) => setFilters(prev => ({ ...prev, materialId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Materials</option>
                  {materials.map(material => (
                    <option key={material._id} value={material._id}>{material.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="From Date"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="To Date"
                />
              </div>
              <div>
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X size={16} className="mr-2" />
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Transactions ({filteredTransactions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSupplierName(transaction.supplierId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getMaterialName(transaction.materialId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{transaction.rate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{transaction.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewSupplierDetails(transaction.supplierId)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No transactions found matching your criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-purple-600 hover:text-purple-800"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Record New Purchase"
      >
        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select
              value={purchaseForm.supplierId}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
            <select
              value={purchaseForm.materialId}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, materialId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Material</option>
              {materials.map((material) => (
                <option key={material._id} value={material._id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹) *</label>
              <input
                type="number"
                value={purchaseForm.rate}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, rate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={purchaseForm.note}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowPurchaseModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Record Purchase
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add Payment"
      >
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select
              value={paymentForm.supplierId}
              onChange={(e) => setPaymentForm({ ...paymentForm, supplierId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={paymentForm.note}
              onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Supplier Transaction Details"
        size="lg"
      >
        {supplierDetails && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">₹{supplierDetails.summary.totalPayable?.toLocaleString()}</div>
                <div className="text-sm text-red-700">Total Payable</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">₹{supplierDetails.summary.totalPaid?.toLocaleString()}</div>
                <div className="text-sm text-green-700">Total Paid</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">₹{supplierDetails.summary.balance?.toLocaleString()}</div>
                <div className="text-sm text-orange-700">Balance</div>
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h4 className="font-semibold mb-3">Recent Transactions</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {supplierDetails.transactions?.map((transaction) => (
                  <div key={transaction._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{getMaterialName(transaction.materialId)}</div>
                      <div className="text-sm text-gray-600">
                        {transaction.quantity} × ₹{transaction.rate} = ₹{transaction.totalAmount}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments */}
            <div>
              <h4 className="font-semibold mb-3">Payment History</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {supplierDetails.payments?.map((payment) => (
                  <div key={payment._id} className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <div className="font-medium">₹{payment.amount?.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{payment.paymentMethod} - {payment.note}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Purchases;