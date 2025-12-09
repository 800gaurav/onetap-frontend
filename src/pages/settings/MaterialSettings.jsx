import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Package } from 'lucide-react';
import { materialsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MaterialSettings = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialsAPI.getAll();
      setMaterials(response.data.materials || []);
    } catch (error) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;

    try {
      await materialsAPI.create({ name: newMaterial.trim() });
      toast.success('Material added successfully');
      setNewMaterial('');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to add material');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await materialsAPI.delete(id);
        toast.success('Material deleted successfully');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material');
      }
    }
  };

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
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Package className="mr-2 text-purple-600" size={24} />
          Material List Management
        </h2>
        <p className="text-gray-600 mt-1">Add and manage your material types</p>
      </div>

      {/* Add Material Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleAddMaterial} className="flex gap-3">
          <input
            type="text"
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
            placeholder="Enter material name (e.g., Cement, Steel, Sand)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} className="mr-2" />
            Add Material
          </button>
        </form>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Materials ({materials.length})
          </h3>
        </div>
        <div className="p-6">
          {materials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No materials added yet</p>
              <p className="text-sm">Add your first material above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {materials.map((material) => (
                <motion.div
                  key={material._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Package size={16} className="text-purple-600 mr-2" />
                    <span className="font-medium text-gray-900">{material.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMaterial(material._id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete material"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Package className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Material Management Tips
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Add common construction materials like Cement, Steel, Sand, etc.</li>
                <li>These materials will be available when creating suppliers and orders</li>
                <li>Keep material names simple and consistent</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MaterialSettings;