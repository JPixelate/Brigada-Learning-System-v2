import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  href?: string;
}

interface PageHeaderProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: Action[];
  stats?: {
    label: string;
    value: string | number;
  }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  actions,
  stats 
}) => {
  return (
    <div className="flex items-center justify-between gap-8 mb-4">
      {/* Actions Section (Left) */}
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-3">
          {actions.map((action, idx) => {
            const ActionIcon = action.icon;
            const isPrimary = action.variant === 'primary' || !action.variant;
            
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs transition-all active:scale-95 whitespace-nowrap
                  ${isPrimary 
                    ? 'bg-brand-primary text-brand-primary-text hover:bg-brand-hover shadow-lg shadow-brand-primary/20' 
                    : 'bg-white text-main-text border border-main-border hover:bg-main-bg'
                  }`}
              >
                {ActionIcon && <ActionIcon size={14} />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Stats Section (Right) */}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{stat.label}</span>
              <span className="text-base font-bold text-main-heading">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
