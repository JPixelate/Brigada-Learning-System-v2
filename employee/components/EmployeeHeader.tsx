import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import NotificationDropdown from '../../components/NotificationDropdown';

const EmployeeHeader = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data } = useData();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = (data.notifications || [])
    .filter(n => n.userId === user?.id && !n.read).length;

  const pendingEvaluations = (data.enrollments || []).filter(
    e => e.employeeId === user?.id && e.status === 'under_evaluation'
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/employee', end: true },
    { name: 'Modules', path: '/employee/courses' },
    { name: 'Pathways', path: '/employee/learning-paths' },
    { name: 'Certificates', path: '/employee/certificates' },
    { name: 'Evaluations', path: '/employee/evaluations', badge: pendingEvaluations },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-main-surface/95 backdrop-blur-sm border-b border-main-border transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16 gap-8">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <NavLink to="/employee" className="flex-shrink-0 flex items-center">
              <img
                src={theme === 'dark' ? "/images/icons/bls_dark.svg" : "/images/icons/bls_light.svg"}
                alt="Logo"
                className="h-8 w-auto"
              />
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
                      isActive
                        ? 'text-brand-primary bg-brand-primary/5'
                        : 'text-slate-500 hover:text-main-heading hover:bg-main-bg'
                    }`
                  }
                >
                  {link.name}
                  {link.badge != null && link.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md items-center relative">
              <Search size={18} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="w-full pl-10 pr-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm text-main-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>

            {/* Action Buttons */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-main-heading hover:bg-main-bg rounded-lg transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <NavLink
              to="/employee/messages"
              className="p-2 text-slate-500 hover:text-main-heading hover:bg-main-bg rounded-lg transition-all relative"
            >
              <MessageSquare size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full"></span>
            </NavLink>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition-all relative ${
                  showNotifications ? 'bg-main-bg text-brand-primary' : 'text-slate-500 hover:text-main-heading hover:bg-main-bg'
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <NotificationDropdown 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 hover:bg-main-bg rounded-lg transition-all">
                <img
                  src={user?.avatar || ''}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover border border-main-border"
                />
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-main-surface border border-main-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-3 border-b border-main-border">
                  <p className="text-sm font-medium text-main-heading truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <NavLink
                    to="/employee/profile"
                    className="block px-3 py-2 text-sm text-slate-600 hover:text-main-heading hover:bg-main-bg rounded-lg transition-all"
                  >
                    My Profile
                  </NavLink>
                  <NavLink
                    to="/employee/certificates"
                    className="block px-3 py-2 text-sm text-slate-600 hover:text-main-heading hover:bg-main-bg rounded-lg transition-all"
                  >
                    My Certificates
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-main-heading hover:bg-main-bg rounded-lg transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-main-border">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-brand-primary bg-brand-primary/5'
                        : 'text-slate-500 hover:text-main-heading hover:bg-main-bg'
                    }`
                  }
                >
                  {link.name}
                  {link.badge != null && link.badge > 0 && (
                    <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
            <div className="mt-4 px-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm text-main-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default EmployeeHeader;
