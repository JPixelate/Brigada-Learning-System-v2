import React, { useState } from 'react';
import { X, Sparkles, Upload, FileText, Type, Clock, AlertCircle, Users, Link2, Search } from 'lucide-react';
import { generateFullModuleStructure } from '../services/geminiService';

interface AIModuleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: { 
    title: string; 
    description: string; 
    duration: string;
    availability: 'always' | 'range';
    assignmentType: string;
    selectedAudience: string[];
    prerequisites: string[];
    sections: any[] 
  }) => void;
  lookups: {
    existingModules: { id: string; title: string }[];
    audienceLists: Record<string, string[]>;
  };
}

const AIModuleGeneratorModal: React.FC<AIModuleGeneratorModalProps> = ({ isOpen, onClose, onGenerated, lookups }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [availability, setAvailability] = useState<'always' | 'range'>('always');
  const [assignmentType, setAssignmentType] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [prereqSearch, setPrereqSearch] = useState('');
  const [details, setDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleAudienceItem = (item: string) => {
    setSelectedAudience(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const togglePrerequisite = (mid: string) => {
    setPrerequisites(prev => prev.includes(mid) ? prev.filter(id => id !== mid) : [...prev, mid]);
  };

  const handleGenerate = async () => {
    if (!title || !description || !details) {
      setError('Please fill in module title, description, and source details to architect the curriculum.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateFullModuleStructure(title, description, details);
      if (result && result.sections) {
        onGenerated({
          title,
          description,
          duration,
          availability,
          assignmentType,
          selectedAudience,
          prerequisites,
          sections: result.sections
        });
        onClose();
      } else {
        setError('The AI was unable to generate a valid structure. Please try again with more specific details.');
      }
    } catch (err) {
      setError('An error occurred while communicating with the AI. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentAudienceList = lookups.audienceLists[assignmentType] || [];
  const filteredPrereqs = lookups.existingModules.filter(m => 
    m.title.toLowerCase().includes(prereqSearch.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple text extraction for .txt files
    // For .pdf or .docx, in a real app we'd use pdfjs or mammoth
    // Here we'll handle .txt and provide feedback for others
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setDetails(prev => prev ? `${prev}\n\n--- Extracted from ${file.name} ---\n${text}` : text);
      };
      reader.readAsText(file);
    } else {
      // Simulation for other formats or prompting user
      setDetails(prev => prev ? `${prev}\n\n[Attached: ${file.name}] - (AI will prioritize curriculum based on this file name and your summary)` : `[Attached: ${file.name}]`);
      setError(`Note: Deep text extraction for ${file.name.split('.').pop()?.toUpperCase()} is simulated. The AI will still use the file reference for context.`);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-main-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-main-border animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-main-border flex justify-between items-center bg-gradient-to-r from-brand-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/20 rounded-xl text-brand-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-main-heading">AI Module Architect</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Automated Instructional Design</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-main-bg rounded-full text-slate-400 hover:text-main-heading transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Section 1: Identity & Timing */}
          <div className="space-y-4">
             <h4 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-4 h-0.5 bg-brand-primary rounded-full" />
                Module Identity
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module Title</label>
                 <input 
                   type="text" 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder="e.g. Cybersecurity Essentials"
                   className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm font-bold text-main-heading outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (e.g. 40 hours)</label>
                 <input 
                   type="text" 
                   value={duration}
                   onChange={(e) => setDuration(e.target.value)}
                   placeholder="e.g. 2 hours"
                   className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm font-bold text-main-heading outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all"
                 />
               </div>
             </div>
          </div>

          {/* Section 2: Goals & Context */}
          <div className="space-y-4">
             <h4 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-4 h-0.5 bg-brand-primary rounded-full" />
                Curriculum Strategy
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning Objectives</label>
                 <textarea 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="What should employees learn from this module?"
                   className="w-full h-32 px-4 py-3 bg-main-bg border border-main-border rounded-xl text-sm font-bold text-main-heading outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all resize-none shadow-inner"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Content / Specific Details</label>
                 <textarea 
                   value={details}
                   onChange={(e) => setDetails(e.target.value)}
                   placeholder="Enter details or snippet for AI to expand into sections..."
                   className="w-full h-32 px-4 py-3 bg-main-bg border border-main-border rounded-xl text-sm font-bold text-main-heading outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all resize-none shadow-inner"
                 />
                 <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="file" 
                      id="ai-architect-upload" 
                      className="hidden" 
                      accept=".txt,.pdf,.docx"
                      onChange={handleFileUpload}
                    />
                    <button 
                      onClick={() => document.getElementById('ai-architect-upload')?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/5 border border-brand-primary/20 rounded-lg text-[10px] font-black text-brand-primary uppercase hover:bg-brand-primary/10 transition-all shrink-0"
                    >
                        <Upload size={12} />
                        Attach Document
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold">PDF, DOCX, TXT support</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Section 3: Distribution Settings */}
          <div className="space-y-4">
             <h4 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-4 h-0.5 bg-brand-primary rounded-full" />
                Deployment & Restrictions
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Availability */}
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</label>
                 <div className="flex gap-2 p-1 bg-main-bg border border-main-border rounded-xl">
                   <button 
                     onClick={() => setAvailability('always')}
                     className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${availability === 'always' ? 'bg-brand-primary text-brand-primary-text shadow-sm' : 'text-slate-500 hover:text-main-heading'}`}
                   >
                     Always
                   </button>
                   <button 
                     onClick={() => setAvailability('range')}
                     className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${availability === 'range' ? 'bg-brand-primary text-brand-primary-text shadow-sm' : 'text-slate-500 hover:text-main-heading'}`}
                   >
                     Range
                   </button>
                 </div>
               </div>

               {/* Audience */}
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Audience Type</label>
                 <select 
                   value={assignmentType} 
                   onChange={e => {setAssignmentType(e.target.value); setSelectedAudience([])}} 
                   className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-xl text-[10px] font-black uppercase outline-none text-main-heading transition-colors"
                 >
                   <option value="all">Everywhere</option>
                   <option value="company">By Company</option>
                   <option value="department">By Department</option>
                   <option value="position">By Position</option>
                   <option value="business_unit">By Business Unit</option>
                   <option value="rank">By Rank/Band</option>
                 </select>
               </div>

               {/* Prerequisites */}
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prerequisites</label>
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     value={prereqSearch} 
                     onChange={e => setPrereqSearch(e.target.value)} 
                     placeholder="Search modules..." 
                     className="w-full pl-9 pr-3 py-2 bg-main-bg border border-main-border rounded-xl text-xs outline-none text-main-heading font-bold" 
                   />
                 </div>
               </div>
             </div>

             {/* Dynamic Multi-Selects */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audience Selection */}
                {assignmentType !== 'all' && (
                  <div className="p-4 bg-main-bg border border-main-border rounded-2xl">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Specific {assignmentType}s</label>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
                      {currentAudienceList.map(item => (
                        <button 
                          key={item} 
                          onClick={() => toggleAudienceItem(item)} 
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                            selectedAudience.includes(item) 
                              ? 'bg-brand-primary text-brand-primary-text border-brand-primary shadow-sm' 
                              : 'bg-main-surface text-main-text border-main-border hover:bg-main-bg'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites Selection */}
                <div className="p-4 bg-main-bg border border-main-border rounded-2xl">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Selected Prerequisites</label>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
                    {filteredPrereqs.map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => togglePrerequisite(m.id)} 
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                          prerequisites.includes(m.id) 
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                            : 'bg-main-surface text-main-text border-main-border hover:bg-main-bg'
                        }`}
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-main-border bg-main-bg flex justify-between items-center transition-colors">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:block italic">
            * AI generates curriculum, sections, and component mapping automatically.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-main-border bg-main-surface text-slate-600 font-bold text-sm hover:bg-main-bg transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-10 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-purple-600 text-brand-primary-text font-black text-sm hover:shadow-lg hover:shadow-brand-primary/30 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Architecting...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Architecture
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModuleGeneratorModal;
