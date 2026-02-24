import React, { useState } from 'react';
import { Megaphone, Search, Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/PageHeader';

const EmployeeAnnouncements = () => {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(data.announcements.map(a => a.category)))];

  const filtered = data.announcements
    .filter(a => a.status === 'Published' || a.status === 'Active')
    .filter(a => selectedCategory === 'All' || a.category === selectedCategory)
    .filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  const priorityColors: Record<string, string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-8 fade-in">
      <PageHeader
        icon={Megaphone}
        title="Announcements"
        description="Stay up to date with the latest news, updates, and corporate events."
      />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex items-center bg-main-surface rounded-xl px-4 py-3 border border-main-border shadow-sm flex-1 w-full max-w-lg">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by keyword..."
            className="bg-transparent border-none outline-none text-base text-main-heading placeholder-slate-400 ml-3 w-full font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-brand-primary-text border-brand-primary shadow-md'
                  : 'bg-main-surface text-slate-500 border-main-border hover:text-main-heading hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-main-surface rounded-3xl border border-dashed border-main-border">
          <Megaphone size={64} className="mx-auto text-slate-200 mb-4" />
          <p className="text-lg text-slate-500 font-bold">No announcements found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ann => (
            <div
              key={ann.id}
              className="bg-main-surface rounded-2xl border border-main-border p-6 shadow-sm transition-all hover:shadow-lg hover:border-brand-primary/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {ann.pinned && <Pin size={16} className="text-amber-500 shrink-0" />}
                    <h3 className="text-lg font-bold text-main-heading leading-tight">{ann.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{ann.date}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{ann.category}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${priorityColors[ann.priority] || priorityColors.Low}`}>
                      {ann.priority} Priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                  className="p-2 text-slate-400 hover:text-main-heading rounded-xl hover:bg-main-bg transition-colors border border-transparent hover:border-main-border shadow-sm"
                >
                  {expandedId === ann.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {expandedId === ann.id ? (
                <div className="mt-6 pt-6 border-t border-main-border animate-in slide-in-from-top-2 duration-300">
                  <p className="text-base text-main-text leading-relaxed font-medium">{ann.content}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                    <span className="px-3 py-1 bg-main-bg rounded-lg">By {ann.author}</span>
                    <span className="px-3 py-1 bg-main-bg rounded-lg">{ann.reads} views</span>
                    <span className="px-3 py-1 bg-main-bg rounded-lg">Audience: {ann.audience}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-4 line-clamp-2 leading-relaxed">{ann.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeAnnouncements;
