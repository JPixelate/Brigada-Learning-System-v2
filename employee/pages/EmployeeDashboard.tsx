import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Clock, 
  Award, 
  BookOpen, 
  Calendar, 
  Megaphone, 
  ChevronRight,
  Star,
  Users,
  PlayCircle,
  Target,
  Zap,
  Trophy,
  BarChart3,
  Flame,
  LayoutList,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import EnhancedProgressStats from '../components/EnhancedProgressStats';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { data } = useData();
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // Get employee's progress data and sort enrollments by recency
  const myEnrollments = [...(data.enrollments || [])]
    .filter(e => e.employeeId === user?.id)
    .sort((a, b) => new Date(b.lastAccessedDate).getTime() - new Date(a.lastAccessedDate).getTime());

  const myComponentProgress = (data.componentProgress || []).filter(cp => cp.employeeId === user?.id);
  const myCerts = (data.employeeCertificates || []).filter(c => c.employeeId === user?.id);
  const myQuizzes = (data.quizAttempts || []).filter(q => q.employeeId === user?.id);

  const getEnrollmentStatus = (moduleId: string) =>
    myEnrollments.find(e => e.moduleId === moduleId)?.status ?? 'not_started';

  // Calculate module progress for each module
  const getModuleProgress = (moduleId: string) => {
    const module = data.modules.find(m => m.id === moduleId);
    if (!module) return 0;

    const totalComponents = module.sections.reduce((sum, section) => sum + section.components.length, 0);
    const completedComponents = myComponentProgress.filter(
      cp => cp.moduleId === moduleId && cp.status === 'completed'
    ).length;

    return totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0;
  };

  // Get modules with progress
  const publishedModules = data.modules.filter(m => m.status === 'Published');
  const modulesWithProgress = publishedModules.map(module => ({
    ...module,
    progress: getModuleProgress(module.id)
  }));

  // Categorize modules by enrollment status (not raw progress)
  const inProgress = modulesWithProgress.filter(m =>
    ['in_progress', 'completed'].includes(getEnrollmentStatus(m.id))
  );
  const completed = modulesWithProgress.filter(m => getEnrollmentStatus(m.id) === 'passed');
  // notStarted: no enrollment OR explicitly not_started — excludes under_evaluation/failed/rejected
  const notStarted = modulesWithProgress.filter(m =>
    ['not_started'].includes(getEnrollmentStatus(m.id)) ||
    !myEnrollments.find(e => e.moduleId === m.id)
  );
  
  // Calculate XP values dynamically based on content
  const calculateModuleMaxXP = (module: any) => {
    let xp = 0;
    module.sections?.forEach((section: any) => {
      section.components?.forEach((comp: any) => {
        switch (comp.type) {
          case 'video': xp += 30; break;
          case 'quiz': xp += 50; break;
          case 'reading': xp += 20; break;
          default: xp += 10;
        }
      });
    });
    return xp > 0 ? xp : 100; // Fallback min XP
  };

  // Calculate user's Total XP
  const completedXP = completed.reduce((sum, m) => sum + calculateModuleMaxXP(m), 0);
  const inProgressXP = inProgress.reduce((sum, m) => {
    const maxXP = calculateModuleMaxXP(m);
    return sum + Math.round((m.progress / 100) * maxXP);
  }, 0);

  const totalXP = completedXP + inProgressXP;
  const avgScore = myQuizzes.length > 0 
    ? Math.round(myQuizzes.reduce((sum, q) => sum + q.score, 0) / myQuizzes.length)
    : 0;
  // Calculate real daily streak
  const calculateStreak = () => {
    if (myComponentProgress.length === 0) return 0;
    
    // Extract unique activity dates (normalized)
    const activeDates = new Set(
      myComponentProgress
        .map(cp => cp.completedDate || cp.lastAccessedDate)
        .filter(Boolean)
        .map(d => {
          const date = new Date(d);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        })
    );

    let streak = 0;
    const now = new Date();
    // Check back from today or yesterday
    let checkDate = new Date(now);
    
    // If no activity today, check if there was activity yesterday (to continue streak)
    if (!activeDates.has(checkDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (activeDates.has(checkDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  };

  const currentStreak = calculateStreak();
  const nextLevel = Math.ceil(totalXP / 500) * 500;
  const levelProgress = ((totalXP % 500) / 500) * 100;

  // Calculate real activity data for the last 7 days
  const calculateActivityData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayName = days[date.getDay()];
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Sum up minutes from all component progress on this specific day
      const minutesOnDay = myComponentProgress
        .filter(cp => cp.completedDate === dateString || cp.lastAccessedDate?.includes(dateString))
        .reduce((sum, cp) => sum + (Number(cp.timeSpentMinutes) || 0) + (Number(cp.timeSpentSeconds) || 0) / 60, 0);

      result.push({
        day: dayName,
        hours: Number((minutesOnDay / 60).toFixed(1))
      });
    }
    return result;
  };

  const activityData = calculateActivityData();

  // --- Intelligent Recommendation Engine ---
  const getPersonalizedRecommendations = () => {
    return notStarted
      .map(course => {
        let score = 0;
        
        // 1. Department/Position Alignment (+50)
        const userDept = user?.department?.toLowerCase();
        const userPos = user?.position?.toLowerCase();
        const courseCategory = (course.category || '').toLowerCase();
        const courseTitle = course.title.toLowerCase();
        
        if (userDept && (courseCategory.includes(userDept) || courseTitle.includes(userDept))) score += 50;
        if (userPos && courseTitle.includes(userPos)) score += 30;

        // 2. Learning Path Synergy (+40)
        // If course is part of ANY learning path designed for user's department
        const relevantPaths = data.learningPaths?.filter(lp => lp.targetAudience === user?.department);
        const inRelevantPath = relevantPaths?.some(lp => lp.modules.includes(course.id));
        if (inRelevantPath) score += 40;

        // 3. Social Proof (Popularity) (+1 for every 100 students)
        score += Math.floor(course.studentsEnrolled / 100);

        // 4. Recency Bonus (+10 for new courses)
        if (course.lastUpdated.includes('hours') || course.lastUpdated.includes('Just now')) score += 10;

        return { ...course, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  };

  const intelligentRecommendations = getPersonalizedRecommendations();

  return (
    <div className="pb-20 fade-in">
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Part: Header + Content */}
        <div className="flex-1 lg:pr-10 space-y-10">
          {/* Header */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="text-3xl font-semibold text-main-heading tracking-tight leading-snug">
                Welcome back, <span className="text-brand-primary font-medium">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-base text-slate-500 font-normal mt-2">You have {inProgress.length} courses in progress. Keep up the great momentum!</p>
            </div>
          </header>

          {/* Continue Learning */}
          <section className="space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-main-heading flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" />
                  Continue Learning
                </h2>
                <Link to="/employee/courses" className="text-sm font-medium text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-main-surface">
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              {inProgress.length > 0 ? (
                <Link to={`/employee/courses/${inProgress[0].id}`} className="block bg-main-surface rounded-2xl border border-main-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                   <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-2/5 aspect-video md:aspect-auto relative overflow-hidden">
                         <img src={inProgress[0].thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Course" />
                         <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm px-3 py-1.5 rounded-lg text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                            <Star size={14} className="text-amber-500 fill-amber-500" /> 4.9
                         </div>
                      </div>
                      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                         <div>
                            <span className="text-xs font-medium text-brand-primary uppercase tracking-wider mb-2 block">{inProgress[0].category || 'Professional'}</span>
                            <h3 className="text-2xl font-semibold text-main-heading mb-3 group-hover:text-brand-primary transition-colors leading-snug">{inProgress[0].title}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{inProgress[0].description}</p>
                         </div>
                         <div className="mt-8 pt-6 border-t border-main-border">
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</span>
                               <span className="text-sm font-semibold text-brand-primary">{inProgress[0].progress}%</span>
                            </div>
                            <div className="h-2 bg-main-bg rounded-full overflow-hidden mb-6">
                               <div className="h-full bg-brand-primary rounded-full transition-all duration-1000" style={{ width: `${inProgress[0].progress}%` }} />
                            </div>
                            <button className="inline-flex items-center justify-center gap-2 w-full bg-brand-primary text-brand-primary-text font-medium px-6 py-3 rounded-xl hover:bg-brand-hover transition-all shadow-sm text-sm">
                              Continue Learning
                              <ArrowRight size={18} />
                            </button>
                         </div>
                      </div>
                   </div>
                </Link>
              ) : (
                <div className="bg-main-surface border border-dashed border-main-border rounded-2xl p-12 lg:p-16 text-center">
                   <BookOpen className="text-slate-300 mx-auto mb-4" size={48} />
                   <p className="text-lg text-slate-500 font-medium">Ready to start your journey?</p>
                   <Link to="/employee/courses" className="text-brand-primary font-medium mt-3 inline-block text-sm hover:underline">Explore the course catalog</Link>
                </div>
              )}
            </div>

            {/* Available Courses */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-main-heading flex items-center gap-2">
                     <BookOpen size={22} className="text-brand-primary" />
                     Available Courses
                  </h3>
                  <div className="flex bg-main-surface p-1 rounded-lg border border-main-border">
                     <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-brand-primary text-brand-primary-text shadow-sm' : 'text-slate-400 hover:text-main-heading'}`}
                     >
                        <LayoutList size={18} />
                     </button>
                     <button 
                        onClick={() => setViewMode('card')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-brand-primary text-brand-primary-text shadow-sm' : 'text-slate-400 hover:text-main-heading'}`}
                     >
                        <LayoutGrid size={18} />
                     </button>
                  </div>
               </div>

                <div className={viewMode === 'card' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                   {intelligentRecommendations.map(course => (
                    <Link 
                       key={course.id} 
                       to={`/employee/courses/${course.id}`}
                       className={`group bg-main-surface rounded-xl border border-main-border overflow-hidden hover:shadow-md transition-all duration-300 block relative ${
                          viewMode === 'list' 
                             ? 'flex flex-col sm:flex-row items-center p-4 gap-6' 
                             : 'flex flex-col'
                       }`}
                    >
                       {/* AI Match Badge */}
                       {course.matchScore > 40 && (
                         <div className="absolute top-0 right-0 z-10">
                            <div className="bg-brand-primary text-white text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg flex items-center gap-1 shadow-lg">
                               <Sparkles size={10} /> Best Fit
                            </div>
                         </div>
                       )}

                       <div className={`${
                          viewMode === 'list' 
                             ? 'w-full sm:w-48 aspect-video rounded-lg overflow-hidden shrink-0' 
                             : 'aspect-video w-full'
                       } relative overflow-hidden bg-main-bg`}>
                          <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                       </div>
                       
                       <div className={`flex-1 min-w-0 ${viewMode === 'card' ? 'p-5' : ''}`}>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded text-center">{course.category || 'Course'}</span>
                             {course.studentsEnrolled > 100 && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                   <Users size={12} /> {course.studentsEnrolled}
                                </span>
                             )}
                             {course.matchScore > 40 && (
                               <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                 <Target size={12} /> {Math.min(99, Math.floor(course.matchScore))}% Match
                               </span>
                             )}
                          </div>
                          
                          <h4 className="text-base font-bold text-main-heading group-hover:text-brand-primary transition-colors mb-2 line-clamp-1">{course.title}</h4>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{course.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto">
                             <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                <span className="flex items-center gap-1.5 bg-main-bg px-2 py-1 rounded-md border border-main-border">
                                   <Clock size={12} /> {course.duration}
                                </span>
                                <span className="flex items-center gap-1.5 bg-main-bg px-2 py-1 rounded-md border border-main-border">
                                   <BookOpen size={12} /> {course.sections?.length || 0} Modules
                                </span>
                             </div>
                             {viewMode === 'list' && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                                   Start Now <ArrowRight size={14} />
                                </span>
                             )}
                          </div>
                       </div>
                    </Link>
                  ))}
                </div>
               
               <div className="text-center pt-2">
                  <Link to="/employee/courses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-brand-primary transition-colors px-4 py-2 rounded-lg hover:bg-main-surface border border-transparent hover:border-main-border">
                     Browsing all courses <ArrowRight size={16} />
                  </Link>
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-main-heading flex items-center gap-2">
                     <Megaphone size={22} className="text-brand-primary" />
                     Latest News
                  </h3>
                  <Link to="/employee/announcements" className="text-sm font-medium text-slate-500 hover:text-brand-primary transition-colors flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-main-surface">
                     View All <ChevronRight size={16} />
                  </Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.announcements.slice(0, 4).map((ann) => (
                    <div key={ann.id} className="bg-main-surface rounded-2xl border border-main-border p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col h-full">
                       <div className="flex items-center gap-2 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{ann.date}</p>
                       </div>
                       <h4 className="text-base font-bold text-main-heading group-hover:text-brand-primary transition-colors mb-2 line-clamp-1">{ann.title}</h4>
                       <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">{ann.content}</p>
                       
                       <div className="mt-auto pt-4 border-t border-main-border flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            Since {ann.date}
                          </span>
                          <span className="text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Read More <ArrowRight size={12} />
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Upcoming Schedule */}
            <div className="space-y-6">
               <h3 className="text-xl font-semibold text-main-heading flex items-center gap-2">
                  <Calendar size={22} className="text-brand-primary" />
                  Upcoming Schedule
               </h3>
               <div className="bg-main-surface rounded-2xl border border-main-border p-6 space-y-4 shadow-sm">
                  {(data.calendarEvents || []).slice(0, 3).map((event: any) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-main-bg transition-colors group cursor-pointer">
                       <div className="w-16 h-16 bg-main-bg rounded-xl flex flex-col items-center justify-center border border-main-border group-hover:border-brand-primary transition-colors shrink-0">
                          <span className="text-xs font-medium text-slate-400 uppercase">{event.month || (event.date ? event.date.split(' ')[0] : '')}</span>
                          <span className="text-xl font-semibold text-main-heading">{event.day}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-base font-medium text-main-heading group-hover:text-brand-primary transition-colors truncate">{event.title}</h4>
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                            <Clock size={14} /> {event.time} · {event.location}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        </div>

        {/* Right Part: Persistent Progress Sidebar */}
        <aside className="lg:w-[400px] lg:pl-10 lg:border-l lg:border-main-border shrink-0">
          <EnhancedProgressStats 
            totalXP={totalXP}
            currentStreak={currentStreak}
            myCerts={myCerts}
            avgScore={avgScore}
            inProgress={inProgress}
            activityData={activityData}
            totalModules={publishedModules.length}
          />
        </aside>

      </div>
    </div>
  );
};

export default EmployeeDashboard;
