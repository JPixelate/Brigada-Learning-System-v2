import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Save, 
  CheckCircle, 
  Camera, 
  Edit2, 
  X, 
  Zap, 
  Trophy, 
  Flame, 
  Star, 
  Clock, 
  Target, 
  MoreVertical, 
  Share2, 
  LayoutList, 
  LayoutGrid,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import EnhancedProgressStats from '../components/EnhancedProgressStats';
import { Link } from 'react-router-dom';

const MyProfile = () => {
  const { user, login } = useAuth();
  const { data, updateEmployee } = useData();
  const [isEditing, setIsEditing] = useState(false);

  // Memoize data calculations
  const profileData = useMemo(() => {
    if (!user || !data.employees) return null;

    const employeeId = String(user.id);
    const employee = data.employees.find(e => String(e.id) === employeeId) || user;
    
    const allEnrollments = data.enrollments || [];
    const myEnrollments = allEnrollments.filter(e => String(e.employeeId) === employeeId);
    
    const myCompleted = myEnrollments.filter(e => e.status === 'completed');
    const myInProgress = myEnrollments.filter(e => e.status === 'in_progress');
    
    // XP Calculation
    const totalXP = myEnrollments.reduce((sum, enr) => sum + (enr.progress * 10), 0);
    const currentLevel = Math.floor(totalXP / 500) + 1;
    const xpInCurrentLevel = totalXP % 500;
    const levelProgress = (xpInCurrentLevel / 500) * 100;
    const nextLevelXP = 500 - xpInCurrentLevel;

    const certificateCount = myCompleted.length;

    const myAttempts = (data.quizAttempts || []).filter(q => String(q.employeeId) === employeeId);
    const avgScore = myAttempts.length > 0
      ? Math.round(myAttempts.reduce((sum, q) => sum + q.score, 0) / myAttempts.length)
      : 0;

    // Streak Logic (Fixed to match dashboard)
    const currentStreak = 12;

    // Achievements
    const achievements = [];
    if (certificateCount > 0) achievements.push({ id: 1, name: 'First Milestone', icon: '🎯', earned: true, date: 'Recently', desc: 'Completed first course', progress: 100 });
    if (avgScore >= 90) achievements.push({ id: 2, name: 'High Performer', icon: '🔥', earned: true, date: 'Ongoing', desc: 'Avg score > 90%', progress: 100 });
    
    return {
      employee,
      inProgressCount: myInProgress.length,
      completedCount: myCompleted.length,
      totalCourses: myEnrollments.length,
      certificateCount,
      avgScore,
      totalXP,
      currentLevel,
      xpInCurrentLevel,
      levelProgress,
      nextLevelXP,
      currentStreak,
      achievements,
      myInProgress,
      myEnrollments,
      myCerts: myCompleted
    };
  }, [data, user]);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!user) return;
    const [first, ...rest] = name.split(' ');
    const last = rest.join(' ');
    updateEmployee(user.id, { 
      first_name: first, 
      last_name: last,
      name, 
      email 
    });
    login({ 
      ...user, 
      first_name: first,
      last_name: last,
      name, 
      email 
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setIsEditing(false);
  };

  const [isUploading, setIsUploading] = useState(false);
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'profiles/avatars');

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();

      // Update employee in DB and context
      updateEmployee(user.id, { avatar: result.url, image_url: result.url });
      login({ ...user, avatar: result.url, image_url: result.url });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const activityData = [
    { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 1.2 }, { day: 'Wed', hours: 3.8 },
    { day: 'Thu', hours: 1.1 }, { day: 'Fri', hours: 2.9 }, { day: 'Sat', hours: 0.5 }, { day: 'Sun', hours: 1.7 },
  ];

  if (!profileData) return <div className="p-10 text-center animate-pulse">Loading profile...</div>;

  const { employee, inProgressCount, completedCount, totalCourses, certificateCount, avgScore, totalXP, currentLevel, levelProgress, nextLevelXP, currentStreak, achievements, myInProgress, myEnrollments, myCerts } = profileData;

  // Enrich in-progress courses with module data
  const inProgressWithDetails = myInProgress.map(enrollment => {
    const module = data.modules.find(m => String(m.id) === String(enrollment.moduleId));
    return {
      ...enrollment,
      module
    };
  }).filter(item => item.module);

  return (
    <div className="space-y-10 pb-20 fade-in">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-main-heading tracking-tight leading-snug">
            Professional <span className="text-brand-primary font-medium">Profile</span>
          </h1>
          <p className="text-base text-slate-500 font-normal mt-1">View your learning accomplishments and manage your account.</p>
        </div>
        <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2.5 bg-main-surface border border-main-border rounded-xl text-sm font-medium text-main-text hover:text-main-heading hover:border-slate-300 transition-all shadow-sm">
                <Share2 size={16} /> Share
             </button>
             <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-brand-primary-text rounded-xl text-sm font-medium hover:bg-brand-hover transition-all shadow-md shadow-brand-primary/20">
                <Edit2 size={16} /> Edit Profile
             </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Profile & Main Content */}
        <section className="lg:col-span-8 space-y-10 lg:pr-10">
          
          {/* Enhanced Profile Hero */}
          <div className="bg-main-surface border border-main-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
             <div className="h-32 bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                   <ShieldCheck size={120} />
                </div>
             </div>
             
             <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 items-end -mt-12 relative z-10">
                <div className="relative group/avatar shrink-0">
                   <div className={`w-32 h-32 rounded-2xl p-1 bg-white dark:bg-slate-900 shadow-xl overflow-hidden ring-4 ring-white dark:ring-slate-900 ${isUploading ? 'opacity-50' : ''}`}>
                      <img 
                        src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                        className="w-full h-full object-cover rounded-xl bg-slate-100" 
                        alt={user?.name} 
                      />
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                      <div 
                        className="absolute inset-1 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                         {isUploading ? (
                           <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         ) : (
                           <Camera size={24} className="text-white" />
                         )}
                      </div>
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-lg" title="Active Account">
                      <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                   </div>
                </div>
                
                <div className="flex-1 pb-2">
                   <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-main-heading">{user?.name}</h2>
                      <BadgeCheck size={20} className="text-blue-500 fill-blue-500/10" />
                   </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                       <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                          <Briefcase size={16} className="text-brand-primary" /> {employee?.position}
                       </span>
                       <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                          <Building2 size={16} className="text-brand-primary" /> {employee?.department} • {employee?.business_unit}
                       </span>
                       <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                          <BadgeCheck size={16} className="text-brand-primary" /> Band {employee?.band_id}
                       </span>
                       <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                          <Calendar size={16} className="text-brand-primary" /> Joined {new Date(employee?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                       </span>
                    </div>
                </div>
             </div>
          </div>

          {/* Personal Information Editable Card */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-main-heading flex items-center gap-2">
                   <User size={22} className="text-brand-primary" />
                   Personal Information
                </h3>
                {saved && (
                   <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                      <CheckCircle size={14} /> Saved Successfully
                   </span>
                )}
             </div>

             <div className="bg-main-surface rounded-2xl border border-main-border p-8 shadow-sm">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                       {isEditing ? (
                         <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-main-bg border border-main-border rounded-xl px-4 py-3 text-main-heading font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                         />
                       ) : (
                         <p className="text-base font-semibold text-main-heading flex items-center gap-2 py-1">
                            {employee?.name}
                         </p>
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                       {isEditing ? (
                         <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-main-bg border border-main-border rounded-xl px-4 py-3 text-main-heading font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                         />
                       ) : (
                         <p className="text-base font-semibold text-main-heading py-1">{employee?.email}</p>
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Unit</label>
                       <p className="text-base font-semibold text-main-heading py-1">{employee?.business_unit}</p>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                       <p className="text-base font-semibold text-main-heading py-1">{employee?.department}</p>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Status</label>
                       <p className="text-base font-semibold text-main-heading py-1">{employee?.employment_status} ({employee?.contract_type})</p>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Band / Level</label>
                       <p className="text-base font-semibold text-main-heading py-1">{employee?.band_id}</p>
                    </div>
                 </div>

                {isEditing && (
                   <div className="mt-8 pt-6 border-t border-main-border flex justify-end gap-3">
                      <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-main-heading hover:bg-main-bg transition-colors">Cancel</button>
                      <button onClick={handleSave} className="bg-brand-primary text-brand-primary-text px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover shadow-lg shadow-brand-primary/20 transition-all">Save Changes</button>
                   </div>
                )}
             </div>
          </div>

          {/* My Enrollments - Styled like dashboard */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-main-heading flex items-center gap-2">
                   <BookOpen size={22} className="text-brand-primary" />
                   Active Learning
                </h3>
                <Link to="/employee/courses" className="text-sm font-medium text-slate-500 hover:text-brand-primary transition-colors flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-main-surface">
                   Catalog <ChevronRight size={16} />
                </Link>
             </div>

             <div className="space-y-4">
                {inProgressWithDetails.length > 0 ? (
                   inProgressWithDetails.slice(0, 3).map((item: any) => (
                      <Link to={`/employee/courses/${item.moduleId}`} key={item.id} className="group bg-main-surface border border-main-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-all duration-300">
                         <div className="w-full sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 border border-main-border">
                            <img src={item.module?.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.module?.title} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-main-heading group-hover:text-brand-primary transition-colors mb-2">{item.module?.title}</h4>
                            <div className="flex items-center gap-4 mb-4">
                               <div className="flex-1 h-2 bg-main-bg rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-primary rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
                               </div>
                               <span className="text-xs font-bold text-brand-primary shrink-0">{item.progress}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock size={12} /> Last accessed {new Date(item.lastAccessedDate).toLocaleDateString()}
                               </p>
                               <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                                  Resume <ArrowRight size={14} />
                               </span>
                            </div>
                         </div>
                      </Link>
                   ))
                ) : (
                   <div className="bg-main-surface border border-dashed border-main-border rounded-2xl p-12 text-center">
                      <BookOpen className="text-slate-200 mx-auto mb-4" size={48} />
                      <p className="text-slate-500 font-medium">No active courses. Ready to learn something new?</p>
                      <Link to="/employee/courses" className="text-brand-primary font-bold text-sm mt-3 inline-block hover:underline">Explore Catalog</Link>
                   </div>
                )}
             </div>
          </div>

        </section>

        {/* Right Column: Statistics - Mirror Dashboard */}
        <aside className="lg:col-span-4 lg:pl-10 lg:border-l lg:border-main-border">
           <EnhancedProgressStats 
              totalXP={totalXP}
              currentStreak={currentStreak}
              myCerts={myCerts}
              avgScore={avgScore}
              inProgress={myInProgress}
              activityData={activityData}
              achievements={achievements}
              totalModules={totalCourses}
           />
        </aside>

      </div>
    </div>
  );
};

export default MyProfile;
