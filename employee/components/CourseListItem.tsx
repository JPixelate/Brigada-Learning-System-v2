import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Clock, CheckCircle, Hourglass, RotateCcw, XCircle } from 'lucide-react';
import { Module, Enrollment } from '../../types';

interface CourseListItemProps {
  module: Module & { progress?: number };
  progress?: number;
  enrollment?: Enrollment;
  key?: string;
}

const CourseListItem = ({ module, progress, enrollment }: CourseListItemProps) => {
  const actualProgress = progress ?? module.progress ?? 0;
  const status = enrollment?.status ?? 'not_started';
  const retakeCount = enrollment?.retakeCount ?? 0;
  const isDisabled = status === 'rejected';

  const getStatusBadge = () => {
    if (status === 'under_evaluation') {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-amber-50 text-amber-700 flex items-center gap-1 border border-amber-200">
          <Hourglass size={10} className="animate-pulse" /> Under Evaluation
        </span>
      );
    }
    if (status === 'passed') {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-50 text-emerald-600 flex items-center gap-1">
          <CheckCircle size={10} /> Passed
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-orange-50 text-orange-600 flex items-center gap-1 border border-orange-200">
          <RotateCcw size={10} /> Retake #{retakeCount}
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-red-50 text-red-600 flex items-center gap-1 border border-red-200">
          <XCircle size={10} /> Rejected
        </span>
      );
    }
    if (actualProgress === 100) {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle size={10} /> Completed
        </span>
      );
    }
    if (actualProgress > 0) {
      return (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          In Progress
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400">
        Not Started
      </span>
    );
  };

  const getButtonLabel = () => {
    if (status === 'under_evaluation') return 'View';
    if (status === 'passed') return 'Review';
    if (status === 'failed') return `Retake #${retakeCount}`;
    if (status === 'rejected') return 'Denied';
    if (actualProgress === 100) return 'Review';
    if (actualProgress > 0) return 'Continue';
    return 'Start';
  };

  const showProgress = actualProgress > 0
    && status !== 'under_evaluation'
    && status !== 'passed'
    && status !== 'rejected';

  return (
    <div className={`group bg-main-surface rounded-xl border border-main-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex items-center p-3 gap-4 ${isDisabled ? 'opacity-60' : ''}`}>
      {/* Thumbnail */}
      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={module.thumbnail}
          alt={module.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isDisabled ? 'grayscale' : ''}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-medium text-brand-primary uppercase tracking-wider">{module.category || 'Course'}</p>
          {getStatusBadge()}
        </div>
        <h3 className="text-sm font-medium text-main-heading group-hover:text-brand-primary transition-colors truncate">
          {module.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-1 mb-2">
          {module.description}
        </p>

        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {module.studentsEnrolled?.toLocaleString() || 0}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {module.duration || 'Self-paced'}
          </span>
          {status === 'failed' && (
            <span className="text-orange-500 font-bold">
              {3 - retakeCount} attempt{3 - retakeCount !== 1 ? 's' : ''} left
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="w-48 hidden md:block px-4">
        {showProgress ? (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-semibold text-brand-primary">{actualProgress}%</span>
            </div>
            <div className="h-1.5 bg-main-bg rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-500"
                style={{ width: `${actualProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 italic">
            {status === 'under_evaluation' ? 'Awaiting review' :
             status === 'passed' ? 'Evaluation passed' :
             status === 'rejected' ? 'Access denied' : 'No progress yet'}
          </span>
        )}
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {isDisabled ? (
          <div className="flex items-center justify-center gap-2 bg-slate-100 text-slate-400 font-medium px-4 py-2 rounded-lg text-xs border border-slate-200 cursor-not-allowed">
            <XCircle size={14} />
            Denied
          </div>
        ) : (
          <Link
            to={`/employee/courses/${module.id}`}
            className={`flex items-center justify-center gap-2 font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all text-xs shadow-sm whitespace-nowrap ${
              status === 'failed'
                ? 'bg-orange-500 text-white'
                : status === 'under_evaluation'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-brand-primary text-brand-primary-text hover:bg-brand-hover'
            }`}
          >
            {getButtonLabel()}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseListItem;
