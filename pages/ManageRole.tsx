import React from 'react';
import { ShieldCheck, Shield } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { DBStructure } from '../types';
import { useData } from '../context/DataContext';

const ManageRole = () => {
  const { data: db } = useData();
  const roles = db.roles;

  return (
    <div className="relative space-y-4">
      <PageHeader 
        title="Manage Roles"
        description="Configure roles and granular permissions for employees to ensure platform security."
        icon={Shield}
        stats={[
          { label: 'Total Roles', value: roles.length },
          { label: 'Global Admins', value: roles.find(r => r.name === 'Admin')?.members || 0 }
        ]}
        actions={[
          {
            label: 'Create Role',
            icon: ShieldCheck,
            variant: 'primary',
            onClick: () => console.log('Create Role')
          }
        ]}
      />

      <div className="bg-main-surface rounded-xl border border-main-border shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-main-bg border-b border-main-border transition-colors">
              <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Role Name</th>
              <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Members</th>
              <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-main-border">
            {roles.map((role) => (
              <tr key={role.name} className="group hover:bg-main-bg transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-main-heading">{role.name}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-main-text">{role.members}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-main-bg text-main-text border border-main-border transition-colors">
                    {role.permissions}
                  </span>
                </td>
                 <td className="px-6 py-4 text-sm font-medium text-slate-500">{role.created}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-semibold text-slate-500 hover:text-main-heading transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRole;
