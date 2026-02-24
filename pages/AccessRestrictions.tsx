import React from 'react';
import { Lock, UserX, AlertTriangle, RotateCcw, MoreVertical, Unlock, ShieldAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader';

import { DBStructure, RestrictedProfile } from '../types';
import { useData } from '../context/DataContext';

const AccessRestrictions = () => {
  const { data, updateData } = useData();
  const restrictedProfiles = data.restrictedProfiles;

  const handleAction = (id: string, newStatus: string) => {
    const updated = restrictedProfiles.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    );
    updateData('restrictedProfiles', updated);
  };
  return (
    <div className="relative space-y-4">
      <PageHeader 
        title="Access Restrictions"
        description="Manage employees restricted due to repeated module failures and provide manual overrides or resets."
        icon={ShieldAlert}
        stats={[
          { label: 'Restricted', value: restrictedProfiles.filter(p => p.status === 'Restricted').length },
          { label: 'Auto-Lock At', value: '3+ Fails' }
        ]}
        actions={[
          {
            label: 'Manual Restriction',
            icon: UserX,
            variant: 'primary',
            onClick: () => console.log('Manual Restriction')
          }
        ]}
      />

      <div className="bg-main-surface rounded-xl border border-main-border shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-main-border bg-main-bg/50 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-main-heading" />
                <span className="text-sm font-bold text-main-heading">Flagged for Review</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-main-surface px-3 py-1 rounded-full border border-main-border transition-colors">
                Auto-Restriction at 3+ failures
            </span>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-main-surface border-b border-main-border transition-colors">
              <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Target Module</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider text-center">Attempts</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Last Score</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-main-border">
            {restrictedProfiles.map((item) => (
              <tr key={item.id} className="group hover:bg-main-bg/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={item.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-main-border shadow-sm" />
                    <div>
                        <span className="text-sm font-bold text-main-heading block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight italic">Blocked on {item.date}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-slate-400" />
                    <span className="text-sm font-semibold text-main-text">{item.module}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold leading-none ${
                      item.attempts >= 4 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                  }`}>
                    {item.attempts} Attempts
                  </span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-12 bg-main-bg h-1.5 rounded-full overflow-hidden transition-colors">
                            <div 
                                className={`h-full rounded-full ${item.lastScore < 50 ? 'bg-brand-primary' : 'bg-orange-500'}`} 
                                style={{ width: `${item.lastScore}%` }} 
                            />
                        </div>
                        <span className="text-xs font-bold text-main-heading">{item.lastScore}%</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1.5 ${
                    item.status === 'Restricted'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Restricted' ? 'bg-brand-primary animate-pulse' : 'bg-orange-500'}`} />
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleAction(item.id, 'Probation')}
                            className="flex items-center gap-1 text-[10px] font-bold text-main-text hover:text-main-heading bg-main-surface border border-main-border px-3 py-1.5 rounded-lg transition-all shadow-sm"
                        >
                            <RotateCcw size={12} />
                            Reset
                        </button>
                        <button 
                            onClick={() => handleAction(item.id, 'Cleared')}
                            className="flex items-center gap-1 text-[10px] font-bold text-brand-primary-text bg-brand-primary border border-brand-primary px-3 py-1.5 rounded-lg transition-all shadow-sm"
                        >
                            <Unlock size={12} />
                            Override
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-main-bg/50 border-t border-main-border text-center transition-colors">
            <p className="text-[11px] font-semibold text-slate-400 italic">
                * Restricted employees cannot retake the same module until an instructor resets their attempts or provides an override.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AccessRestrictions;

