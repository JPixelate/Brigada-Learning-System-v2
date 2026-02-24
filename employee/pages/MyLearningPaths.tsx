import React, { useState } from 'react';
import { Waypoints, BookOpen, Clock, Users, Search, LayoutGrid, List, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LearningPathEnrollment } from '../../types';
import LearningPathListItem from '../components/LearningPathListItem';

const MyLearningPaths = () => {
  const { user } = useAuth();
  const { data, enrollInLearningPath } = useData();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');

  const myPathEnrollments = (data.learningPathEnrollments || [])
    .filter(lp => lp.employeeId === user?.id)
    .filter(lpe => {
      const path = data.learningPaths.find(p => p.id === lpe.learningPathId);
      if (!path) return false;
      const matchesSearch = path.title.toLowerCase().includes(search.toLowerCase()) || 
                           path.description.toLowerCase().includes(search.toLowerCase());
      const matchesAudience = selectedAudience === 'All' || path.targetAudience === selectedAudience;
      return matchesSearch && matchesAudience;
    });

  const enrolledPathIds = (data.learningPathEnrollments || [])
    .filter(lp => lp.employeeId === user?.id)
    .map(lp => lp.learningPathId);

  const availablePaths = data.learningPaths
    .filter(lp => lp.status === 'Active' && !enrolledPathIds.includes(lp.id))
    .filter(path => {
      const matchesSearch = path.title.toLowerCase().includes(search.toLowerCase()) || 
                           path.description.toLowerCase().includes(search.toLowerCase());
      const matchesAudience = selectedAudience === 'All' || path.targetAudience === selectedAudience;
      return matchesSearch && matchesAudience;
    });

  const audiences = ['All', ...new Set(data.learningPaths.map(lp => lp.targetAudience).filter(Boolean))];

  const handleEnroll = (pathId: string) => {
    const enrollment: LearningPathEnrollment = {
      id: `lpe-${Date.now()}`,
      employeeId: user!.id,
      learningPathId: pathId,
      enrolledDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      progress: 0,
      status: 'not_started',
    };
    enrollInLearningPath(enrollment);
  };

  const statusColors: Record<string, string> = {
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    not_started: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="space-y-8 fade-in">
      
      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-main-surface p-4 rounded-2xl border border-main-border shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex items-center bg-main-bg rounded-xl px-4 py-2.5 border border-main-border flex-1 lg:max-w-md focus-within:border-brand-primary transition-all">
            <Search size={18} className="text-slate-400 mr-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pathways..."
              className="bg-transparent border-none outline-none text-sm text-main-heading placeholder-slate-400 w-full"
            />
          </div>

          <div className="flex items-center gap-2 bg-main-bg rounded-xl px-3 py-2 border border-main-border">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-main-heading font-medium cursor-pointer min-w-[120px]"
            >
              {audiences.map(aud => (
                <option key={aud} value={aud}>{aud}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-main-bg p-1 rounded-xl border border-main-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-main-surface text-brand-primary shadow-sm border border-main-border'
                : 'text-slate-400 hover:text-main-heading'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-main-surface text-brand-primary shadow-sm border border-main-border'
                : 'text-slate-400 hover:text-main-heading'
            }`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* My Enrolled Paths */}
      {myPathEnrollments.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-1.5 h-6 bg-brand-primary rounded-full"></div>
             <h2 className="text-xl font-bold text-main-heading">My Current Journeys</h2>
          </div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPathEnrollments.map(lpe => {
                const path = data.learningPaths.find(p => p.id === lpe.learningPathId);
                if (!path) return null;
                return (
                  <div key={lpe.id} className="bg-main-surface rounded-2xl border border-main-border p-6 shadow-sm transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-brand-primary/10">
                        <Waypoints size={24} className="text-brand-primary" />
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${statusColors[lpe.status]}`}>
                        {lpe.status === 'in_progress' ? 'In Progress' :
                         lpe.status === 'completed' ? 'Completed' : 'Not Started'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-main-heading mb-2 leading-tight">{path.title}</h3>
                    <p className="text-sm text-main-text line-clamp-2 mb-4 font-medium leading-relaxed">{path.description}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-400 font-bold mb-6">
                      <span className="flex items-center gap-2 bg-main-bg px-3 py-1.5 rounded-lg"><BookOpen size={16} />{path.moduleCount} modules</span>
                      <span className="flex items-center gap-2 bg-main-bg px-3 py-1.5 rounded-lg"><Clock size={16} />{path.duration}</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Journey Progress</span>
                        <span className="text-sm font-black text-brand-primary">{lpe.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-main-bg rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary rounded-full transition-all duration-1000" style={{ width: `${lpe.progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myPathEnrollments.map(lpe => {
                const path = data.learningPaths.find(p => p.id === lpe.learningPathId);
                if (!path) return null;
                return (
                  <LearningPathListItem 
                    key={lpe.id}
                    path={path}
                    isEnrolled={true}
                    progress={lpe.progress}
                    status={lpe.status}
                    statusColors={statusColors}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Available Paths */}
      {availablePaths.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
             <h2 className="text-xl font-bold text-main-heading">Explore New Paths</h2>
          </div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePaths.map(path => (
                <div key={path.id} className="bg-main-surface rounded-2xl border border-main-border p-6 shadow-sm transition-all hover:shadow-lg">
                  <div className="p-3 rounded-xl bg-main-bg w-fit mb-4">
                    <Waypoints size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-main-heading mb-2 leading-tight">{path.title}</h3>
                  <p className="text-sm text-main-text line-clamp-2 mb-4 font-medium leading-relaxed">{path.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 font-bold mb-6">
                    <span className="flex items-center gap-2 bg-main-bg px-3 py-1.5 rounded-lg"><BookOpen size={16} />{path.moduleCount}</span>
                    <span className="flex items-center gap-2 bg-main-bg px-3 py-1.5 rounded-lg"><Clock size={16} />{path.duration}</span>
                    <span className="flex items-center gap-2 bg-main-bg px-3 py-1.5 rounded-lg"><Users size={16} />{path.enrolledCount.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleEnroll(path.id)}
                    className="w-full px-6 py-3.5 bg-emerald-600 text-white rounded-xl text-base font-bold hover:bg-emerald-700 transition-all font-sans"
                  >
                    Enroll in Path
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {availablePaths.map(path => (
                <LearningPathListItem 
                  key={path.id}
                  path={path}
                  isEnrolled={false}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {myPathEnrollments.length === 0 && availablePaths.length === 0 && (
        <div className="text-center py-24 bg-main-surface rounded-3xl border border-dashed border-main-border">
          <Waypoints size={64} className="mx-auto text-slate-200 mb-4" />
          <p className="text-lg text-slate-500 font-bold">No learning paths available right now.</p>
        </div>
      )}
    </div>
  );
};

export default MyLearningPaths;
