import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';

const DEFAULT_INFO = {
  name: 'Your Name',
  first_name: 'Your',
  last_name: 'Name',
  title: 'Professional',
  tagline: '& Creator',
  email: 'hello@yoursite.dev',
  location: 'Your City',
  bio: 'Edit this in the admin panel → Profile section.',
  bio_extended: '',
  resume_url: '#',
  github_url: '#',
  linkedin_url: '#',
  twitter_url: '#',
  avatar_url: '',
  // Custom social links — array of { platform, label, url }
  social_links: [],
};

const DEFAULT_SKILLS = [
  { id: '1', name: 'Skill 1', category: 'General', icon: '⚡', display_order: 1 },
];
const DEFAULT_PROJECTS = [
  { id: '1', title: 'Sample Project', description: 'Add real projects via the admin panel.',
    tech: ['React'], image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
    live_url: '#', github_url: '#', featured: true,
    gradient: 'from-violet-600/20 to-blue-600/10', display_order: 1 },
];
const DEFAULT_EXPERIENCE = [
  { id: '1', role: 'Your Role', company: 'Company Name', company_url: '#',
    period: '2023 — Present', location: 'City', type: 'Full-time',
    description: 'Manage experience in the admin panel.', highlights: [], display_order: 1 },
];

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [info, setInfo]           = useState(DEFAULT_INFO);
  const [skills, setSkills]       = useState(DEFAULT_SKILLS);
  const [projects, setProjects]   = useState(DEFAULT_PROJECTS);
  const [experience, setExperience] = useState(DEFAULT_EXPERIENCE);
  const [loading, setLoading]     = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [infoRes, skillsRes, projectsRes, expRes] = await Promise.all([
        supabase.from('portfolio_info').select('*').single(),
        supabase.from('skills').select('*').order('display_order'),
        supabase.from('projects').select('*').order('display_order'),
        supabase.from('experience').select('*').order('display_order'),
      ]);

      if (infoRes.data) {
        // Normalize social_links — could be array (JSONB) or null
        const sl = infoRes.data.social_links;
        setInfo({
          ...DEFAULT_INFO,
          ...infoRes.data,
          social_links: Array.isArray(sl) ? sl : (sl ? JSON.parse(sl) : []),
        });
      }
      if (skillsRes.data?.length)  setSkills(skillsRes.data);
      if (projectsRes.data?.length) setProjects(projectsRes.data);
      if (expRes.data?.length)     setExperience(expRes.data);
    } catch (err) {
      console.warn('Portfolio fetch error:', err.message);
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
  if (!ctx) throw new Error('usePortfolio must be inside PortfolioProvider');
  return ctx;
}
