import React, { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext'; // Uncomment when needed
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Toast } from '@components/ui/Toast';
import { 
  BellIcon, 
  GlobeAltIcon, 
  MoonIcon, 
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  // const { updateProfile } = useAuth(); // Uncomment when profile update is needed
  // const user = useAuth().user; // Uncomment when user data is needed
  const [activeTab, setActiveTab] = useState('notifications');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: GlobeAltIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  const handleSave = async () => {
    try {
      // Save settings logic here
      setToastMessage('Settings saved successfully');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to save settings');
      setShowToast(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`
                -ml-0.5 mr-2 h-5 w-5
                ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
              `} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email updates about your account</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">RFQ Updates</h3>
                <p className="text-sm text-gray-500">Get notified about RFQ status changes</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Order Updates</h3>
                <p className="text-sm text-gray-500">Notifications about order status</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                <p className="text-sm text-gray-500">Product updates and promotional content</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>UTC</option>
                <option>EST</option>
                <option>CST</option>
                <option>PST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MoonIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Use dark theme</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Password</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Last changed 30 days ago</p>
                <Button variant="outline">Change Password</Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center mb-2">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center mb-2">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Active Sessions</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Manage devices where you're logged in</p>
                <Button variant="outline">View Sessions</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-red-50 border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
              Delete Account
            </Button>
          </Card>
        </div>
      )}

      {/* Save Button */}
      {activeTab !== 'security' && (
        <div className="mt-6 flex justify-end">
          <Button variant="default" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          id="settings-toast"
          title={toastMessage.includes('Failed') ? 'Error' : 'Success'}
          message={toastMessage}
          type={toastMessage.includes('Failed') ? 'error' : 'success'}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Settings;