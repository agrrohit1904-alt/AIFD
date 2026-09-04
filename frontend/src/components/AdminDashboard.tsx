import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Clock, AlertTriangle, CheckCircle, Database } from 'lucide-react';

interface AuditLog {
  id: number;
  document_id: string;
  timestamp: string;
  risk_score: number;
  document_type: string;
  face_status: string;
  signals_json: string;
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/admin/logs`);
      setLogs(response.data.logs);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch audit logs from backend.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getRiskBadge = (score: number) => {
    if (score < 30) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Low ({score})</span>;
    if (score < 70) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium ({score})</span>;
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">High ({score})</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="text-purple-600" />
            Audit Logs
          </h1>
          <p className="text-slate-400 mt-2">Administrative view of all verification attempts</p>
        </div>
        <button onClick={fetchLogs} className="text-sm bg-slate-800 border border-slate-600 px-4 py-2 rounded hover:bg-slate-800/50 text-gray-700 shadow-sm">
          Refresh Logs
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-slate-800 shadow overflow-hidden sm:rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Document ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Document Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Risk Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Face Match
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  No verification logs found. Process a document first!
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {formatDate(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {log.document_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                    {log.document_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRiskBadge(log.risk_score)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.face_status === 'auto_approve' ? (
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4"/> Passed</span>
                    ) : log.face_status === 'auto_reject' ? (
                      <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="w-4 h-4"/> Failed</span>
                    ) : (
                      <span className="text-slate-400 capitalize">{log.face_status.replace('_', ' ')}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
