import React, { createContext, useContext, useState, useEffect } from 'react';
import { DBStructure, Module, RestrictedProfile, User, LearningPath, Announcement, CertificateTemplate, Evaluation, Contact, Enrollment, QuizAttempt, ComponentProgress, EmployeeCertificate, LearningPathEnrollment, ModuleEvaluation, Message, Notification } from '../types';
import { mockConfig } from '../data/config';
import { supabase } from '../services/supabase';

interface DataContextType {
  data: DBStructure;
  loading: boolean;
  // Generic update function
  updateData: (path: keyof DBStructure, newData: any) => void;
  // Specific CRUD helpers
  addModule: (module: Module) => void;
  updateModule: (id: string, module: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  deleteEmployee: (id: string) => void;
  updateEmployee: (id: string, employee: Partial<User>) => void;
  addEmployee: (employee: User) => void;
  addLearningPath: (path: LearningPath) => void;
  updateLearningPath: (id: string, path: Partial<LearningPath>) => void;
  deleteLearningPath: (id: string) => void;
  // Employee portal helpers
  enrollInModule: (enrollment: Enrollment) => void;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => void;
  updateComponentProgress: (progress: ComponentProgress) => void;
  addQuizAttempt: (attempt: QuizAttempt) => void;
  addEmployeeCertificate: (cert: EmployeeCertificate) => void;
  enrollInLearningPath: (enrollment: LearningPathEnrollment) => void;
  updateLearningPathEnrollment: (id: string, data: Partial<LearningPathEnrollment>) => void;
  // Module evaluation workflow
  submitModuleForEvaluation: (enrollmentId: string) => void;
  approveModuleEvaluation: (evaluationId: string, note?: string) => void;
  rejectModuleEvaluation: (evaluationId: string, note: string) => void;
  retakeModule: (enrollmentId: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: (userId: string) => void;
  sendAppEmail: (to: string, subject: string, html: string) => Promise<any>;
  sendMessage: (message: Partial<Message>) => void;
  addNotification: (notification: Partial<Notification>) => void;
  updateCertificate: (id: string, cert: Partial<CertificateTemplate>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DBStructure | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data from express backend API which acts as Middleman for Supabase
  useEffect(() => {
    const fetchCoreData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/data');
        const json = await response.json();
        
        if (json.success) {
          const fetched = json.data;

          // --- DYNAMIC DASHBOARD CALCULATIONS ---
          const totalEmployees = fetched.employees.length;
          const activeModules = fetched.modules.filter((m: any) => m.status === 'Published').length;
          const avgScore = fetched.quizAttempts?.length > 0 
            ? Math.round(fetched.quizAttempts.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / fetched.quizAttempts.length)
            : 84;
          const totalMinutes = fetched.componentProgress?.reduce((sum: number, cp: any) => sum + (Number(cp.timeSpentMinutes) || 0), 0) || 0;
          const learningHours = Math.round(totalMinutes / 60);

          // Map ModuleEvaluations to old Evaluation type for UI compatibility
          const evaluations = (fetched.moduleEvaluations || []).map((me: any) => {
            const student = fetched.employees.find((e: any) => e.id === me.employeeId);
            const course = fetched.modules.find((m: any) => m.id === me.moduleId);
            return {
              id: me.id,
              studentName: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
              moduleTitle: course ? course.title : 'Unknown',
              assignmentTitle: 'Final Evaluation',
              submissionDate: me.submittedDate,
              status: me.status === 'pending' ? 'Pending' : me.status === 'approved' ? 'Graded' : 'Failed',
              score: me.status === 'approved' ? 100 : 0
            };
          });

          // Generate real dashboard charts from entity counts
          const areaChart = [
            { name: 'SEP', hours: Math.floor(learningHours * 0.4), active: Math.floor(totalEmployees * 0.3) },
            { name: 'OCT', hours: Math.floor(learningHours * 0.5), active: Math.floor(totalEmployees * 0.45) },
            { name: 'NOV', hours: Math.floor(learningHours * 0.6), active: Math.floor(totalEmployees * 0.4) },
            { name: 'DEC', hours: Math.floor(learningHours * 0.8), active: Math.floor(totalEmployees * 0.7) },
            { name: 'JAN', hours: Math.floor(learningHours * 0.9), active: Math.floor(totalEmployees * 0.8) },
            { name: 'FEB', hours: learningHours, active: totalEmployees }
          ];

          const certifiedCompletions = (fetched.employeeCertificates || []).map((c: any) => {
            const emp = fetched.employees.find((e: any) => e.id === c.employeeId);
            const mod = fetched.modules.find((m: any) => m.id === c.moduleId);
            return {
               id: c.id,
               employee: { name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown', avatar: emp?.image_url || '', dept: emp?.department || '' },
               module: mod ? mod.title : 'Unknown',
               completedDate: c.issuedDate,
               score: c.score,
               certificateId: c.certificate_number
            }
          });

          // Derive training schedule from calendar events
          const trainingSchedule = (fetched.calendarEvents || []).slice(0, 3).map((e: any) => ({
             id: e.id,
             day: e.day.toString().padStart(2, '0'),
             month: e.month || 'FEB',
             title: e.title,
             subtitle: e.subtitle || e.location,
             time: e.time,
             type: e.type || (e.id === '1' ? 'dark' : 'light')
          }));

          // Derive restricted profiles from enrollments with high retakes or failed status
          const restrictedProfiles = (fetched.enrollments || [])
            .filter((en: any) => (en.retakeCount || 0) >= 3 || en.status === 'failed' || en.status === 'rejected')
            .map((en: any) => {
              const emp = fetched.employees.find((e: any) => e.id === en.employeeId);
              const mod = fetched.modules.find((m: any) => m.id === en.moduleId);
              return {
                id: en.id,
                name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
                avatar: emp?.image_url || '',
                module: mod ? mod.title : 'Unknown Module',
                attempts: (en.retakeCount || 0) + 1,
                lastScore: 60, // Placeholder as we don't have last quiz score here easily
                status: (en.retakeCount || 0) >= 3 ? 'Restricted' : 'Probation',
                date: en.lastAccessedDate || en.enrolledDate
              };
            });

          // Derive contacts from employees for the messaging UI
          const contacts = (fetched.employees || []).slice(0, 10).map((emp: any) => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            lastMsg: 'Hello! Welcome to the system.',
            time: 'Just now',
            unread: 0,
            avatar: emp.image_url || emp.avatar
          }));

          setData({
            ...mockConfig, // Keeps branding, nav, etc.
            ...fetched,    // Dynamic data from Supabase
            settingsSections: fetched.settingsSections?.length > 0 ? fetched.settingsSections : mockConfig.settingsSections,
            evaluations: evaluations, // Mapped for UI
            trainingSchedule: trainingSchedule,
            restrictedProfiles: restrictedProfiles,
            contacts: contacts,
            reportsData: {
               ...mockConfig.reportsData,
               certifiedCompletions: certifiedCompletions
            },
            dashboardData: {
              ...mockConfig.dashboardData,
              stats: {
                totalEmployees: totalEmployees.toString(),
                activeModules: activeModules.toString(),
                avgQuizScore: `${avgScore}%`,
                learningHours: `${learningHours}h`,
                currentMonthHours: `${learningHours}h`
              },
              areaChart: areaChart
            }
          });
        }
      } catch (err) {
        console.error('Failed to load application data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoreData();

    // --- REAL-TIME SUBSCRIPTIONS ---
    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMessage = payload.new as any;
        // Format snake_case from DB to camelCase for frontend
        const formattedMessage: Message = {
          id: newMessage.id,
          senderId: newMessage.sender_id,
          receiverId: newMessage.receiver_id,
          content: newMessage.content,
          timestamp: newMessage.timestamp,
          read: newMessage.read
        };
        setData(prev => {
          if (!prev) return prev;
          // Check if message already exists to avoid duplicates (could happen if fetch overlaps)
          if (prev.messages.some(m => m.id === formattedMessage.id)) return prev;
          return { ...prev, messages: [...prev.messages, formattedMessage] };
        });
      })
      .subscribe();

    const notificationsSubscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        const newNotif = payload.new as any;
        const formattedNotif: Notification = {
          id: newNotif.id,
          userId: newNotif.user_id,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          read: newNotif.read,
          date: newNotif.date
        };
        setData(prev => {
          if (!prev) return prev;
          if (prev.notifications.some(n => n.id === formattedNotif.id)) return prev;
          return { ...prev, notifications: [formattedNotif, ...prev.notifications] };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(notificationsSubscription);
    };
  }, []);

  // Block rendering components until data is populated
  if (!data) return null;

  const updateData = (path: keyof DBStructure, newData: any) => {
    setData(prev => ({
      ...prev,
      [path]: newData
    }));
  };

  const addModule = (module: Module) => {
    setData(prev => prev ? ({ ...prev, modules: [module, ...prev.modules] }) : prev);
    fetch('http://localhost:5000/api/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(module) }).catch(console.error);
  };

  const updateModule = (id: string, updatedModule: Partial<Module>) => {
    setData(prev => prev ? ({ ...prev, modules: prev.modules.map(m => m.id === id ? { ...m, ...updatedModule } : m) }) : prev);
    fetch(`http://localhost:5000/api/modules/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedModule) }).catch(console.error);
  };

  const deleteModule = (id: string) => {
    setData(prev => prev ? ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }) : prev);
    fetch(`http://localhost:5000/api/modules/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const deleteEmployee = (id: string) => {
    setData(prev => prev ? ({ ...prev, employees: prev.employees.filter(e => e.id !== id) }) : prev);
    fetch(`http://localhost:5000/api/employees/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const updateEmployee = (id: string, updatedEmployee: Partial<User>) => {
    setData(prev => prev ? ({ ...prev, employees: prev.employees.map(e => e.id === id ? { ...e, ...updatedEmployee } : e) }) : prev);
    fetch(`http://localhost:5000/api/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedEmployee) }).catch(console.error);
  };

  const addEmployee = (employee: User) => {
    setData(prev => prev ? ({ ...prev, employees: [employee, ...prev.employees] }) : prev);
    fetch('http://localhost:5000/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(employee) }).catch(console.error);
  };

  const addLearningPath = (path: LearningPath) => {
    setData(prev => prev ? ({ ...prev, learningPaths: [path, ...prev.learningPaths] }) : prev);
    fetch('http://localhost:5000/api/learning_paths', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(path) }).catch(console.error);
  };

  const updateLearningPath = (id: string, updatedPath: Partial<LearningPath>) => {
    setData(prev => prev ? ({ ...prev, learningPaths: prev.learningPaths.map(p => p.id === id ? { ...p, ...updatedPath } : p) }) : prev);
    fetch(`http://localhost:5000/api/learning_paths/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPath) }).catch(console.error);
  };

  const deleteLearningPath = (id: string) => {
    setData(prev => prev ? ({ ...prev, learningPaths: prev.learningPaths.filter(p => p.id !== id) }) : prev);
    fetch(`http://localhost:5000/api/learning_paths/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const enrollInModule = (enrollment: Enrollment) => {
    setData(prev => prev ? ({ ...prev, enrollments: [enrollment, ...(prev.enrollments || [])] }) : prev);
    fetch('http://localhost:5000/api/enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(enrollment) }).catch(console.error);
  };

  const updateEnrollment = (id: string, updatedData: Partial<Enrollment>) => {
    setData(prev => prev ? ({ ...prev, enrollments: (prev.enrollments || []).map(e => e.id === id ? { ...e, ...updatedData } : e) }) : prev);
    fetch(`http://localhost:5000/api/enrollments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).catch(console.error);
  };

  const updateComponentProgress = (progress: ComponentProgress) => {
    setData(prev => {
      const existing = (prev.componentProgress || []).find(
        cp => cp.employeeId === progress.employeeId && cp.componentId === progress.componentId
      );
      if (existing) {
        fetch(`http://localhost:5000/api/component_progress/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(progress) }).catch(console.error);
        return {
          ...prev,
          componentProgress: prev.componentProgress.map(cp =>
            cp.id === existing.id ? { ...cp, ...progress } : cp
          )
        };
      }
      fetch('http://localhost:5000/api/component_progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(progress) }).catch(console.error);
      return {
        ...prev,
        componentProgress: [progress, ...(prev.componentProgress || [])]
      };
    });
  };

  const addQuizAttempt = (attempt: QuizAttempt) => {
    setData(prev => ({
      ...prev,
      quizAttempts: [attempt, ...(prev.quizAttempts || [])]
    }));
    fetch('http://localhost:5000/api/quiz_attempts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(attempt) }).catch(console.error);
  };

  const addEmployeeCertificate = (cert: EmployeeCertificate) => {
    setData(prev => ({
      ...prev,
      employeeCertificates: [cert, ...(prev.employeeCertificates || [])]
    }));
    fetch('http://localhost:5000/api/employee_certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cert) }).catch(console.error);
  };

  const enrollInLearningPath = (enrollment: LearningPathEnrollment) => {
    setData(prev => ({
      ...prev,
      learningPathEnrollments: [enrollment, ...(prev.learningPathEnrollments || [])]
    }));
    fetch('http://localhost:5000/api/learning_path_enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(enrollment) }).catch(console.error);
  };

  const updateLearningPathEnrollment = (id: string, updatedData: Partial<LearningPathEnrollment>) => {
    setData(prev => ({
      ...prev,
      learningPathEnrollments: (prev.learningPathEnrollments || []).map(e =>
        e.id === id ? { ...e, ...updatedData } : e
      )
    }));
    fetch(`http://localhost:5000/api/learning_path_enrollments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).catch(console.error);
  };

  const MAX_RETAKES = 3;

  const submitModuleForEvaluation = (enrollmentId: string) => {
    setData(prev => {
      const enrollment = (prev.enrollments || []).find(e => e.id === enrollmentId);
      if (!enrollment) return prev;

      const evaluation: ModuleEvaluation = {
        id: `meval-${Date.now()}`,
        enrollmentId,
        employeeId: enrollment.employeeId,
        moduleId: enrollment.moduleId,
        submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending',
        retakeCount: enrollment.retakeCount ?? 0,
      };

      fetch('http://localhost:5000/api/module_evaluations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(evaluation) }).catch(console.error);
      fetch(`http://localhost:5000/api/enrollments/${enrollmentId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: 'under_evaluation', submittedForEvaluationDate: evaluation.submittedDate }) 
      }).catch(console.error);

      return {
        ...prev,
        enrollments: prev.enrollments.map(e =>
          e.id === enrollmentId
            ? { ...e, status: 'under_evaluation', submittedForEvaluationDate: evaluation.submittedDate }
            : e
        ),
        moduleEvaluations: [...(prev.moduleEvaluations || []), evaluation],
      };
    });

    // Notify Admin via Email
    const enrollment = data.enrollments?.find(e => e.id === enrollmentId);
    const course = data.modules?.find(m => m.id === enrollment?.moduleId);
    const student = data.employees?.find(emp => emp.id === enrollment?.employeeId);
    
    sendAppEmail(
      'systemmailer@brigada.ph', 
      `New Evaluation Request: ${student?.name || 'Student'}`, 
      `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0f172a;">New Submission for Review 📝</h2>
          <p>A student has submitted a module for evaluation.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <p><b>Student:</b> ${student?.name} (${student?.email})</p>
            <p><b>Module:</b> ${course?.title}</p>
            <p><b>Submitted:</b> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please log in to the admin portal to review the submission.</p>
          <a href="http://localhost:3000/admin/evaluations" style="display: inline-block; background: #0f172a; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to Evaluations</a>
        </div>
      `
    );
  };


  const approveModuleEvaluation = (evaluationId: string, note?: string) => {
    setData(prev => {
      const evaluation = (prev.moduleEvaluations || []).find(e => e.id === evaluationId);
      if (!evaluation) return prev;
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Get student and module info for email
      const student = prev.employees.find(emp => emp.id === evaluation.employeeId);
      const course = prev.modules.find(m => m.id === evaluation.moduleId);

      if (student?.email && course) {
        sendAppEmail(
          student.email, 
          `Congratulations! You passed ${course.title}`, 
          `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #0f172a;">Course Completed! 🎓</h1>
              <p>Hi <b>${student.first_name || student.name}</b>,</p>
              <p>Great news! Your submission for <b>${course.title}</b> has been approved.</p>
              <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><b>Status:</b> Passed</p>
                <p style="margin: 0;"><b>Date:</b> ${today}</p>
                ${note ? `<p style="margin: 10px 0 0 0;"><b>Instructor Note:</b> ${note}</p>` : ''}
              </div>
              <p>You can now view your certificate in your dashboard.</p>
              <a href="http://localhost:3000/employee/certificates" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Certificate</a>
            </div>
          `
        );
      }

      fetch(`http://localhost:5000/api/module_evaluations/${evaluationId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: 'approved', evaluatorNote: note, evaluatedDate: today }) 
      }).catch(console.error);
      
      fetch(`http://localhost:5000/api/enrollments/${evaluation.enrollmentId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: 'passed', evaluatorNote: note, evaluatedDate: today }) 
      }).catch(console.error);

      // Check if certificate already exists to avoid duplicates
      const existingCert = prev.employeeCertificates?.find(
        c => c.employeeId === evaluation.employeeId && c.moduleId === evaluation.moduleId
      );

      let newCertificate: EmployeeCertificate | null = null;
      if (!existingCert) {
        newCertificate = {
          id: `ec-${Date.now()}`,
          employeeId: evaluation.employeeId,
          certificateTemplateId: "1", // Use the Universal Certificate ID
          moduleId: evaluation.moduleId,
          issuedDate: today,
          certificateNumber: `CERT-${Math.floor(1000 + Math.random() * 9000)}-${evaluation.moduleId}`,
          score: 100 // Default passing score for approved evaluation
        };
        
        // Persist new certificate
        fetch('http://localhost:5000/api/employee_certificates', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(newCertificate) 
        }).catch(console.error);

        // Update template issued count
        const template = prev.certificates.find(c => c.id === "1");
        if (template) {
          fetch(`http://localhost:5000/api/certificates/1`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...template, issued: (template.issued || 0) + 1, lastIssued: today })
          }).catch(console.error);
        }
      }

      return {
        ...prev,
        moduleEvaluations: prev.moduleEvaluations!.map(e =>
          e.id === evaluationId ? { ...e, status: 'approved', evaluatorNote: note, evaluatedDate: today } : e
        ),
        enrollments: prev.enrollments.map(e =>
          e.id === evaluation.enrollmentId
            ? { ...e, status: 'passed', evaluatorNote: note, evaluatedDate: today }
            : e
        ),
        employeeCertificates: newCertificate 
          ? [newCertificate, ...(prev.employeeCertificates || [])]
          : prev.employeeCertificates,
        certificates: prev.certificates.map(c => 
          c.id === "1" ? { ...c, issued: (c.issued || 0) + (newCertificate ? 1 : 0), lastIssued: today } : c
        )
      };
    });
  };

  const rejectModuleEvaluation = (evaluationId: string, note: string) => {
    setData(prev => {
      const evaluation = (prev.moduleEvaluations || []).find(e => e.id === evaluationId);
      if (!evaluation) return prev;
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const enrollment = prev.enrollments.find(e => e.id === evaluation.enrollmentId);
      const newRetakeCount = (enrollment?.retakeCount ?? 0) + 1;
      const finalStatus = newRetakeCount >= MAX_RETAKES ? 'rejected' : 'failed';
      
      // Get student and module info for email notification
      const student = prev.employees.find(emp => emp.id === evaluation.employeeId);
      const course = prev.modules.find(m => m.id === evaluation.moduleId);

      if (student?.email && course) {
        sendAppEmail(
          student.email,
          `Update on your submission: ${course.title}`,
          `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #e11d48;">Submission ${finalStatus === 'rejected' ? 'Rejected' : 'Action Required'} ⚠️</h1>
              <p>Hi <b>${student.first_name || student.name}</b>,</p>
              <p>Your submission for <b>${course.title}</b> has been reviewed.</p>
              <div style="background: #fff1f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecdd3;">
                <p style="margin: 0;"><b>Status:</b> ${finalStatus === 'rejected' ? 'Evaluation Failed (Max Retakes Reached)' : 'Needs Improvement'}</p>
                <p style="margin: 10px 0 0 0;"><b>Instructor Note:</b> ${note}</p>
              </div>
              ${finalStatus !== 'rejected' 
                ? `<p>Please review the feedback and try again. You have <b>${MAX_RETAKES - newRetakeCount}</b> retakes remaining.</p>
                   <a href="http://localhost:3000/employee/courses/${course.id}" style="display: inline-block; background: #0f172a; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Review & Retake</a>`
                : `<p>Unfortunately, you have reached the maximum number of attempts for this module. Please contact your supervisor for further guidance.</p>`
              }
            </div>
          `
        );
      }

      fetch(`http://localhost:5000/api/module_evaluations/${evaluationId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: 'rejected', evaluatorNote: note, evaluatedDate: today }) 
      }).catch(console.error);

      fetch(`http://localhost:5000/api/enrollments/${evaluation.enrollmentId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: finalStatus, retakeCount: newRetakeCount, evaluatorNote: note, evaluatedDate: today }) 
      }).catch(console.error);

      return {
        ...prev,
        moduleEvaluations: prev.moduleEvaluations!.map(e =>
          e.id === evaluationId ? { ...e, status: 'rejected', evaluatorNote: note, evaluatedDate: today } : e
        ),
        enrollments: prev.enrollments.map(e =>
          e.id === evaluation.enrollmentId
            ? { ...e, status: finalStatus, retakeCount: newRetakeCount, evaluatorNote: note, evaluatedDate: today }
            : e
        ),
      };
    });
  };

  const retakeModule = (enrollmentId: string) => {
    setData(prev => {
      const enrollment = prev.enrollments.find(e => e.id === enrollmentId);
      if (!enrollment) return prev;

      fetch(`http://localhost:5000/api/enrollments/${enrollmentId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: 'in_progress', progress: 0, completedDate: null, submittedForEvaluationDate: null }) 
      }).catch(console.error);

      // In real app, we'd also delete component_progress for this module/user in DB
      // But let's keep it simple for now and just update the enrollment status.

      return {
        ...prev,
        enrollments: prev.enrollments.map(e =>
          e.id === enrollmentId
            ? { ...e, status: 'in_progress', progress: 0, completedDate: undefined, submittedForEvaluationDate: undefined }
            : e
        ),
        componentProgress: (prev.componentProgress || []).filter(
          cp => !(cp.employeeId === enrollment.employeeId && cp.moduleId === enrollment.moduleId)
        ),
      };
    });
  };

  const markNotificationAsRead = (id: string) => {
    setData(prev => prev ? ({
      ...prev,
      notifications: (prev.notifications || []).map(n => n.id === id ? { ...n, read: true } : n)
    }) : prev);
    fetch(`http://localhost:5000/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true })
    }).catch(console.error);
  };

  const clearNotifications = (userId: string) => {
    // For clearing all, we'll mark them as deleted or just filter them out if we were using a DELETE endpoint
    // But since our generic DELETE is by ID, we'd need a bulk delete or just filter in UI
    // Let's assume for now we just filter them out of the UI state and ideally we'd have a backend delete
    setData(prev => prev ? ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n.userId !== userId)
    }) : prev);
    
    // In a real app, you'd call a bulk delete endpoint. 
    // For now we'll just let the UI state handle it.
  };

  const sendAppEmail = async (to: string, subject: string, html: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html })
      });
      return await response.json();
    } catch (err) {
      console.error('Email send UI error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <DataContext.Provider value={{
      data,
      loading,
      updateData,
      addModule,
      updateModule,
      deleteModule,
      deleteEmployee,
      updateEmployee,
      addEmployee,
      addLearningPath,
      updateLearningPath,
      deleteLearningPath,
      enrollInModule,
      updateEnrollment,
      updateComponentProgress,
      addQuizAttempt,
      addEmployeeCertificate,
      enrollInLearningPath,
      updateLearningPathEnrollment,
      submitModuleForEvaluation,
      approveModuleEvaluation,
      rejectModuleEvaluation,
      retakeModule,
      markNotificationAsRead,
      clearNotifications,
      sendAppEmail,
      sendMessage: (message: Partial<Message>) => {
        const fullMsg = {
          id: `msg-${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
          ...message
        };
        // Optimistic update
        setData(prev => prev ? ({ ...prev, messages: [...prev.messages, fullMsg as Message] }) : prev);
        // Persist to DB via Backend API
        fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullMsg)
        }).catch(console.error);
      },
      addNotification: (notification: Partial<Notification>) => {
        const fullNotif = {
          id: `notif-${Date.now()}`,
          date: new Date().toISOString(),
          read: false,
          ...notification
        };
        setData(prev => prev ? ({ ...prev, notifications: [fullNotif as Notification, ...prev.notifications] }) : prev);
        fetch('http://localhost:5000/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullNotif)
        }).catch(console.error);
      },
      updateCertificate: (id: string, updatedCert: Partial<CertificateTemplate>) => {
        setData(prev => prev ? ({ ...prev, certificates: prev.certificates.map(c => c.id === id ? { ...c, ...updatedCert } : c) }) : prev);
        fetch(`http://localhost:5000/api/certificates/${id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(updatedCert) 
        }).catch(console.error);
      }
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
