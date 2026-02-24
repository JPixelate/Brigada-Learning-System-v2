import React, { useState, useMemo } from 'react';
import { X, CheckCircle, Circle, PlayCircle, ChevronDown, ChevronRight, ArrowRight, ArrowLeft, Layout, BookOpen, Clock } from 'lucide-react';
import ContentRenderer from '../employee/components/ContentRenderer';
import QuizPlayer from '../employee/components/QuizPlayer';
import { Module } from '../types';

interface ModulePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module | null;
}

const ModulePreviewModal = ({ isOpen, onClose, module }: ModulePreviewModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

  // Initializing expanded sections
  React.useEffect(() => {
    if (module?.sections) {
      const map: Record<string, boolean> = {};
      module.sections.forEach(s => { map[s.id] = true; });
      setExpandedSections(map);
      setCurrentIndex(0); // Reset index when module changes
    }
  }, [module]);

  if (!isOpen || !module) return null;

  const currentComponent = allComponents[currentIndex];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-main-bg w-full max-w-6xl h-[90vh] rounded-3xl border border-main-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-main-border bg-main-surface/50">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-brand-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-main-heading truncate">Preview: {module.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{module.duration}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor: {module.instructor}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Admin Preview Mode</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-surface rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Curriculum */}
          <div className="w-72 border-r border-main-border bg-main-surface/30 overflow-y-auto no-scrollbar hidden md:block">
            <div className="p-4 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Course Curriculum</p>
              {module.sections?.map(section => (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-main-surface transition-colors group"
                  >
                    {expandedSections[section.id] ? (
                      <ChevronDown size={14} className="text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-main-heading truncate group-hover:text-brand-primary transition-colors">{section.title}</span>
                  </button>

                  {expandedSections[section.id] && (
                    <div className="ml-3 pl-3 border-l border-main-border/50 space-y-0.5 mt-1">
                      {section.components.map((comp) => {
                        const globalIdx = allComponents.findIndex(c => c.id === comp.id);
                        const isActive = globalIdx === currentIndex;

                        return (
                          <button
                            key={comp.id}
                            onClick={() => setCurrentIndex(globalIdx)}
                            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all text-[11px] ${
                              isActive
                                ? 'bg-brand-primary/10 text-brand-primary font-bold shadow-sm'
                                : 'text-slate-500 hover:text-main-heading hover:bg-main-surface'
                            }`}
                          >
                            {isActive ? (
                              <PlayCircle size={12} className="text-brand-primary shrink-0" />
                            ) : (
                              <Circle size={12} className="text-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{comp.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Viewer Area */}
          <div className="flex-1 flex flex-col bg-main-bg overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="max-w-4xl mx-auto">
                {currentComponent ? (
                  currentComponent.type === 'quiz' ? (
                    <QuizPlayer component={currentComponent} moduleId={module.id} />
                  ) : (
                    <ContentRenderer component={currentComponent} />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Layout size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">This section has no content yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="px-6 py-4 border-t border-main-border bg-main-surface/50 backdrop-blur-md flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-main-heading bg-main-bg border border-main-border rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                   Step {currentIndex + 1} of {totalComponents}
                 </span>
                 <button
                   onClick={handleNext}
                   disabled={currentIndex >= allComponents.length - 1}
                   className="flex items-center gap-2 px-6 py-2 text-xs font-bold bg-brand-primary text-brand-primary-text rounded-xl hover:bg-brand-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                 >
                   Next Step
                   <ArrowRight size={16} />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePreviewModal;
