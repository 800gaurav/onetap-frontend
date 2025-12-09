import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { suppliersAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import StatsCard from '../../components/ui/StatsCard';
import FilterPanel from '../../components/ui/FilterPanel';
import EmptyState from '../../components/ui/EmptyState';
import ContactInfo from '../../components/ui/ContactInfo';
import FormField from '../../components/ui/FormField';
import ActionButtons from '../../components/ui/ActionButtons';
import useApi from '../../hooks/useApi';
import useFilters from '../../hooks/useFilters';
import useForm from '../../hooks/useForm';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const { loading, execute } = useApi();

  const filterConfig = {
    searchFields: ['name', 'contactPerson', 'phone'],
    initialFilters: { city: '' },
    filterFunctions: {
      city: (item, value) =>
        !value || item.address?.city?.toLowerCase().includes(value.toLowerCase())
    }
  };

  const {
    searchTerm,
    setSearchTerm,
    filters,
    showFilters,
    setShowFilters,
    filteredData: filteredSuppliers,
    clearFilters,
    updateFilter
  } = useFilters(suppliers, filterConfig);

  const initialFormData = {
    name: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: { street: '', city: '' }
  };

  const { values: formData, handleChange, reset: resetForm, setValues } =
    useForm(initialFormData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await execute(
      () => suppliersAPI.getAll(),
      {
        errorMessage: 'Failed to load suppliers',
        showSuccess: false
      }
    ).then((response) => {
      setSuppliers(response.data.suppliers || []);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiCall = editingSupplier
      ? () => suppliersAPI.update(editingSupplier._id, formData)
      : () => suppliersAPI.create(formData);

    await execute(apiCall, {
      successMessage: `Supplier ${editingSupplier ? 'updated' : 'created'} successfully`,
      errorMessage: 'Failed to save supplier'
    }).then(() => {
      setShowModal(false);
      handleResetForm();
      fetchData();
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      await execute(() => suppliersAPI.delete(id), {
        successMessage: 'Supplier deleted successfully',
        errorMessage: 'Failed to delete supplier'
      }).then(() => fetchData());
    }
  };

  const handleResetForm = () => {
    resetForm();
    setEditingSupplier(null);
  };

  const cities = [...new Set(suppliers.map((s) => s.address?.city).filter(Boolean))];

  const stats = {
    total: suppliers.length,
    active: suppliers.length
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suppliers
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your suppliers and contacts
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Suppliers" value={stats.total} color="blue" />
      </div>

      {/* Search & Filter Panel */}
      <FilterPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={clearFilters}
        searchPlaceholder="Search suppliers..."
      >
        <div>
          <select
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </div>
      </FilterPanel>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
            <tr>
              <th className="p-4">Supplier</th>
              <th className="p-4">Contact Person</th>
              <th className="p-4">Phone</th>
              <th className="p-4">WhatsApp</th>
              <th className="p-4">City</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((s) => (
              <tr
                key={s._id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="p-4">{s.name}</td>
                <td className="p-4">{s.contactPerson}</td>
                <td className="p-4">{s.phone}</td>
                <td className="p-4">{s.whatsapp}</td>
                <td className="p-4">{s.address?.city}</td>
                <td className="p-4 text-right">
                  <ActionButtons
                    onEdit={() => {
                      setEditingSupplier(s);
                      setValues(s);
                      setShowModal(true);
                    }}
                    onDelete={() => handleDelete(s._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="grid md:hidden grid-cols-1 gap-4">
        {filteredSuppliers.map((supplier) => (
          <motion.div
            key={supplier._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-bold">{supplier.name}</h3>
                {supplier.contactPerson && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {supplier.contactPerson}
                  </p>
                )}
              </div>

              <ActionButtons
                onEdit={() => {
                  setEditingSupplier(supplier);
                  setValues(supplier);
                  setShowModal(true);
                }}
                onDelete={() => handleDelete(supplier._id)}
              />
            </div>

            <ContactInfo
              phone={supplier.phone}
              email={supplier.email}
              whatsapp={supplier.whatsapp}
              address={supplier.address}
              className="mt-4"
            />
          </motion.div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <EmptyState
          title="No suppliers found"
          description="No suppliers found matching your criteria"
          onAction={clearFilters}
        />
      )}

      {/* Count */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-sm">
        Showing {filteredSuppliers.length} of {suppliers.length} suppliers
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          handleResetForm();
        }}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Supplier Name" name="name" value={formData.name} onChange={handleChange} required />
            <FormField label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
            <FormField label="WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
          </div>

          <FormField label="Email" name="email" value={formData.email} onChange={handleChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
            <FormField
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Suppliers;
