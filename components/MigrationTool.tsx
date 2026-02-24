import React, { useState } from 'react';
import { Database, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';

const MigrationTool = () => {
  const [initStatus, setInitStatus] = useState<string>('idle');
  const [status, setStatus] = useState<string>('idle'); // idle, migrating, success, error
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleCreateTables = async () => {
    setInitStatus('migrating');
    addLog('Connecting via Express backend to bypass browser module constraints...');
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/init-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.logs) {
        data.logs.forEach((log: string) => addLog(log));
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Initialization failed from Backend API');
      }

      setInitStatus('success');
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      addLog('Make sure your backend is running (`node server/server.js`) on port 5000.');
      setInitStatus('error');
    }
  };

  const runMigration = async () => {
    setStatus('migrating');
    setLogs(['Connecting to Backend API...']);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (data.logs) {
        data.logs.forEach((log: string) => addLog(log));
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Migration failed from Backend API');
      }

      addLog('🎉 Migration complete. Your JSON data is now stored in Supabase via Express Backend!');
      setStatus('success');
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
      addLog('Make sure your backend is running (`node server/server.js`) on port 5000.');
      setStatus('error');
    }
  };

  return (
    <div className="mt-8 border border-brand-primary/20 bg-brand-primary/5 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="text-brand-primary" size={24} />
        <h3 className="text-xl font-bold text-main-heading">Supabase Migration</h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Once you've configured your `VITE_SUPABASE_DB_*` parameters in the `.env`, you can execute the direct connection below to build the Postgres tables automatically. Then, push your mock JSON data.
      </p>
      
      <div className="flex gap-4 mb-4">
        <button 
          onClick={handleCreateTables}
          disabled={initStatus === 'migrating'}
          className="flex items-center gap-2 px-6 py-3 border-2 border-brand-primary text-brand-primary font-bold rounded-lg hover:bg-brand-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Database size={20} />
          {initStatus === 'migrating' ? 'Connecting DB...' : '1. Initialize SQL Tables'}
        </button>

        <button 
          onClick={runMigration}
          disabled={status === 'migrating' || initStatus === 'error'}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud size={20} />
          {status === 'migrating' ? 'Executing Migration...' : '2. Migrate JSON to API'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-6 bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 shadow-inner">
          {logs.map((log, i) => (
            <div key={i} className={`py-1 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : ''}`}>
              {log}
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 mt-4 text-red-500 text-sm font-semibold p-3 bg-red-50 rounded-lg">
          <AlertCircle size={18} />
          Some records failed. Read the logs to identify the issue. Table schemas must match data precisely.
        </div>
      )}
      {status === 'success' && (
        <div className="flex items-center gap-2 mt-4 text-green-600 text-sm font-semibold p-3 bg-green-50 rounded-lg">
          <CheckCircle2 size={18} />
          Migration successfully executed. Supabase database populated!
        </div>
      )}
    </div>
  );
};

export default MigrationTool;
