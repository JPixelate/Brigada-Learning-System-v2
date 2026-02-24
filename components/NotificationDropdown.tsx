import React, { useRef, useEffect } from 'react';
import { Bell, X, Check, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { data, markNotificationAsRead, clearNotifications } = useData();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = (data.notifications || []).filter(n => n.userId === user?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
      case 'error': return <X className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-main-surface border border-main-border rounded-2xl shadow-2xl z-50 animate-fade-in-up"
    >
      <div className="p-4 border-b border-main-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-main-heading">Notifications</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {unreadCount} UNREAD
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={() => user && clearNotifications(user.id)}
              className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              Clear All
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-main-bg rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          <div className="divide-y divide-main-border">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-4 hover:bg-main-bg transition-all cursor-pointer group flex gap-3 ${!n.read ? 'bg-brand-primary/[0.02]' : ''}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                  !n.read ? 'bg-brand-primary/10 border-brand-primary/20' : 'bg-main-bg border-main-border'
                }`}>
                  {getTypeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${!n.read ? 'font-bold text-main-heading' : 'text-slate-600'}`}>
                      {n.title}
                    </p>
                    {!n.read && <div className="w-2 h-2 bg-brand-primary rounded-full shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatTime(n.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 text-center">
            <div className="w-16 h-16 bg-main-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-main-border">
              <Bell size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-main-heading">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">We'll let you know when something important happens.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-main-border text-center">
          <button className="text-xs font-bold text-brand-primary hover:text-brand-hover transition-colors uppercase tracking-widest">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
