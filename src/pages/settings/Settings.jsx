import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Package, User, Bell } from 'lucide-react';
import MaterialSettings from './MaterialSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('materials');

  const tabs = [
    { id: 'materials', name: 'Materials', icon: Package },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'materials':
        return <MaterialSettings />;
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
            <p className="text-gray-600">Profile settings coming soon...</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
            <p className="text-gray-600">Notification settings coming soon...</p>
          </div>
        );
      default:
        return <MaterialSettings />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="mr-2 text-purple-600" size={28} />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your application settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;