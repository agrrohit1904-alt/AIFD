import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { Shield, Database } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'verify' | 'admin'>('verify');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 font-bold text-xl text-gray-900 tracking-tight">KYC Verify</span>
              </div>
              <div className="ml-10 flex space-x-8">
                <button
                  onClick={() => setActiveTab('verify')}
                  className={`${
                    activeTab === 'verify'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  User Portal
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`${
                    activeTab === 'admin'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Database className="w-4 h-4 mr-1"/>
                  Admin Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        {activeTab === 'verify' ? <Dashboard /> : <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
