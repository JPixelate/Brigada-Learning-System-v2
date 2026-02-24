import React, { useState } from 'react';
import { Megaphone, Plus, Pin, Users, Clock, ChevronRight, AlertCircle, Info, Settings, Eye, ArrowLeft, Trash2, Send, Filter, MoreVertical, Search, LayoutGrid, List, ChevronLeft, BellRing } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { DBStructure, Announcement } from '../types';
import { useData } from '../context/DataContext';

const Announcements = () => {
  const { data: db } = useData();
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const announcements: Announcement[] = db.announcements;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Alert': return AlertCircle;
      case 'Update': return Info;
      case 'Maintenance': return Settings;
      default: return Megaphone;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-slate-400 bg-slate-50 border-slate-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  // Filter Logic
  const filteredAnnouncements = announcements.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (selectedItem) {
    const Icon = getCategoryIcon(selectedItem.category);

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Detail Header - Matching LearningPaths */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedItem(null)}
              className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-bg rounded-full transition-colors border border-transparent hover:border-main-border"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 bg-brand-primary text-brand-primary-text px-5 py-2 rounded-full font-bold text-xs shadow-sm hover:bg-brand-hover transition-all active:scale-95">
                <Send size={14} />
                Broadcast
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-main-border text-main-text font-bold text-xs hover:bg-main-bg transition-all bg-main-surface shadow-sm">
                <Plus size={14} />
                New Notice
              </button>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(selectedItem.priority)}`}>
            {selectedItem.priority} Priority
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-main-surface p-6 rounded-2xl border border-main-border shadow-sm space-y-4 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-main-bg rounded-bl-[200px] -translate-y-24 translate-x-24 -z-0 opacity-50 transition-colors"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg text-brand-primary-text">
                      <Icon size={22} />
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedItem.category}</span>
                      <h4 className="text-sm font-bold text-main-heading">Communication ID: #{selectedItem.id}024</h4>
                   </div>
                </div>

                <div className="prose prose-slate max-w-none pt-4">
                  <p className="text-main-text leading-relaxed text-lg font-medium">
                    {selectedItem.content}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8 border-t border-main-border">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Audience</p>
                      <div className="flex items-center gap-2 text-main-heading font-bold text-sm">
                        <Users size={16} className="text-slate-400" />
                        {selectedItem.audience}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engagement</p>
                      <div className="flex items-center gap-2 text-main-heading font-bold text-sm">
                        <Eye size={16} className="text-slate-400" />
                        {selectedItem.reads.toLocaleString()} Views
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                      <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Live
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
             <div className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm space-y-4 transition-colors">
                <h3 className="text-sm font-bold text-main-heading uppercase tracking-widest flex items-center gap-2">
                  <Settings size={16} className="text-slate-400" /> Administration
                </h3>
                <div className="space-y-2">
                   <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-main-bg transition-colors group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-main-bg flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-brand-primary-text transition-all">
                            <Pin size={16} />
                         </div>
                         <span className="text-sm font-bold text-main-text group-hover:text-main-heading">Pin to Dashboard</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                   </button>
                   <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-main-bg transition-colors group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-main-bg flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-brand-primary-text transition-all">
                            <Filter size={16} />
                         </div>
                         <span className="text-sm font-bold text-main-text group-hover:text-main-heading">Audit Log</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                   </button>
                   <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors group">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                            <Trash2 size={16} />
                         </div>
                         <span className="text-sm font-bold text-red-600">Delete Permanently</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Announcements"
        description="Publish organization-wide notices and broadcast system updates to keep everyone informed."
        icon={BellRing}
        stats={[
          { label: 'Total Notices', value: announcements.length },
          { label: 'Views Today', value: '1,240' }
        ]}
        actions={[
          {
            label: 'Create Notice',
            icon: Plus,
            variant: 'primary',
            onClick: () => console.log('Create Notice')
          }
        ]}
      />

      {/* Filter & View Mode Bar */}
      <div className="bg-main-surface p-4 rounded-xl border border-main-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="flex flex-1 items-center gap-3 w-full">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all text-main-heading"
              />
           </div>
           <select 
             value={filterCategory}
             onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
             className="px-3 py-2 bg-main-bg border border-main-border rounded-lg text-sm font-semibold text-main-text outline-none transition-colors"
           >
              <option value="All">All Categories</option>
              <option value="Alert">Alerts</option>
              <option value="Update">Updates</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Event">Events</option>
           </select>
           <select 
             value={filterPriority}
             onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
             className="px-3 py-2 bg-main-bg border border-main-border rounded-lg text-sm font-semibold text-main-text outline-none transition-colors"
           >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
           </select>
        </div>

        <div className="flex items-center border border-main-border rounded-lg overflow-hidden shrink-0 transition-colors">
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-brand-primary text-brand-primary-text' : 'bg-main-surface text-slate-400 hover:text-main-heading'}`}
           >
             <LayoutGrid size={18} />
           </button>
           <button 
             onClick={() => setViewMode('list')}
             className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-brand-primary text-brand-primary-text' : 'bg-main-surface text-slate-400 hover:text-main-heading'}`}
           >
             <List size={18} />
           </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedAnnouncements.map(item => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[100px] -translate-y-8 translate-x-8 group-hover:bg-brand-primary/10 transition-colors"></div>
                <div className="relative flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform transition-colors">
                        <Icon size={22} className="text-brand-primary-text" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-main-heading line-clamp-1 truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                             {item.priority}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white rounded-lg transition-all">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-5 border-t border-main-border transition-colors">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      <span className="flex items-center gap-1.5 bg-main-bg px-2 py-1 rounded transition-colors"><Users size={13} className="text-slate-300" /> {item.audience}</span>
                      <span className="flex items-center gap-1.5 bg-main-bg px-2 py-1 rounded transition-colors"><Clock size={13} className="text-slate-300" /> {item.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-main-heading">
                       <Eye size={14} className="text-slate-400" />
                       <span>{item.reads} Views</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-main-surface rounded-2xl border border-main-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 transition-colors">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-main-bg border-b border-main-border transition-colors">
                    <th className="px-6 py-4 text-[10px] font-bold text-main-text uppercase tracking-wider">Announcement</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-main-text uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-main-text uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-main-text uppercase tracking-wider">Target</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-main-text uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-main-border">
                 {paginatedAnnouncements.map(item => (
                   <tr key={item.id} onClick={() => setSelectedItem(item)} className="group hover:bg-main-bg cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                         <div className="min-w-0">
                            <p className="font-bold text-main-heading truncate">{item.title}</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{item.date}</p>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-bold text-main-text uppercase tracking-tight bg-main-bg px-2 py-1 rounded-lg border border-main-border transition-colors">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-xs font-bold text-main-text">
                            <Users size={14} className="text-slate-400" />
                            {item.audience}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                         {item.reads.toLocaleString()} Views
                      </td>
                      <td className="px-6 py-4 text-right">
                         <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 inline-block transition-all" />
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {paginatedAnnouncements.length} of {filteredAnnouncements.length} Notices
           </p>
           <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 border border-main-border rounded-xl bg-main-surface hover:bg-main-bg hover:shadow-sm disabled:opacity-30 transition-all text-main-text"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                    currentPage === i + 1 
                      ? 'bg-brand-primary text-brand-primary-text shadow-lg' 
                      : 'bg-main-surface border border-main-border text-slate-400 hover:border-brand-primary hover:text-main-heading'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 border border-main-border rounded-xl bg-main-surface hover:bg-main-bg hover:shadow-sm disabled:opacity-30 transition-all text-main-text"
              >
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;

