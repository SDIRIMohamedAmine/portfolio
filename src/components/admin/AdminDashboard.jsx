import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Code2, FolderOpen, Briefcase, Layout, Palette, LogOut, ExternalLink, ChevronRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import ProfileEditor     from './editors/ProfileEditor';
import SkillsEditor      from './editors/SkillsEditor';
import ProjectsEditor    from './editors/ProjectsEditor';
import ExperienceEditor  from './editors/ExperienceEditor';
import SiteContentEditor from './editors/SiteContentEditor';
import AppearanceEditor  from './editors/AppearanceEditor';

const NAV_ITEMS = [
  { id: 'content',    label: 'Site Content',  icon: Layout,     desc: 'All text & labels' },
  { id: 'appearance', label: 'Appearance',    icon: Palette,    desc: 'Colors & theme' },
  { id: 'profile',    label: 'Profile',       icon: User,       desc: 'Bio, photo, socials' },
  { id: 'skills',     label: 'Skills',        icon: Code2,      desc: 'Your toolkit' },
  { id: 'projects',   label: 'Projects',      icon: FolderOpen, desc: 'Portfolio work' },
  { id: 'experience', label: 'Experience',    icon: Briefcase,  desc: 'Timeline entries' },
];

function ToastManager({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card-hover min-w-[260px]"
            style={t.type === 'success'
              ? { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }
              : { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
            <span className={t.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {t.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="font-body text-sm text-text-primary flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-text-muted hover:text-text-primary">✕</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const { info, projects, skills, experience } = usePortfolio();
  const [activeTab, setActiveTab]     = useState('content');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts]           = useState([]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-6xl">🚫</div>
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-text-primary mb-2">Access Denied</h2>
          <p className="font-body text-text-muted">
            Your account (<span style={{ color: 'var(--color-accent)' }}>{user?.email}</span>) is not authorized.
          </p>
        </div>
        <button onClick={signOut} className="btn-outline flex items-center gap-2">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    );
  }

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  const stats = [
    { label: 'Projects',  value: projects.length },
    { label: 'Skills',    value: skills.length },
    { label: 'Timeline',  value: experience.length },
  ];
  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>

        <div className="flex items-center justify-between px-5 h-16 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)' }}>
              <span className="font-display font-extrabold text-sm" style={{ color: 'var(--color-accent)' }}>
                {info.first_name?.[0] || 'A'}
              </span>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-text-primary">{info.first_name}</p>
              <p className="font-mono text-[10px] text-text-muted">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase px-2 mb-2">Manage</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`admin-nav-item w-full text-left ${activeTab === id ? 'active' : ''}`}>
              <Icon size={17} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{label}</p>
                <p className="text-[10px] text-text-muted truncate">{desc}</p>
              </div>
              {activeTab === id && <ChevronRight size={14} className="shrink-0" style={{ color: 'var(--color-accent)' }} />}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t shrink-0 flex flex-col gap-3"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-3 gap-2">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-xl p-2 text-center"
                style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <p className="font-display font-bold text-base" style={{ color: 'var(--color-accent)' }}>{value}</p>
                <p className="font-mono text-[9px] text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-item">
            <ExternalLink size={17} className="shrink-0" />
            <span>View Site</span>
          </a>
          <button onClick={signOut} className="admin-nav-item w-full text-red-400 hover:bg-red-500/10">
            <LogOut size={17} className="shrink-0" />
            <span>Sign Out</span>
          </button>
          <p className="font-mono text-[10px] text-text-muted px-2 truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center px-6 gap-4 shrink-0"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-text-muted hover:text-text-primary">
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-base text-text-primary">{activeNav?.label}</h1>
            <p className="font-body text-xs text-text-muted">{activeNav?.desc}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-xs text-green-400">Live</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}>
              {activeTab === 'content'    && <SiteContentEditor addToast={addToast} />}
              {activeTab === 'appearance' && <AppearanceEditor  addToast={addToast} />}
              {activeTab === 'profile'    && <ProfileEditor     addToast={addToast} />}
              {activeTab === 'skills'     && <SkillsEditor      addToast={addToast} />}
              {activeTab === 'projects'   && <ProjectsEditor    addToast={addToast} />}
              {activeTab === 'experience' && <ExperienceEditor  addToast={addToast} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
