import React, { useState, useMemo } from 'react';
import { 
  MoreHorizontal, Edit, Trash2, Eye, Filter, Plus, 
  Calendar, Clock, BookOpen, Paperclip, Link2, 
  Search, LayoutGrid, List as ListIcon, ChevronDown, X 
} from 'lucide-react';
import { Module } from '../types';
import { useData } from '../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ModulePreviewModal from '../components/ModulePreviewModal';

const StatusBadge = ({ status }: { status: Module['status'] }) => {
  const styles = {
    Published: 'bg-black/20 text-white border border-white/20 backdrop-blur-md',
    Draft: 'bg-main-bg text-slate-500 border border-main-border',
    Archived: 'bg-slate-100 text-slate-400 border border-slate-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const ModuleManagement = () => {
  const navigate = useNavigate();
  const { data, deleteModule } = useData();
  const allModules = data.modules;

  // State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Published' | 'Draft'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterInstructor, setFilterInstructor] = useState('All');
  const [filterAssignmentType, setFilterAssignmentType] = useState('All');
  const [filterBusinessUnit, setFilterBusinessUnit] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewModule, setSelectedPreviewModule] = useState<Module | null>(null);

  // Derived Data
  const instructors = useMemo(() => ['All', ...Array.from(new Set(allModules.map(m => m.instructor)))], [allModules]);
  const businessUnits = ['All', ...data.commonData.businessUnits];
  const departments = ['All', ...data.commonData.departments];
  const companies = ['All', 'Brigada Corp', 'Lumina Global', 'EdTech Solutions']; // Mock companies

  const filteredModules = useMemo(() => {
    return allModules.filter(m => {
      const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             m.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesInstructor = filterInstructor === 'All' || m.instructor === filterInstructor;
      
      const matchesAssignmentType = filterAssignmentType === 'All' || m.settings?.assignmentType === filterAssignmentType;
      
      // Match if selected audience includes the filtered value, or if no filter is set
      const matchesBU = filterBusinessUnit === 'All' || (m.settings?.selectedAudience || []).includes(filterBusinessUnit);
      const matchesDept = filterDepartment === 'All' || (m.settings?.selectedAudience || []).includes(filterDepartment);
      const matchesComp = filterCompany === 'All' || (m.settings?.selectedAudience || []).includes(filterCompany);

      return matchesStatus && matchesSearch && matchesInstructor && matchesAssignmentType && matchesBU && matchesDept && matchesComp;
    });
  }, [allModules, filterStatus, searchTerm, filterInstructor, filterAssignmentType, filterBusinessUnit, filterDepartment, filterCompany]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      deleteModule(id);
    }
  };

  return (
    <div className="relative space-y-4">
      <PageHeader 
        stats={[
          { label: 'Total Modules', value: allModules.length },
          { label: 'Results', value: filteredModules.length }
        ]}
        actions={[
          { 
            label: showAdvanced ? 'Hide Filters' : 'Advanced Filter', 
            icon: Filter, 
            variant: 'secondary',
            onClick: () => setShowAdvanced(!showAdvanced) 
          },
          { 
            label: 'Create New', 
            icon: Plus, 
            variant: 'primary',
            onClick: () => navigate('/admin/create-module')
          }
        ]}
      />

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="bg-main-surface p-6 rounded-2xl border border-main-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-main-heading uppercase tracking-wider">Advanced Filters</h3>
            <button onClick={() => setShowAdvanced(false)} className="text-slate-400 hover:text-main-heading transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Title or creator..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-main-bg border border-main-border rounded-xl text-xs font-medium placeholder:font-medium placeholder:text-[11px] placeholder:text-slate-400/60 focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creator</label>
              <select 
                value={filterInstructor}
                onChange={(e) => setFilterInstructor(e.target.value)}
                className="w-full px-4 py-2 bg-main-bg border border-main-border rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
              >
                {instructors.map(inst => <option key={inst} value={inst}>{inst}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</label>
              <select 
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-4 py-2 bg-main-bg border border-main-border rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
              >
                {companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Unit</label>
              <select 
                value={filterBusinessUnit}
                onChange={(e) => setFilterBusinessUnit(e.target.value)}
                className="w-full px-4 py-2 bg-main-bg border border-main-border rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
              >
                {businessUnits.map(bu => <option key={bu} value={bu}>{bu}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
              <select 
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 bg-main-bg border border-main-border rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
              >
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment Type</label>
              <select 
                value={filterAssignmentType}
                onChange={(e) => setFilterAssignmentType(e.target.value)}
                className="w-full px-4 py-2 bg-main-bg border border-main-border rounded-xl text-xs font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
              >
                <option value="All">All Types</option>
                <option value="all">Everywhere</option>
                <option value="department">By Department</option>
                <option value="business_unit">By Business Unit</option>
                <option value="position">By Position</option>
                <option value="rank">By Rank</option>
              </select>
            </div>

            <div className="flex items-end md:col-span-2">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('All');
                  setFilterInstructor('All');
                  setFilterCompany('All');
                  setFilterBusinessUnit('All');
                  setFilterDepartment('All');
                  setFilterAssignmentType('All');
                }}
                className="w-full py-2 bg-main-bg border border-main-border rounded-xl text-xs font-bold text-slate-500 hover:text-main-heading hover:bg-main-surface transition-all active:scale-[0.98]"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-main-surface rounded-2xl border border-main-border shadow-sm overflow-hidden transition-colors">
        {/* Sub-Header / Quick Filters */}
        <div className="px-6 py-4 border-b border-main-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-1.5 bg-main-bg p-1 rounded-full border border-main-border">
                {['All', 'Published', 'Draft'].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      filterStatus === status 
                        ? 'bg-white text-main-heading shadow-sm' 
                        : 'text-slate-500 hover:text-main-heading'
                    }`}
                  >
                    {status}
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-main-bg p-1 rounded-full border border-main-border">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ListIcon size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
                  {filteredModules.length} Modules Found
              </div>
            </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-main-bg/50">
                  <th className="px-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Module Information</th>
                  <th className="px-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Creator</th>
                  <th className="px-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Enrollment</th>
                  <th className="px-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-main-border transition-colors">
                {filteredModules.map((module) => (
                  <tr key={module.id} className="group hover:bg-main-bg transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img src={module.thumbnail} alt="" className="w-16 h-12 object-cover rounded-xl shadow-sm border border-main-border" />
                        <div className="min-w-0">
                          <h4 className="font-bold text-main-heading text-sm truncate group-hover:text-brand-primary transition-colors">{module.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                              <Clock size={12} /> {module.duration || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 border-l border-main-border pl-3">
                              <Calendar size={12} /> {module.lastUpdated}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 cursor-default">
                         <p className="text-xs font-medium text-main-heading">{module.instructor}</p>
                    </td>
                    <td className="px-6 py-5">
                        <div className="w-full max-w-[120px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[10px] font-bold text-main-heading">{module.studentsEnrolled.toLocaleString()}</p>
                              <p className="text-[9px] font-black text-slate-400">LIMIT 2.5K</p>
                            </div>
                            <div className="w-full bg-main-bg h-1 rounded-full overflow-hidden">
                                <div className="bg-brand-primary h-full rounded-full transition-all duration-1000" style={{width: `${(module.studentsEnrolled / 2500) * 100}%`}}></div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={module.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreviewModule(module);
                            setIsPreviewOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-brand-primary hover:bg-white rounded-full transition-all shadow-sm"
                        >
                          <Eye size={16} />
                        </button>
                        <Link to={`/admin/edit-module/${module.id}`} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-white rounded-full transition-all shadow-sm">
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(module.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-full transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredModules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-main-bg rounded-full">
                          <BookOpen size={32} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">No modules found matching filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
            {filteredModules.map((module) => (
              <div key={module.id} className="group bg-main-bg/30 rounded-2xl border border-main-border p-4 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 relative">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-main-border">
                  <img src={module.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={module.status} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3 gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPreviewModule(module);
                        setIsPreviewOpen(true);
                      }}
                      className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-brand-primary transition-all"
                    >
                      <Eye size={16} />
                    </button>
                    <Link to={`/admin/edit-module/${module.id}`} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-brand-primary transition-all">
                      <Edit size={16} />
                    </Link>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-main-heading text-sm line-clamp-1 group-hover:text-brand-primary transition-colors">{module.title}</h4>
                  <div className="flex items-center justify-between border-t border-main-border pt-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Creator</span>
                      <span className="text-xs font-medium text-main-heading">{module.instructor}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                      <span className="text-xs font-medium text-main-heading">{module.duration || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        <div className="px-6 py-4 flex justify-between items-center bg-main-bg/50 border-t border-main-border">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Displaying {filteredModules.length} Modules
             </span>
             <div className="flex gap-2">
                 <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-main-border text-xs font-bold text-slate-400 hover:text-main-heading shadow-sm transition-all">1</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-primary text-brand-primary-text text-xs font-bold shadow-lg shadow-brand-primary/20">2</button>
                 <button className="px-3 h-8 flex items-center justify-center rounded-full bg-white border border-main-border text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-main-heading shadow-sm transition-all">Next</button>
             </div>
        </div>
      </div>
      <ModulePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedPreviewModule(null);
        }} 
        module={selectedPreviewModule} 
      />
    </div>
  );
};

export default ModuleManagement;