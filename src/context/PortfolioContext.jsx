import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';

// ─── Fallback/seed data shown while loading or if Supabase is not set up ───
const DEFAULT_INFO = {
  name: 'Your Name',
  first_name: 'Your',
  last_name: 'Name',
  title: 'Full Stack Developer',
  tagline: '& UI Engineer',
  email: 'hello@yoursite.dev',
  location: 'Your City',
  bio: 'Edit this in the admin panel → Profile section.',
  bio_extended: 'More about you — add this in the admin panel.',
  resume_url: '#',
  github_url: 'https://github.com',
  linkedin_url: 'https://linkedin.com',
  twitter_url: 'https://twitter.com',
};

const DEFAULT_SKILLS = [
  { id: '1', name: 'React', category: 'Frontend', icon: '⚛️', display_order: 1 },
  { id: '2', name: 'TypeScript', category: 'Frontend', icon: '🔷', display_order: 2 },
  { id: '3', name: 'Node.js', category: 'Backend', icon: '🟢', display_order: 3 },
  { id: '4', name: 'Docker', category: 'Tools', icon: '🐳', display_order: 4 },
];

const DEFAULT_PROJECTS = [
  {
    id: '1',
    title: 'Sample Project',
    description: 'Add your real projects via the admin panel at /admin-space.',
    tech: ['React', 'Node.js'],
    image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
    live_url: '#',
    github_url: '#',
    featured: true,
    gradient: 'from-violet-600/20 to-blue-600/10',
    display_order: 1,
  },
];

const DEFAULT_EXPERIENCE = [
  {
    id: '1',
    role: 'Your Role',
    company: 'Company Name',
    company_url: '#',
    period: '2023 — Present',
    location: 'City',
    type: 'Full-time',
    description: 'Manage your experience entries in the admin panel.',
    highlights: ['Achievement one', 'Achievement two'],
    display_order: 1,
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────
const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [experience, setExperience] = useState(DEFAULT_EXPERIENCE);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [infoRes, skillsRes, projectsRes, expRes] = await Promise.all([
        supabase.from('portfolio_info').select('*').single(),
        supabase.from('skills').select('*').order('display_order'),
        supabase.from('projects').select('*').order('display_order'),
        supabase.from('experience').select('*').order('display_order'),
      ]);

      if (infoRes.data) setInfo(infoRes.data);
      if (skillsRes.data?.length) setSkills(skillsRes.data);
      if (projectsRes.data?.length) setProjects(projectsRes.data);
      if (expRes.data?.length) setExperience(expRes.data);
    } catch (err) {
      console.warn('Could not fetch portfolio data from Supabase:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <PortfolioContext.Provider value={{ info, skills, projects, experience, loading, refetch: fetchAll }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return ctx;
}
