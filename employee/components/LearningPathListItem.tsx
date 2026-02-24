import React from 'react';
import { Waypoints, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { LearningPath } from '../../types';

interface LearningPathListItemProps {
  path: LearningPath;
  progress?: number;
  status?: string;
  isEnrolled?: boolean;
  onEnroll?: (id: string) => void;
  statusColors?: Record<string, string>;
  key?: string;
}

const LearningPathListItem = ({
  path,
  progress,
  status,
  isEnrolled,
  onEnroll,
  statusColors
}: LearningPathListItemProps) => {
  return (
    <div className="group bg-main-surface rounded-xl border border-main-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex items-center p-4 gap-6">
      {/* Icon Area */}
      <div className={`p-4 rounded-xl flex-shrink-0 ${isEnrolled ? 'bg-brand-primary/10' : 'bg-main-bg'}`}>
        <Waypoints size={32} className={isEnrolled ? 'text-brand-primary' : 'text-slate-400'} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-medium text-brand-primary uppercase tracking-wider">{path.targetAudience || 'General'}</p>
          {isEnrolled && status && statusColors && (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[status]}`}>
              {status === 'in_progress' ? 'In Progress' : status === 'completed' ? 'Completed' : 'Not Started'}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-main-heading group-hover:text-brand-primary transition-colors truncate">
          {path.title}
        </h3>
        <p className="text-sm text-main-text line-clamp-1 mb-3 font-medium opacity-70">
          {path.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-bold">
          <span className="flex items-center gap-1.5"><BookOpen size={14} />{path.moduleCount} modules</span>
          <span className="flex items-center gap-1.5"><Clock size={14} />{path.duration}</span>
          {!isEnrolled && (
            <span className="flex items-center gap-1.5"><Users size={14} />{path.enrolledCount.toLocaleString()} enrolled</span>
          )}
        </div>
      </div>

      {/* Progress or Enroll */}
      <div className="flex items-center gap-6">
        {isEnrolled ? (
          <div className="w-48 hidden md:block">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
              <span className="text-[10px] font-black text-brand-primary">{progress}%</span>
            </div>
            <div className="h-2 bg-main-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => onEnroll?.(path.id)}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all whitespace-nowrap"
          >
            Enroll in Path
          </button>
        )}

        <div className="p-2 rounded-lg bg-main-bg text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all cursor-pointer">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
};

export default LearningPathListItem;
