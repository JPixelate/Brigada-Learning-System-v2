import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Menu, 
  X, 
  Play, 
  Search,
  Users,
  Star,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { data } = useData();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Inject modern clean fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      body {
        font-family: 'Inter', sans-serif;
        background-color: #ffffff;
        color: #111827;
      }
      .font-display {
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .container-width {
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-blur: 10px;
        border: 1px solid rgba(229, 231, 235, 0.5);
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const featuredCourses = data.modules.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? 'py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'py-6 bg-transparent'
      }`}>
        <div className="container-width flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 font-display">Brigada</span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-[14px] font-medium text-gray-500">
            <a href="#courses" className="hover:text-brand-primary transition-colors">Courses</a>
            <a href="#features" className="hover:text-brand-primary transition-colors">Platform</a>
            <a href="#about" className="hover:text-brand-primary transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate(isAdmin ? '/admin' : '/employee')}
                className="bg-gray-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-[14px] font-semibold text-gray-600 hover:text-brand-primary transition-colors">Login</Link>
                <Link 
                  to="/login" 
                  className="bg-brand-primary text-white text-[14px] font-semibold px-6 py-2.5 rounded-full hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/25"
                >
                  Join for Free
                </Link>
              </>
            )}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-50/30 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="container-width px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[12px] font-bold uppercase tracking-wider mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Modern Learning System
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-8 font-display">
              Learn the skills that <br/> 
              <span className="text-brand-primary">shape your future.</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mb-12 font-medium">
              Empower your career with professional-grade courses and an intuitive platform designed for modern workforce excellence. 
            </p>

            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <Link 
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white font-bold px-10 py-4.5 rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
              >
                Get Started
                <ArrowRight size={20} />
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4.5 bg-white border border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <Play size={18} className="fill-gray-700" />
                See How It Works
              </button>
            </div>

            <div className="mt-16 pt-12 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                ))}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-black text-gray-400 border-2 border-white">+32k</div>
              </div>
              <p className="text-sm font-semibold text-gray-500">
                Trusted by <span className="text-gray-900 font-bold">45,000+</span> professionals globally
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-12 border-y border-gray-50 bg-gray-50/30">
        <div className="container-width px-6">
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10">Powering learning for the world's best teams</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
             {['Google', 'Microsoft', 'Nvidia', 'Figma', 'Stripe'].map(brand => (
               <span key={brand} className="text-xl md:text-2xl font-black text-gray-800 tracking-tighter">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 px-6">
        <div className="container-width">
          <div className="max-w-2xl mb-20 text-center mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight font-display mb-4">Elevate your learning experience.</h2>
            <p className="text-gray-500 font-medium">A unified platform built for speed, performance, and impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 bg-gray-900 rounded-2xl p-10 text-white relative overflow-hidden group">
                <div className="relative z-10 max-w-md">
                   <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-6 group-hover:bg-brand-primary transition-colors">
                      <TrendingUp size={24} className="text-brand-primary group-hover:text-white" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4">Advanced Learning Analytics</h3>
                   <p className="text-gray-400 font-medium leading-relaxed">Track your progress with precision. Our AI identifies skill gaps and suggests the most efficient paths to mastery.</p>
                </div>
                <div className="absolute right-[-10%] bottom-[-10%] w-[60%] h-[70%] bg-gradient-to-tl from-brand-primary/20 to-transparent blur-3xl opacity-50"></div>
             </div>

             <div className="bg-emerald-50 rounded-2xl p-10 flex flex-col justify-between group hover:bg-emerald-100 transition-colors">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 mb-8 font-bold">
                   <ShieldCheck size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-2">Certified Progress</h3>
                   <p className="text-emerald-700/60 text-sm font-medium">Earn industry-standard certificates verified by experts.</p>
                </div>
             </div>

             <div className="bg-brand-primary/5 rounded-2xl p-10 flex flex-col justify-between group hover:bg-brand-primary/10 transition-colors">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-primary mb-8 font-bold">
                   <Globe size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-2">Global Access</h3>
                   <p className="text-brand-primary/60 text-sm font-medium">Learn anytime, anywhere on any device with full offline support.</p>
                </div>
             </div>

             <div className="md:col-span-2 bg-slate-50 border border-gray-100 rounded-2xl p-10 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                   <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Immersive Curriculum</h3>
                      <p className="text-gray-500 font-medium leading-relaxed mb-6">High-definition video lectures, interactive quizzes, and hands-on projects designed for retention.</p>
                      <button className="text-brand-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                         Discover Catalog <ArrowRight size={20} />
                      </button>
                   </div>
                   <div className="w-full md:w-1/3 aspect-square bg-white rounded-2xl shadow-xl shadow-gray-200/50 flex items-center justify-center text-gray-200">
                      <Search size={64} strokeWidth={1} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-24 bg-gray-50/50">
        <div className="container-width px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
             <div>
                <h2 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight">Top-rated courses.</h2>
                <p className="text-gray-500 mt-2 font-medium">Expert-led training ready for you to enroll today.</p>
             </div>
             <Link to="/login" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-primary transition-colors border-b border-gray-200 py-2">
                View all courses
             </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur shadow-md px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-bold text-gray-900">4.9</span>
                  </div>
                </div>
                <div className="px-1">
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1.5">{course.category || 'Professional'}</p>
                  <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1 mb-2">{course.title}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
                    <Users size={14} />
                    <span>{course.studentsEnrolled.toLocaleString()} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
         <div className="container-width">
            <div className="bg-gray-900 rounded-[32px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-gray-200">
               <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-primary opacity-10 blur-[100px]"></div>
               <div className="relative z-10 max-w-2xl mx-auto">
                 <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 font-display">Ready to master any skill?</h2>
                 <p className="text-gray-400 text-lg mb-12 leading-relaxed">Join thousands of career-focused learners around the world and start your personalized journey today.</p>
                 <div className="flex flex-col sm:flex-row justify-center gap-5">
                    <Link 
                      to="/login"
                      className="bg-brand-primary text-white font-bold px-12 py-5 rounded-xl shadow-xl shadow-brand-primary/20 hover:bg-brand-hover transition-all text-lg"
                    >
                      Sign Up Now
                    </Link>
                    <button className="bg-white/10 text-white border border-white/20 font-bold px-12 py-5 rounded-xl hover:bg-white/20 transition-all text-lg backdrop-blur-md">
                      Request Demo
                    </button>
                 </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 border-t border-gray-100">
        <div className="container-width px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-brand-primary rounded-xl flex items-center justify-center">
                  <Zap size={18} className="text-white fill-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 font-display">Brigada</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
                Building the future of professional education through technology, design, and elite curriculum.
              </p>
              <div className="flex gap-4">
                 <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-primary cursor-pointer transition-colors"><Globe size={20} /></div>
                 <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-primary cursor-pointer transition-colors"><Star size={20} /></div>
                 <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-primary cursor-pointer transition-colors"><Users size={20} /></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-brand-primary">Catalog</a></li>
                <li><a href="#" className="hover:text-brand-primary">Enterprise</a></li>
                <li><a href="#" className="hover:text-brand-primary">Paths</a></li>
                <li><a href="#" className="hover:text-brand-primary">Mentors</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-brand-primary">About</a></li>
                <li><a href="#" className="hover:text-brand-primary">Careers</a></li>
                <li><a href="#" className="hover:text-brand-primary">Press</a></li>
                <li><a href="#" className="hover:text-brand-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-brand-primary">Terms</a></li>
                <li><a href="#" className="hover:text-brand-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-brand-primary">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 tracking-wider">
            <p>© 2026 BRIGADA SYSTEM. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-gray-900 transition-colors">TWITTER</a>
              <a href="#" className="hover:text-gray-900 transition-colors">LINKEDIN</a>
              <a href="#" className="hover:text-gray-900 transition-colors">INSTAGRAM</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white p-6 flex flex-col animate-in fade-in slide-in-from-top duration-300">
           <div className="flex justify-between items-center mb-10">
              <span className="font-bold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}><X size={28}/></button>
           </div>
           <nav className="flex flex-col gap-8 text-2xl font-bold font-display px-4">
              <Link to="/login">Join Platform</Link>
              <a href="#courses">Courses</a>
              <a href="#features">Experience</a>
              <a href="#about">Business</a>
           </nav>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
