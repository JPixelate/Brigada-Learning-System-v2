import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Save, Plus, Trash2, GripVertical, 
  BookOpen, Video, Mic, Cast, FileText, CheckSquare, 
  LayoutList, ChevronDown, ChevronRight, X,
  Calendar, Users, Lock, Search,
  Link2, Paperclip, Upload, Type, Eye, Clock 
} from 'lucide-react';
import ModulePreviewModal from '../components/ModulePreviewModal';
import AIModuleGeneratorModal from '../components/AIModuleGeneratorModal';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { generateModuleContent } from '../services/geminiService';
import { DBStructure, Module, Section, ModuleComponent, Question } from '../types';
import { useData } from '../context/DataContext';

type ComponentType = ModuleComponent['type'];
type ComponentCategory = ModuleComponent['category'];

// --- Helper Functions ---

const getTypeIcon = (type: ComponentType) => {
  switch (type) {
    case 'reading': return FileText;
    case 'video': return Video;
    case 'lecture': return Cast;
    case 'podcast': return Mic;
    case 'narrative': return LayoutList;
    case 'quiz': return CheckSquare;
    default: return BookOpen;
  }
};

const getTypeLabel = (type: ComponentType) => {
  switch (type) {
    case 'reading': return 'Reading Material';
    case 'video': return 'Video Lesson';
    case 'lecture': return 'Interactive Lecture';
    case 'podcast': return 'Audio Lesson';
    case 'narrative': return 'Narrative Writing';
    case 'quiz': return 'Multiple Choice Set';
    default: return 'Component';
  }
};

// --- Sortable Components ---

const SortableComponent = ({ 
  comp, 
  sectionId, 
  deleteComponent, 
  updateComponent, 
  updateQuestion,
  addOption,
  deleteOption,
  addQuestion,
  handleTranscode,
  onFileUpload
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: comp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getTypeIcon(comp.type);

  return (
    <div ref={setNodeRef} style={style} className="bg-main-bg p-5 rounded-lg border border-main-border space-y-4">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-main-surface/50 rounded transition-colors">
          <GripVertical size={16} className="text-slate-300" />
        </div>
        <Icon size={18} className="text-slate-500" />
        <input
          type="text"
          value={comp.title}
          onChange={(e) => updateComponent(sectionId, comp.id, 'title', e.target.value)}
          className="flex-1 text-sm font-medium text-main-heading bg-transparent outline-none focus:bg-main-surface px-3 py-1.5 rounded transition-colors focus:ring-1 focus:ring-brand-primary/20"
        />
        <span className="text-xs font-semibold text-slate-400 uppercase">{comp.category}</span>
        <button
          onClick={() => deleteComponent(sectionId, comp.id)}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {comp.type === 'quiz' ? (
        <div className="space-y-3 pl-9">
          {(comp.content as Question[]).map((q, qIdx) => (
            <div key={q.id} className="bg-main-surface p-4 rounded-lg border border-main-border space-y-3">
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestion(sectionId, comp.id, q.id, 'text', e.target.value)}
                placeholder={`Question ${qIdx + 1}`}
                className="w-full text-sm font-medium text-main-heading bg-transparent outline-none px-2 py-1"
              />
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const updatedOptions = q.options.map(o => ({
                          ...o,
                          isCorrect: o.id === opt.id
                        }));
                        updateQuestion(sectionId, comp.id, q.id, 'options', updatedOptions);
                      }}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                        opt.isCorrect
                          ? 'border-green-500 bg-green-500'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updatedOptions = q.options.map(o =>
                          o.id === opt.id ? { ...o, text: e.target.value } : o
                        );
                        updateQuestion(sectionId, comp.id, q.id, 'options', updatedOptions);
                      }}
                      placeholder="Option text..."
                      className="flex-1 text-sm text-slate-700 bg-transparent outline-none px-2 py-1"
                    />
                    {q.options.length > 3 && (
                      <button
                        onClick={() => deleteOption(sectionId, comp.id, q.id, opt.id)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(sectionId, comp.id, q.id)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase ml-8 mt-2"
                >
                  <Plus size={12} />
                  Add Option
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => addQuestion(sectionId, comp.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Plus size={14} />
            Add Question
          </button>
        </div>
      ) : (
        <div className="pl-9 space-y-4">
          <textarea
            value={comp.content as string}
            onChange={(e) => updateComponent(sectionId, comp.id, 'content', e.target.value)}
            placeholder={`Enter ${getTypeLabel(comp.type).toLowerCase()} content...`}
            className="w-full h-24 text-sm text-main-text bg-main-surface border border-main-border rounded-lg p-3 outline-none focus:ring-1 focus:ring-brand-primary/10 placeholder:font-medium placeholder:text-[13px] placeholder:text-slate-400/60 resize-none transition-colors"
          />

          {/* Additional Inputs based on Component Type */}
          {['reading', 'video', 'lecture', 'podcast'].includes(comp.type) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                    <Paperclip size={10} /> Attachment / Resource File
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="File URL or name..." 
                      value={comp.fileUrl || ''} 
                      onChange={(e) => updateComponent(sectionId, comp.id, 'fileUrl', e.target.value)}
                      className="flex-1 text-xs bg-main-surface border border-main-border rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-brand-primary/20 text-main-heading placeholder:font-medium placeholder:text-[11px] placeholder:text-slate-400/60"
                    />
                    <input
                      type="file"
                      id={`file-${comp.id}`}
                      className="hidden"
                      accept={comp.type === 'video' ? 'video/*' : comp.type === 'podcast' ? 'audio/*' : '*/*'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onFileUpload(sectionId, comp.id, file);
                        }
                      }}
                    />
                    <button 
                      onClick={() => document.getElementById(`file-${comp.id}`)?.click()}
                      className="p-2 bg-brand-primary/10 text-brand-primary rounded-md hover:bg-brand-primary/20 transition-all border border-brand-primary/20"
                    >
                      <Upload size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                    <Link2 size={10} /> Social / External Platform URL
                  </label>
                  <input 
                    type="text" 
                    placeholder="https://youtube.com/..." 
                    value={comp.externalUrl || ''} 
                    onChange={(e) => updateComponent(sectionId, comp.id, 'externalUrl', e.target.value)}
                    className="w-full text-xs bg-main-surface border border-main-border rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-brand-primary/20 text-main-heading placeholder:font-medium placeholder:text-[11px] placeholder:text-slate-400/60"
                  />
                </div>
              </div>

              {comp.type === 'video' && comp.fileUrl && !comp.externalUrl && (
                <div className="mt-2 p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                        <Video size={14} className="text-brand-primary" />
                      </div>
                      <span className="text-xs font-bold text-main-heading">Adaptive Bitrate Transcoding</span>
                    </div>
                    {!comp.resolutions && !comp.isTranscoding && (
                      <button 
                        onClick={() => handleTranscode(sectionId, comp.id)}
                        className="px-3 py-1.5 bg-brand-primary text-brand-primary-text rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-brand-hover transition-all"
                      >
                        Generate Resolutions
                      </button>
                    )}
                  </div>

                  {comp.isTranscoding && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500 animate-pulse">Processing Multi-Resolution Video...</span>
                        <span className="text-brand-primary">{comp.transcodingProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-brand-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary transition-all duration-300"
                          style={{ width: `${comp.transcodingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {comp.resolutions && (
                    <div className="flex flex-wrap gap-2">
                      {comp.resolutions.map((res: any) => (
                        <div key={res.label} className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-main-border rounded-lg shadow-sm">
                          <CheckSquare size={12} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-main-heading">{res.label}</span>
                          <span className="text-[9px] font-medium text-slate-400">{res.size}</span>
                        </div>
                      ))}
                      <div className="ml-auto text-[9px] font-bold text-emerald-600 uppercase">Ready for All Connections</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {comp.type === 'narrative' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                  <Paperclip size={10} /> Reference Document
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Document URL or name..." 
                    value={comp.fileUrl || ''} 
                    onChange={(e) => updateComponent(sectionId, comp.id, 'fileUrl', e.target.value)}
                    className="flex-1 text-xs bg-main-surface border border-main-border rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-brand-primary/20 text-main-heading"
                  />
                  <input
                    type="file"
                    id={`file-${comp.id}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onFileUpload(sectionId, comp.id, file);
                      }
                    }}
                  />
                  <button 
                    onClick={() => document.getElementById(`file-${comp.id}`)?.click()}
                    className="p-2 bg-brand-primary/10 text-brand-primary rounded-md hover:bg-brand-primary/20 transition-all border border-brand-primary/20"
                  >
                    <Upload size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                  <Type size={10} /> Minimum Word Count
                </label>
                <input 
                  type="number" 
                  placeholder="e.g. 500" 
                  value={comp.minWords || ''} 
                  onChange={(e) => updateComponent(sectionId, comp.id, 'minWords', parseInt(e.target.value) || 0)}
                  className="w-full text-xs bg-main-surface border border-main-border rounded px-2.5 py-2 outline-none focus:ring-1 focus:ring-brand-primary/20 text-main-heading"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SortableSection = ({ 
  section, 
  toggleSection, 
  updateSectionTitle, 
  deleteSection,
  addComponent,
  ...compProps 
}: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as any,
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-main-surface p-6 rounded-2xl border border-main-border shadow-sm space-y-6 transition-colors ${isDragging ? 'shadow-xl scale-[1.01] border-slate-300 z-50' : ''} transition-all duration-200`}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-main-border pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => toggleSection(section.id)} className="text-slate-400 hover:text-slate-900 transition-colors">
            {section.isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          <div {...attributes} {...listeners} className="p-1.5 hover:bg-main-bg rounded-lg cursor-grab active:cursor-grabbing text-slate-300 transition-colors">
            <GripVertical size={20} />
          </div>
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            className="text-lg font-bold text-main-heading bg-transparent outline-none focus:bg-main-bg px-2 py-1 rounded transition-colors"
          />
        </div>
        <button
          onClick={() => deleteSection(section.id)}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {section.isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-main-border pt-5 transition-colors">
          <div className="space-y-4">
            <SortableContext 
              items={section.components.map((c: any) => c.id)} 
              strategy={verticalListSortingStrategy}
            >
              {section.components.map((comp: any) => (
                <SortableComponent 
                  key={comp.id} 
                  comp={comp} 
                  sectionId={section.id} 
                  {...compProps} 
                />
              ))}
            </SortableContext>
          </div>

          {/* Add Component Buttons */}
          <div className="pt-4 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add Component</p>
            <div className="flex flex-wrap gap-2.5">
              {([
                { type: 'reading' as ComponentType, category: 'learning' as ComponentCategory },
                { type: 'video' as ComponentType, category: 'learning' as ComponentCategory },
                { type: 'lecture' as ComponentType, category: 'learning' as ComponentCategory },
                { type: 'podcast' as ComponentType, category: 'learning' as ComponentCategory },
                { type: 'narrative' as ComponentType, category: 'learning' as ComponentCategory },
                { type: 'quiz' as ComponentType, category: 'assessment' as ComponentCategory },
              ]).map(({ type, category }) => {
                const Icon = getTypeIcon(type);
                return (
                  <button
                    key={type}
                    onClick={() => addComponent(section.id, type, category)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-bold text-main-text hover:bg-main-surface hover:text-main-heading transition-all"
                  >
                    <Icon size={14} />
                    {getTypeLabel(type)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

const ModuleCreation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, addModule, updateModule } = useData();
  const isEditMode = !!id;

  // Constants from Centralized Types
  const EXISTING_MODULES = data.modules.map(m => ({ id: m.id, title: m.title }));
  const COMPANIES = data.commonData.companies;
  const DEPARTMENTS = data.commonData.departments;
  const POSITIONS = data.commonData.positions;
  const RANKS = data.commonData.ranks;
  const STATUSES = data.commonData.statuses;
  const BUSINESS_UNITS = data.commonData.businessUnits;
  const CONTRACT_TYPES = data.commonData.contractTypes;
  const EMPLOYMENT_STATUSES = data.commonData.employmentStatuses;

  // Module Details State
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleDuration, setModuleDuration] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [availability, setAvailability] = useState<'always' | 'range'>('always');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [assignmentType, setAssignmentType] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [prereqSearch, setPrereqSearch] = useState('');

  // Curriculum State
  const [sections, setSections] = useState<Section[]>([
    { id: 'sec-1', title: 'Section 1: Introduction', components: [], isExpanded: true }
  ]);
  const [status, setStatus] = useState<Module['status']>('Draft');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // FFmpeg State
  const ffmpegRef = useRef(new FFmpeg());
  const [videoFiles, setVideoFiles] = useState<Record<string, File>>({});
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  // Load FFmpeg
  useEffect(() => {
    const load = async () => {
      // Use single-threaded version to avoid COOP/COEP header requirements
      const baseURL = window.location.origin + '/ffmpeg';
      const ffmpeg = ffmpegRef.current;
      
      // Add progress listener
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsFFmpegLoaded(true);
    };
    load();
  }, []);

  // Load Initial Data
  useEffect(() => {
    if (isEditMode) {
      const moduleData = data.modules.find(m => m.id === id);
      if (moduleData) {
        setModuleTitle(moduleData.title);
        setModuleDescription(moduleData.description);
        setModuleDuration(moduleData.duration || '');
        setThumbnailUrl(moduleData.thumbnail || '');
        if (moduleData.sections) {
          setSections(moduleData.sections as Section[]);
        }
        if (moduleData.settings) {
          setAvailability(moduleData.settings.availability as any);
          setAssignmentType(moduleData.settings.assignmentType);
          setSelectedAudience(moduleData.settings.selectedAudience);
          setPrerequisites(moduleData.settings.prerequisites);
        }
        if (moduleData.status) {
          setStatus(moduleData.status);
        }
      }
    }
  }, [id, isEditMode, data.modules]);

  const handleGenerateDescription = async () => {
    if (!moduleTitle) return;
    setIsGenerating(true);
    const content = await generateModuleContent(moduleTitle, 'description');
    setModuleDescription(content);
    setIsGenerating(false);
  };

  const handleAIGenerated = (generatedData: { 
    title: string; 
    description: string; 
    duration: string;
    availability: 'always' | 'range';
    assignmentType: string;
    selectedAudience: string[];
    prerequisites: string[];
    sections: any[] 
  }) => {
    setModuleTitle(generatedData.title);
    setModuleDescription(generatedData.description);
    setModuleDuration(generatedData.duration);
    setAvailability(generatedData.availability);
    setAssignmentType(generatedData.assignmentType);
    setSelectedAudience(generatedData.selectedAudience);
    setPrerequisites(generatedData.prerequisites);
    setSections(generatedData.sections);
  };

  // Drag and Drop Logic
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id.toString();
      const overId = over.id.toString();

      // Case 1: Reordering Sections
      if (activeId.startsWith('sec-') && overId.startsWith('sec-')) {
        setSections((prev) => {
          const oldIndex = prev.findIndex((s) => s.id === activeId);
          const newIndex = prev.findIndex((s) => s.id === overId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }

      // Case 2: Reordering Components
      if (activeId.startsWith('comp-') && overId.startsWith('comp-')) {
        setSections((prev) => {
          return prev.map((section) => {
            const hasActive = section.components.some(c => c.id === activeId);
            const hasOver = section.components.some(c => c.id === overId);

            if (hasActive && hasOver) {
              const oldIndex = section.components.findIndex(c => c.id === activeId);
              const newIndex = section.components.findIndex(c => c.id === overId);
              return {
                ...section,
                components: arrayMove(section.components, oldIndex, newIndex)
              };
            }
            return section;
          });
        });
      }
    }
  };

  // Management Logic
  const addSection = () => {
    setSections([...sections, {
      id: `sec-${Date.now()}`,
      title: 'New Section',
      components: [],
      isExpanded: true
    }]);
  };

  const updateSectionTitle = (id: string, title: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, title } : s));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s));
  };

  const addComponent = (sectionId: string, type: ComponentType, category: ComponentCategory) => {
    const compId = `comp-${Date.now()}`;
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          components: [...s.components, {
            id: compId,
            type,
            category,
            title: `New ${getTypeLabel(type)}`,
            content: type === 'quiz' ? [] : ''
          }]
        };
      }
      return s;
    }));
  };

  const deleteComponent = (sectionId: string, componentId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, components: s.components.filter(c => c.id !== componentId) };
      }
      return s;
    }));
  };

  const updateComponent = (sectionId: string, componentId: string, field: string, value: any) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          components: s.components.map(c => c.id === componentId ? { ...c, [field]: value } : c)
        };
      }
      return s;
    }));
  };

  const addQuestion = (sectionId: string, componentId: string) => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      text: '',
      options: [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-3`, text: '', isCorrect: false }
      ]
    };
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          components: s.components.map(c => 
            c.id === componentId ? { ...c, content: [...(c.content as Question[]), newQ] } : c
          )
        };
      }
      return s;
    }));
  };

  const updateQuestion = (sectionId: string, componentId: string, qId: string, field: string, value: any) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          components: s.components.map(c => {
            if (c.id === componentId) {
              const qs = (c.content as Question[]).map(q => q.id === qId ? { ...q, [field]: value } : q);
              return { ...c, content: qs };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const addOption = (secId: string, compId: string, qId: string) => {
    setSections(sections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          components: s.components.map(c => {
            if (c.id === compId) {
              const qs = (c.content as Question[]).map(q => {
                if (q.id === qId) {
                  return { ...q, options: [...q.options, { id: `opt-${Date.now()}`, text: '', isCorrect: false }] };
                }
                return q;
              });
              return { ...c, content: qs };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const deleteOption = (secId: string, compId: string, qId: string, optId: string) => {
    setSections(sections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          components: s.components.map(c => {
            if (c.id === compId) {
              const qs = (c.content as Question[]).map(q => {
                if (q.id === qId) {
                  return { ...q, options: q.options.filter(o => o.id !== optId) };
                }
                return q;
              });
              return { ...c, content: qs };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const handleTranscode = async (sectionId: string, componentId: string) => {
    const file = videoFiles[componentId];
    if (!file || !isFFmpegLoaded) {
      if (!file) alert('Please upload a video file first using the upload button.');
      return;
    }

    const ffmpeg = ffmpegRef.current;
    updateComponent(sectionId, componentId, 'isTranscoding', true);
    updateComponent(sectionId, componentId, 'transcodingProgress', 0);

    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      const resolutions = [
        { label: '720p', scale: '1280:720', output: 'output_720.mp4' },
        { label: '480p (SD)', scale: '854:480', output: 'output_480.mp4' }
      ];

      const results = [];
      
      // Upload Original/1080p
      const originalResult = await uploadToS3(file, 'videos/1080p');
      results.push({
        label: '1080p (HD)',
        url: originalResult.url,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`
      });

      for (let i = 0; i < resolutions.length; i++) {
        const res = resolutions[i];
        await ffmpeg.exec(['-i', 'input.mp4', '-vf', `scale=${res.scale}`, '-c:a', 'copy', res.output]);
        
        const data = await ffmpeg.readFile(res.output);
        const buffer = (data as Uint8Array).buffer;
        
        const usableBuffer = ((typeof SharedArrayBuffer !== 'undefined' && buffer instanceof SharedArrayBuffer) 
          ? buffer.slice(0) 
          : buffer) as ArrayBuffer;
        
        const transcodedFile = new File([usableBuffer], res.output, { type: 'video/mp4' });
        const uploadResult = await uploadToS3(transcodedFile, `videos/${res.label.replace(/\s+/g, '')}`);
        
        results.push({
          label: res.label,
          url: uploadResult.url,
          size: `${(data.length / (1024 * 1024)).toFixed(1)}MB`
        });

        updateComponent(sectionId, componentId, 'transcodingProgress', Math.round(((i + 1) / resolutions.length) * 100));
      }

      updateComponent(sectionId, componentId, 'resolutions', results);
      updateComponent(sectionId, componentId, 'fileUrl', results[0].url);
    } catch (error) {
      console.error('Transcoding/Upload error:', error);
      alert('Error during processing. Check console for details.');
    } finally {
      updateComponent(sectionId, componentId, 'isTranscoding', false);
    }
  };

  const uploadToS3 = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    return await response.json();
  };

  const onFileUpload = async (sectionId: string, componentId: string, file: File) => {
    try {
      updateComponent(sectionId, componentId, 'isUploading', true);
      
      const isVideo = file.type.startsWith('video/');
      const folder = isVideo ? 'videos/raw' : 'attachments';
      
      const result = await uploadToS3(file, folder);
      
      updateComponent(sectionId, componentId, 'fileUrl', result.url);
      
      if (isVideo) {
        setVideoFiles(prev => ({ ...prev, [componentId]: file }));
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Failed to upload to S3');
    } finally {
      updateComponent(sectionId, componentId, 'isUploading', false);
    }
  };

  const toggleAudienceItem = (item: string) => {
    setSelectedAudience(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const togglePrerequisite = (mid: string) => {
    setPrerequisites(prev => prev.includes(mid) ? prev.filter(id => id !== mid) : [...prev, mid]);
  };

  const filteredPrerequisites = EXISTING_MODULES.filter(m => 
    m.title.toLowerCase().includes(prereqSearch.toLowerCase()) && m.id !== id
  );

  const handleSave = (newStatus?: Module['status']) => {
    const finalStatus = newStatus || status;
    const modulePayload: Module = {
      id: id || `mod-${Date.now()}`,
      title: moduleTitle || 'Untitled Module',
      description: moduleDescription,
      duration: moduleDuration,
      instructor: data.currentUser.name,
      studentsEnrolled: isEditMode ? (data.modules.find(m => m.id === id)?.studentsEnrolled || 0) : 0,
      status: finalStatus,
      lastUpdated: 'Just now',
      thumbnail: thumbnailUrl || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      sections,
      settings: {
        availability,
        assignmentType,
        selectedAudience,
        prerequisites
      }
    };

    if (isEditMode) {
      updateModule(id, modulePayload);
    } else {
      addModule(modulePayload);
    }
    navigate('/admin/modules');
  };

  const getAudienceList = () => {
    switch (assignmentType) {
      case 'company': return COMPANIES;
      case 'department': return DEPARTMENTS;
      case 'position': return POSITIONS;
      case 'rank': return RANKS;
      case 'status': return STATUSES;
      case 'business_unit': return BUSINESS_UNITS;
      case 'contract_type': return CONTRACT_TYPES;
      case 'employment_status': return EMPLOYMENT_STATUSES;
      default: return [];
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Sidebar Settings */}
      <div className="w-full lg:w-96 space-y-4 font-bold">
        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="w-full p-4 text-white rounded-xl shadow-lg flex items-center justify-center gap-3 group hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, #1a1a1a, #000000)', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
        >
          <div className="p-2 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
            <Sparkles size={20} />
          </div>
          <div className="text-left">
            <div className="text-sm font-black uppercase tracking-wider">AI Module Architect</div>
            <div className="text-[10px] font-bold opacity-80">Build entire curriculum index seconds</div>
          </div>
        </button>

        <div className="bg-main-surface p-5 rounded-xl border border-main-border shadow-sm space-y-5 transition-colors">
          <h2 className="text-lg font-bold text-main-heading border-b border-main-border pb-4 transition-colors">Module Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Module Title</label>
              <input 
                type="text" 
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Advanced Cybersecurity"
                className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-bold placeholder:font-medium placeholder:text-[13px] placeholder:text-slate-400/60 focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all outline-none text-main-heading"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (Hours)</label>
              <input 
                type="text" 
                value={moduleDuration}
                onChange={(e) => setModuleDuration(e.target.value)}
                placeholder="e.g. 40 hours"
                className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-bold placeholder:font-medium placeholder:text-[13px] placeholder:text-slate-400/60 focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all outline-none text-main-heading"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Creator</label>
              <div className="flex items-center gap-3 px-4 py-2 bg-main-bg border border-main-border rounded-xl">
                <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] text-brand-primary border border-brand-primary/20">
                  {data.currentUser.name.charAt(0)}
                </div>
                <span className="text-sm font-bold text-main-heading">{data.currentUser.name}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
              </div>
              <textarea
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Describe objectives..."
                className="w-full h-24 px-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-bold placeholder:font-medium placeholder:text-[13px] placeholder:text-slate-400/60 focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary outline-none resize-none text-main-heading transition-colors"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Module Thumbnail</label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setThumbnailUrl(URL.createObjectURL(file));
                }}
              />
              {thumbnailUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-main-border group">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => setThumbnailUrl('')}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-main-border rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                >
                  <Upload size={22} />
                  <span className="text-xs font-bold">Upload image</span>
                </button>
              )}
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                className="w-full mt-2 px-3 py-2 bg-main-bg border border-main-border rounded-lg text-xs font-medium placeholder:text-slate-400/60 focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary outline-none text-main-heading transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-main-surface p-5 rounded-xl border border-main-border shadow-sm space-y-4 transition-colors">
          <h2 className="text-lg font-bold text-main-heading border-b border-main-border pb-4 transition-colors">Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Availability</label>
              <div className="flex gap-2">
                {['always', 'range'].map(type => (
                  <button
                    key={type}
                    onClick={() => setAvailability(type as any)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      availability === type ? 'bg-brand-primary text-brand-primary-text border-brand-primary' : 'bg-main-bg text-slate-500 border-main-border'
                    }`}
                  >
                    {type === 'always' ? 'Always' : 'Range'}
                  </button>
                ))}
              </div>
              {availability === 'range' && (
                <div className="flex gap-2 mt-2">
                  <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="flex-1 px-3 py-2 bg-main-bg border border-main-border rounded-lg text-xs outline-none text-main-heading transition-colors" />
                  <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="flex-1 px-3 py-2 bg-main-bg border border-main-border rounded-lg text-xs outline-none text-main-heading transition-colors" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audience</label>
              <select value={assignmentType} onChange={e => {setAssignmentType(e.target.value); setSelectedAudience([])}} className="w-full px-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm outline-none text-main-heading font-bold transition-colors">
                <option value="all">Everywhere</option>
                <option value="company">By Company</option>
                <option value="department">By Department</option>
                <option value="position">By Position</option>
                <option value="business_unit">By Business Unit</option>
                <option value="rank">By Rank/Band</option>
                <option value="contract_type">By Contract Type</option>
                <option value="employment_status">By Employment Status</option>
              </select>
              {assignmentType !== 'all' && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {getAudienceList().map(item => (
                    <button 
                  key={item} 
                  onClick={() => toggleAudienceItem(item)} 
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedAudience.includes(item) 
                      ? 'bg-brand-primary text-brand-primary-text border-brand-primary shadow-sm' 
                      : 'bg-main-surface text-main-text border-main-border hover:bg-main-bg'
                  }`}
                >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prerequisites</label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={prereqSearch} onChange={e => setPrereqSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-main-bg border border-main-border rounded-lg text-sm outline-none text-main-heading font-bold placeholder:font-medium placeholder:text-[13px] placeholder:text-slate-400/60 transition-colors" />
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 text-sm scroll-smooth no-scrollbar">
                {filteredPrerequisites.map(m => (
                  <button key={m.id} onClick={() => togglePrerequisite(m.id)} className={`w-full text-left px-3 py-1.5 rounded transition-all font-bold ${prerequisites.includes(m.id) ? 'bg-brand-primary text-brand-primary-text' : 'bg-main-bg text-main-text hover:bg-main-border'}`}>
                    {m.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Canvas */}
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {isEditMode && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewOpen(true);
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-main-surface text-brand-primary border border-brand-primary/20 rounded-full text-xs font-bold hover:bg-brand-primary/5 transition-all shadow-sm"
              >
                <Eye size={14} /> Preview
              </button>
            )}
            <button 
              onClick={() => handleSave('Published')}
              className="px-5 py-2 bg-brand-primary text-brand-primary-text rounded-full font-bold text-xs hover:bg-brand-hover transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <Save size={14} /> {isEditMode ? 'Update' : 'Publish'}
            </button>
            <button 
              onClick={() => handleSave('Draft')} 
              className="flex items-center gap-1.5 px-4 py-2 bg-main-surface text-main-text border border-main-border rounded-full text-xs font-bold hover:bg-main-bg transition-all shadow-sm"
            >
              <FileText size={14} /> Save Draft
            </button>
            <button onClick={addSection} className="flex items-center gap-1.5 px-4 py-2 bg-main-bg text-main-text border border-main-border rounded-full text-xs font-bold hover:bg-main-surface transition-all shadow-sm">
              <Plus size={14} /> Add Section
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              status === 'Published' ? 'bg-brand-primary text-brand-primary-text shadow-sm' : 
              status === 'Draft' ? 'bg-main-bg text-slate-500 border border-main-border' : 
              'bg-main-bg text-slate-400 border border-main-border'
            }`}>
              {status}
            </span>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-5">
            <SortableContext 
              items={sections.map(s => s.id)} 
              strategy={verticalListSortingStrategy}
            >
              {sections.map(section => (
                <SortableSection 
                  key={section.id} 
                  section={section} 
                  toggleSection={toggleSection}
                  updateSectionTitle={updateSectionTitle}
                  deleteSection={deleteSection}
                  addComponent={addComponent}
                  deleteComponent={deleteComponent}
                  updateComponent={updateComponent}
                  updateQuestion={updateQuestion}
                  addOption={addOption}
                  deleteOption={deleteOption}
                  addQuestion={addQuestion}
                  handleTranscode={handleTranscode}
                  onFileUpload={onFileUpload}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>

      <ModulePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        module={{
          id: id || 'preview',
          title: moduleTitle || 'Untitled Module',
          description: moduleDescription,
          duration: moduleDuration,
          instructor: data.currentUser.name,
          studentsEnrolled: 0,
          status: status,
          lastUpdated: 'Just now',
          thumbnail: '',
          sections: sections,
          settings: {
            availability,
            assignmentType,
            selectedAudience,
            prerequisites
          }
        }} 
      />
      <AIModuleGeneratorModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerated={handleAIGenerated}
        lookups={{
          existingModules: EXISTING_MODULES,
          audienceLists: {
            company: COMPANIES,
            department: DEPARTMENTS,
            position: POSITIONS,
            rank: RANKS,
            status: STATUSES,
            business_unit: BUSINESS_UNITS,
            contract_type: CONTRACT_TYPES,
            employment_status: EMPLOYMENT_STATUSES
          }
        }}
      />
    </div>
  );
};

export default ModuleCreation;