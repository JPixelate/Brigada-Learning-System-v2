import React, { useRef, useEffect, useState } from 'react';
import { Award, GraduationCap } from 'lucide-react';
import { CertificateTemplate, Signatory } from '../types';

// Fixed certificate canvas dimensions (A4 landscape proportions)
export const CERT_WIDTH = 1100;
export const CERT_HEIGHT = 778;

export interface CertificateContentProps {
  cert: CertificateTemplate;
  systemName: string;
  recipientName?: string;
  certificateNumber?: string;
  issuedDate?: string;
  moduleTitle?: string;
  completionHours?: string;
}

/**
 * Certificate rendered at fixed pixel dimensions (1100×778).
 * All internal text, spacing, and layout uses fixed px values
 * so the certificate looks identical regardless of screen size.
 *
 * Wrap with <CertificateScaler> to auto-fit a container,
 * or <CertificateThumbnail> for a small preview.
 */
export const CertificateContent = ({
  cert,
  systemName,
  recipientName,
  certificateNumber,
  issuedDate,
  moduleTitle,
  completionHours,
}: CertificateContentProps) => {
  const displayName = recipientName || 'John S. Candidate';
  const displayDate = issuedDate || 'October 24, 2026';
  const displayModule = moduleTitle || cert.name;

  const signatories: Signatory[] = cert.signatories ||
    (cert.signatoryName ? [{ name: cert.signatoryName, title: cert.signatoryTitle || '' }] : []);

  return (
    <div
      style={{ width: CERT_WIDTH, height: CERT_HEIGHT }}
      className="bg-white overflow-hidden relative rounded-sm shrink-0 shadow-2xl"
    >
      {/* Universal Premium Background */}
      <div className="absolute inset-0 z-0 select-none">
        <img 
          src={cert.backgroundImage || "/images/academy_cert_bg.webp"} 
          alt="" 
          className="w-full h-full object-cover" 
          draggable={false} 
        />
      </div>

      {/* Decorative Overlay for depth */}
      <div className="absolute inset-0 z-5 pointer-events-none bg-gradient-to-b from-white/5 to-transparent" />

      {/* Certificate Content */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center text-center justify-between"
        style={{ padding: '60px 80px' }}
      >
        {/* ── Top: Header ── */}
        <div className="w-full flex justify-between items-start">
          <div className="text-left">
            <div 
              className="font-black text-slate-900/10 select-none uppercase"
              style={{ fontSize: 40, lineHeight: 1, letterSpacing: '-0.02em', marginTop: -10 }}
            >
              {systemName}
            </div>
          </div>
          <div className="text-right">
             {certificateNumber && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certificate ID</span>
                <span className="font-mono text-slate-900 font-bold" style={{ fontSize: 12 }}>
                  {certificateNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Middle: Main Body ── */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <div className="flex flex-col items-center mb-2">
            <div className="w-16 h-1 bg-slate-900 mb-6 rounded-full" />
            <h1
              className="font-bold text-slate-900 uppercase italic tracking-tighter"
              style={{ fontSize: 48, lineHeight: 0.9 }}
            >
              Certificate
            </h1>
            <h2
              className="font-medium text-slate-500 uppercase tracking-[0.4em] mt-2"
              style={{ fontSize: 14 }}
            >
              of Completion
            </h2>
          </div>

          <p className="font-serif italic text-slate-500 mt-4" style={{ fontSize: 18 }}>
            This certificate is awarded to
          </p>

          <div className="relative py-4">
            <div
              className="font-black text-slate-900 uppercase tracking-tight"
              style={{
                fontSize: 52,
                lineHeight: 1,
              }}
            >
              {displayName}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-px bg-slate-200" />
          </div>

          <div className="max-w-[800px] mt-4">
            <p
              className="text-slate-600 font-medium"
              style={{ fontSize: 17, lineHeight: 1.6 }}
            >
              For successfully completing 
              <span className="font-bold text-slate-900"> {completionHours || '40/40'} </span> 
              hours of the 
              <span className="font-bold text-slate-900 italic"> {displayModule} </span>
              conducted through the 
              <span className="font-bold text-slate-900"> {systemName} </span>
              on 
              <span className="font-bold text-slate-900"> {displayDate}</span>.
            </p>
            
            <p className="text-slate-400 mt-8 font-semibold uppercase tracking-widest" style={{ fontSize: 10 }}>
              Validated by the <span className="text-slate-900">{systemName}</span> Authority
            </p>
          </div>
        </div>

        {/* ── Bottom: Signatories & Seal ── */}
        <div className="w-full flex items-end justify-between px-10">
          {/* Left Signatory */}
          {signatories[0] && (
            <div className="text-center w-48">
              <div 
                className="font-serif italic text-slate-800 mb-1"
                style={{ fontSize: 22 }}
              >
                {signatories[0].name}
              </div>
              <div className="border-t-2 pt-2" style={{ borderTopColor: cert.primaryColor }}>
                <p className="font-black text-slate-900 uppercase" style={{ fontSize: 10 }}>{signatories[0].name}</p>
                <p className="font-bold text-slate-400 uppercase tracking-tighter" style={{ fontSize: 8 }}>{signatories[0].title}</p>
              </div>
            </div>
          )}

          {/* Golden Seal Placeholder */}
          <div className="relative group">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-100 ring-4 ring-slate-900/5 transition-transform group-hover:scale-110"
              style={{ backgroundColor: cert.primaryColor }}
            >
              <Award size={40} className="text-white" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-[spin_20s_linear_infinite]" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white text-slate-900 text-[8px] font-black px-2 py-1 rounded-full border border-slate-900">
              OFFICIAL
            </div>
          </div>

          {/* Right Signatory or Date */}
          {signatories[1] ? (
            <div className="text-center w-48">
              <div 
                className="font-serif italic text-slate-800 mb-1"
                style={{ fontSize: 22 }}
              >
                {signatories[1].name}
              </div>
              <div className="border-t-2 pt-2" style={{ borderTopColor: cert.primaryColor }}>
                <p className="font-black text-slate-900 uppercase" style={{ fontSize: 10 }}>{signatories[1].name}</p>
                <p className="font-bold text-slate-400 uppercase tracking-tighter" style={{ fontSize: 8 }}>{signatories[1].title}</p>
              </div>
            </div>
          ) : (
            <div className="text-center w-48">
              <div className="font-bold text-slate-900 mb-2" style={{ fontSize: 14 }}>
                {displayDate}
              </div>
              <div className="border-t-2 pt-2" style={{ borderTopColor: cert.primaryColor }}>
                <p className="font-black text-slate-900 uppercase" style={{ fontSize: 10 }}>Date of Issuance</p>
                <p className="font-bold text-slate-400 uppercase tracking-tighter" style={{ fontSize: 8 }}>Official Record</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Patterns */}
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
          <path d="M0,100 L100,0 L100,100 Z" />
        </svg>
      </div>
    </div>
  );
};


/**
 * Auto-scales the certificate to fit the container width.
 * Uses ResizeObserver so it adapts to layout changes.
 */
export const CertificateScaler = ({
  children,
  maxScale = 1,
  className = '',
}: {
  children: React.ReactNode;
  maxScale?: number;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const containerWidth = el.clientWidth;
      setScale(Math.min(containerWidth / CERT_WIDTH, maxScale));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxScale]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {scale > 0 && (
        <div style={{ height: CERT_HEIGHT * scale, overflow: 'hidden' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};


/**
 * Small fixed-scale thumbnail of the certificate.
 */
export const CertificateThumbnail = ({
  scale = 0.26,
  ...props
}: CertificateContentProps & { scale?: number }) => {
  return (
    <div style={{ width: CERT_WIDTH * scale, height: CERT_HEIGHT * scale, overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <CertificateContent {...props} />
      </div>
    </div>
  );
};
