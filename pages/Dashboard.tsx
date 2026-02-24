import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Award, Activity, TrendingUp, Calendar, CheckCircle2, PieChart as PieChartIcon, Radar as RadarIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useData } from '../context/DataContext';

const PIE_COLORS = ['var(--brand-primary)', '#f97316', '#0ea5e9', 'var(--border-color)'];

const StatCard = ({ title, value, icon: Icon, colorClass = 'bg-main-bg text-main-heading', subtitle, sparkData, sparkColor }: { title: string, value: string | number, icon: any, colorClass?: string, subtitle?: boolean, sparkData?: { v: number }[], sparkColor?: string }) => (
  <div className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{title}</p>
        <h3 className="text-xl font-bold text-main-heading">{value}</h3>
        {subtitle && <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-1"><span className="font-semibold text-emerald-500">+12%</span> vs last month</p>}
    </div>
    {sparkData && (
      <div className="w-[80px] h-[40px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sparkColor || 'var(--brand-primary)'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={sparkColor || 'var(--brand-primary)'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={sparkColor || 'var(--brand-primary)'} strokeWidth={1.5} fill={`url(#spark-${title.replace(/\s/g, '')})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const sparkEmployees = [{ v: 8 }, { v: 9.5 }, { v: 9 }, { v: 10.2 }, { v: 11 }, { v: 11.8 }, { v: 12.4 }];
const sparkModules = [{ v: 280 }, { v: 295 }, { v: 310 }, { v: 300 }, { v: 325 }, { v: 330 }, { v: 342 }];
const sparkScore = [{ v: 78 }, { v: 80 }, { v: 79 }, { v: 82 }, { v: 81 }, { v: 83 }, { v: 84 }];
const sparkHours = [{ v: 1500 }, { v: 1600 }, { v: 1550 }, { v: 1700 }, { v: 1800 }, { v: 1850 }, { v: 1920 }];

const Dashboard = () => {
  const { data } = useData();
  const { areaChart, barChart, radarChart, pieChart, stats } = data.dashboardData;
  const areaChartData = areaChart;
  const barChartData = barChart;
  const radarData = radarChart;
  const pieData = pieChart;

  return (
    <div className="relative space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            colorClass="bg-main-bg text-main-heading"
            subtitle={true}
            sparkData={sparkEmployees}
            sparkColor="var(--brand-primary)"
        />
        <StatCard
            title="Active Modules"
            value={stats.activeModules}
            icon={BookOpen}
            colorClass="bg-amber-50 text-amber-500"
            subtitle={true}
            sparkData={sparkModules}
            sparkColor="#f59e0b"
        />
        <StatCard
            title="Avg. Quiz Score"
            value={stats.avgQuizScore}
            icon={Award}
            colorClass="bg-emerald-50 text-emerald-500"
            subtitle={true}
            sparkData={sparkScore}
            sparkColor="#10b981"
        />
        <StatCard
            title="Learning Hours"
            value={stats.learningHours}
            icon={Activity}
            colorClass="bg-sky-50 text-sky-500"
            subtitle={true}
            sparkData={sparkHours}
            sparkColor="#0ea5e9"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Main Chart Card */}
        <div className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <button className="bg-main-bg text-main-text px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 hover:bg-main-border transition-colors">
                        <Calendar size={14} /> This Month
                    </button>
                    <h2 className="text-2xl font-semibold text-main-heading mt-2">{stats.currentMonthHours}</h2>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                        <p className="text-slate-500">Total Learning Time</p>
                        <span className="text-emerald-500 font-semibold flex items-center gap-1"><TrendingUp size={12} /> +15.2%</span>
                    </div>
                </div>
                <button className="w-8 h-8 bg-main-bg rounded-xl flex items-center justify-center text-main-heading hover:bg-main-border transition-all">
                    <Activity size={16} />
                </button>
            </div>
            
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--border-color)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--border-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 500}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 500}} />
                    <Tooltip
                      contentStyle={{backgroundColor: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.08)'}}
                      itemStyle={{color: 'var(--text-main)', fontWeight: '600', fontSize: '12px'}}
                      labelStyle={{color: 'var(--text-heading)', fontWeight: '700'}}
                    />
                    <Area type="monotone" dataKey="hours" stroke="var(--brand-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                    <Area type="monotone" dataKey="active" stroke="var(--border-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Weekly Progress Bar Chart */}
        <div className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="text-base font-bold text-main-heading">Weekly Engagement</h3>
                    <p className="text-xs font-semibold text-slate-500">Active employees per day</p>
                </div>
                <button className="w-8 h-8 bg-main-bg rounded-xl flex items-center justify-center text-main-heading hover:bg-main-border transition-colors">
                    <Activity size={16} />
                </button>
            </div>
            
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={barChartData} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} labelStyle={{color: 'var(--text-heading)'}} />
                        <Bar dataKey="activity" radius={[4, 4, 4, 4]}>
                            {barChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--brand-primary)' : 'var(--border-color)'} />
                            ))}
                        </Bar>
                        <Line type="monotone" dataKey="trend" stroke="#f97316" strokeWidth={2} dot={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Complex Table Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Check Table */}
          <div className="xl:col-span-2 bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm overflow-hidden transition-colors">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-main-heading">Recent Completions</h3>
                <Link to="/admin/reports/completion" className="text-main-heading bg-main-bg px-3 py-1.5 rounded-full font-bold text-[10px] hover:bg-main-border transition-colors">See all</Link>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full">
                     <thead className="border-b border-main-border transition-colors">
                         <tr>
                             <th className="text-left pb-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">Employee</th>
                             <th className="text-left pb-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">Module</th>
                             <th className="text-left pb-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">Score</th>
                             <th className="text-left pb-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">Date</th>
                         </tr>
                     </thead>
                      <tbody className="divide-y divide-main-border transition-colors">
                         {data.reportsData.certifiedCompletions.slice(0, 4).map((report) => (
                              <tr key={report.id} className="group hover:bg-main-bg transition-colors">
                                  <td className="py-2.5">
                                      <div className="flex items-center gap-2">
                                         <div className="w-4 h-4 rounded border border-main-border flex items-center justify-center text-transparent group-hover:text-main-heading transition-colors cursor-pointer">
                                             <CheckCircle2 size={12} />
                                         </div>
                                          <p className="text-xs font-bold text-main-heading">{report.employee.name}</p>
                                      </div>
                                  </td>
                                  <td className="py-2.5">
                                      <div className="flex items-center gap-1.5">
                                          <BookOpen size={14} className="text-main-heading" />
                                          <span className="text-xs font-bold text-main-heading">{report.module}</span>
                                      </div>
                                  </td>
                                  <td className="py-2.5 align-middle">
                                      <div className="w-full max-w-[100px]">
                                         <p className="text-xs font-bold text-main-heading mb-0.5">{report.score}%</p>
                                         <div className="w-full bg-main-bg h-1.5 rounded-full overflow-hidden transition-colors">
                                             <div className="bg-brand-primary h-full rounded-full" style={{width: `${report.score}%`}}></div>
                                         </div>
                                      </div>
                                  </td>
                                  <td className="py-2.5">
                                      <p className="text-xs font-bold text-slate-400">{report.completedDate}</p>
                                  </td>
                              </tr>
                        ))}
                      </tbody>
                 </table>
             </div>
          </div>

          {/* Mini Calendar or Secondary Info */}
          <div className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm transition-colors">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-main-heading">Training Schedule</h3>
                <Link to="/admin/calendar" className="text-main-heading bg-main-bg px-3 py-1.5 rounded-full font-bold text-[10px] hover:bg-main-border transition-colors">View All</Link>
              </div>
              <div className="flex flex-col gap-5">
                   {data.trainingSchedule.map((event) => (
                    <div key={event.id} className={`flex gap-3 p-4 rounded-xl shadow-sm border border-main-border transition-all duration-300 ${event.type === 'dark' ? 'bg-brand-primary text-brand-primary-text' : 'bg-main-surface text-main-heading'}`}>
                        <div className={`flex flex-col justify-center items-center border-r pr-3 ${event.type === 'dark' ? 'border-brand-primary-text/20' : 'border-main-border'}`}>
                            <span className="text-xl font-bold">{event.day}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${event.type === 'dark' ? 'opacity-80' : 'text-slate-400'}`}>{event.month}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs">{event.title}</h4>
                            <p className={`text-[10px] mt-0.5 font-medium ${event.type === 'dark' ? 'opacity-80' : 'text-slate-400'}`}>{event.subtitle}</p>
                            <span className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded font-bold ${event.type === 'dark' ? 'bg-white/20' : 'bg-main-bg border border-main-border text-slate-500'}`}>{event.time}</span>
                        </div>
                    </div>
                  ))}
              </div>
          </div>
      </div>

      {/* New Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
         {/* Radar Chart - Skills Analysis */}
         <div className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="text-base font-bold text-main-heading">Department Skills Matrix</h3>
                    <p className="text-xs font-semibold text-slate-500">Average competency levels across teams</p>
                </div>
                <button className="w-8 h-8 bg-main-bg rounded-xl flex items-center justify-center text-main-heading hover:bg-main-border transition-colors">
                    <RadarIcon size={16} />
                </button>
            </div>
            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="var(--border-color)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="var(--brand-primary)"
                            strokeWidth={2}
                            fill="var(--brand-primary)"
                            fillOpacity={0.15}
                        />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{color: 'var(--text-heading)'}} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Pie Chart - Content Distribution */}
         <div className="bg-main-surface p-5 rounded-2xl border border-main-border shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="text-base font-bold text-main-heading">Content Consumption</h3>
                    <p className="text-xs font-semibold text-slate-500">Most popular learning formats</p>
                </div>
                 <button className="w-8 h-8 bg-main-bg rounded-xl flex items-center justify-center text-main-heading hover:bg-main-border transition-colors">
                    <PieChartIcon size={16} />
                </button>
            </div>
            <div className="h-[240px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{color: 'var(--text-heading)'}} />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-main)' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;