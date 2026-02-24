import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Download, Share2, Search, Filter, ChevronDown, Award, FileCheck, Eye, BarChart2, Clock, AlertCircle, CheckCircle, RotateCcw, XCircle, ChevronRight, X, ChevronLeft } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useData } from '../context/DataContext';

type ReportType = 'progress' | 'retake' | 'completion';
const ITEMS_PER_PAGE = 8;

const Reports = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('progress');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ type: ReportType; data: any } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useData();

  const activityData = data.reportsData.activityTrend;
  const completionData = data.reportsData.completionRates;

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // --- Helper Functions ---

  const getEmployee = (id: string) => data.employees.find(e => e.id === id);
  const getModule = (id: string) => data.modules.find(m => m.id === id);
  
  const getEmployeeByName = (name: string) => data.employees.find(e => 
    (e.name && e.name === name) || (`${e.first_name} ${e.last_name}` === name)
  );

  const getModuleByTitle = (title: string) => data.modules.find(m => m.title === title);

  // --- Data Preparation ---

  const getProgressData = () => {
    return data.enrollments
      .filter(e => e.status === 'in_progress' || e.status === 'not_started') // Including not_started as 'pending' often means similar context
      .map(e => {
        const emp = getEmployee(e.employeeId);
        const mod = getModule(e.moduleId);
        return {
          id: e.id,
          employeeId: e.employeeId,
          moduleId: e.moduleId,
          employeeName: emp?.name || `${emp?.first_name} ${emp?.last_name}` || 'Unknown',
          employeeAvatar: emp?.avatar || emp?.image_url || '',
          employeeDept: emp?.department || '',
          moduleName: mod?.title || 'Unknown',
          startDate: e.enrolledDate,
          status: e.status === 'not_started' ? 'Pending' : 'In Progress',
          progress: e.progress,
        };
      })
      .filter(item => 
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const getRetakeData = () => {
    return data.restrictedProfiles
      .map(p => {
        // Try to link to real IDs if possible for details
        const emp = getEmployeeByName(p.name);
        const mod = getModuleByTitle(p.module);
        return {
           ...p,
           employeeId: emp?.id,
           moduleId: mod?.id
        };
      })
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const getCompletionData = () => {
    // Merge enrollments (completed) with certificates
    const completedEnrollments = data.enrollments.filter(e => e.status === 'completed');
    
    // Also consider data.reportsData.certifiedCompletions which is a prepared view
    const certifiedView = data.reportsData.certifiedCompletions || [];

    // We'll proceed with enrollments as the source of truth for "Completions" generally
    const mappedEnrollments = completedEnrollments.map(e => {
        const emp = getEmployee(e.employeeId);
        const mod = getModule(e.moduleId);
        const cert = data.employeeCertificates.find(c => c.employeeId === e.employeeId && c.moduleId === e.moduleId);
        
        // Find score from quiz attempts if not in cert
        const attempts = data.quizAttempts.filter(qa => qa.employeeId === e.employeeId && qa.moduleId === e.moduleId);
        const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : (cert?.score || 0);

        return {
            id: e.id,
            employeeId: e.employeeId,
            moduleId: e.moduleId,
            employeeName: emp?.name || `${emp?.first_name} ${emp?.last_name}` || 'Unknown',
            employeeAvatar: emp?.avatar || emp?.image_url || '',
            employeeDept: emp?.department || '',
            moduleName: mod?.title || 'Unknown',
            completionDate: e.completedDate || e.lastAccessedDate,
            score: maxScore,
            status: cert ? 'Certified' : 'Passed',
            certificateNumber: cert?.certificateNumber
        };
    });
    
    return mappedEnrollments.filter(item => 
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // --- Modal Content Generators ---

  const renderModalContent = () => {
    if (!selectedItem) return null;
    const { type, data: itemData } = selectedItem;

    if (type === 'progress') {
        const compProgress = data.componentProgress.filter(cp => 
            cp.employeeId === itemData.employeeId && cp.moduleId === itemData.moduleId
        );
        const module = getModule(itemData.moduleId);

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4 bg-main-bg p-4 rounded-xl border border-main-border">
                    <img src={itemData.employeeAvatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-main-surface shadow-sm" />
                    <div>
                        <h3 className="text-lg font-bold text-main-heading">{itemData.employeeName}</h3>
                        <p className="text-sm text-main-text">{itemData.moduleName}</p>
                        <div className="mt-2 flex items-center gap-2">
                             <div className="h-2 w-32 bg-main-surface border border-main-border rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${itemData.progress}%` }}></div>
                             </div>
                             <span className="text-xs font-bold text-blue-600">{itemData.progress}% Complete</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-main-heading mb-3 flex items-center gap-2">
                        <FileCheck size={18} /> Module Breakdown
                    </h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {module?.sections?.map(section => (
                            <div key={section.id} className="border border-main-border rounded-lg overflow-hidden">
                                <div className="bg-main-bg px-4 py-2 font-medium text-main-heading text-sm">{section.title}</div>
                                <div className="divide-y divide-main-border">
                                    {section.components.map(comp => {
                                        const progress = compProgress.find(cp => cp.componentId === comp.id);
                                        const status = progress?.status || 'not_started';
                                        
                                        return (
                                            <div key={comp.id} className="px-4 py-3 flex items-center justify-between hover:bg-main-bg transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-green-500' : status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                                    <span className="text-sm text-main-text max-w-[200px] truncate" title={comp.title}>{comp.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {progress?.timeSpentMinutes !== undefined && (
                                                        <span className="text-xs text-main-text opacity-70 font-mono flex items-center gap-1">
                                                            <Clock size={12} /> {progress.timeSpentMinutes}m
                                                        </span>
                                                    )}
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                                                        status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                        status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                                                        'bg-main-bg text-main-text opacity-70'
                                                    }`}>
                                                        {status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'retake') {
        const history = data.quizAttempts.filter(qa => 
            (itemData.employeeId && qa.employeeId === itemData.employeeId) || 
            false
        ).filter(qa => {
            if (itemData.moduleId) return qa.moduleId === itemData.moduleId;
            return true;
        });
        
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-start bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                    <div className="flex items-center gap-4">
                        <img src={itemData.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-main-surface shadow-sm" />
                        <div>
                            <h3 className="text-lg font-bold text-main-heading">{itemData.name}</h3>
                            <p className="text-sm text-main-text">{itemData.module}</p>
                             <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                                   <RotateCcw size={12} /> {itemData.attempts} Retakes
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${itemData.status === 'Restricted' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}>
                                    {itemData.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    {itemData.attempts >= 3 && (
                         <div className="bg-main-surface p-2 rounded-lg text-center border border-red-100 dark:border-red-900">
                            <XCircle className="text-red-500 mb-1 mx-auto" size={24} />
                            <span className="text-xs font-bold text-red-600 block">Restricted</span>
                         </div>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold text-main-heading mb-3">Attempt History</h4>
                    {history.length > 0 ? (
                        <div className="border border-main-border rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-main-bg border-b border-main-border">
                                    <tr>
                                        <th className="px-4 py-3 text-main-text font-semibold">Attempt</th>
                                        <th className="px-4 py-3 text-main-text font-semibold">Date</th>
                                        <th className="px-4 py-3 text-main-text font-semibold text-center">Score</th>
                                        <th className="px-4 py-3 text-main-text font-semibold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-main-border">
                                    {history.map((h, i) => (
                                        <tr key={h.id}>
                                            <td className="px-4 py-3 font-medium text-main-heading">#{h.attemptNumber}</td>
                                            <td className="px-4 py-3 text-main-text">{h.submittedDate}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-bold ${h.score < 75 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{h.score}%</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {h.passed ? (
                                                    <span className="text-green-600 dark:text-green-400 font-bold text-xs">Passed</span>
                                                ) : (
                                                    <span className="text-red-600 dark:text-red-400 font-bold text-xs">Failed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-main-bg rounded-xl border border-dashed border-main-border">
                            <p className="text-main-text opacity-70 text-sm">No detailed attempt history linked to this profile.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (type === 'completion') {
         const module = getModule(itemData.moduleId);

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50">
                    <div className="flex items-center gap-4">
                        <img src={itemData.employeeAvatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-main-surface shadow-sm" />
                        <div>
                            <h3 className="text-lg font-bold text-main-heading">{itemData.employeeName}</h3>
                            <p className="text-sm text-main-text">{itemData.moduleName}</p>
                            <div className="mt-1 flex text-xs font-medium text-green-700 dark:text-green-400 gap-3">
                                <span className="flex items-center gap-1"><CheckCircle size={12} /> Completed {itemData.completionDate}</span>
                                {itemData.status === 'Certified' && (
                                     <span className="flex items-center gap-1 bg-green-200 dark:bg-green-900/40 px-2 py-0.5 rounded-full text-green-800 dark:text-green-300"><Award size={12} /> Certified</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-center bg-main-surface p-3 rounded-xl border border-green-100 dark:border-green-900 shadow-sm">
                        <span className="block text-xs uppercase tracking-wide text-main-text opacity-70 font-bold">Final Score</span>
                        <span className="block text-2xl font-black text-green-600 dark:text-green-400">{itemData.score}%</span>
                    </div>
                </div>

                 <div>
                    <h4 className="font-semibold text-main-heading mb-3 flex items-center gap-2">
                        <FileCheck size={18} /> Course Breakdown
                    </h4>
                     <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {module?.sections?.map(section => (
                            <div key={section.id} className="border border-main-border rounded-lg overflow-hidden">
                                <div className="bg-main-bg px-4 py-2 font-medium text-main-heading text-sm">{section.title}</div>
                                <div className="divide-y divide-main-border">
                                    {section.components.map(comp => {
                                        const attempt = data.quizAttempts.find(qa => qa.employeeId === itemData.employeeId && qa.componentId === comp.id);
                                        const isAssessment = comp.category === 'assessment' || comp.type === 'quiz';
                                        
                                        return (
                                            <div key={comp.id} className="px-4 py-3 flex items-center justify-between hover:bg-main-bg transition-colors">
                                                <span className="text-sm text-main-text max-w-[250px] truncate" title={comp.title}>{comp.title}</span>
                                                <div className="flex items-center gap-4">
                                                    {isAssessment ? (
                                                        attempt ? (
                                                            <span className={`text-sm font-bold ${attempt.score >= 80 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                                {attempt.score}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-main-text opacity-50 italic">No score</span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                                            <CheckCircle size={12} /> Done
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
  };

  const closeModal = () => setSelectedItem(null);

  // --- Pagination Logic ---
  
  const PaginatedTable = ({ data, columns, renderRow }: { data: any[], columns: string[], renderRow: (item: any) => React.ReactNode }) => {
     const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
     const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

     return (
        <div className="flex flex-col min-h-[400px]">
           <div className="overflow-x-auto flex-1">
               <table className="w-full text-left border-collapse">
                   <thead className="bg-main-bg border-b border-main-border">
                       <tr>
                           {columns.map((col, i) => (
                               <th key={i} className={`px-6 py-4 text-main-text font-bold text-xs uppercase tracking-wider ${i === columns.length - 1 ? 'text-right' : 'text-left'}`}>
                                   {col}
                               </th>
                           ))}
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-main-border">
                       {currentData.map(renderRow)}
                       {currentData.length === 0 && <EmptyState />}
                   </tbody>
               </table>
           </div>
           
           {/* Pagination Footer */}
           {totalPages > 1 && (
               <div className="p-4 border-t border-main-border bg-main-bg flex items-center justify-between mt-auto">
                   <span className="text-xs font-semibold text-main-text opacity-70">
                       Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, data.length)} of {data.length}
                   </span>
                   <div className="flex gap-2">
                       <button 
                           onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                           disabled={currentPage === 1}
                           className="p-1.5 rounded-lg border border-main-border text-main-text hover:bg-main-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                           <ChevronLeft size={16} />
                       </button>
                       <span className="px-3 py-1 text-sm font-medium text-main-heading flex items-center">
                           Page {currentPage} of {totalPages}
                       </span>
                       <button 
                           onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                           disabled={currentPage === totalPages}
                           className="p-1.5 rounded-lg border border-main-border text-main-text hover:bg-main-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                           <ChevronRight size={16} />
                       </button>
                   </div>
               </div>
           )}
        </div>
     );
  };

  const EmptyState = () => (
      <tr>
        <td colSpan={6} className="px-6 py-12 text-center text-main-text opacity-50">
            <div className="flex flex-col items-center justify-center gap-3">
                <Search size={48} className="text-main-border" />
                <p className="font-medium text-sm">No reports found matching your criteria.</p>
            </div>
        </td>
      </tr>
  );
  
  // --- Render Tables ---

  const renderContent = () => {
    if (activeTab === 'progress') {
        const reports = getProgressData();
        return (
            <PaginatedTable 
                data={reports}
                columns={['Employee Name', 'Module Name', 'Start Date', 'Status', 'Completion', 'Action']}
                renderRow={(item) => (
                    <tr key={item.id} className="hover:bg-main-bg transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={item.employeeAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-main-border" />
                                <span className="font-semibold text-main-heading text-sm">{item.employeeName}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-main-heading">{item.moduleName}</td>
                        <td className="px-6 py-4 text-sm text-main-text">{item.startDate}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                item.status === 'Pending' ? 'bg-main-bg text-main-text border border-main-border' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900'
                            }`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-main-bg rounded-full overflow-hidden w-24 border border-main-border">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }} />
                                </div>
                                <span className="text-xs font-bold text-blue-600 w-8">{item.progress}%</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => setSelectedItem({ type: 'progress', data: item })}
                                className="p-2 text-main-text hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                title="View Details"
                            >
                                <Eye size={18} />
                            </button>
                        </td>
                    </tr>
                )}
            />
        );
    }

    if (activeTab === 'retake') {
         const reports = getRetakeData();
         return (
            <PaginatedTable 
                data={reports}
                columns={['Employee Name', 'Module Name', 'Retake Count', 'Status', 'Last Attempt', 'Action']}
                renderRow={(item) => (
                    <tr key={item.id} className="hover:bg-main-bg transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={item.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-main-border" />
                                <span className="font-semibold text-main-heading text-sm">{item.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-main-heading">{item.module}</td>
                        <td className="px-6 py-4">
                            <div className="font-mono font-bold text-main-text pl-4">{item.attempts}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                item.status === 'Restricted' 
                                    ? 'bg-main-bg text-main-text border-main-border' 
                                    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-900'
                            }`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-main-text">{item.date}</td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => setSelectedItem({ type: 'retake', data: item })}
                                className="p-2 text-main-text hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                title="View Details"
                            >
                                <Eye size={18} />
                            </button>
                        </td>
                    </tr>
                )}
            />
         );
    }

    if (activeTab === 'completion') {
         const reports = getCompletionData();
         return (
            <PaginatedTable 
                data={reports}
                columns={['Employee Name', 'Module Name', 'Completion Date', 'Final Score', 'Status', 'Action']}
                renderRow={(item) => (
                    <tr key={item.id} className="hover:bg-main-bg transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={item.employeeAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-main-border" />
                                <span className="font-semibold text-main-heading text-sm">{item.employeeName}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-main-heading">{item.moduleName}</td>
                        <td className="px-6 py-4 text-sm text-main-text">{item.completionDate}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                item.score >= 90 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-900' : 
                                item.score >= 75 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900' :
                                'bg-main-bg text-main-text border-main-border'
                            }`}>
                                {item.score}%
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                item.status === 'Certified' 
                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-100 dark:border-purple-900' 
                                    : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-100 dark:border-green-900'
                            }`}>
                                {item.status === 'Certified' && <Award size={12} />}
                                {item.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => setSelectedItem({ type: 'completion', data: item })}
                                className="p-2 text-main-text hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                title="View Details"
                            >
                                <Eye size={18} />
                            </button>
                        </td>
                    </tr>
                )}
            />
         );
    }
  };

  return (
    <div className="relative space-y-6">
      <PageHeader 
        title="Analytics & Reports"
        description="Monitor employee progress, retakes, and certifications."
        icon={BarChart2}
        stats={[
            { label: 'Total Certified', value: (data.reportsData.certifiedCompletions?.length || 0) + (data.employeeCertificates?.length || 0) },
            { label: 'Pending Retakes', value: data.restrictedProfiles.filter(p => p.status === 'Probation').length },
            { label: 'Active Learners', value: data.enrollments.filter(e => e.status === 'in_progress').length }
        ]}
        actions={[
          { label: 'Share', icon: Share2, variant: 'secondary', onClick: () => console.log('Share') },
          { label: 'Export Report', icon: Download, variant: 'primary', onClick: () => console.log('Export') }
        ]}
      />

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-main-surface p-5 rounded-xl border border-main-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-main-heading">Weekly Activity Trend</h3>
                <select className="bg-main-bg border border-main-border text-main-text text-sm font-semibold rounded-md px-2 py-1 outline-none">
                    <option>Last 7 Days</option>
                </select>
            </div>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-main)', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-main)', fontSize: 12}} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                        <Line type="monotone" dataKey="active" stroke="var(--brand-primary)" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="completions" stroke="#94a3b8" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-main-surface p-5 rounded-xl border border-main-border shadow-sm">
            <h3 className="text-lg font-bold text-main-heading mb-6">Course Completion Rates</h3>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--text-main)', fontSize: 12}} domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: 'var(--brand-primary)', fontWeight: 600, fontSize: 13}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                        <Bar dataKey="completion" fill="var(--brand-primary)" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Main Reports Section */}
      <div className="bg-main-surface border border-main-border rounded-xl shadow-sm overflow-hidden flex flex-col">
         <div className="p-5 border-b border-main-border">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-main-heading">Detailed Reports</h3>
                    <p className="text-main-text opacity-70 text-sm mt-1">Select a report type to view detailed metrics.</p>
                </div>
                 
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-main-text opacity-50" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-main-bg border border-main-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-64 text-main-heading"
                  />
               </div>
             </div>

             {/* Custom Tabs */}
             <div className="flex items-center gap-2 p-1 bg-main-bg rounded-lg border border-main-border w-fit">
                 {activeTab && (['progress', 'retake', 'completion'] as ReportType[]).map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${
                            activeTab === tab 
                                ? 'bg-main-surface shadow-sm text-brand-primary' 
                                : 'text-main-text opacity-70 hover:opacity-100 hover:bg-main-surface/50'
                        }`}
                     >
                         {tab} Report
                     </button>
                 ))}
             </div>
         </div>

         {/* Dynamic Content */}
         <div className="flex-1">
            {renderContent()}
         </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
              <div 
                  className="relative bg-main-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col transition-all animate-in fade-in zoom-in duration-300 border border-main-border"
                  onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-5 border-b border-main-border flex justify-between items-center bg-main-bg/50">
                      <h3 className="text-lg font-bold text-main-heading capitalize flex items-center gap-2">
                          {selectedItem.type === 'progress' && <Clock className="text-blue-500" size={20} />}
                          {selectedItem.type === 'retake' && <AlertCircle className="text-red-500" size={20} />}
                          {selectedItem.type === 'completion' && <CheckCircle className="text-green-500" size={20} />}
                          {selectedItem.type} Details
                      </h3>
                      <button onClick={closeModal} className="p-2 text-main-text opacity-50 hover:opacity-100 hover:bg-main-bg rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      {renderModalContent()}
                  </div>
                  <div className="p-4 border-t border-main-border bg-main-bg flex justify-end">
                      <button onClick={closeModal} className="px-5 py-2 bg-main-surface border border-main-border rounded-lg text-sm font-semibold text-main-text hover:bg-main-bg transition-colors shadow-sm">
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Reports;