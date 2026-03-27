import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { SectionReveal, RevealItem } from './ui/SectionReveal';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const techArr = Array.isArray(project.tech)
    ? project.tech
    : (project.tech || '').split(',').map(t => t.trim()).filter(Boolean);
  const hasGithub = project.github_url && project.github_url !== '#';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="card-base overflow-hidden group flex flex-col"
    >
      <div className="relative overflow-hidden h-48">
        <motion.img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'; }}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient || 'from-violet-600/20 to-blue-600/10'} opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
        {project.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 font-mono text-[10px] font-semibold rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 90%, transparent)', color: 'var(--color-bg-primary)' }}>
            FEATURED
          </span>
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-sm flex items-center justify-center gap-4"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 70%, transparent)' }}>
              <motion.button
                initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
                className="flex items-center gap-2 px-4 py-2 font-semibold text-sm rounded-full transition-colors"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
                onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.id}`); }}>
                <ExternalLink size={14} /> View Project
              </motion.button>
              {hasGithub && (
                <motion.a
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                  href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border text-sm rounded-full transition-colors"
                  style={{ borderColor: 'var(--color-border-bright)', color: 'var(--color-text-primary)' }}
                  onClick={(e) => e.stopPropagation()}>
                  <Github size={14} /> GitHub
                </motion.a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-text-primary transition-colors"
            style={{ '--tw-text-opacity': hovered ? 1 : 1 }}>
            <motion.span animate={{ color: hovered ? 'var(--color-accent)' : 'var(--color-text-primary)' }} transition={{ duration: 0.2 }}>
              {project.title}
            </motion.span>
          </h3>
          <motion.div animate={{ x: hovered ? 4 : 0, color: hovered ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            transition={{ duration: 0.2 }}>
            <ArrowRight size={16} className="shrink-0 mt-1" />
          </motion.div>
        </div>
        <p className="font-body text-sm text-text-secondary leading-relaxed flex-1">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {techArr.map((t) => (
            <span key={t} className="px-2.5 py-1 font-mono text-[11px] text-text-muted rounded-md"
              style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const { projects, info } = usePortfolio();
  const { config } = useSiteConfig();
  const [filter, setFilter] = useState('All');
  const filterAll = config.projects_filter_all || 'All';
  const filterFeatured = config.projects_filter_featured || 'Featured';
  const filtered = filter === filterAll ? projects : projects.filter((p) => p.featured);

  return (
    <section id="projects" className="py-28 relative overflow-hidden">
      <div className="glow-blob w-[600px] h-[600px] -right-60 top-1/4 opacity-20"
        style={{ background: '#4ecdc4' }} />

      <div className="section-container relative z-10">
        <SectionReveal variant="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <SectionTitle
              eyebrow={config.projects_eyebrow}
              title={<>{config.projects_title1}<br /><span className="gradient-text">{config.projects_title2}</span></>}
              subtitle={config.projects_subtitle}
            />
            <div className="flex gap-2 shrink-0">
              {[filterAll, filterFeatured].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-full font-body text-sm transition-all duration-300"
                  style={filter === f
                    ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)', fontWeight: 600 }
                    : { backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </SectionReveal>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </AnimatePresence>
        </motion.div>

        {info.github_url && info.github_url !== '#' && config.projects_github_cta && (
          <SectionReveal variant="fade" delay={0.2}>
            <div className="flex justify-center mt-14">
              <motion.a href={info.github_url} target="_blank" rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Github size={16} /> {config.projects_github_cta}
              </motion.a>
            </div>
          </SectionReveal>
        )}
      </div>
    </section>
  );
}
