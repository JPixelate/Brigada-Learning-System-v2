import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Plus, BookOpen, Users, Clock, ChevronRight, ArrowLeft, Target, Layers, Play, Settings, GripVertical, Trash2, Map, HelpCircle, X, Lightbulb, MousePointerClick, Sparkles, ArrowRight, CheckCircle2, Search, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';

import { DBStructure, Module, LearningPath } from '../types';

import { useData } from '../context/DataContext';

const DocumentationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'purpose' | 'howto' | 'effects'>('purpose');

  if (!isOpen) return null;

  const tabs = [
    { id: 'purpose' as const, label: 'Purpose', icon: Lightbulb },
    { id: 'howto' as const, label: 'How To Use', icon: MousePointerClick },
    { id: 'effects' as const, label: 'User Impact', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-main-surface rounded-2xl border border-main-border shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-main-border bg-main-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
              <BookOpen size={18} className="text-brand-primary-text" />
            </div>
            <div>
              <h2 className="text-base font-bold text-main-heading">Learning Paths Guide</h2>
              <p className="text-[11px] text-slate-400 font-medium">Everything you need to know about career roadmaps</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-bg rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 mx-5 mt-4 bg-main-bg rounded-xl border border-main-border">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-brand-primary-text shadow-sm'
                    : 'text-slate-400 hover:text-main-heading hover:bg-main-surface'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'purpose' && (
            <div className="space-y-4 fade-in">
              <div className="p-4 bg-main-bg rounded-xl border border-main-border">
                <h3 className="text-sm font-bold text-main-heading mb-2 flex items-center gap-2">
                  <Lightbulb size={15} className="text-amber-500" /> What are Learning Paths?
                </h3>
                <p className="text-xs text-main-text leading-relaxed">
                  Learning Paths are <strong className="text-main-heading">curated career roadmaps</strong> that sequence multiple training modules into a structured, step-by-step learning journey. Instead of employees browsing individual modules randomly, Learning Paths guide them through a logical progression of courses.
                </p>
              </div>

              <div className="p-4 bg-main-bg rounded-xl border border-main-border">
                <h3 className="text-sm font-bold text-main-heading mb-2 flex items-center gap-2">
                  <Target size={15} className="text-blue-500" /> Key Concept
                </h3>
                <p className="text-xs text-main-text leading-relaxed mb-3">
                  Think of modules as <strong className="text-main-heading">individual courses</strong> and Learning Paths as a <strong className="text-main-heading">playlist of courses</strong> arranged in the right order for a specific goal.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-main-surface p-3 rounded-lg border border-main-border">
                  <span className="px-2 py-1 bg-brand-primary text-brand-primary-text rounded">Module A</span>
                  <ArrowRight size={12} />
                  <span className="px-2 py-1 bg-brand-primary text-brand-primary-text rounded">Module B</span>
                  <ArrowRight size={12} />
                  <span className="px-2 py-1 bg-brand-primary text-brand-primary-text rounded">Module C</span>
                  <span className="ml-1">=</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200">Learning Path</span>
                </div>
              </div>

              <div className="p-4 bg-main-bg rounded-xl border border-main-border">
                <h3 className="text-sm font-bold text-main-heading mb-2 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-500" /> Modules are NOT affected
                </h3>
                <p className="text-xs text-main-text leading-relaxed">
                  Learning Paths only <strong className="text-main-heading">reference</strong> existing modules — they do not modify, duplicate, or delete them. The same module can appear in multiple Learning Paths. Creating, editing, or deleting a path has zero impact on the modules themselves.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'howto' && (
            <div className="space-y-4 fade-in">
              {[
                { step: '1', title: 'Create a Roadmap', desc: 'Click the "Create Roadmap" button to start building a new Learning Path. Give it a title, description, and select the target department.' },
                { step: '2', title: 'Add Modules', desc: 'Browse and add existing modules to your path. Arrange them in the order employees should complete them — drag to reorder as needed.' },
                { step: '3', title: 'Set Target Audience', desc: 'Choose which department or team will see this path. Only employees in the selected audience will have this roadmap recommended to them.' },
                { step: '4', title: 'Activate the Path', desc: 'Set the status to "Active" to make it visible to employees. Use "Draft" to save work-in-progress paths that are not ready yet.' },
                { step: '5', title: 'Monitor Progress', desc: 'Track enrollment counts and monitor how employees progress through each module in the sequence from the path detail view.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4 p-4 bg-main-bg rounded-xl border border-main-border">
                  <div className="flex-shrink-0 w-9 h-9 bg-brand-primary text-brand-primary-text rounded-lg flex items-center justify-center font-black text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-main-heading mb-1">{item.title}</h4>
                    <p className="text-xs text-main-text leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'effects' && (
            <div className="space-y-4 fade-in">
              <div className="p-4 bg-main-bg rounded-xl border border-main-border">
                <h3 className="text-sm font-bold text-main-heading mb-2 flex items-center gap-2">
                  <Users size={15} className="text-violet-500" /> What Employees See
                </h3>
                <p className="text-xs text-main-text leading-relaxed">
                  Employees in the <strong className="text-main-heading">target department</strong> will see the Learning Path as a recommended career roadmap. It appears as a guided, step-by-step journey showing which module to complete first, second, and so on — giving them a clear direction for their learning.
                </p>
              </div>

              <div className="p-4 bg-main-bg rounded-xl border border-main-border">
                <h3 className="text-sm font-bold text-main-heading mb-3 flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-500" /> Benefits for Employees
                </h3>
                <ul className="space-y-2.5">
                  {[
                    'Structured progression instead of random module selection',
                    'Clear visibility into what skills they\'ll gain and in what order',
                    'Motivation through step-by-step milestone tracking',
                    'Department-specific relevance — they only see paths meant for them',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-main-text leading-relaxed">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/30">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <Lightbulb size={15} /> Important Note
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Learning Paths are an <strong>organizational layer</strong> — they group and sequence modules but do not change module content, enrollments, or settings. Modules remain fully independent and can be managed separately from the Manage Modules page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-main-border bg-main-bg/50">
          <button onClick={onClose} className="w-full py-2.5 bg-brand-primary text-brand-primary-text rounded-xl font-bold text-xs hover:bg-brand-hover transition-all active:scale-[0.98]">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateRoadmapModal = ({ isOpen, onClose, onSubmit, allModules, departments }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (path: LearningPath) => void;
  allModules: Module[];
  departments: string[];
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Draft');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [moduleSearch, setModuleSearch] = useState('');
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  if (!isOpen) return null;

  const availableModules = allModules.filter(
    m => !selectedModules.includes(m.id) &&
    m.title.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  const addModule = (id: string) => {
    setSelectedModules(prev => [...prev, id]);
    setModuleSearch('');
    setShowModuleDropdown(false);
  };

  const removeModule = (id: string) => {
    setSelectedModules(prev => prev.filter(mid => mid !== id));
  };

  const moveModule = (idx: number, direction: 'up' | 'down') => {
    const newArr = [...selectedModules];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newArr.length) return;
    [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
    setSelectedModules(newArr);
  };

  const isValid = title.trim() && description.trim() && targetAudience;

  const handleSubmit = () => {
    if (!isValid) return;
    const h = parseInt(durationHours) || 0;
    const m = parseInt(durationMinutes) || 0;
    const duration = h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : m > 0 ? `${m}m` : '0h';

    onSubmit({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      moduleCount: selectedModules.length,
      enrolledCount: 0,
      duration,
      status,
      targetAudience,
      modules: selectedModules,
    });

    setTitle('');
    setDescription('');
    setTargetAudience('');
    setStatus('Draft');
    setSelectedModules([]);
    setDurationHours('');
    setDurationMinutes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-main-surface rounded-2xl border border-main-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-main-border bg-main-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
              <GitBranch size={18} className="text-brand-primary-text" />
            </div>
            <div>
              <h2 className="text-base font-bold text-main-heading">Create New Roadmap</h2>
              <p className="text-[11px] text-slate-400 font-medium">Build a structured learning journey for your team</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-bg rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Roadmap Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Frontend Mastery"
              className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm text-main-heading font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what employees will learn in this roadmap..."
              rows={3}
              className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm text-main-heading font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all resize-none"
            />
          </div>

          {/* Target Audience + Status row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target Department *</label>
              <div className="relative">
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm text-main-heading font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus('Draft')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    status === 'Draft'
                      ? 'bg-main-bg border-brand-primary text-main-heading shadow-sm'
                      : 'border-main-border text-slate-400 hover:bg-main-bg'
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setStatus('Active')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    status === 'Active'
                      ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                      : 'border-main-border text-slate-400 hover:bg-main-bg'
                  }`}
                >
                  Active
                </button>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Duration</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={durationHours}
                  onChange={e => setDurationHours(e.target.value)}
                  placeholder="0"
                  className="w-20 px-3 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm text-main-heading font-medium text-center placeholder:text-slate-300 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
                />
                <span className="text-xs font-bold text-slate-400">hrs</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  placeholder="0"
                  className="w-20 px-3 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm text-main-heading font-medium text-center placeholder:text-slate-300 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
                />
                <span className="text-xs font-bold text-slate-400">min</span>
              </div>
            </div>
          </div>

          {/* Module Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Modules ({selectedModules.length} selected)
            </label>

            {/* Search & Add */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={moduleSearch}
                onChange={e => { setModuleSearch(e.target.value); setShowModuleDropdown(true); }}
                onFocus={() => setShowModuleDropdown(true)}
                placeholder="Search modules to add..."
                className="w-full pl-9 pr-4 py-2.5 bg-main-bg border border-main-border rounded-xl text-sm text-main-heading font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
              {showModuleDropdown && availableModules.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-main-surface border border-main-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {availableModules.map(m => (
                    <button
                      key={m.id}
                      onClick={() => addModule(m.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-main-bg transition-colors text-left border-b border-main-border last:border-b-0"
                    >
                      <Plus size={14} className="text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-main-heading truncate">{m.title}</p>
                        <p className="text-[11px] text-slate-400">{m.instructor} &middot; {m.duration || 'No duration'}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        m.status === 'Published' ? 'text-green-600 bg-green-50 border-green-100' : 'text-slate-400 bg-main-bg border-main-border'
                      }`}>{m.status}</span>
                    </button>
                  ))}
                </div>
              )}
              {showModuleDropdown && moduleSearch && availableModules.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-main-surface border border-main-border rounded-xl shadow-lg z-10 p-4 text-center text-xs text-slate-400 font-medium">
                  No matching modules found
                </div>
              )}
            </div>

            {/* Click-away listener */}
            {showModuleDropdown && (
              <div className="fixed inset-0 z-[5]" onClick={() => setShowModuleDropdown(false)} />
            )}

            {/* Selected modules list */}
            {selectedModules.length > 0 ? (
              <div className="space-y-2">
                {selectedModules.map((mid, idx) => {
                  const mod = allModules.find(m => m.id === mid);
                  if (!mod) return null;
                  return (
                    <div key={mid} className="flex items-center gap-3 p-3 bg-main-bg rounded-xl border border-main-border group">
                      <div className="w-7 h-7 bg-brand-primary text-brand-primary-text rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-main-heading truncate">{mod.title}</p>
                        <p className="text-[11px] text-slate-400">{mod.instructor}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveModule(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-slate-400 hover:text-main-heading hover:bg-main-surface rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={14} className="rotate-[-90deg]" />
                        </button>
                        <button
                          onClick={() => moveModule(idx, 'down')}
                          disabled={idx === selectedModules.length - 1}
                          className="p-1.5 text-slate-400 hover:text-main-heading hover:bg-main-surface rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={14} className="rotate-90" />
                        </button>
                        <button
                          onClick={() => removeModule(mid)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-main-border rounded-xl flex flex-col items-center justify-center gap-2">
                <Layers size={20} className="text-slate-300" />
                <p className="text-xs font-bold text-slate-400">No modules added yet</p>
                <p className="text-[11px] text-slate-400">Search above to add modules to this roadmap</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-main-border bg-main-bg/50 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-xs border border-main-border text-main-text hover:bg-main-bg transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 py-2.5 bg-brand-primary text-brand-primary-text rounded-xl font-bold text-xs hover:bg-brand-hover transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Create Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};

const LearningPaths = () => {
  const { data, addLearningPath } = useData();
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const paths: LearningPath[] = data.learningPaths;
  const allModules: Module[] = data.modules;

  const getModuleById = (id: string) => allModules.find(m => m.id === id);

  if (selectedPath) {
    const activeModules = selectedPath.modules.map(id => getModuleById(id)).filter(Boolean) as Module[];

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Detail Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedPath(null)}
              className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-bg rounded-full transition-colors border border-transparent hover:border-main-border"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 bg-brand-primary text-brand-primary-text px-5 py-2 rounded-full font-bold text-xs shadow-sm hover:bg-brand-hover transition-all active:scale-95">
                <Plus size={14} />
                Add Module
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-main-border text-main-text font-bold text-xs hover:bg-main-bg transition-all">
                <Settings size={14} />
                Settings
              </button>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            selectedPath.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-main-bg text-slate-500 border border-main-border'
          }`}>
            {selectedPath.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Path Timeline/Sequence */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-main-surface p-5 rounded-xl border border-main-border shadow-sm transition-colors">
              <h3 className="text-sm font-bold text-main-heading uppercase tracking-widest mb-6 flex items-center gap-2">
                <Layers size={16} className="text-slate-400" /> Curriculum Sequence
              </h3>

              <div className="space-y-4">
                {activeModules.length > 0 ? (
                  activeModules.map((module, idx) => (
                    <div key={module.id} className="relative">
                      {/* Connector Line */}
                      {idx !== activeModules.length - 1 && (
                         <div className="absolute left-[27px] top-12 bottom-[-20px] w-0.5 bg-main-border"></div>
                      )}
                      
                      <div className="flex items-center gap-4 group p-4 bg-main-bg hover:bg-main-surface border border-transparent hover:border-main-border rounded-xl transition-all hover:shadow-sm">
                        <div className="flex-shrink-0 w-14 h-14 bg-main-surface border border-main-border rounded-lg flex items-center justify-center font-bold text-slate-400 group-hover:text-main-heading transition-colors relative">
                          <span className="text-xs absolute -top-2 -left-2 w-6 h-6 bg-brand-primary text-brand-primary-text rounded-full flex items-center justify-center border-2 border-main-surface">{idx + 1}</span>
                          <Play size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-main-heading truncate">{module.title}</h4>
                           <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-main-surface px-1.5 py-0.5 border border-main-border rounded">{module.status}</span>
                              <span className="text-xs text-slate-500 font-medium">Instructor: {module.instructor}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><GripVertical size={18} /></button>
                           <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 border-2 border-dashed border-main-border rounded-xl flex flex-col items-center justify-center gap-3">
                     <div className="w-12 h-12 bg-main-bg rounded-full flex items-center justify-center text-slate-300">
                        <Layers size={24} />
                     </div>
                     <p className="text-sm font-bold text-slate-400">No modules added to this path yet.</p>
                     <button className="text-xs font-bold text-main-heading uppercase underline underline-offset-4 decoration-main-border hover:decoration-brand-primary transition-all">Browse Modules</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Audience */}
          <div className="lg:col-span-4 space-y-4">
             <div className="bg-main-surface p-5 rounded-xl border border-main-border shadow-sm space-y-4 transition-colors">
                <h3 className="text-sm font-bold text-main-heading uppercase tracking-widest flex items-center gap-2">
                  <Target size={16} className="text-slate-400" /> Target Audience
                </h3>
                                <div className="p-4 bg-brand-primary rounded-xl space-y-3 shadow-md">
                    <div className="flex items-center gap-3 text-brand-primary-text">
                       <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <Users size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 leading-none mb-1">Assigned Department</p>
                          <p className="text-sm font-bold">{selectedPath.targetAudience}</p>
                       </div>
                    </div>
                    <div className="pt-3 border-t border-main-bg/10">
                       <p className="text-[11px] font-bold opacity-60 italic">Employees in this department will see this path as a recommended roadmap.</p>
                    </div>
                </div>
             </div>

             <div className="bg-main-surface p-5 rounded-xl border border-main-border shadow-sm space-y-4 transition-colors">
                <h3 className="text-sm font-bold text-main-heading uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" /> Path Overview
                </h3>

                <div className="space-y-4">
                   <div className="flex justify-between items-center py-3 border-b border-main-border">
                      <span className="text-xs font-bold text-slate-500 uppercase">Total Duration</span>
                      <span className="text-sm font-bold text-main-heading">{selectedPath.duration}</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-main-border">
                      <span className="text-xs font-bold text-slate-500 uppercase">Module Count</span>
                      <span className="text-sm font-bold text-main-heading">{selectedPath.moduleCount}</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-main-border">
                      <span className="text-xs font-bold text-slate-500 uppercase">Enrolled Students</span>
                      <span className="text-sm font-bold text-main-heading">{selectedPath.enrolledCount}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Learning Paths"
        description="Curate 'Career Roadmaps' by sequencing multiple modules into a single journey."
        icon={Map}
        stats={[
          { label: 'Total Paths', value: paths.length },
          { label: 'Active Paths', value: paths.filter(p => p.status === 'Active').length }
        ]}
        actions={[
          {
            label: 'Documentation',
            icon: HelpCircle,
            variant: 'secondary',
            onClick: () => setShowDocs(true)
          },
          {
            label: 'Create Roadmap',
            icon: Plus,
            variant: 'primary',
            onClick: () => setShowCreate(true)
          }
        ]}
      />

      <DocumentationModal isOpen={showDocs} onClose={() => setShowDocs(false)} />
      <CreateRoadmapModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={addLearningPath}
        allModules={allModules}
        departments={data.commonData.departments}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         {paths.map(path => (
          <div 
            key={path.id} 
            onClick={() => setSelectedPath(path)}
            className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all group cursor-pointer relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-main-bg rounded-bl-[100px] -translate-y-8 translate-x-8 group-hover:bg-brand-primary/5 transition-colors"></div>
            
            <div className="relative flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <GitBranch size={22} className="text-brand-primary-text" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-main-heading">{path.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                         path.status === 'Active' 
                          ? 'text-green-600 bg-green-50 border-green-100' 
                          : 'text-slate-400 bg-main-bg border-main-border'
                       }`}>
                         {path.status}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{path.targetAudience}</span>
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-main-bg group-hover:bg-brand-primary group-hover:text-brand-primary-text rounded-lg transition-all border border-main-border">
                   <ChevronRight size={20} />
                </div>
              </div>

              <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
                {path.description}
              </p>

              <div className="mt-auto flex items-center justify-between pt-5 border-t border-main-border">
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                  <span className="flex items-center gap-1.5 bg-main-bg px-2 py-1 rounded transition-colors"><BookOpen size={13} className="text-slate-300" /> {path.moduleCount} Modules</span>
                  <span className="flex items-center gap-1.5 bg-main-bg px-2 py-1 rounded transition-colors"><Clock size={13} className="text-slate-300" /> {path.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-main-heading">
                   <Users size={14} className="text-slate-400" />
                   <span>{path.enrolledCount} Enrolled</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPaths;

