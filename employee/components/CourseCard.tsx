import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Clock, CheckCircle, Hourglass, XCircle, RotateCcw } from 'lucide-react';
import { Module, Enrollment } from '../../types';

interface CourseCardProps {
  module: Module & { progress?: number };
  progress?: number;
  enrollment?: Enrollment;
  key?: string;
}

const CourseCard = ({ module, progress, enrollment }: CourseCardProps) => {
  const actualProgress = progress ?? (module as any).progress ?? 0;
  const status = enrollment?.status ?? 'not_started';
  const retakeCount = enrollment?.retakeCount ?? 0;

  const getStatusBadge = () => {
    if (status === 'under_evaluation') {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 flex items-center gap-1.5 border border-amber-200">
          <Hourglass size={12} className="animate-pulse" /> Under Evaluation
        </span>
      );
    }
    if (status === 'passed') {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 flex items-center gap-1.5">
          <CheckCircle size={12} /> Passed
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 flex items-center gap-1.5 border border-orange-200">
          <RotateCcw size={12} /> Retake #{retakeCount}
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 flex items-center gap-1.5 border border-red-200">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    if (actualProgress === 100) {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle size={14} /> Completed
        </span>
      );
    }
    if (actualProgress > 0) {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          In Progress
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400">
        Not Started
      </span>
    );
  };

  const getButtonLabel = () => {
    if (status === 'under_evaluation') return 'View Module';
    if (status === 'passed') return 'Review Course';
    if (status === 'failed') return `Retake #${retakeCount}`;
    if (status === 'rejected') return 'Access Denied';
    if (actualProgress === 100) return 'Review Course';
    if (actualProgress > 0) return 'Continue Learning';
    return 'Start Course';
  };

  const isDisabled = status === 'rejected';

  return (
    <div className="group bg-main-surface rounded-2xl border border-main-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={module.thumbnail}
          alt={module.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isDisabled ? 'grayscale opacity-60' : ''}`}
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
        {status === 'failed' && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/60 text-white rounded-full">
              {3 - retakeCount} attempt{3 - retakeCount !== 1 ? 's' : ''} left
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-brand-primary uppercase tracking-wider mb-1.5">{module.category || 'Course'}</p>
            <h3 className="text-base font-medium text-main-heading group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
              {module.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {module.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-4">
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {module.studentsEnrolled?.toLocaleString() || 0}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {module.duration || 'Self-paced'}
          </span>
        </div>

        {actualProgress > 0 && status !== 'under_evaluation' && status !== 'passed' && status !== 'rejected' && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-semibold text-brand-primary">{actualProgress}%</span>
            </div>
            <div className="h-2 bg-main-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-500"
                style={{ width: `${actualProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Evaluator note on rejected/failed */}
        {enrollment?.evaluatorNote && (status === 'failed' || status === 'rejected') && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-0.5">Feedback</p>
            <p className="text-xs text-red-700 line-clamp-2">{enrollment.evaluatorNote}</p>
          </div>
        )}

        {isDisabled ? (
          <div className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-400 font-medium px-5 py-2.5 rounded-xl text-sm cursor-not-allowed border border-slate-200">
            <XCircle size={16} />
            Access Denied
          </div>
        ) : (
          <Link
            to={`/employee/courses/${module.id}`}
            className={`flex items-center justify-center gap-2 w-full font-medium px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm ${
              status === 'failed'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-brand-primary text-brand-primary-text hover:bg-brand-hover'
            }`}
          >
            {getButtonLabel()}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
