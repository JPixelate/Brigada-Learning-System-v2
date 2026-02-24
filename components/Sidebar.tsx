import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Library,
  Users,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
  LogOut,
  ShieldCheck,
  Lock,
  ChevronDown,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  Calendar,
  Megaphone,
  Waypoints,
  Settings,
  Award
} from 'lucide-react';

import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const { data } = useData();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const db = data;
  const location = useLocation();
  const profile = user || db.currentUser;
  const branding = db.systemBranding;
  const navigation = db.navigation;



  // Helper to resolve Icons from Lucide
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      LayoutDashboard, PlusCircle, Library, Users, MessageSquare, 
      ClipboardCheck, BarChart3, LogOut, ShieldCheck, Lock, 
      ChevronDown, TrendingUp, RotateCcw, CheckCircle, 
      Calendar, Megaphone, Waypoints, Award, Settings
    };
    return icons[iconName] || LayoutDashboard;
  };

  const navGroups = navigation.groups;
  const isReportActive = location.pathname === '/admin/reports';

  return (
    <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-20 px-2' : 'w-72 px-5'} bg-main-surface h-full transition-all duration-300 z-50 py-5 border-r border-main-border`}>
      {/* Logo */}
      <div className={`flex items-center gap-2 mb-5 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
        <div className={`flex ${isCollapsed ? 'justify-center' : 'items-start flex-col'}`}>
          <img 
            src={isCollapsed ? "/images/icons/bls_hat.svg" : (theme === 'dark' ? "/images/icons/bls_dark.svg" : "/images/icons/bls_light.svg")} 
            alt="Logo" 
            className={`transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-48'}`}
          />
        </div>
      </div>

      <div className={`border-b border-main-border mb-3 ${isCollapsed ? 'mx-1' : 'mx-2'}`} />

      {/* Navigation */}
      <nav className={`flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar scroll-smooth ${isCollapsed ? '' : 'pr-6'}`}>
        {navGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
                {group.title}
              </h3>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.name : ''}
                className={({ isActive }) => {
                  const isManageActive = item.path === '/admin/modules' && (isActive || location.pathname.startsWith('/admin/edit-module'));
                  const active = isActive || isManageActive;
                  return `group flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-4 px-3'} py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-brand-primary text-brand-primary-text font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-main-heading hover:bg-main-bg font-medium'
                  }`;
                }}
              >
                {(() => {
                  const Icon = getIcon(item.icon);
                  return <Icon size={20} className="shrink-0" />;
                })()}
                {!isCollapsed && <span className="text-sm tracking-wide whitespace-nowrap">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Analytics & Reports */}
        <div className="flex flex-col gap-1.5">
          {!isCollapsed && (
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
              Analytics
            </h3>
          )}
          
          <NavLink
            to="/admin/evaluation"
            title={isCollapsed ? 'Evaluation' : ''}
            className={({ isActive }) =>
              `group flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-4 px-3'} py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary text-brand-primary-text font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-main-heading hover:bg-main-bg font-medium'
              }`
            }
          >
            <ClipboardCheck size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm tracking-wide whitespace-nowrap">Evaluation</span>}
          </NavLink>

          <NavLink
            to="/admin/reports"
            title={isCollapsed ? 'Reports' : ''}
            className={({ isActive }) =>
              `group flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-4 px-3'} py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary text-brand-primary-text font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-main-heading hover:bg-main-bg font-medium'
              }`
            }
          >
            <BarChart3 size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm tracking-wide whitespace-nowrap">Reports</span>}
          </NavLink>
        </div>

        {/* System */}
        <div className="flex flex-col gap-1.5">
          {!isCollapsed && (
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
              System
            </h3>
          )}
          <NavLink
            to="/admin/settings"
            title={isCollapsed ? 'Settings' : ''}
            className={({ isActive }) =>
              `group flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-4 px-3'} py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary text-brand-primary-text font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-main-heading hover:bg-main-bg font-medium'
              }`
            }
          >
            <Settings size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm tracking-wide whitespace-nowrap">Settings</span>}
          </NavLink>
        </div>
      </nav>

      {/* User Profile */}
      <div className={`mt-3 pt-3 border-t border-main-border ${isCollapsed ? 'px-1' : 'px-2'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
          <img
            src={profile.avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-main-border"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-main-heading truncate">{profile.name}</p>
              <p className="text-xs text-slate-500 truncate">{profile.role}</p>
            </div>
          )}
          <button onClick={logout} className={`p-2 text-slate-300 hover:text-main-heading transition-colors rounded-lg hover:bg-main-bg ${isCollapsed ? '' : ''}`} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
