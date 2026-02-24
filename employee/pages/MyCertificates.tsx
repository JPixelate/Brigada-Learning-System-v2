import React, { useState } from 'react';
import { Award, Calendar, BookOpen, Hash, Eye, Download, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CertificateContent, CertificateScaler, CertificateThumbnail } from '../../components/CertificateRenderer';
import { EmployeeCertificate } from '../../types';

const MyCertificates = () => {
  const { user } = useAuth();
  const { data } = useData();
  const [viewingCert, setViewingCert] = useState<EmployeeCertificate | null>(null);

  const myCerts = (data.employeeCertificates || []).filter(c => c.employeeId === user?.id);

  const getCertTemplate = (templateId: string) => data.certificates.find(c => c.id === templateId);
  const getModule = (moduleId: string) => data.modules.find(m => m.id === moduleId);

  const getRecipientName = () => {
    if (!user) return 'Employee';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || user.name || 'Employee';
  };

  return (
    <div className="space-y-8 fade-in">

      {myCerts.length === 0 ? (
        <div className="text-center py-24 bg-main-surface rounded-3xl border border-dashed border-main-border">
          <Award size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-lg text-slate-500 font-bold">You haven't earned any certificates yet.</p>
          <p className="text-base text-slate-400 mt-2">Complete course assessments with passing scores to earn yours!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCerts.map(cert => {
            const template = getCertTemplate(cert.certificateTemplateId);
            const mod = getModule(cert.moduleId);
            const color = template?.primaryColor || '#2563eb';

            return (
              <div
                key={cert.id}
                className="bg-main-surface rounded-2xl border border-main-border shadow-sm overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 group"
              >
                {/* Certificate Thumbnail Preview */}
                <div
                  className="relative flex items-center justify-center p-4 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
                  onClick={() => setViewingCert(cert)}
                >
                  {template ? (
                    <CertificateThumbnail
                      cert={template}
                      systemName={data.systemBranding?.name || 'Learning System'}
                      recipientName={getRecipientName()}
                      certificateNumber={cert.certificateNumber}
                      issuedDate={cert.issuedDate}
                      moduleTitle={mod?.title}
                      completionHours={mod?.duration ? `${mod.duration.split(' ')[0]}/${mod.duration.split(' ')[0]} ${mod.duration.split(' ')[1] || 'hours'}` : '40/40 hours'}
                      scale={0.26}
                    />
                  ) : (
                    <div className="text-center px-6 py-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-dashed border-white/50 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center">
                      <Award size={40} className="text-slate-300 opacity-50 mb-1" />
                      <div className="w-16 h-1 bg-slate-200 rounded-full opacity-50" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/30 backdrop-blur-[1px] flex items-center justify-center gap-3 transition-opacity z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingCert(cert); }}
                      className="p-2.5 bg-white text-slate-700 rounded-full hover:bg-slate-50 transition-colors shadow-lg"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2.5 bg-white text-slate-700 rounded-full hover:bg-slate-50 transition-colors shadow-lg"
                    >
                      <Download size={18} />
                    </button>
                  </div>

                  {/* Score badge */}
                  <div className="absolute top-3 right-3 z-[5]">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-500/30">
                      SCORE: {cert.score}%
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-main-heading mb-3 group-hover:text-brand-primary transition-colors">
                    {template?.name || 'Professional Certification'}
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3 text-sm text-main-text font-medium bg-main-bg p-2 rounded-lg">
                      <BookOpen size={16} className="shrink-0 text-slate-400" />
                      <span className="truncate">{mod?.title || 'Unknown Module'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-main-text font-medium bg-main-bg p-2 rounded-lg">
                      <Calendar size={16} className="shrink-0 text-slate-400" />
                      <span>Issued on {cert.issuedDate}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400 font-bold bg-main-bg p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                      <Hash size={16} className="shrink-0 text-slate-300" />
                      <span className="tracking-wider">{cert.certificateNumber}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingCert(cert)}
                    className="w-full mt-4 px-4 py-2.5 bg-main-bg hover:bg-brand-primary hover:text-brand-primary-text text-main-text rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View Certificate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate View Modal */}
      {viewingCert && (() => {
        const template = getCertTemplate(viewingCert.certificateTemplateId);
        const mod = getModule(viewingCert.moduleId);

        if (!template) return null;

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-main-surface rounded-2xl border border-main-border shadow-2xl w-full max-w-[1200px] max-h-[95vh] overflow-auto">
              <div className="sticky top-0 bg-main-surface border-b border-main-border p-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-lg font-bold text-main-heading">{template.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Certificate #{viewingCert.certificateNumber} &middot; Issued {viewingCert.issuedDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-main-border text-main-text font-bold text-xs hover:bg-main-bg transition-all bg-main-surface shadow-sm">
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => setViewingCert(null)}
                    className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-bg rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <CertificateScaler>
                    <CertificateContent
                      cert={template}
                      systemName={data.systemBranding?.name || 'Learning System'}
                      recipientName={getRecipientName()}
                      certificateNumber={viewingCert.certificateNumber}
                      issuedDate={viewingCert.issuedDate}
                      moduleTitle={mod?.title}
                      completionHours={mod?.duration ? `${mod.duration.split(' ')[0]}/${mod.duration.split(' ')[0]} ${mod.duration.split(' ')[1] || 'hours'}` : '40/40 hours'}
                    />
                </CertificateScaler>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MyCertificates;
