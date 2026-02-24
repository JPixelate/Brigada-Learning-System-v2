import React, { useState } from 'react';
import { BookOpen, Search, LayoutGrid, List, Hourglass, XCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import CourseCard from '../components/CourseCard';
import CourseListItem from '../components/CourseListItem';
import { Module, Enrollment } from '../../types';

type TabKey = 'all' | 'in-progress' | 'completed' | 'under-evaluation' | 'retake' | 'rejected';

interface ModuleWithEnrollment extends Module {
  progress: number;
  enrollment?: Enrollment;
}

const MyCourses = () => {
  const { user } = useAuth();
  const { data } = useData();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const myEnrollments = (data.enrollments || []).filter(e => e.employeeId === user?.id);
  const myComponentProgress = (data.componentProgress || []).filter(cp => cp.employeeId === user?.id);

  const getModuleProgress = (moduleId: string) => {
    const mod = data.modules.find(m => m.id === moduleId);
    if (!mod) return 0;
    const total = mod.sections.reduce((sum, s) => sum + s.components.length, 0);
    const done = myComponentProgress.filter(cp => cp.moduleId === moduleId && cp.status === 'completed').length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const allModules: ModuleWithEnrollment[] = data.modules
    .filter(m => m.status === 'Published')
    .map(mod => ({
      ...mod,
      progress: getModuleProgress(mod.id),
      enrollment: myEnrollments.find(e => e.moduleId === mod.id),
    }));

  const enrollmentStatus = (m: ModuleWithEnrollment) => m.enrollment?.status ?? 'not_started';

  const counts: Record<TabKey, number> = {
    all: allModules.length,
    'in-progress': allModules.filter(m => ['in_progress', 'not_started', 'completed'].includes(enrollmentStatus(m))).length,
    completed: allModules.filter(m => enrollmentStatus(m) === 'passed').length,
    'under-evaluation': allModules.filter(m => enrollmentStatus(m) === 'under_evaluation').length,
    retake: allModules.filter(m => enrollmentStatus(m) === 'failed').length,
    rejected: allModules.filter(m => enrollmentStatus(m) === 'rejected').length,
  };

  let filtered = allModules;
  if (activeTab === 'in-progress') {
    filtered = allModules.filter(m => ['in_progress', 'not_started', 'completed'].includes(enrollmentStatus(m)));
  } else if (activeTab === 'completed') {
    filtered = allModules.filter(m => enrollmentStatus(m) === 'passed');
  } else if (activeTab === 'under-evaluation') {
    filtered = allModules.filter(m => enrollmentStatus(m) === 'under_evaluation');
  } else if (activeTab === 'retake') {
    filtered = allModules.filter(m => enrollmentStatus(m) === 'failed');
  } else if (activeTab === 'rejected') {
    filtered = allModules.filter(m => enrollmentStatus(m) === 'rejected');
  }

  if (search) {
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  const tabs: { key: TabKey; label: string; icon?: React.ReactNode; alertColor?: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'under-evaluation', label: 'Under Evaluation', icon: <Hourglass size={13} /> },
    { key: 'retake', label: 'Retake', icon: <RotateCcw size={13} />, alertColor: 'bg-orange-500 text-white' },
    { key: 'completed', label: 'Passed' },
    { key: 'rejected', label: 'Rejected', icon: <XCircle size={13} /> },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Tabs + Search */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-main-surface p-4 rounded-xl border border-main-border shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 bg-main-bg p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-primary text-brand-primary-text shadow-sm'
                  : 'text-slate-400 hover:text-main-heading hover:bg-main-surface'
              }`}
            >
              {tab.icon}
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-inherit'
                    : tab.alertColor ?? 'bg-main-border text-slate-500'
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-main-bg rounded-lg px-4 py-2.5 border border-main-border flex-1 lg:min-w-[280px]">
            <Search size={18} className="text-slate-400 mr-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="bg-transparent border-none outline-none text-sm text-main-heading placeholder-slate-400 w-full"
            />
          </div>
          <div className="flex items-center gap-1 bg-main-bg p-1 rounded-lg border border-main-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-main-surface text-brand-primary shadow-sm border border-main-border' : 'text-slate-400 hover:text-main-heading'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-main-surface text-brand-primary shadow-sm border border-main-border' : 'text-slate-400 hover:text-main-heading'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Alert banners */}
      {counts['under-evaluation'] > 0 && activeTab !== 'under-evaluation' && (
        <button
          className="w-full flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-left"
          onClick={() => setActiveTab('under-evaluation')}
        >
          <Hourglass size={18} className="text-amber-600 shrink-0 animate-pulse" />
          <p className="text-sm font-semibold text-amber-800 flex-1">
            <span className="font-black">{counts['under-evaluation']}</span> module{counts['under-evaluation'] > 1 ? 's' : ''} currently awaiting admin evaluation.
          </p>
          <span className="text-xs font-bold text-amber-600 underline-offset-2 underline">View →</span>
        </button>
      )}
      {counts['retake'] > 0 && activeTab !== 'retake' && (
        <button
          className="w-full flex items-center gap-3 px-5 py-3.5 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors text-left"
          onClick={() => setActiveTab('retake')}
        >
          <RotateCcw size={18} className="text-orange-600 shrink-0" />
          <p className="text-sm font-semibold text-orange-800 flex-1">
            <span className="font-black">{counts['retake']}</span> module{counts['retake'] > 1 ? 's' : ''} need{counts['retake'] === 1 ? 's' : ''} to be retaken.
          </p>
          <span className="text-xs font-bold text-orange-600 underline-offset-2 underline">View →</span>
        </button>
      )}

      {/* Course grid / list */}
      {filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(module => (
              <CourseCard key={module.id} module={module} enrollment={module.enrollment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(module => (
              <CourseListItem key={module.id} module={module} enrollment={module.enrollment} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-main-surface rounded-2xl border border-dashed border-main-border">
          <BookOpen size={56} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg text-slate-500 font-medium">No courses found</p>
          <p className="text-sm text-slate-400 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
