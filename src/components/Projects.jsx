import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { usePortfolio } from '../context/PortfolioContext';

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const techArr = Array.isArray(project.tech) ? project.tech : (project.tech || '').split(',').map(t => t.trim()).filter(Boolean);
  const hasGithub = project.github_url && project.github_url !== '#';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
          transition={{ duration: 0.5 }}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'; }}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient || 'from-violet-600/20 to-blue-600/10'} opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
        {project.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-accent-gold/90 text-bg-primary font-mono text-[10px] font-semibold rounded-full">
            FEATURED
          </span>
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-primary/70 backdrop-blur-sm flex items-center justify-center gap-4"
            >
              <button
                className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-bg-primary font-semibold text-sm rounded-full hover:bg-accent-gold-bright transition-colors"
                onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.id}`); }}>
                <ExternalLink size={14} /> View Project
              </button>
              {hasGithub && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-bright text-text-primary text-sm rounded-full hover:border-accent-gold transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <Github size={14} /> GitHub
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-accent-gold transition-colors">
            {project.title}
          </h3>
          <ArrowRight size={16} className={`text-text-muted shrink-0 mt-1 transition-all ${hovered ? 'text-accent-gold translate-x-1' : ''}`} />
        </div>
        <p className="font-body text-sm text-text-secondary leading-relaxed flex-1">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {techArr.map((t) => (
            <span key={t} className="px-2.5 py-1 bg-bg-secondary border border-border font-mono text-[11px] text-text-muted rounded-md">
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
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.featured);

  return (
    <section id="projects" className="py-28 relative overflow-hidden">
      <div className="glow-blob w-[600px] h-[600px] bg-accent-teal/4 -right-60 top-1/4" />
      <div className="section-container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <SectionTitle
            eyebrow="Selected Work"
            title={<>Projects that<br /><span className="gradient-text">make an impact</span></>}
            subtitle="A curated selection of things I've built."
          />
          <div className="flex gap-2 shrink-0">
            {['All', 'Featured'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full font-body text-sm transition-all ${
                  filter === f ? 'bg-accent-gold text-bg-primary font-semibold' : 'bg-bg-card border border-border text-text-muted hover:text-text-primary'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </AnimatePresence>
        </motion.div>

        {info.github_url && info.github_url !== '#' && (
          <div className="flex justify-center mt-14">
            <a href={info.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center gap-2">
              <Github size={16} /> See all projects on GitHub
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
