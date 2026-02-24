import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Waypoints,
  Award,
  Megaphone,
  Calendar,
  MessageSquare,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface EmployeeSidebarProps {
  isCollapsed: boolean;
}

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/employee', icon: LayoutDashboard, end: true },
    ]
  },
  {
    title: 'Learning',
    items: [
      { name: 'Modules', path: '/employee/courses', icon: BookOpen },
      { name: 'Learning Paths', path: '/employee/learning-paths', icon: Waypoints },
      { name: 'Certificates', path: '/employee/certificates', icon: Award },
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'Announcements', path: '/employee/announcements', icon: Megaphone },
      { name: 'Calendar', path: '/employee/calendar', icon: Calendar },
      { name: 'Messages', path: '/employee/messages', icon: MessageSquare },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'My Profile', path: '/employee/profile', icon: User },
    ]
  }
];

const EmployeeSidebar = ({ isCollapsed }: EmployeeSidebarProps) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
                end={item.end || false}
                title={isCollapsed ? item.name : ''}
                className={({ isActive }) =>
                  `group flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-4 px-3'} py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-primary text-brand-primary-text font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-main-heading hover:bg-main-bg font-medium'
                  }`
                }
              >
                <item.icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="text-sm tracking-wide whitespace-nowrap">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className={`mt-3 pt-3 border-t border-main-border ${isCollapsed ? 'px-1' : 'px-2'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
          <img
            src={user?.avatar || ''}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-main-border"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-main-heading truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role as string}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-300 hover:text-main-heading transition-colors rounded-lg hover:bg-main-bg"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
