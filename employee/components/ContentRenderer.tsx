import React from 'react';
import { BookOpen, Video, Presentation, Headphones, ScrollText, Paperclip, Link2, ExternalLink, Info, Settings, ShieldCheck, Wifi, WifiOff, Clock, CheckCircle, Circle } from 'lucide-react';
import { ModuleComponent } from '../../types';

interface ContentRendererProps {
  component: ModuleComponent;
  timerDisplay?: React.ReactNode; // Optional timer display from parent
}

const ContentRenderer = ({ component, timerDisplay }: ContentRendererProps) => {
  const typeIcons: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    reading: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Reading Material' },
    video: { icon: Video, color: 'text-red-600', bg: 'bg-red-50', label: 'Video Lesson' },
    lecture: { icon: Presentation, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Lecture' },
    podcast: { icon: Headphones, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Podcast' },
    narrative: { icon: ScrollText, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Narrative' },
  };

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = React.useState(false);

  const [activeUrl, setActiveUrl] = React.useState<string>(
    component.resolutions?.[0]?.url || (typeof component.content === 'string' && component.content.startsWith('http') ? component.content : '')
  );
  const [activeRes, setActiveRes] = React.useState<string>(component.resolutions?.[0]?.label || 'Original');
  const [showResMenu, setShowResMenu] = React.useState(false);

  // Sync resolution changes without losing time
  const handleResolutionChange = (newUrl: string, newLabel: string) => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const isPaused = videoRef.current.paused;
    
    setActiveUrl(newUrl);
    setActiveRes(newLabel);
    setShowResMenu(false);
    setIsBuffering(true);

    // After source updates, restore time
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (!isPaused) videoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  React.useEffect(() => {
    if (component.resolutions?.length) {
      setActiveUrl(component.resolutions[0].url);
      setActiveRes(component.resolutions[0].label);
    }
  }, [component.resolutions, component.id]); // Added component.id to reset on navigation

  const meta = typeIcons[component.type] || typeIcons.reading;
  const Icon = meta.icon;

  if (component.type === 'quiz') return null;

  return (
    <div className="space-y-6">
      {/* Type Badge & Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${meta.bg}`}>
            <Icon size={16} className={meta.color} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timer Display */}
          {timerDisplay && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-brand-primary/10 to-purple-500/10 border border-brand-primary/20 rounded-full">
              <Clock size={14} className="text-brand-primary animate-pulse" />
              <span className="text-sm font-black text-brand-primary tabular-nums">
                {timerDisplay}
              </span>
            </div>
          )}
          
          {component.minWords && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200 uppercase">
              <Info size={12} />
              Min. {component.minWords} words
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-black text-main-heading tracking-tight">{component.title}</h2>

      {/* Main Narrative/Content Information */}
      {component.type === 'narrative' && component.minWords && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <ScrollText size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900">Writing Assignment</h4>
            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
              This section requires a narrative submission with at least <strong>{component.minWords} words</strong>. 
              {component.fileUrl && " Please refer to the attached document for guidelines."}
            </p>
          </div>
        </div>
      )}

      {/* Primary Content Area */}
      {component.type === 'video' ? (
        <div className="space-y-4">
          <div className="relative bg-[#0a0a0b] rounded-2xl aspect-video flex flex-col items-center justify-center overflow-hidden border border-white/5 group shadow-2xl">
            {/* Buffering Spinner */}
            {isBuffering && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Video Player */}
            {activeUrl ? (
              <video 
                ref={videoRef}
                key={activeUrl}
                src={activeUrl} 
                className="w-full h-full object-contain"
                controls
                autoPlay={false}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onSeeking={() => setIsBuffering(true)}
                onSeeked={() => setIsBuffering(false)}
              />
            ) : (
              <div className="text-center p-6">
                 <Video size={56} className="mx-auto text-slate-800 mb-4 opacity-20" />
                 <p className="text-slate-500 font-bold">No High-Def Source Found</p>
              </div>
            )}

            {/* Quality Switcher Overlay */}
            {component.resolutions && component.resolutions.length > 0 && (
              <div className="absolute top-4 right-4 z-20">
                <div className="relative">
                  <button 
                    onClick={() => setShowResMenu(!showResMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md text-white/90 rounded-lg border border-white/10 hover:bg-black/60 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-wider shadow-lg"
                  >
                    <Settings size={12} className={showResMenu ? 'animate-spin-slow' : ''} />
                    {activeRes}
                  </button>

                  {showResMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1b1e] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                      <div className="px-3 py-2 border-b border-white/5 bg-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Streaming Quality</p>
                      </div>
                      <div className="p-1">
                        {component.resolutions.map((res) => (
                          <button
                            key={res.label}
                            onClick={() => handleResolutionChange(res.url, res.label)}
                            className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between mb-0.5 ${
                              activeRes === res.label ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {activeRes === res.label ? <CheckCircle size={14} /> : <Circle size={14} className="opacity-20" />}
                              {res.label}
                            </div>
                            {res.label.includes('1080') && <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">HQ</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connection Status Badge */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
                 {activeRes.includes('1080') || activeRes.includes('720') ? (
                    <Wifi size={12} className="text-emerald-400" />
                 ) : (
                    <WifiOff size={12} className="text-amber-400" />
                 )}
                 <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">
                   {activeRes.includes('1080') || activeRes.includes('720') ? 'High Speed' : 'Data Saver'}
                 </span>
               </div>
            </div>
          </div>
          
          {component.externalUrl && (
            <a 
              href={component.externalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20"
            >
              <ExternalLink size={18} />
              Watch on YouTube / External Platform
            </a>
          )}
        </div>
      ) : component.type === 'podcast' ? (
        <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-2xl p-8 border border-orange-200/50 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 rotate-3 transition-transform hover:rotate-0">
              <Headphones size={44} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl font-black text-slate-800">{component.title}</p>
              <p className="text-sm font-bold text-orange-600 mt-1 uppercase tracking-wider">Audio Lesson • 12:45</p>
              <div className="mt-6 space-y-3">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-orange-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <span>04:15</span>
                  <span>12:45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="prose prose-slate prose-sm max-w-none text-main-text leading-relaxed bg-main-surface rounded-2xl p-8 border border-main-border shadow-sm">
          {typeof component.content === 'string' ? (
            <div className="whitespace-pre-wrap">{component.content}</div>
          ) : (
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(component.content, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Resources & Attachments Section */}
      {(component.fileUrl || component.externalUrl) && (
        <div className="pt-4 border-t border-main-border space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Paperclip size={14} />
            Learning Resources
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {component.fileUrl && (
              <a 
                href={component.fileUrl} 
                className="flex items-center gap-3 p-4 bg-main-surface border border-main-border rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
              >
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Paperclip size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-main-heading truncate">Download Attachment</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Resource File / PDF</p>
                </div>
              </a>
            )}
            {component.externalUrl && component.type !== 'video' && (
              <a 
                href={component.externalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-main-surface border border-main-border rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
              >
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Link2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-main-heading truncate">External Link</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Visit Platform</p>
                </div>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentRenderer;
