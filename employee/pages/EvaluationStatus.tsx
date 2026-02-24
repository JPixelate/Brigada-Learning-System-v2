import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Hourglass, CheckCircle, XCircle, RotateCcw, Clock,
  BookOpen, ChevronRight, MessageSquare, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Enrollment } from '../../types';

type FilterKey = 'all' | 'under_evaluation' | 'passed' | 'failed' | 'rejected';

const STATUS_META: Record<string, {
  label: string;
  icon: React.ElementType;
  cardBg: string;
  badge: string;
  iconColor: string;
}> = {
  under_evaluation: {
    label: 'Under Evaluation',
    icon: Hourglass,
    cardBg: 'border-amber-200 bg-amber-50/40',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-600',
  },
  passed: {
    label: 'Passed',
    icon: CheckCircle,
    cardBg: 'border-emerald-200 bg-emerald-50/30',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  failed: {
    label: 'Needs Retake',
    icon: RotateCcw,
    cardBg: 'border-orange-200 bg-orange-50/30',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    iconColor: 'text-orange-600',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    cardBg: 'border-red-200 bg-red-50/30',
    badge: 'bg-red-50 text-red-600 border-red-200',
    iconColor: 'text-red-600',
  },
};

const EvaluationStatus = () => {
  const { user } = useAuth();
  const { data, retakeModule } = useData();
  const [filter, setFilter] = useState<FilterKey>('all');

  const myEnrollments: Enrollment[] = (data.enrollments || []).filter(
    e => e.employeeId === user?.id &&
      ['under_evaluation', 'passed', 'failed', 'rejected'].includes(e.status)
  );

  const counts: Record<FilterKey, number> = {
    all: myEnrollments.length,
    under_evaluation: myEnrollments.filter(e => e.status === 'under_evaluation').length,
    passed: myEnrollments.filter(e => e.status === 'passed').length,
    failed: myEnrollments.filter(e => e.status === 'failed').length,
    rejected: myEnrollments.filter(e => e.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? myEnrollments : myEnrollments.filter(e => e.status === filter);

  // Sort: under_evaluation first, then failed, then rejected, then passed
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<string, number> = { under_evaluation: 0, failed: 1, rejected: 2, passed: 3 };
    return (order[a.status] ?? 99) - (order[b.status] ?? 99);
  });

  const getModule = (moduleId: string) => data.modules.find(m => m.id === moduleId);

  const filters: { key: FilterKey; label: string; icon?: React.ReactNode }[] = [
    { key: 'all', label: 'All' },
    { key: 'under_evaluation', label: 'Under Evaluation', icon: <Hourglass size={13} /> },
    { key: 'failed', label: 'Needs Retake', icon: <RotateCcw size={13} /> },
    { key: 'passed', label: 'Passed', icon: <CheckCircle size={13} /> },
    { key: 'rejected', label: 'Rejected', icon: <XCircle size={13} /> },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-main-heading">My Evaluations</h1>
        <p className="text-sm text-slate-500 mt-1">Track the evaluation status of your submitted modules.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 bg-main-surface p-3 rounded-xl border border-main-border shadow-sm">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f.key
                ? 'bg-brand-primary text-brand-primary-text shadow-sm'
                : 'text-slate-500 hover:text-main-heading hover:bg-main-bg'
            }`}
          >
            {f.icon}
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filter === f.key ? 'bg-white/20 text-inherit' : 'bg-main-border text-slate-500'
              }`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {sorted.length === 0 ? (
        <div className="text-center py-24 bg-main-surface rounded-2xl border border-dashed border-main-border">
          <BookOpen size={52} className="mx-auto text-slate-300 mb-4" />
          <p className="text-base font-semibold text-slate-500">No evaluations yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            Complete a module and submit it for evaluation to see it here.
          </p>
          <Link
            to="/employee/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-brand-primary-text font-semibold text-sm rounded-xl hover:bg-brand-hover transition-all"
          >
            Browse Modules <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(enrollment => {
            const mod = getModule(enrollment.moduleId);
            if (!mod) return null;
            const meta = STATUS_META[enrollment.status];
            const StatusIcon = meta?.icon ?? BookOpen;
            const retakeCount = enrollment.retakeCount ?? 0;

            return (
              <div
                key={enrollment.id}
                className={`bg-main-surface rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${meta?.cardBg ?? 'border-main-border'}`}
              >
                <div className="flex flex-col sm:flex-row gap-0">
                  {/* Thumbnail */}
                  <div className="sm:w-40 shrink-0">
                    <img
                      src={mod.thumbnail}
                      alt={mod.title}
                      className={`w-full h-32 sm:h-full object-cover ${enrollment.status === 'rejected' ? 'grayscale opacity-50' : ''}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">{mod.category || 'Module'}</p>
                        <h3 className="text-base font-bold text-main-heading leading-snug">{mod.title}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{mod.instructor}</p>
                      </div>

                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-full shrink-0 ${meta?.badge}`}>
                        <StatusIcon size={13} className={enrollment.status === 'under_evaluation' ? 'animate-pulse' : ''} />
                        {meta?.label}
                        {enrollment.status === 'failed' && ` — Retake #${retakeCount}`}
                      </span>
                    </div>

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                      {enrollment.submittedForEvaluationDate && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          Submitted {enrollment.submittedForEvaluationDate}
                        </span>
                      )}
                      {enrollment.evaluatedDate && (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle size={12} />
                          Evaluated {enrollment.evaluatedDate}
                        </span>
                      )}
                      {enrollment.status === 'failed' && (
                        <span className="flex items-center gap-1.5 text-orange-500 font-bold">
                          <RotateCcw size={12} />
                          {3 - retakeCount} attempt{3 - retakeCount !== 1 ? 's' : ''} remaining
                        </span>
                      )}
                    </div>

                    {/* Evaluator feedback */}
                    {enrollment.evaluatorNote && (
                      <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                        enrollment.status === 'passed'
                          ? 'bg-emerald-50 border-emerald-100'
                          : 'bg-red-50 border-red-100'
                      }`}>
                        <MessageSquare size={14} className={`mt-0.5 shrink-0 ${enrollment.status === 'passed' ? 'text-emerald-600' : 'text-red-500'}`} />
                        <div>
                          <p className={`text-xs font-black uppercase tracking-wider mb-0.5 ${enrollment.status === 'passed' ? 'text-emerald-700' : 'text-red-600'}`}>
                            Evaluator Feedback
                          </p>
                          <p className={`text-sm leading-relaxed ${enrollment.status === 'passed' ? 'text-emerald-800' : 'text-red-700'}`}>
                            {enrollment.evaluatorNote}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action row */}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <Link
                        to={`/employee/courses/${mod.id}`}
                        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-main-heading transition-colors"
                      >
                        View module <ChevronRight size={13} />
                      </Link>

                      {enrollment.status === 'failed' && (
                        <button
                          onClick={() => {
                            const prefix = `timer_${user?.id}_${enrollment.moduleId}_`;
                            Object.keys(localStorage)
                              .filter(k => k.startsWith(prefix))
                              .forEach(k => localStorage.removeItem(k));
                            retakeModule(enrollment.id);
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                        >
                          <RotateCcw size={15} />
                          Retake Module
                        </button>
                      )}

                      {enrollment.status === 'under_evaluation' && (
                        <span className="flex items-center gap-2 px-5 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl">
                          <Hourglass size={15} className="animate-pulse" />
                          Awaiting review
                        </span>
                      )}

                      {enrollment.status === 'passed' && (
                        <Link
                          to="/employee/certificates"
                          className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                        >
                          <CheckCircle size={15} />
                          View Certificate
                        </Link>
                      )}

                      {enrollment.status === 'rejected' && (
                        <span className="flex items-center gap-2 px-5 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl">
                          <XCircle size={15} />
                          Access Denied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EvaluationStatus;
