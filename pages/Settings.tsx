import React, { useState } from 'react';
import { Globe, Bell, Palette, Shield, Database, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { DBStructure } from '../types';
import { useData } from '../context/DataContext';
import MigrationTool from '../components/MigrationTool';

const Settings = () => {
  const { data: db } = useData();
  const settingsSections = db.settingsSections;
  const [activeSection, setActiveSection] = useState('general');

  const getIcon = (id: string) => {
    switch (id) {
        case 'general': return Globe;
        case 'notifications': return Bell;
        case 'appearance': return Palette;
        case 'security': return Shield;
        case 'data': return Database;
        default: return Globe;
    }
  };

  return (
    <div className="relative space-y-4">
      <PageHeader 
        title="Settings"
        description="Manage your platform preferences, system configuration, and security standards."
        icon={SettingsIcon}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Settings Navigation */}
        <div className="bg-main-surface rounded-xl border border-main-border shadow-sm p-3 transition-colors">
          <nav className="flex flex-col gap-1">
            {settingsSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-brand-primary text-brand-primary-text font-bold shadow-sm'
                    : 'text-main-text hover:bg-main-bg'
                }`}
              >
              {(() => {
                const Icon = getIcon(section.id);
                return <Icon size={18} />;
              })()}
                <span className="text-sm font-semibold">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 bg-main-surface rounded-xl border border-main-border shadow-sm p-5 transition-colors">
          {settingsSections.filter(s => s.id === activeSection).map(section => (
            <div key={section.id}>
              <div className="flex items-center gap-3 mb-2">
              {(() => {
                const Icon = getIcon(section.id);
                return <Icon size={22} className="text-main-heading" />;
              })()}
                <h3 className="text-lg font-semibold text-main-heading">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6 transition-colors">{section.description}</p>

              <div className="space-y-4">
                {section.options?.map((opt: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-main-border last:border-0 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-main-heading">{opt.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                ))}
              </div>
              {section.id === 'data' && <MigrationTool />}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Settings;
