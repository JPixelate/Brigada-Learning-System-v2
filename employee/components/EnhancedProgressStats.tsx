import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  Target, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Star, 
  Clock, 
  Calendar, 
  ChevronRight, 
  X, 
  Sparkles, 
  CheckCircle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Medal
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EnhancedProgressStats = ({ 
  totalXP, 
  currentStreak, 
  myCerts, 
  avgScore, 
  inProgress, 
  activityData,
  totalModules,
  achievements = [],
  weeklyGoal = 10, // hours
  lastActivityDate // for streak warning
}: any) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  // Calculate values
  const currentLevel = Math.floor(totalXP / 500) + 1;
  const xpInCurrentLevel = totalXP % 500;
  const nextLevelXP = 500;
  const levelProgress = (xpInCurrentLevel / nextLevelXP) * 100;
  
  const weeklyHours = activityData.reduce((sum: number, day: any) => sum + day.hours, 0);
  const weeklyGoalProgress = (weeklyHours / weeklyGoal) * 100;

  useEffect(() => {
    setMounted(true);
  }, []);

  const ModernStatCard = ({ icon: Icon, value, label, subValue, id, colorClass }: any) => (
    <div 
      onMouseEnter={() => setHoveredStat(id)}
      onMouseLeave={() => setHoveredStat(null)}
      className="relative group bg-main-surface/40 backdrop-blur-xl border border-main-border rounded-2xl p-5 transition-all duration-500 hover:border-brand-primary/30 hover:shadow-[0_20px_50px_-15px_rgba(var(--brand-primary-rgb),0.1)] overflow-hidden cursor-default"
    >
      {/* Hover background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-700`} />
      
      <div className="relative flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-main-surface border border-main-border flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Icon size={20} className="text-slate-500 group-hover:text-brand-primary transition-colors duration-300" />
          </div>
          <ArrowUpRight size={14} className="text-slate-300 group-hover:text-brand-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <div>
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-main-heading tracking-tight">{value}</span>
              {subValue && <span className="text-[10px] font-semibold text-emerald-500 mb-1">{subValue}</span>}
           </div>
           <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-1">{label}</p>
        </div>
      </div>
      
      {/* Decorative corner element */}
      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  return (
    <section className="h-full space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-8">
        
        {/* Modern Level Hero Card */}
        <div className="relative p-8 rounded-2xl bg-gradient-to-br from-brand-primary/[0.03] to-purple-500/[0.03] border border-main-border overflow-hidden group">
          {/* Dynamic Background Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] -ml-24 -mb-24 animate-pulse-slow" />
          
          <div className="relative flex flex-col items-center text-center">
            {/* Elegant Circular Progress */}
            <div className="relative mb-8 pt-4">
              <svg className="w-48 h-48 transform -rotate-[225deg]">
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 84 * 0.75} ${2 * Math.PI * 84 * 0.25}`}
                  className="text-slate-100 dark:text-slate-800"
                  strokeLinecap="round"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 84 * 0.75}`}
                  strokeDashoffset={`${2 * Math.PI * 84 * 0.75 * (1 - (mounted ? levelProgress : 0) / 100)}`}
                  className="text-brand-primary transition-all duration-[1500ms] ease-out-expo"
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.4em] mb-1">Level</span>
                <span className="text-6xl font-semibold text-main-heading tracking-tighter drop-shadow-sm">{currentLevel}</span>
                <div className="mt-2 text-xs font-medium text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20 backdrop-blur-sm">
                   {xpInCurrentLevel} / {nextLevelXP} XP
                </div>
              </div>

              {/* Float Icons Around Progress */}
              <div className="absolute top-6 right-2 w-8 h-8 rounded-xl bg-white/50 backdrop-blur-sm border border-white shadow-xl flex items-center justify-center animate-bounce-slow">
                 <Zap size={14} className="text-brand-primary fill-brand-primary" />
              </div>
              <div className="absolute bottom-10 -left-2 w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm border border-white shadow-xl flex items-center justify-center animate-bounce-delayed">
                 <Trophy size={18} className="text-amber-500" />
              </div>
            </div>

            <div className="space-y-2">
               <h2 className="text-xl font-semibold text-main-heading tracking-tight flex items-center gap-2">
                  Elite Developer Path
                  <ShieldCheck size={18} className="text-brand-primary" />
               </h2>
               <p className="text-xs text-slate-500 font-medium uppercase tracking-widest flex items-center gap-2 justify-center">
                  <Flame size={12} className="text-orange-500" />
                  {nextLevelXP - xpInCurrentLevel} XP until next rank
               </p>
            </div>
          </div>
        </div>

        {/* Bento Stat Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ModernStatCard 
            icon={Flame} 
            value={currentStreak} 
            label="Day Streak" 
            subValue="+2"
            id="streak"
            colorClass="from-orange-500 to-red-500"
          />
          <ModernStatCard 
            icon={Activity} 
            value={Math.round(weeklyHours)} 
            label="Hours/Week" 
            subValue={`${Math.round(weeklyGoalProgress)}%`}
            id="activity"
            colorClass="from-blue-500 to-indigo-500"
          />
          <ModernStatCard 
            icon={Target} 
            value={`${avgScore}%`} 
            label="Avg Accuracy" 
            subValue="+1.2%"
            id="score"
            colorClass="from-emerald-500 to-teal-500"
          />
          <ModernStatCard 
            icon={Medal} 
            value={myCerts.length} 
            label="Certificates" 
            subValue="TOP 5%"
            id="certs"
            colorClass="from-fuchsia-500 to-purple-500"
          />
        </div>

        {/* Weekly Engagement Visualization */}
        <div className="bg-main-surface/40 backdrop-blur-xl border border-main-border rounded-2xl p-6 group hover:border-brand-primary/20 transition-all duration-500">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h4 className="text-sm font-semibold text-main-heading uppercase tracking-widest">Learning Pulse</h4>
                 <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] mt-1">Activity over 7 days</p>
              </div>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                 <span className="text-[10px] font-semibold text-brand-primary uppercase tracking-widest">Live Sync</span>
              </div>
           </div>

           <div className="h-40 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="modernPulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.15}/>
                      <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    cursor={{ stroke: 'var(--brand-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-main-surface/90 backdrop-blur-md border border-main-border p-3 rounded-xl shadow-2xl">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.day}</p>
                            <p className="text-sm font-semibold text-main-heading">{payload[0].value} Hours Learned</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <XAxis 
                    dataKey="day" 
                    hide 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="var(--brand-primary)" 
                    strokeWidth={3}
                    fill="url(#modernPulse)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="flex items-center justify-between mt-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-t border-main-border/50 pt-4">
              <span>Weekly Milestone</span>
              <span className="text-brand-primary">{weeklyHours.toFixed(1)} / {weeklyGoal}H</span>
           </div>
        </div>

        {/* Global Progress Overview */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em]">Module Mastery</h4>
              <span className="text-[10px] font-semibold text-brand-primary">{Math.round((myCerts.length / totalModules) * 100)}% Overall</span>
           </div>
           <div className="relative h-1.5 w-full bg-main-bg rounded-full overflow-hidden border border-main-border/30">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-primary to-purple-500 rounded-full transition-all duration-[2000ms]"
                style={{ width: `${(myCerts.length / totalModules) * 100}%` }}
              />
           </div>
        </div>

      </div>
    </section>
  );
};

export default EnhancedProgressStats;
