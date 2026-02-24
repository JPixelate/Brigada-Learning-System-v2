import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, GraduationCap, ArrowRight, BookOpen, Award, Users, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { AuthUser } from '../types';
import FloatingShapes from '../components/FloatingShapes';

const ADMIN_ROLES = ['Super Admin', 'Admin', 'Instructor'];

const Login = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { data } = useData();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/employee', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const employee = data.employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (!employee) {
      setError('No account found with that email address.');
      return;
    }
    const authUser: AuthUser = {
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      name: employee.name || `${employee.first_name} ${employee.last_name}`,
      email: employee.email,
      role: employee.role,
      admin_role: employee.admin_role,
      image_url: employee.image_url,
      avatar: employee.avatar || employee.image_url,
      department: employee.department,
      position: employee.position,
    };
    login(authUser);
    navigate(ADMIN_ROLES.includes(employee.role as string) ? '/admin' : '/employee', { replace: true });
  };

  const handleQuickLogin = (employee: typeof data.employees[0]) => {
    const authUser: AuthUser = {
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      name: employee.name || `${employee.first_name} ${employee.last_name}`,
      email: employee.email,
      role: employee.role,
      admin_role: employee.admin_role,
      image_url: employee.image_url,
      avatar: employee.avatar || employee.image_url,
      department: employee.department,
      position: employee.position,
    };
    login(authUser);
    navigate(ADMIN_ROLES.includes(employee.role as string) ? '/admin' : '/employee', { replace: true });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Shared ambient background (covers entire page) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-3xl animate-orb-float" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl animate-orb-float-2" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/8 dark:bg-cyan-500/10 blur-3xl animate-glow-pulse" />
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? 'white' : '#0f172a'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        <FloatingShapes />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-8 overflow-y-auto">
        <div className="relative w-full max-w-[480px] animate-float-up" style={{ animationDelay: '0.1s' }}>
          {/* Branding header */}
          <div className="text-center mb-6">
            {/* Logo */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 w-full h-full bg-slate-900/5 dark:bg-white/8 rounded-3xl blur-2xl animate-glow-pulse" />
              <img
                src={theme === 'dark' ? "/images/icons/bls_dark.svg" : "/images/icons/bls_light.svg"}
                alt="Logo"
                className={`relative w-44 mx-auto ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
              />
            </div>

            {/* Tagline */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 leading-snug tracking-tight whitespace-nowrap">
              Where{' '}
              <span className="">
                Growth and Learning
              </span>
              {' '}begin
            </h2>
            <p className="text-slate-500 dark:text-white/40 text-sm">
              Build skills, track progress, and grow — all in one place.
            </p>
          </div>

          {/* Floating stat badges - hidden on small screens */}
          {[
            { icon: BookOpen, value: '200+', label: 'Courses', color: 'blue', pos: '-left-48 top-[18%]', delay: '0s' },
            { icon: Users, value: '5K+', label: 'Learners', color: 'violet', pos: '-right-44 top-[22%]', delay: '1.2s' },
            { icon: Award, value: '1.2K', label: 'Certified', color: 'amber', pos: '-left-44 top-[52%]', delay: '2.4s' },
            { icon: TrendingUp, value: '94%', label: 'Completion', color: 'emerald', pos: '-right-40 bottom-[22%]', delay: '0.8s' },
            { icon: Star, value: '4.9', label: 'Rating', color: 'rose', pos: '-left-36 bottom-[16%]', delay: '2s' },
          ].map((stat, i) => {
            const colorMap: Record<string, { iconBg: string; iconText: string; glow: string; accent: string }> = {
              blue:    { iconBg: 'bg-blue-100 dark:bg-blue-500/15',       iconText: 'text-blue-600 dark:text-blue-400',       glow: 'bg-blue-400/20 dark:bg-blue-500/10',       accent: 'from-blue-500 to-blue-600' },
              violet:  { iconBg: 'bg-violet-100 dark:bg-violet-500/15',   iconText: 'text-violet-600 dark:text-violet-400',   glow: 'bg-violet-400/20 dark:bg-violet-500/10',   accent: 'from-violet-500 to-violet-600' },
              amber:   { iconBg: 'bg-amber-100 dark:bg-amber-500/15',     iconText: 'text-amber-600 dark:text-amber-400',     glow: 'bg-amber-400/20 dark:bg-amber-500/10',     accent: 'from-amber-500 to-amber-600' },
              emerald: { iconBg: 'bg-emerald-100 dark:bg-emerald-500/15', iconText: 'text-emerald-600 dark:text-emerald-400', glow: 'bg-emerald-400/20 dark:bg-emerald-500/10', accent: 'from-emerald-500 to-emerald-600' },
              rose:    { iconBg: 'bg-rose-100 dark:bg-rose-500/15',       iconText: 'text-rose-600 dark:text-rose-400',       glow: 'bg-rose-400/20 dark:bg-rose-500/10',       accent: 'from-rose-500 to-rose-600' },
            };
            const c = colorMap[stat.color];
            return (
              <div
                key={i}
                className={`hidden lg:flex items-center gap-3 absolute ${stat.pos} px-3.5 py-2.5 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-black/[0.06] dark:shadow-black/25 border border-white/80 dark:border-white/[0.08] animate-micro-float overflow-hidden`}
                style={{ animationDelay: stat.delay }}
              >
                {/* Soft glow behind icon */}
                <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${c.glow} blur-xl`} />
                <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg ${c.iconBg} ring-1 ring-black/[0.04] dark:ring-white/[0.06]`}>
                  <stat.icon size={15} strokeWidth={2.25} className={c.iconText} />
                </div>
                <div className="relative flex flex-col">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white leading-none tracking-tight">{stat.value}</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-white/35 mt-1 uppercase tracking-wider">{stat.label}</span>
                </div>
              </div>
            );
          })}

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-black/8 dark:shadow-black/20 p-8 sm:p-10 border border-gray-200/60 dark:border-white/10">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight">Welcome back</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to your learning portal</p>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-800 dark:group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-gray-300 dark:focus:border-gray-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-800 dark:group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 focus:border-gray-300 dark:focus:border-gray-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 accent-slate-800 dark:accent-white" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Remember me</span>
                </label>
                <button type="button" className="text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors">
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow-md active:scale-[0.98] group"
              >
                Sign In
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Quick Login Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quick access</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Quick Login Cards */}
              <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                {data.employees.filter(e => e.status === 'Active').map(employee => (
                  <button
                    key={employee.id}
                    onClick={() => handleQuickLogin(employee)}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/[0.03] dark:from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-all group-hover:scale-105"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {ADMIN_ROLES.includes(employee.role as string) ? (
                          <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-blue-500 text-white shadow-sm">
                            <ShieldCheck size={9} />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500 text-white shadow-sm">
                            <GraduationCap size={9} />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative min-w-0 w-full">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{employee.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{employee.position}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-[11px] text-gray-400 dark:text-gray-600">
                Lumina LMS &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
