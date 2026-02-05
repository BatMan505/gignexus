
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Search, Briefcase, Users, MessageSquare, Video, Mic, 
    Sparkles, BrainCircuit, Globe, ArrowRight, Star, 
    Upload, X, Loader2, Check,
    LogOut, PlusCircle,
    Filter, LayoutDashboard, MessageCircle, Send,
    Volume2,
    Bell, Save, Trash2, Award, AlertCircle, FileSignature,
    Shield, User, PenLine, Lightbulb, Target, ChevronRight, Zap, Trophy, ShieldCheck, 
    Edit, Plus, Trash, Link as LinkIcon, Camera, RefreshCw, CheckCircle2,
    ZapOff, CreditCard, Building2, Rocket, Wand2, TrendingUp, Handshake,
    SlidersHorizontal, CheckCircle, MoreVertical, FileText, Zap as ZapIcon
} from 'lucide-react';
import { 
    Job, Freelancer, JobType, ViewState, AIMode, ChatMessage, UserRole, Application, Conversation, AppNotification, SavedSearch, Contract, PortfolioItem, Message
} from './types';
import { 
    generateStandardResponse, 
    generateResearchedResponse, 
    generateThoughtfulResponse,
    analyzeVideoContent, 
    GeminiLiveClient,
    analyzeProposalQuality,
    generateSmartContract,
    GeneratedContract,
    generateJobDraft,
    generateProposal,
    generateSkillQuiz,
    QuizQuestion,
    parseProfileFromText,
    rankFreelancersForJob
} from './services/geminiService';

// --- MOCK DATA ---
const INITIAL_JOBS: Job[] = [
    {
        id: '1',
        title: 'Senior React Developer for Fintech App',
        description: 'We need a senior React developer to build a new dashboard for our fintech application. Must have experience with D3.js and Tailwind.',
        budget: '$4,000',
        type: JobType.FIXED,
        tags: ['React', 'TypeScript', 'Tailwind', 'Finance'],
        postedAt: '2h ago',
        clientRating: 4.9,
        status: 'open',
        clientId: 'client_1'
    }
];

const MOCK_FREELANCERS: Freelancer[] = [
    {
        id: 'my_id',
        name: 'Alex Rivera',
        title: 'Full Stack Engineer',
        rate: '$95/hr',
        skills: ['React', 'Node.js', 'PostgreSQL', 'Figma'],
        verifiedSkills: ['React', 'Node.js'],
        rating: 4.9,
        completedJobs: 24,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        bio: 'Experienced full stack developer focusing on clean code and performance. I build high-scale web applications using modern JavaScript frameworks.',
        availability: 'Available',
        portfolio: [
            { id: 'p1', title: 'Crypto Dashboard', description: 'A real-time tracking tool for digital assets.', imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=400&auto=format&fit=crop' }
        ],
        isPro: true
    },
    {
        id: 'f2',
        name: 'Sarah Chen',
        title: 'UX/UI Designer',
        rate: '$75/hr',
        skills: ['Figma', 'User Research', 'Prototyping'],
        verifiedSkills: ['Figma'],
        rating: 5.0,
        completedJobs: 56,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        bio: 'Passionate about creating intuitive digital experiences.',
        availability: 'Available',
        portfolio: [],
        isPro: true
    }
];

// --- MAIN APP ---

export const App = () => {
    const [view, setView] = useState<ViewState>(ViewState.HOME);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
    const [notifications] = useState<AppNotification[]>([{ id: 'n1', type: 'message', title: 'New Message', message: 'Sarah Chen sent you a message.', read: false, timestamp: '10m ago' }]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [showPostJob, setShowPostJob] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [myProfile, setMyProfile] = useState<Freelancer>(MOCK_FREELANCERS[0]);
    const [generatingContract, setGeneratingContract] = useState<{ freelancer: Freelancer, job: Job } | null>(null);
    const [activeContract, setActiveContract] = useState<GeneratedContract | null>(null);

    const handleLogin = (role: UserRole) => {
        setIsAuthenticated(true);
        setUserRole(role);
        setView(ViewState.DASHBOARD);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setView(ViewState.HOME);
    };

    const startHiring = async (freelancer: Freelancer, job: Job) => {
        setGeneratingContract({ freelancer, job });
        try {
            const contract = await generateSmartContract(job.title, job.description, freelancer.rate);
            setActiveContract(contract);
        } catch (e) {
            console.error("Hiring error", e);
        } finally {
            setGeneratingContract(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <Header view={view} setView={setView} isAuthenticated={isAuthenticated} role={userRole} onLogout={handleLogout} notifications={notifications} />
            
            <main className="transition-all duration-300">
                {view === ViewState.HOME && !isAuthenticated && (
                    <LandingPage onGetStarted={() => setView(ViewState.SIGNUP)} />
                )}
                {view === ViewState.LOGIN && <LoginView setView={setView} onLogin={handleLogin} />}
                {view === ViewState.SIGNUP && <SignupView onLogin={handleLogin} />}
                {view === ViewState.PRICING && <PricingView />}
                
                {view === ViewState.JOBS && <JobsListView jobs={jobs} onApply={setSelectedJob} />}
                {view === ViewState.TALENT && <TalentListView jobs={jobs} onHire={startHiring} />}
                {view === ViewState.AI_HUB && <AIHub jobs={jobs} freelancers={MOCK_FREELANCERS} />}
                {view === ViewState.DASHBOARD && isAuthenticated && <DashboardView role={userRole} onPostJob={() => setShowPostJob(true)} notifications={notifications} />}
                {view === ViewState.PROFILE && <ProfileView freelancer={myProfile} onUpdate={setMyProfile} />}
            </main>

            {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onSubmit={(job) => setJobs([job, ...jobs])} />}
            {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} onApply={() => setSelectedJob(null)} />}
            
            {(generatingContract || activeContract) && (
                <ContractModal 
                    isLoading={!!generatingContract} 
                    contract={activeContract} 
                    onClose={() => { setActiveContract(null); setGeneratingContract(null); }} 
                    freelancer={generatingContract?.freelancer || ({} as Freelancer)}
                />
            )}
        </div>
    );
};

// --- COMPONENTS ---

const Header = ({ view, setView, isAuthenticated, role, onLogout, notifications }: any) => {
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105" onClick={() => setView(ViewState.HOME)}>
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">G</div>
                        <span className="text-xl font-black tracking-tight text-slate-900">GigNexus</span>
                    </div>
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1">
                            {role === 'client' ? (
                                <>
                                    <HeaderNav active={view === ViewState.TALENT} onClick={() => setView(ViewState.TALENT)}>Find Talent</HeaderNav>
                                    <HeaderNav active={view === ViewState.AI_HUB} onClick={() => setView(ViewState.AI_HUB)} icon={<Sparkles className="w-4 h-4" />}>AI Hub</HeaderNav>
                                </>
                            ) : (
                                <>
                                    <HeaderNav active={view === ViewState.JOBS} onClick={() => setView(ViewState.JOBS)}>Browse Jobs</HeaderNav>
                                    <HeaderNav active={view === ViewState.PROFILE} onClick={() => setView(ViewState.PROFILE)}>My Profile</HeaderNav>
                                </>
                            )}
                        </nav>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <button className="p-2.5 text-slate-500 hover:text-slate-900 transition-colors relative bg-slate-100 rounded-full">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>}
                            </button>
                            <button onClick={() => setView(ViewState.DASHBOARD)} className="p-2.5 text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 rounded-full">
                                <LayoutDashboard className="w-5 h-5" />
                            </button>
                            <button onClick={onLogout} className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 rounded-full">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView(ViewState.LOGIN)} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4">Login</button>
                            <button onClick={() => setView(ViewState.SIGNUP)} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-black shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">Sign Up</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const HeaderNav = ({ children, active, onClick, icon }: any) => (
    <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${active ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}>
        {icon} {children}
    </button>
);

const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => (
    <div className="animate-in fade-in duration-1000">
        <section className="relative pt-24 pb-32 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[800px] bg-gradient-to-b from-emerald-50/40 to-transparent -z-10 rounded-[100%] blur-[120px]"></div>
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 text-emerald-700 text-xs font-black mb-8 shadow-sm animate-bounce-subtle">
                    <ZapIcon className="w-3.5 h-3.5 fill-emerald-500" />
                    <span>THE FUTURE OF WORK IS AI-NATIVE</span>
                </div>
                <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
                    Find your next expert <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-indigo-600 to-indigo-700">Matched by Gemini.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-12 font-medium leading-relaxed">
                    GigNexus is the elite marketplace where AI understanding connects high-complexity projects with the world's most talented freelancers.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button 
                        onClick={onGetStarted} 
                        className="group w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95"
                    >
                        Hire Expert Talent <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={onGetStarted} className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-[1.5rem] font-black text-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3">
                        Join as Freelancer
                    </button>
                </div>
                
                <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center gap-8 opacity-60">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Industry leaders hiring on GigNexus</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 grayscale">
                         <div className="text-2xl font-black tracking-tighter">FINTECH.OS</div>
                         <div className="text-2xl font-black tracking-tighter">VERCEL</div>
                         <div className="text-2xl font-black tracking-tighter">LINEAR</div>
                         <div className="text-2xl font-black tracking-tighter">SUPABASE</div>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

// --- Fix: Added missing JobsListView component to resolve 'Cannot find name JobsListView' error ---
const JobsListView = ({ jobs, onApply }: { jobs: Job[], onApply: (j: Job) => void }) => (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Available Projects</h2>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort by:</span>
                <select className="bg-white border border-slate-200 rounded-xl text-xs font-black px-4 py-2 outline-none shadow-sm">
                    <option>Most Recent</option>
                    <option>Highest Budget</option>
                </select>
            </div>
        </div>
        <div className="grid gap-6">
            {jobs.map(j => (
                <div key={j.id} onClick={() => onApply(j)} className="p-8 bg-white rounded-[2.5rem] border border-slate-200 hover:border-emerald-500 transition-all hover:shadow-2xl cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{j.postedAt}</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100 tracking-widest">
                                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED LISTING
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-3 truncate">{j.title}</h3>
                        <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">{j.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {j.tags.map(t => (
                                <span key={t} className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg uppercase border border-slate-100">{t}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0">
                        <div className="text-right">
                            <div className="text-3xl font-black text-slate-900">{j.budget}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{j.type}</div>
                        </div>
                        <button className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 group-hover:shadow-emerald-200 active:scale-95">View Project</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TalentListView = ({ jobs, onHire }: { jobs: Job[], onHire: (f: Freelancer, j: Job) => void }) => {
    const [filters, setFilters] = useState({ search: '', proOnly: false, minRate: 0, activeJobId: jobs[0]?.id || '', availability: 'All' });
    const [rankedTalent, setRankedTalent] = useState<any[]>(MOCK_FREELANCERS);
    const [loading, setLoading] = useState(false);

    const filteredTalent = useMemo(() => {
        return rankedTalent.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(filters.search.toLowerCase()) || f.title.toLowerCase().includes(filters.search.toLowerCase());
            const matchesPro = !filters.proOnly || f.isPro;
            const matchesRate = parseInt(f.rate.replace(/[^0-9]/g, '')) >= filters.minRate;
            const matchesAvailability = filters.availability === 'All' || f.availability === filters.availability;
            return matchesSearch && matchesPro && matchesRate && matchesAvailability;
        });
    }, [rankedTalent, filters]);

    const handleMatch = async () => {
        setLoading(true);
        const job = jobs.find(j => j.id === filters.activeJobId);
        if (job) {
            const results = await rankFreelancersForJob(job.description, MOCK_FREELANCERS);
            setRankedTalent(MOCK_FREELANCERS.map(f => {
                const res = results.find(r => r.freelancerId === f.id);
                return { ...f, matchScore: res?.matchScore || 0, matchReason: res?.reason };
            }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-4 gap-10">
                {/* Fixed Filter Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 mb-2">
                            <SlidersHorizontal className="w-5 h-5 text-emerald-600" /> Filters
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Availability</label>
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Available', 'Busy', 'Offline'].map(a => (
                                        <button 
                                            key={a}
                                            onClick={() => setFilters({...filters, availability: a})}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${filters.availability === a ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Min Rate: ${filters.minRate}/hr</label>
                                <input 
                                    type="range" min="0" max="200" step="10" 
                                    value={filters.minRate}
                                    onChange={e => setFilters({...filters, minRate: parseInt(e.target.value)})}
                                    className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${filters.proOnly ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'}`}>
                                        {filters.proOnly && <Check className="w-3.5 h-3.5 text-white" />}
                                        <input type="checkbox" className="hidden" checked={filters.proOnly} onChange={e => setFilters({...filters, proOnly: e.target.checked})} />
                                    </div>
                                    <span className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> GigNexus PRO Only
                                    </span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="w-5 h-5 rounded-md border-2 border-slate-200 group-hover:border-emerald-400 transition-all flex items-center justify-center">
                                        <input type="checkbox" className="hidden" />
                                    </div>
                                    <span className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AI Verified Only
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                        <BrainCircuit className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
                        <h4 className="text-xl font-black mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-300" /> AI Matchmaking</h4>
                        <p className="text-indigo-100 text-xs mb-6 leading-relaxed font-medium">Gemini will architect project milestones and hand-pick the top 1% fit.</p>
                        <select 
                            value={filters.activeJobId} 
                            onChange={e => setFilters({...filters, activeJobId: e.target.value})}
                            className="w-full bg-indigo-700/50 border-none rounded-xl py-2.5 px-4 text-xs font-black mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
                        >
                            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                        </select>
                        <button 
                            onClick={handleMatch}
                            disabled={loading}
                            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />} Rank Expert Talent
                        </button>
                    </div>
                </div>

                {/* Talent Cards Grid */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Expert Talent</h2>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredTalent.length} Results Found</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {filteredTalent.map(f => (
                            <FreelancerCard key={f.id} freelancer={f} onHire={() => onHire(f, jobs.find(j => j.id === filters.activeJobId)!)} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FreelancerCard: React.FC<{ freelancer: Freelancer; onHire: () => void }> = ({ freelancer, onHire }) => (
    <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-emerald-500 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden flex flex-col">
        {freelancer.matchScore && (
            <div className="absolute top-6 right-6 px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full border border-indigo-100 animate-pulse">
                {freelancer.matchScore}% AI MATCH
            </div>
        )}
        <div className="flex gap-6 mb-8">
            <div className="relative shrink-0">
                <img src={freelancer.avatar} className="w-20 h-20 rounded-3xl object-cover shadow-lg border-2 border-slate-50 group-hover:scale-105 transition-transform" />
                {freelancer.isPro && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        <Trophy className="w-4 h-4" />
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors truncate">{freelancer.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest truncate">{freelancer.title}</p>
                <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs"><Star className="w-3.5 h-3.5 fill-current" /> {freelancer.rating}</div>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <div className="text-slate-900 font-black text-sm">{freelancer.rate}</div>
                </div>
            </div>
        </div>
        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-8">{freelancer.bio}</p>
        
        {freelancer.matchReason && (
             <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100/50 mb-8 animate-in slide-in-from-top-2">
                <p className="text-[9px] font-black text-indigo-700 uppercase mb-2 flex items-center gap-1.5 tracking-widest"><BrainCircuit className="w-3.5 h-3.5" /> GEMINI INSIGHT</p>
                <p className="text-xs text-indigo-800 font-medium italic leading-relaxed">"{freelancer.matchReason}"</p>
             </div>
        )}

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
                {freelancer.skills.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg uppercase border border-slate-100">{s}</span>
                ))}
            </div>
            <button 
                onClick={onHire}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95"
            >
                <Handshake className="w-4 h-4" /> Hire Expert
            </button>
        </div>
    </div>
);

const AIHub = ({ jobs, freelancers }: { jobs: Job[], freelancers: Freelancer[] }) => {
    const [mode, setMode] = useState<AIMode>(AIMode.CHAT);
    const [messages, setMessages] = useState<ChatMessage[]>([{role: 'model', text: 'Hello! I am Gemini. How can I help you plan your project roadmap or talent search today?'}]);
    const [input, setInput] = useState('');
    const [matchingDesc, setMatchingDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');
        setLoading(true);
        const reply = await generateStandardResponse(input);
        setMessages(prev => [...prev, { role: 'model', text: reply }]);
        setLoading(false);
    };

    const runMatching = async () => {
        if (!matchingDesc.trim()) return;
        setLoading(true);
        const results = await rankFreelancersForJob(matchingDesc, freelancers);
        setMatches(results.map(res => {
            const f = freelancers.find(fl => fl.id === res.freelancerId);
            return { ...f, ...res };
        }));
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 overflow-hidden flex flex-col shadow-2xl shadow-slate-200">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <BrainCircuit className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-none mb-1">Gemini AI Hub</h2>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active Intelligence
                            </p>
                        </div>
                    </div>
                    <div className="flex bg-slate-200/40 p-1.5 rounded-2xl backdrop-blur-md">
                        <button onClick={() => setMode(AIMode.CHAT)} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === AIMode.CHAT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Strategy Advisor</button>
                        <button onClick={() => setMode(AIMode.MATCHING)} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === AIMode.MATCHING ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Talent Matcher</button>
                    </div>
                </div>

                {mode === AIMode.CHAT ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-slate-50/20">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-2xl p-6 rounded-[2rem] font-medium leading-relaxed text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-100' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-sm'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && <div className="flex justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-indigo-600/30" /></div>}
                        </div>
                        <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
                            <input 
                                value={input} 
                                onChange={e => setInput(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleSend()} 
                                className="flex-1 px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                                placeholder="Ask Gemini strategy or project planning questions..." 
                            />
                            <button onClick={handleSend} className="p-5 bg-indigo-600 text-white rounded-[2rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/10">
                        <div className="w-full md:w-1/3 border-r border-slate-100 p-10 space-y-8 flex flex-col bg-white">
                            <div>
                                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-2"><Target className="w-5 h-5 text-emerald-600" /> Match Engine</h3>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed">Paste your project requirements. Gemini will perform architectural analysis and candidate fit ranking.</p>
                            </div>
                            <textarea 
                                value={matchingDesc}
                                onChange={e => setMatchingDesc(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm font-medium resize-none focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                                placeholder="E.g. A senior dev for a real-time analytics engine using Rust and Kafka..."
                            />
                            <button 
                                onClick={runMatching}
                                disabled={loading || !matchingDesc.trim()}
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Find Best Matches
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 space-y-6">
                            {matches.length > 0 ? matches.map(m => (
                                <div key={m.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all animate-in slide-in-from-right-4">
                                    <div className="flex gap-5">
                                        <img src={m.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-900 text-lg">{m.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{m.title}</p>
                                            <p className="text-xs text-indigo-600 font-black italic bg-indigo-50 p-3 rounded-xl border border-indigo-100">"{m.reason}"</p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-6 shrink-0">
                                        <div className="text-3xl font-black text-slate-900">{m.matchScore}%</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AI Match</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                    <Target className="w-24 h-24 mb-6 text-slate-200" />
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Talent Analytics Engine</h4>
                                    <p className="text-sm font-bold text-slate-400 max-w-xs">Run the matching engine on the left to see ranked candidates.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DashboardView = ({ role, onPostJob, notifications }: any) => (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Workspace</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Logged in as {role}
                </p>
            </div>
            {role === 'client' && (
                <button 
                    onClick={onPostJob}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4.5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:-translate-y-1 active:scale-95"
                >
                    <PlusCircle className="w-5 h-5" /> Post Project
                </button>
            )}
        </div>
        <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
                <div className="p-20 bg-white rounded-[3rem] border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-slate-100/50">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3">No active {role === 'client' ? 'hires' : 'contracts'}</h3>
                    <p className="text-slate-400 font-medium max-w-xs">{role === 'client' ? 'Ready to build? Start by posting a job requirement.' : 'Unlock high-ticket clients by completing your professional profile.'}</p>
                </div>
            </div>
            <div className="space-y-12">
                <div className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    <Sparkles className="absolute -top-10 -right-10 w-48 h-48 text-emerald-400/10 group-hover:scale-125 transition-transform duration-1000" />
                    <h3 className="font-black text-xl mb-8 flex items-center gap-3"><BrainCircuit className="w-6 h-6 text-emerald-400" /> Market Outlook</h3>
                    <div className="space-y-6 relative z-10">
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Skill Demand Alert</p>
                            <p className="text-sm font-medium leading-relaxed text-slate-300">LLM Ops & Python Backend roles have surged 45% this month. Rates are adjusting upward.</p>
                        </div>
                        <button className="w-full py-4.5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95">Strategy Report</button>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3"><TrendingUp className="w-6 h-6 text-emerald-500" /> Trending Expertise</h3>
                    <div className="flex flex-wrap gap-2.5">
                        {['FastAPI', 'Three.js', 'Vector DBs', 'D3.js', 'Go', 'PyTorch'].map(s => (
                            <span key={s} className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black rounded-xl border border-slate-100 uppercase tracking-tighter">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const PricingView = () => (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in duration-1000">
        <div className="text-center mb-24">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">GigNexus Pro.</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Enterprise-grade AI tools to supercharge your hiring or your career.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
             <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col hover:border-slate-300 transition-all group">
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Starter</h3>
                <div className="text-5xl font-black text-slate-900 mb-10">$0 <span className="text-sm font-medium text-slate-400">/mo</span></div>
                <ul className="space-y-6 mb-12 flex-1">
                    <PricingFeature text="10 AI-Analyzed Applications" />
                    <PricingFeature text="Standard Talent Match" />
                    <PricingFeature text="AI Bio Polish (1/mo)" />
                </ul>
                <button className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all">Current Plan</button>
            </div>
            <div className="bg-white p-16 rounded-[3.5rem] border-2 border-emerald-500 shadow-3xl flex flex-col scale-105 relative z-10 ring-8 ring-emerald-500/5">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">HIGHLY RECOMMENDED</div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Pro Expert</h3>
                <div className="text-5xl font-black text-slate-900 mb-10">$29 <span className="text-sm font-medium text-slate-400">/mo</span></div>
                <ul className="space-y-6 mb-12 flex-1">
                    <PricingFeature text="Unlimited Applications & Proposals" bold />
                    <PricingFeature text="Priority AI Ranking Placement" bold />
                    <PricingFeature text="Smart Contract Generator" bold />
                    <PricingFeature text="Advanced Strategy Insights" bold />
                    <PricingFeature text="Instant Dispute Resolution" bold />
                </ul>
                <button className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95">Upgrade to Pro</button>
            </div>
        </div>
    </div>
);

const PricingFeature = ({ text, disabled, bold }: { text: string; disabled?: boolean; bold?: boolean }) => (
    <li className={`flex items-center gap-4 ${disabled ? 'text-slate-300' : 'text-slate-600'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${disabled ? 'bg-slate-100 text-slate-300' : 'bg-emerald-100 text-emerald-600'}`}>
            <Check className="w-4 h-4" />
        </div>
        <span className={`text-sm font-medium ${bold ? 'font-black text-slate-900' : ''}`}>{text}</span>
    </li>
);

const ContractModal = ({ isLoading, contract, onClose, freelancer }: any) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-inner">
                        <FileSignature className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Smart Contract</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Legal-Grade Draft by Gemini</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-300" /></button>
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto space-y-8">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-8"></div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Analyzing hiring context...</h3>
                        <p className="text-slate-400 text-sm font-medium">Gemini is structuring fair milestones and legal terms.</p>
                    </div>
                ) : contract && (
                    <>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Project Summary</h4>
                             <p className="text-lg font-bold text-slate-800 leading-relaxed">{contract.title}</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><Trophy className="w-4 h-4 text-amber-500" /> Milestones & Disbursement</h4>
                            {contract.milestones.map((m: any, i: number) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">{i + 1}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{m.description}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{m.dueDate}</p>
                                    </div>
                                    <div className="text-lg font-black text-emerald-600">{m.amount}</div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 px-2 pb-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Terms</h4>
                            <ul className="grid gap-3">
                                {contract.terms.map((t: string, i: number) => (
                                    <li key={i} className="flex gap-4 text-xs text-slate-500 font-medium leading-relaxed">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>

            {!isLoading && contract && (
                <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-5 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:text-slate-600 transition-colors">Discard</button>
                    <button onClick={() => { alert("Hiring sequence initiated!"); onClose(); }} className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Check className="w-4 h-4" /> Sign & release escrow
                    </button>
                </div>
            )}
        </div>
    </div>
);

const LoginView = ({ setView, onLogin }: any) => (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-100 text-center animate-in zoom-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Access GigNexus</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-10">AI-Powered Professional Network</p>
            <form onSubmit={(e) => { e.preventDefault(); onLogin('client'); }} className="space-y-4">
                <input type="email" placeholder="Professional Email" className="w-full px-6 py-4.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" required />
                <input type="password" placeholder="Secure Password" className="w-full px-6 py-4.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" required />
                <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95">Authenticate</button>
            </form>
            <p className="mt-8 text-sm font-medium text-slate-400">Not a member? <button onClick={() => setView(ViewState.SIGNUP)} className="text-emerald-600 font-black hover:underline ml-1">Create Account</button></p>
        </div>
    </div>
);

const SignupView = ({ onLogin }: any) => (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-16 rounded-[3.5rem] shadow-2xl w-full max-w-3xl border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Join the Network.</h2>
            <p className="text-slate-400 text-lg font-medium mb-16">Connect with deep technical experts or build your expert profile.</p>
            <div className="grid sm:grid-cols-2 gap-8">
                <button onClick={() => onLogin('client')} className="p-12 border-2 border-slate-100 hover:border-emerald-500 rounded-[3rem] flex flex-col items-center gap-8 group transition-all active:scale-95 bg-white hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-1">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Users className="w-12 h-12" /></div>
                    <div className="text-center">
                        <span className="font-black text-2xl text-slate-900 block mb-2">I'm Hiring</span>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-widest">Find top-tier specialists</p>
                    </div>
                </button>
                <button onClick={() => onLogin('freelancer')} className="p-12 border-2 border-slate-100 hover:border-indigo-500 rounded-[3rem] flex flex-col items-center gap-8 group transition-all active:scale-95 bg-white hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Briefcase className="w-12 h-12" /></div>
                    <div className="text-center">
                        <span className="font-black text-2xl text-slate-900 block mb-2">I'm Working</span>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-widest">Build high-impact career</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
);

const PostJobModal = ({ onClose, onSubmit }: any) => {
    const [data, setData] = useState({ title: '', description: '', budget: '', tags: [] as string[] });
    const [loading, setLoading] = useState(false);
    const [raw, setRaw] = useState('');

    const runDraft = async () => {
        setLoading(true);
        const draft = await generateJobDraft(raw);
        setData(draft);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-10 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Post Requirement</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-300" /></button>
                </div>
                <div className="p-10 space-y-10">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Start with AI Architect</label>
                        <div className="flex gap-4">
                            <input value={raw} onChange={e => setRaw(e.target.value)} placeholder="Briefly describe what you need built..." className="flex-1 px-6 py-4.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                            <button onClick={runDraft} className="px-8 py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-4 h-4" />} Draft
                            </button>
                        </div>
                    </div>
                    <div className="pt-10 border-t border-slate-100 space-y-6">
                        <div className="space-y-4">
                            <input value={data.title} onChange={e => setData({...data, title: e.target.value})} placeholder="Final Job Title" className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                            <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} placeholder="Detailed Scope of Work" className="w-full h-40 px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium resize-none focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                        </div>
                        <div className="flex gap-4">
                            <input value={data.budget} onChange={e => setData({...data, budget: e.target.value})} placeholder="Target Budget (e.g. $5k)" className="flex-1 px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all" />
                            <button onClick={() => { onSubmit({...data, id: Date.now().toString(), postedAt: 'Just Now', clientRating: 5.0, status: 'open'}); onClose(); }} className="flex-1 py-4.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 active:scale-95 transition-all">Publish Requirements</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobDetailModal = ({ job, onClose, onApply }: any) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-4">
        <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300">
            <div className="p-16">
                <div className="flex justify-between items-start mb-16 gap-8">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100 tracking-[0.1em] uppercase">Verified Listing</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{job.postedAt}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{job.title}</h2>
                        <div className="flex items-center gap-6">
                             <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-emerald-600">{job.budget}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.type}</span>
                             </div>
                             <span className="w-1.5 h-1.5 bg-slate-100 rounded-full"></span>
                             <div className="flex items-center gap-1.5 text-amber-500 font-black text-lg"><Star className="w-5 h-5 fill-current" /> {job.clientRating}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-full transition-colors shrink-0"><X className="w-8 h-8 text-slate-300" /></button>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="prose prose-slate max-w-none">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Deep Context & Scope</h4>
                            <p className="text-slate-500 text-xl leading-relaxed font-medium">{job.description}</p>
                        </div>
                        <div className="space-y-6">
                             <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Required Expertise</h4>
                             <div className="flex flex-wrap gap-3">
                                {job.tags.map((t: string) => (
                                    <span key={t} className="px-6 py-2.5 bg-white text-slate-500 text-xs font-black rounded-xl border border-slate-100 shadow-sm">{t}</span>
                                ))}
                             </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col gap-10">
                            <div>
                                <h4 className="text-xl font-black mb-2">Architect fit found.</h4>
                                <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-tighter">Gemini has analyzed your profile against these requirements.</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">AI Match Predictor</p>
                                <div className="text-4xl font-black mb-2">94%</div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Your experience with fintech dashboards is a primary driver for this score.</p>
                            </div>
                            <button onClick={onApply} className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95">Initiate Proposal Flow</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProfileView = ({ freelancer, onUpdate }: { freelancer: Freelancer, onUpdate: (f: Freelancer) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [temp, setTemp] = useState<Freelancer>(freelancer);
    const [loadingAI, setLoadingAI] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState('');

    const handleSuggestRate = async () => {
        setLoadingAI('rate');
        const res = await generateStandardResponse(`Suggest rate for ${temp.title} with skills ${temp.skills.join(', ')}`);
        setTemp({ ...temp, rate: res.match(/\$[0-9]+/)?.[0] || "$50/hr" });
        setLoadingAI(null);
    };

    const handlePolishBio = async () => {
        setLoadingAI('bio');
        const res = await generateStandardResponse(`Improve this bio: ${temp.bio}`);
        setTemp({ ...temp, bio: res });
        setLoadingAI(null);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-100">
                <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                     <button onClick={() => { if(isEditing) { onUpdate(temp); setIsEditing(false); } else { setTemp(freelancer); setIsEditing(true); } }} className={`absolute bottom-8 right-8 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 ${isEditing ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'}`}>
                        {isEditing ? <><Check className="w-5 h-5" /> Persist changes</> : <><Edit className="w-5 h-5" /> Edit professional profile</>}
                    </button>
                </div>
                <div className="px-16 pb-16">
                    <div className="flex flex-col md:flex-row gap-12 -mt-20 mb-16 items-end">
                        <div className="relative group shrink-0">
                            <img src={freelancer.avatar} className="w-48 h-48 rounded-[3rem] border-8 border-white shadow-2xl object-cover" />
                            {isEditing && <div className="absolute inset-0 bg-black/40 rounded-[3rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Camera className="w-10 h-10 text-white" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEditing ? <input value={temp.name} onChange={e => setTemp({...temp, name: e.target.value})} className="text-5xl font-black text-slate-900 bg-slate-50 border-none rounded-2xl px-6 py-3 w-full focus:ring-4 focus:ring-emerald-500/10 mb-4 tracking-tight shadow-inner" /> : <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">{freelancer.name}</h1>}
                            <p className="text-emerald-600 font-black uppercase tracking-[0.3em] text-sm flex items-center gap-3">
                                {isEditing ? <input value={temp.title} onChange={e => setTemp({...temp, title: e.target.value})} className="bg-slate-50 border-none rounded-xl px-4 py-2 w-full shadow-inner" /> : <>{freelancer.title} {freelancer.isPro && <Trophy className="w-4 h-4 text-amber-500" />}</>}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                             <div className="flex items-center gap-4 justify-end group">
                                {isEditing && <button onClick={handleSuggestRate} className="p-2.5 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all">{loadingAI === 'rate' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}</button>}
                                <span className="text-5xl font-black text-slate-900">{isEditing ? <input value={temp.rate} onChange={e => setTemp({...temp, rate: e.target.value})} className="w-40 bg-slate-50 border-none rounded-2xl px-4 py-2 text-right shadow-inner" /> : freelancer.rate}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Base Billing Rate</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-20">
                        <div className="md:col-span-2 space-y-16">
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">Professional Narrative</h3>
                                    {isEditing && <button onClick={handlePolishBio} className="text-[10px] font-black text-indigo-600 flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest">{loadingAI === 'bio' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Polish</button>}
                                </div>
                                {isEditing ? <textarea value={temp.bio} onChange={e => setTemp({...temp, bio: e.target.value})} className="w-full h-72 bg-slate-50 border-none rounded-[2.5rem] p-10 text-sm font-medium leading-relaxed shadow-inner" /> : <p className="text-slate-500 font-medium text-xl leading-relaxed">{freelancer.bio}</p>}
                            </div>
                            <div className="space-y-8">
                                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">Selected Portfolio Works</h3>
                                <div className="grid sm:grid-cols-2 gap-10">
                                    {freelancer.portfolio.map(item => (
                                        <div key={item.id} className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-3xl transition-all duration-500">
                                            <img src={item.imageUrl} className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="p-8"><h4 className="font-black text-xl text-slate-900">{item.title}</h4></div>
                                        </div>
                                    ))}
                                    {isEditing && <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-16 text-slate-300 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all cursor-pointer"><Plus className="w-12 h-12" /><p className="text-xs font-black uppercase tracking-widest mt-6">Append Item</p></div>}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-12">
                            <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-inner">
                                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] mb-10">Expertise Matrix</h3>
                                <div className="flex flex-wrap gap-3">
                                    {(isEditing ? temp.skills : freelancer.skills).map(s => (
                                        <div key={s} className="px-5 py-2.5 bg-white border border-slate-100 text-slate-600 text-xs font-black rounded-xl shadow-sm flex items-center gap-2.5">
                                            {freelancer.verifiedSkills?.includes(s) && <ShieldCheck className="w-4 h-4 text-emerald-500" />} {s}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <div className="flex gap-2 w-full mt-6">
                                            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Append expert skill..." className="flex-1 bg-white border-none rounded-xl px-5 py-3 text-xs font-black shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                            <button onClick={() => { if(newSkill.trim()) { setTemp({...temp, skills: [...temp.skills, newSkill]}); setNewSkill(''); } }} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-90"><Plus className="w-5 h-5" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {!isEditing && (
                                <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl shadow-slate-200">
                                    <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-emerald-400 mb-10">Platform Performance</h3>
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hires</p><p className="text-2xl font-black">{freelancer.completedJobs}</p></div>
                                        <div className="flex items-center justify-between"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</p><p className="text-2xl font-black">99.8%</p></div>
                                        <div className="flex items-center justify-between"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Response</p><p className="text-2xl font-black">&lt; 2h</p></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
