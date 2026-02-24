import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, PlayCircle, ChevronDown, ChevronRight, ArrowRight, Clock, Play, RotateCcw, Layers, Hourglass, XCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import ContentRenderer from '../components/ContentRenderer';
import QuizPlayer from '../components/QuizPlayer';
import { ComponentProgress } from '../../types';
import { useComponentTimer } from '../hooks/useComponentTimer';

const CourseViewer = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const { data, updateComponentProgress, updateEnrollment, submitModuleForEvaluation, retakeModule } = useData();

  const module = data.modules.find(m => m.id === moduleId);
  const enrollment = (data.enrollments || []).find(
    e => e.employeeId === user?.id && e.moduleId === moduleId
  );
  const progressData = (data.componentProgress || []).filter(
    cp => cp.employeeId === user?.id && cp.moduleId === moduleId
  );

  // Flatten all components for navigation
  const allComponents = useMemo(() => {
    if (!module?.sections) return [];
    return module.sections.flatMap(section =>
      section.components.map(comp => ({
        ...comp,
        sectionId: section.id,
        sectionTitle: section.title,
      }))
    );
  }, [module]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (enrollment?.currentComponentId) {
      const idx = allComponents.findIndex(c => c.id === enrollment.currentComponentId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const [hasStarted, setHasStarted] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    module?.sections?.forEach(s => { map[s.id] = true; });
    return map;
  });

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500 mb-3 text-lg">Course not found.</p>
        <Link to="/employee/courses" className="text-brand-primary font-bold text-base hover:underline">
          Back to Modules
        </Link>
      </div>
    );
  }

  const currentComponent = allComponents[currentIndex];
  
  // Timer for current component
  const handleTimeUpdate = (seconds: number) => {
    if (!currentComponent || !user) return;
    
    const existingProgress = progressData.find(
      p => p.componentId === currentComponent.id
    );
    
    const progress: ComponentProgress = {
      id: existingProgress?.id || `cp-${Date.now()}`,
      employeeId: user.id,
      moduleId: module.id,
      sectionId: currentComponent.sectionId,
      componentId: currentComponent.id,
      status: existingProgress?.status || 'in_progress',
      timeSpentMinutes: Math.floor(seconds / 60),
      timeSpentSeconds: seconds,
      startedDate: existingProgress?.startedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastAccessedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      completedDate: existingProgress?.completedDate,
    };
    
    updateComponentProgress(progress);
  };

  const { formattedTime } = useComponentTimer({
    componentId: currentComponent?.id || '',
    moduleId: module.id,
    employeeId: user?.id || '',
    onTimeUpdate: handleTimeUpdate,
    isActive: !!currentComponent && currentComponent.type !== 'quiz',
  });

  // Calculate total time spent on module
  const totalTimeSpent = useMemo(() => {
    const totalSeconds = progressData.reduce((sum, p) => {
      if (p.timeSpentSeconds !== undefined) {
        return sum + p.timeSpentSeconds;
      }
      return sum + (p.timeSpentMinutes * 60);
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [progressData]);

  const getCompStatus = (compId: string) => {
    const cp = progressData.find(p => p.componentId === compId);
    return cp?.status || 'not_started';
  };

  const getCompTime = (compId: string): string | null => {
    const savedKey = `timer_${user?.id}_${module?.id}_${compId}`;
    const saved = localStorage.getItem(savedKey);
    const secs = saved ? parseInt(saved, 10) : (progressData.find(p => p.componentId === compId)?.timeSpentSeconds ?? 0);
    if (secs < 5) return null;
    if (secs < 3600) {
      const m = Math.floor(secs / 60);
      return m > 0 ? `${m}m` : `${secs}s`;
    }
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleMarkComplete = () => {
    if (!currentComponent || !user) return;

    const progress: ComponentProgress = {
      id: `cp-${Date.now()}`,
      employeeId: user.id,
      moduleId: module.id,
      sectionId: currentComponent.sectionId,
      componentId: currentComponent.id,
      status: 'completed',
      completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeSpentMinutes: 0,
    };
    updateComponentProgress(progress);

    // Recalculate enrollment progress
    const totalComponents = allComponents.length;
    const completedCount = progressData.filter(p => p.status === 'completed').length + 1;
    const newProgress = Math.min(100, Math.round((completedCount / totalComponents) * 100));

    if (enrollment) {
      updateEnrollment(enrollment.id, {
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : 'in_progress',
        lastAccessedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        currentComponentId: currentComponent.id,
        currentSectionId: currentComponent.sectionId,
        ...(newProgress >= 100 ? { completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : {}),
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < allComponents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const totalComponents = allComponents.length;
  const completedComponents = progressData.filter(p => p.status === 'completed').length;
  const overallProgress = totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/employee/courses" className="p-2.5 text-slate-400 hover:text-main-heading rounded-xl hover:bg-main-surface transition-colors border border-transparent hover:border-main-border">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <h1 className="text-xl font-bold text-main-heading truncate">{module.title}</h1>
            <span className="text-slate-300 shrink-0">·</span>
            <span className="text-sm text-slate-500 font-medium shrink-0">{module.instructor}</span>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Total Time Spent */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
              <Clock size={14} className="text-purple-600" />
              <span className="text-xs font-black text-purple-700 tabular-nums">{totalTimeSpent}</span>
            </div>
            
            <span className="text-sm text-slate-500 font-bold">{completedComponents}/{totalComponents} completed</span>
            <div className="w-32 h-2 bg-main-bg rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-sm font-black text-brand-primary min-w-[3ch] text-right">{overallProgress}%</span>
          </div>
        </div>
      </div>

      {!hasStarted ? (
        /* ── Module Landing Screen ── */
        <div className="bg-main-surface rounded-2xl border border-main-border shadow-sm overflow-hidden">
          {/* Hero band */}
          <div className="bg-gradient-to-br from-brand-primary to-brand-primary/80 px-10 py-12 text-brand-primary-text">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-xl shrink-0">
                <Layers size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{module.instructor}</p>
                <h2 className="text-3xl font-black leading-tight">{module.title}</h2>
              </div>
            </div>
            {module.description && (
              <p className="text-sm font-medium opacity-75 leading-relaxed max-w-2xl">{module.description}</p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-main-border border-b border-main-border">
            <div className="px-8 py-5 text-center">
              <p className="text-2xl font-black text-main-heading">{module.sections?.length ?? 0}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Sections</p>
            </div>
            <div className="px-8 py-5 text-center">
              <p className="text-2xl font-black text-main-heading">{totalComponents}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Components</p>
            </div>
            <div className="px-8 py-5 text-center">
              <p className="text-2xl font-black text-main-heading">{completedComponents}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Completed</p>
            </div>
          </div>

          {/* Progress + CTA */}
          <div className="px-10 py-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Overall progress</span>
                <span className="text-brand-primary">{overallProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-main-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              {totalTimeSpent !== '0m' && (
                <div className="flex items-center gap-1.5 mt-3">
                  <Clock size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400">{totalTimeSpent} spent so far</span>
                </div>
              )}
              {/* Evaluator note for failed/rejected */}
              {enrollment?.evaluatorNote && (enrollment?.status === 'failed' || enrollment?.status === 'rejected') && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Evaluator Feedback</p>
                  <p className="text-sm text-red-700">{enrollment.evaluatorNote}</p>
                </div>
              )}
            </div>

            {/* CTA button — varies by enrollment status */}
            {(() => {
              const status = enrollment?.status;
              const retakeCount = enrollment?.retakeCount ?? 0;

              if (status === 'under_evaluation') {
                return (
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-amber-50 border border-amber-200 text-amber-700 text-base font-black rounded-xl shrink-0">
                    <Hourglass size={20} className="animate-pulse" />
                    Under Evaluation
                  </div>
                );
              }
              if (status === 'passed') {
                return (
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-base font-black rounded-xl shrink-0">
                    <CheckCircle size={20} />
                    Passed
                  </div>
                );
              }
              if (status === 'rejected') {
                return (
                  <div className="inline-flex flex-col items-center gap-1 px-8 py-4 bg-red-50 border border-red-200 text-red-700 text-base font-black rounded-xl shrink-0">
                    <div className="flex items-center gap-2">
                      <XCircle size={20} />
                      Access Denied
                    </div>
                    <span className="text-xs font-semibold text-red-500">Maximum retakes reached</span>
                  </div>
                );
              }
              if (status === 'failed') {
                const handleRetake = () => {
                  if (!enrollment) return;
                  // Clear localStorage timer keys for this module so sidebar shows fresh timers
                  const prefix = `timer_${user?.id}_${module.id}_`;
                  Object.keys(localStorage)
                    .filter(k => k.startsWith(prefix))
                    .forEach(k => localStorage.removeItem(k));
                  retakeModule(enrollment.id);
                  setHasStarted(false);
                };
                return (
                  <button
                    onClick={handleRetake}
                    className="inline-flex flex-col items-center gap-1 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-base font-black rounded-xl transition-all shadow-lg shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw size={20} />
                      Retake #{retakeCount}
                    </div>
                    <span className="text-xs font-semibold opacity-80">{3 - retakeCount} attempt{3 - retakeCount !== 1 ? 's' : ''} remaining</span>
                  </button>
                );
              }
              if (completedComponents >= totalComponents && totalComponents > 0) {
                return (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => enrollment && submitModuleForEvaluation(enrollment.id)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-brand-primary-text text-base font-black rounded-xl hover:bg-brand-hover transition-all shadow-lg"
                    >
                      <Send size={20} />
                      Submit for Evaluation
                    </button>
                    <button
                      onClick={() => setHasStarted(true)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 text-center transition-colors"
                    >
                      Review content first
                    </button>
                  </div>
                );
              }
              return (
                <button
                  onClick={() => setHasStarted(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-brand-primary-text text-base font-black rounded-xl hover:bg-brand-hover transition-all shadow-lg shrink-0"
                >
                  {completedComponents === 0 ? (
                    <><Play size={20} className="fill-current" />Start Now</>
                  ) : (
                    <><Play size={20} className="fill-current" />Continue Now</>
                  )}
                </button>
              );
            })()}
          </div>

          {/* Section overview list */}
          <div className="border-t border-main-border px-10 py-6 space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Course Curriculum</p>
            {module.sections?.map(section => {
              const sectionComps = section.components ?? [];
              const sectionDone = sectionComps.filter(c => getCompStatus(c.id) === 'completed').length;
              return (
                <div key={section.id} className="flex items-center justify-between py-2.5 border-b border-main-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    {sectionDone === sectionComps.length && sectionComps.length > 0 ? (
                      <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-300 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-main-heading">{section.title}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{sectionDone}/{sectionComps.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
      <div className="flex gap-6">
        {/* Left Sidebar - Section Tree */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-main-surface rounded-2xl border border-main-border p-4 sticky top-24">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Course Curriculum</h3>
            <div className="space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto no-scrollbar">
              {module.sections?.map(section => (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-main-bg transition-colors group"
                  >
                    {expandedSections[section.id] ? (
                      <ChevronDown size={16} className="text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-main-heading truncate group-hover:text-brand-primary transition-colors">{section.title}</span>
                  </button>

                  {expandedSections[section.id] && (
                    <div className="ml-4 pl-4 border-l-2 border-main-border/50 space-y-1 mt-1">
                      {section.components.map((comp) => {
                        const globalIdx = allComponents.findIndex(c => c.id === comp.id);
                        const status = getCompStatus(comp.id);
                        const isActive = globalIdx === currentIndex;
                        const compTime = getCompTime(comp.id);

                        return (
                          <button
                            key={comp.id}
                            onClick={() => setCurrentIndex(globalIdx)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all text-sm ${
                              isActive
                                ? 'bg-brand-primary/10 text-brand-primary font-bold'
                                : 'text-slate-500 hover:text-main-heading hover:bg-main-bg'
                            }`}
                          >
                            {status === 'completed' ? (
                              <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            ) : isActive ? (
                              <PlayCircle size={16} className="text-brand-primary shrink-0" />
                            ) : (
                              <Circle size={16} className="text-slate-300 shrink-0" />
                            )}
                            <span className="truncate flex-1">{comp.title}</span>
                            {compTime && (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-400 tabular-nums">
                                <Clock size={10} />
                                {compTime}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-main-surface rounded-2xl border border-main-border p-8 shadow-sm">
            {currentComponent ? (
              currentComponent.type === 'quiz' ? (
                <QuizPlayer component={currentComponent} moduleId={module.id} />
              ) : (
                <ContentRenderer component={currentComponent} timerDisplay={formattedTime} />
              )
            ) : (
              <p className="text-slate-500 text-base">No content available.</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-6 py-3 text-base font-bold text-slate-500 hover:text-main-heading bg-main-surface border border-main-border rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-3">
              {currentComponent && getCompStatus(currentComponent.id) !== 'completed' && currentComponent.type !== 'quiz' && (
                <button
                  onClick={handleMarkComplete}
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all"
                >
                  <CheckCircle size={20} />
                  Mark Complete
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={currentIndex >= allComponents.length - 1}
                className="inline-flex items-center gap-2 px-8 py-3 text-base font-bold bg-brand-primary text-brand-primary-text rounded-xl hover:bg-brand-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default CourseViewer;
