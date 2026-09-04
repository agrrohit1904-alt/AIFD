import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { ShieldCheck, Database } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'verify' | 'admin'>('verify');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500/30">
      <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight">
                Nexus Identity AI
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('verify')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'verify'
                    ? 'bg-slate-700 text-cyan-400 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                Verification Portal
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-slate-700 text-cyan-400 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Database className="w-4 h-4 mr-1 inline" />
                Admin Logs
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'verify' ? <Dashboard /> : <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
