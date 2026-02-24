import React, { useState } from 'react';
import { Check, X, FileText, Download, Clock, Sparkles, ChevronDown, ChevronUp, AlertCircle, ClipboardCheck, ChevronLeft, ChevronRight, Hourglass, RotateCcw, ShieldCheck, ShieldX } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Evaluation, DBStructure, ModuleEvaluation } from '../types';
import { evaluateStudentSubmission } from '../services/geminiService';
import { useData } from '../context/DataContext';

const ITEMS_PER_PAGE = 8;

const EvaluationPage = () => {
  const { data, updateData, approveModuleEvaluation, rejectModuleEvaluation } = useData();
  const mockEvaluations = data.evaluations;
  const detailedSubmissions = data.detailedSubmissions;
  const moduleEvaluations = data.moduleEvaluations ?? [];

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalScore, setFinalScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  // Module evaluation review modal
  const [selectedModuleEval, setSelectedModuleEval] = useState<ModuleEvaluation | null>(null);
  const [moduleEvalNote, setModuleEvalNote] = useState('');
  const [isModuleEvalModalOpen, setIsModuleEvalModalOpen] = useState(false);

  // Tab and Pagination State
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'module-evaluations'>('pending');
  const [currentPage, setCurrentPage] = useState(1);

  const pendingModuleEvals = moduleEvaluations.filter(e => e.status === 'pending');
  const historyModuleEvals = moduleEvaluations.filter(e => e.status !== 'pending');

  const openModuleEvalModal = (ev: ModuleEvaluation) => {
    setSelectedModuleEval(ev);
    setModuleEvalNote('');
    setIsModuleEvalModalOpen(true);
  };

  const handleApproveModule = () => {
    if (!selectedModuleEval) return;
    approveModuleEvaluation(selectedModuleEval.id, moduleEvalNote || undefined);
    setIsModuleEvalModalOpen(false);
    setSelectedModuleEval(null);
  };

  const handleRejectModule = () => {
    if (!selectedModuleEval || !moduleEvalNote.trim()) return;
    rejectModuleEvaluation(selectedModuleEval.id, moduleEvalNote);
    setIsModuleEvalModalOpen(false);
    setSelectedModuleEval(null);
  };

  const getEmployeeName = (employeeId: string) => {
    const emp = data.employees.find(e => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  };

  const getModuleTitle = (moduleId: string) => {
    return data.modules.find(m => m.id === moduleId)?.title ?? 'Unknown Module';
  };

  const handleOpenGrade = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setAiAnalysis(evaluation.aiAnalysis || null);
    setFinalScore(evaluation.score || '');
    setFeedback(evaluation.instructorFeedback || evaluation.aiAnalysis?.summary || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvaluation(null);
  };

  const runAiEvaluation = async () => {
    if (!selectedEvaluation || isAnalyzing) return;
    const details = detailedSubmissions[selectedEvaluation.id];
    if (!details) return;

    // Find the module and component
    const module = data.modules.find(m => m.title === selectedEvaluation.moduleTitle);
    const component = module?.sections?.flatMap(s => s.components).find(c => c.title === selectedEvaluation.assignmentTitle);
    const minWords = component?.minWords;
    const moduleDescription = module?.description || '';

    setIsAnalyzing(true);
    const result = await evaluateStudentSubmission(
      selectedEvaluation.moduleTitle,
      moduleDescription,
      details.mcq,
      details.narrative,
      minWords
    );
    
    if (result) {
      setAiAnalysis(result);
      setFinalScore(result.overallScore);
      setFeedback(result.summary);

      // Save AI analysis back to evaluations data for persistence
      const updatedEvaluations = mockEvaluations.map(ev => 
        ev.id === selectedEvaluation.id 
          ? { ...ev, aiAnalysis: result, score: result.overallScore } 
          : ev
      );
      updateData('evaluations', updatedEvaluations);
    }
    setIsAnalyzing(false);
  };

  const handleSubmitGrade = (status: 'Pass' | 'Fail') => {
    if (!selectedEvaluation) return;

    const newStatus = status === 'Pass' ? 'Passed' : 'Failed';

    const updatedEvaluations = mockEvaluations.map(ev => 
      ev.id === selectedEvaluation.id 
        ? { 
            ...ev, 
            status: newStatus, 
            score: typeof finalScore === 'number' ? finalScore : (ev.score || 0),
            instructorFeedback: feedback,
            aiAnalysis: aiAnalysis // Ensure AI analysis is preserved
          } 
        : ev
    );

    updateData('evaluations', updatedEvaluations);
    handleCloseModal();
  };

  const getDetails = (id: string) => detailedSubmissions[id] || { mcq: { correct: 0, total: 0 }, narrative: [] };

  // Filter and Pagination Logic
  const filteredEvaluations = mockEvaluations.filter(item => {
      if (activeTab === 'pending') {
          return item.status === 'Pending';
      } else {
          // History includes anything NOT Pending (Graded, Passed, Failed, etc.)
          return item.status !== 'Pending';
      }
  });

  const totalPages = Math.ceil(filteredEvaluations.length / ITEMS_PER_PAGE);
  const paginatedEvaluations = filteredEvaluations.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: 'pending' | 'history' | 'module-evaluations') => {
      setActiveTab(tab);
      setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="relative space-y-4">
      <PageHeader 
        title="Assessments"
        description="Review employee submissions, provide narrative feedback, and use AI-assisted grading to maintain quality standards."
        icon={ClipboardCheck}
        stats={[
          { label: 'Pending Review', value: mockEvaluations.filter(e => e.status === 'Pending').length },
          { label: 'Avg Grade', value: '82/100' }
        ]}
      />

      <div className="bg-main-surface rounded-xl border border-main-border shadow-sm overflow-hidden transition-colors flex flex-col min-h-[600px]">
        {/* Tabs */}
        <div className="px-5 border-b border-main-border flex gap-8 text-sm font-semibold text-slate-400">
            <button
                onClick={() => handleTabChange('pending')}
                className={`py-4 px-1 transition-colors border-b-2 ${activeTab === 'pending' ? 'text-main-heading border-brand-primary' : 'border-transparent hover:text-main-heading'}`}
            >
                Pending Review
            </button>
            <button
                onClick={() => handleTabChange('history')}
                className={`py-4 px-1 transition-colors border-b-2 ${activeTab === 'history' ? 'text-main-heading border-brand-primary' : 'border-transparent hover:text-main-heading'}`}
            >
                Graded History
            </button>
            <button
                onClick={() => handleTabChange('module-evaluations')}
                className={`py-4 px-1 transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'module-evaluations' ? 'text-main-heading border-brand-primary' : 'border-transparent hover:text-main-heading'}`}
            >
                <Hourglass size={14} />
                Module Evaluations
                {pendingModuleEvals.length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                    {pendingModuleEvals.length}
                  </span>
                )}
            </button>
        </div>

        {/* Module Evaluations Tab Content */}
        {activeTab === 'module-evaluations' && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-main-bg text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-main-border">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Retake #</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-main-border">
                {moduleEvaluations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                      No module evaluations submitted yet.
                    </td>
                  </tr>
                ) : (
                  [...pendingModuleEvals, ...historyModuleEvals].map(ev => (
                    <tr key={ev.id} className="hover:bg-main-bg transition-colors">
                      <td className="px-6 py-4 font-bold text-main-heading">{getEmployeeName(ev.employeeId)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-main-heading">{getModuleTitle(ev.moduleId)}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{ev.submittedDate}</td>
                      <td className="px-6 py-4">
                        {ev.retakeCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 rounded-full">
                            <RotateCcw size={11} /> Retake #{ev.retakeCount}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">First attempt</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ev.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            <Hourglass size={11} className="animate-pulse" /> Pending
                          </span>
                        ) : ev.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            <ShieldCheck size={11} /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-red-50 text-red-600 border border-red-200 rounded-full">
                            <ShieldX size={11} /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ev.status === 'pending' ? (
                          <button
                            onClick={() => openModuleEvalModal(ev)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-hover transition-colors"
                          >
                            <Check size={15} /> Review
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">{ev.evaluatedDate}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Content (existing assessment tabs) */}
        {activeTab !== 'module-evaluations' && (
        <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-main-bg text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-main-border transition-colors">
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Assignment Details</th>
                        <th className="px-6 py-4">Submitted</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-main-border transition-colors">
                    {paginatedEvaluations.length > 0 ? (
                        paginatedEvaluations.map((item) => (
                            <tr key={item.id} className="hover:bg-main-bg transition-colors">
                                <td className="px-6 py-5 font-bold text-main-heading text-base">{item.studentName}</td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-main-heading font-bold text-sm">{item.assignmentTitle}</span>
                                            {item.aiAnalysis && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-bold border border-purple-100 uppercase tracking-tighter">
                                                    <Sparkles size={10} />
                                                    AI Assessed
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 font-bold mt-0.5">{item.moduleTitle}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-slate-500 text-sm font-bold">{item.submissionDate}</td>
                                <td className="px-6 py-5">
                                    <span className={`px-3 py-1.5 rounded-fall text-xs font-bold flex w-fit items-center gap-1.5 rounded-full border ${
                                        item.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                        item.status === 'Failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                        'bg-green-50 text-green-600 border-green-100'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            item.status === 'Pending' ? 'bg-orange-500' : 
                                            item.status === 'Failed' ? 'bg-red-500' :
                                            'bg-green-500'
                                        }`}></span>
                                        {item.status === 'Pending' ? 'Needs Grading' : 
                                         item.status === 'Graded' ? `Score: ${item.score}/100` :
                                         `${item.status} (${item.score || 0}%)`}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-3">
                                        {item.status === 'Pending' ? (
                                            <button 
                                            onClick={() => handleOpenGrade(item)}
                                            className="flex items-center gap-1.5 text-brand-primary-text bg-brand-primary hover:bg-brand-hover px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm active:scale-95"
                                            >
                                                <Check size={16} /> Grade
                                            </button>
                                        ) : (
                                            <button className="flex items-center gap-1.5 text-main-heading bg-main-bg hover:bg-main-border px-4 py-2 rounded-md text-sm font-bold transition-colors border border-main-border">
                                                <FileText size={16} /> View
                                            </button>
                                        )}
                                </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                No {activeTab} evaluations found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        )}

        {/* Pagination Footer */}
        {activeTab !== 'module-evaluations' && totalPages > 1 && (
            <div className="p-4 border-t border-main-border bg-main-bg flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold text-slate-500">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredEvaluations.length)} of {filteredEvaluations.length}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-main-border text-main-heading hover:bg-main-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-main-heading flex items-center">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-main-border text-main-heading hover:bg-main-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Grading Modal */}
      {isModalOpen && selectedEvaluation && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-main-surface rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-main-border transition-colors">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-main-border flex justify-between items-center bg-main-bg transition-colors">
                  <div>
                    <h3 className="text-xl font-bold text-main-heading">{selectedEvaluation.assignmentTitle}</h3>
                    <p className="text-sm text-slate-500 font-bold">
                      Submission by <span className="text-brand-primary">{selectedEvaluation.studentName}</span> • {selectedEvaluation.moduleTitle}
                    </p>
                  </div>
                  <button onClick={handleCloseModal} className="text-slate-400 hover:text-main-heading transition-colors p-2 bg-main-surface rounded-full border border-main-border hover:bg-main-bg">
                    <X size={20} />
                  </button>
              </div>

              {/* Modal Content */}
                 <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-main-surface custom-scrollbar transition-colors">
                 {/* 1. MCQ Section */}
                 <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                       <Check className="text-green-600" size={16} />
                       Multiple Choice Results
                    </h4>
                    <div className="bg-main-bg rounded-xl p-4 border border-main-border flex items-center gap-4 transition-colors mb-6">
                        <div className="w-16 h-16 rounded-full bg-brand-primary text-brand-primary-text flex items-center justify-center text-xl font-bold shadow-sm">
                            {getDetails(selectedEvaluation.id).mcq.correct}/{getDetails(selectedEvaluation.id).mcq.total}
                        </div>
                        <div>
                           <p className="font-bold text-main-heading text-lg">
                             {Math.round((getDetails(selectedEvaluation.id).mcq.correct / getDetails(selectedEvaluation.id).mcq.total) * 100)}% Correct
                           </p>
                           <p className="text-sm text-slate-500 font-bold transition-colors">Auto-graded system result</p>
                        </div>
                    </div>

                    {/* Detailed MCQ Breakdown */}
                    {getDetails(selectedEvaluation.id).mcqDetails && (
                        <div className="space-y-4 mb-8">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Detailed Breakdown</h5>
                            {getDetails(selectedEvaluation.id).mcqDetails.map((detail: any, idx: number) => (
                                <div key={idx} className={`p-4 rounded-xl border ${detail.isCorrect ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900'}`}>
                                    <p className="font-semibold text-main-heading text-sm mb-2">{idx + 1}. {detail.question}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className={`p-2 rounded-lg border flex items-center gap-2 ${detail.isCorrect ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'}`}>
                                            {detail.isCorrect ? <Check size={14} /> : <X size={14} />}
                                            <span className="font-bold">Student Answer:</span> {detail.selectedOption}
                                        </div>
                                        {!detail.isCorrect && (
                                            <div className="p-2 rounded-lg bg-main-bg border border-main-border flex items-center gap-2 text-slate-500">
                                                <Check size={14} className="text-green-500" />
                                                <span className="font-bold">Correct Answer:</span> {detail.correctOption}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>

                 {/* Module Context */}
                 <div className="mb-8">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                       <FileText className="text-brand-primary" size={16} />
                       Module Context
                    </h4>
                    <div className="bg-main-bg rounded-xl border border-main-border overflow-hidden">
                        {data.modules.find(m => m.title === selectedEvaluation.moduleTitle)?.sections?.map(section => (
                            <div key={section.id}>
                                <div className="px-4 py-2 bg-main-surface border-b border-main-border text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    {section.title}
                                </div>
                                <div className="divide-y divide-main-border">
                                    {section.components.map(comp => (
                                        <div key={comp.id} className={`px-4 py-3 flex items-center justify-between ${comp.title === selectedEvaluation.assignmentTitle ? 'bg-brand-primary/5' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${comp.title === selectedEvaluation.assignmentTitle ? 'bg-brand-primary' : 'bg-slate-300'}`} />
                                                <span className={`text-sm ${comp.title === selectedEvaluation.assignmentTitle ? 'font-bold text-brand-primary' : 'text-main-text'}`}>
                                                    {comp.title}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400 capitalize bg-main-surface px-2 py-0.5 rounded border border-main-border">
                                                {comp.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* 2. Narrative Section */}
                 <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                       <FileText className="text-blue-600" size={16} />
                       Narrative Answers
                    </h4>
                    <div className="space-y-4">
                        {getDetails(selectedEvaluation.id).narrative.map((item: any, idx: number) => {
                          const wordCount = item.answer.trim().split(/\s+/).length;
                          return (
                            <div key={idx} className="bg-main-bg rounded-xl p-5 border border-main-border transition-colors">
                               <div className="flex justify-between items-start mb-2">
                                 <p className="text-sm font-bold text-slate-400 transition-colors">Q{idx + 1}: {item.question}</p>
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${wordCount < 20 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'}`}>
                                   {wordCount} words
                                 </span>
                               </div>
                               <p className="text-sm text-main-heading leading-relaxed font-bold bg-main-surface p-3 rounded border border-main-border transition-colors">
                                 {item.answer}
                               </p>
                            </div>
                          );
                        })}
                    </div>
                 </div>

                 {/* 3. AI Analysis Section */}
                 <div>
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Sparkles className="text-purple-600" size={16} />
                          AI Assessment
                       </h4>
                       {!aiAnalysis && (
                          <button 
                            onClick={runAiEvaluation}
                            disabled={isAnalyzing}
                            className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-semibold hover:bg-purple-100 transition-colors flex items-center gap-1 border border-purple-100 disabled:opacity-50"
                          >
                             {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
                             {!isAnalyzing && <Sparkles size={12} />}
                          </button>
                       )}
                    </div>

                    {isAnalyzing && (
                      <div className="bg-purple-50/50 rounded-xl p-8 border border-purple-100 flex flex-col items-center justify-center text-center">
                         <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                         <p className="text-purple-900 font-semibold text-sm">Evaluating narrative quality...</p>
                      </div>
                    )}

                    {aiAnalysis && (
                       <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <div>
                                <h5 className="text-xs font-semibold text-purple-800 uppercase mb-2">Summary</h5>
                                <p className="text-sm text-purple-900 leading-relaxed font-medium">
                                   {aiAnalysis.summary}
                                </p>
                             </div>
                             <div>
                                <h5 className="text-xs font-semibold text-purple-800 uppercase mb-2">Detailed Feedback</h5>
                                <p className="text-sm text-purple-900 leading-relaxed font-medium">
                                   {aiAnalysis.narrativeFeedback}
                                </p>
                             </div>
                          </div>
                          
                          <div className="flex gap-4 border-t border-purple-100 pt-4 mt-2">
                             <div>
                                <span className="text-xs font-semibold text-purple-600 block">Narrative Score</span>
                                <span className="text-xl font-semibold text-purple-900">{aiAnalysis.narrativeScore}/100</span>
                             </div>
                             <div>
                                <span className="text-xs font-semibold text-purple-600 block">Recommended Grade</span>
                                <span className="text-xl font-semibold text-purple-900">{aiAnalysis.overallScore}/100</span>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              {/* Modal Footer (Grading Form) */}
              <div className="p-6 bg-main-bg border-t border-main-border z-10 transition-colors">
                 <div className="flex flex-col md:flex-row gap-5 items-end">
                    <div className="flex-1 w-full">
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 transition-colors">Instructor Feedback</label>
                       <textarea 
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Add your final comments..." 
                          className="w-full h-20 bg-main-surface border border-main-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-brand-primary/5 outline-none resize-none text-main-heading transition-colors"
                       />
                    </div>
                    <div className="w-full md:w-32">
                       <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 transition-colors">Final Score</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            max="100"
                            min="0"
                            value={finalScore}
                            onChange={(e) => setFinalScore(Number(e.target.value))}
                            className="w-full bg-main-surface border border-main-border rounded-xl py-2.5 px-3 text-lg font-semibold text-main-heading focus:ring-2 focus:ring-brand-primary/5 outline-none text-center transition-colors" 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm transition-colors">/100</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-main-border transition-colors">
                    <button onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl border border-main-border bg-main-surface text-slate-600 font-semibold text-sm hover:bg-main-bg transition-colors">
                       Cancel
                    </button>
                    <button 
                       onClick={() => handleSubmitGrade('Fail')}
                       className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
                    >
                       Reject / Fail
                    </button>
                     <button 
                       onClick={() => handleSubmitGrade('Pass')}
                       className="px-6 py-2.5 rounded-xl bg-brand-primary text-brand-primary-text font-semibold text-sm hover:bg-brand-hover transition-colors shadow-sm"
                    >
                       Approve & Pass
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Module Evaluation Review Modal */}
      {isModuleEvalModalOpen && selectedModuleEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-main-surface rounded-xl shadow-xl w-full max-w-lg border border-main-border flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-main-border flex justify-between items-start bg-main-bg rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-main-heading">Review Module Submission</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  <span className="font-bold text-brand-primary">{getEmployeeName(selectedModuleEval.employeeId)}</span>
                  {' '}· {getModuleTitle(selectedModuleEval.moduleId)}
                </p>
              </div>
              <button
                onClick={() => setIsModuleEvalModalOpen(false)}
                className="text-slate-400 hover:text-main-heading transition-colors p-1.5 rounded-lg hover:bg-main-surface"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-main-bg rounded-lg border border-main-border">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Submitted</p>
                  <p className="font-semibold text-main-heading">{selectedModuleEval.submittedDate}</p>
                </div>
                <div className="p-3 bg-main-bg rounded-lg border border-main-border">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attempt</p>
                  <p className="font-semibold text-main-heading">
                    {selectedModuleEval.retakeCount === 0 ? 'First attempt' : `Retake #${selectedModuleEval.retakeCount}`}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Feedback / Note <span className="text-red-400">(required to reject)</span>
                </label>
                <textarea
                  value={moduleEvalNote}
                  onChange={e => setModuleEvalNote(e.target.value)}
                  placeholder="Write your evaluation feedback..."
                  rows={4}
                  className="w-full bg-main-bg border border-main-border rounded-xl p-3 text-sm text-main-heading focus:outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-main-border flex justify-end gap-3">
              <button
                onClick={() => setIsModuleEvalModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-main-border bg-main-surface text-slate-600 font-semibold text-sm hover:bg-main-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectModule}
                disabled={!moduleEvalNote.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldX size={16} /> Reject
              </button>
              <button
                onClick={handleApproveModule}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-brand-primary-text font-semibold text-sm hover:bg-brand-hover transition-colors shadow-sm"
              >
                <ShieldCheck size={16} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;