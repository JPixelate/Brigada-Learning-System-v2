import React from 'react';
import { Search, Bell, Menu, Info, PanelLeft, Plus, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  toggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const Header = ({ toggleSidebar, isSidebarCollapsed }: HeaderProps) => {
  const { user } = useAuth();
  const { data } = useData();
  const profile = user || { name: '', avatar: '' };
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = (data.notifications || [])
    .filter(n => n.userId === user?.id && !n.read).length;

  return (
    <header className="w-full py-2 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 bg-main-surface/80 backdrop-blur-md border-b border-main-border transition-all">
      {/* Left Section: Toggle & Quick Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={toggleSidebar} 
          className="hidden md:flex p-2 text-slate-500 hover:text-main-heading bg-main-surface border border-main-border rounded-lg hover:bg-main-bg transition-colors shadow-sm"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft size={20} className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Center Section: Search Bar */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="flex items-center bg-main-surface rounded-full px-4 py-2 w-full shadow-sm border border-main-border transition-all focus-within:ring-2 focus-within:ring-brand-primary/5 focus-within:border-brand-primary">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search modules, employees, or resources..." 
            className="bg-transparent border-none outline-none text-sm font-medium text-main-heading placeholder-slate-400 ml-3 w-full"
          />
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3 shrink-0 justify-end">
        <Link
          to="/admin/create-module"
          className="hidden md:flex items-center gap-2 bg-brand-primary text-brand-primary-text px-4 py-2 rounded-full font-semibold text-sm hover:bg-brand-hover transition-colors shadow-sm hover:shadow active:scale-95"
        >
          <Plus size={16} />
          <span>Create Module</span>
        </Link>
        
        {/* Mobile Menu Trigger */}
        <button className="p-2 text-slate-900 md:hidden bg-white border border-slate-200 rounded-lg shadow-sm">
            <Menu size={20} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
             onClick={() => setShowNotifications(!showNotifications)}
             className={`p-2 transition-colors rounded-lg hover:bg-main-bg hover:shadow-sm border border-main-border relative ${
               showNotifications ? 'bg-main-bg shadow-sm border-main-border text-brand-primary' : 'text-slate-500'
             }`}
           >
             <Bell size={18} />
             {unreadCount > 0 && (
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             )}
           </button>
           
           <NotificationDropdown 
             isOpen={showNotifications} 
             onClose={() => setShowNotifications(false)} 
           />
        </div>

          {/* Profile Avatar */}
        <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-main-heading transition-colors rounded-lg hover:bg-main-bg hover:shadow-sm border border-main-border bg-main-surface"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <img 
            src={profile.avatar} 
            alt="Avatar" 
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:border-slate-200 transition-all"
        />
      </div>
    </header>
  );
};

export default Header;