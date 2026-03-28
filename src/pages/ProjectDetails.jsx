import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Calendar, Building2, Layers, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ media, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const item = media[current];

  const prev = () => setCurrent((i) => (i - 1 + media.length) % media.length);
  const next = () => setCurrent((i) => (i + 1) % media.length);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}>
      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10">
        <X size={20} />
      </button>

      {/* Prev */}
      {media.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10">
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Media */}
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
        className="max-w-5xl max-h-[85vh] mx-16"
        onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' ? (
          <video src={item.url} controls autoPlay className="max-h-[85vh] max-w-full rounded-xl" />
        ) : (
          <img src={item.url} alt={item.caption || ''} className="max-h-[85vh] max-w-full object-contain rounded-xl" />
        )}
        {item.caption && (
          <p className="text-center font-body text-sm text-white/60 mt-3">{item.caption}</p>
        )}
      </motion.div>

      {/* Next */}
      {media.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10">
          <ChevronRight size={20} />
        </button>
      )}

      {/* Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {media.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-accent-gold scale-125' : 'bg-white/30 hover:bg-white/60'}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Section block (only renders if content exists) ────────────────────────────
function Section({ title, content }) {
  if (!content?.trim()) return null;
  return (
    <div>
      <h3 className="font-display font-bold text-lg text-text-primary mb-3">{title}</h3>
      <p className="font-body text-text-secondary leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = usePortfolio();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const project = projects.find((p) => String(p.id) === String(id));

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-bg-primary">
        <p className="font-body text-text-muted">Project not found.</p>
        <button onClick={() => navigate(-1)} className="btn-outline">← Go Back</button>
      </div>
    );
  }

  const techArr = Array.isArray(project.tech)
    ? project.tech
    : (project.tech || '').split(',').map((t) => t.trim()).filter(Boolean);

  const media = Array.isArray(project.media) ? project.media : [];

  // Adjacent projects for next/prev navigation
  const currentIndex = projects.findIndex((p) => String(p.id) === String(id));
  const prevProject = projects[currentIndex - 1];
  const nextProject = projects[currentIndex + 1];

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border">
          <div className="section-container flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-body text-sm text-text-muted hover:text-accent-gold transition-colors">
              <ArrowLeft size={16} /> Back to Portfolio
            </button>
            <div className="flex items-center gap-3">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-accent-gold transition-colors">
                  <Github size={14} /> GitHub
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2 px-4">
                  <ExternalLink size={13} /> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="section-container py-12 flex flex-col gap-12">

          {/* ── Hero / gallery ── */}
          {media.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Main image */}
              <div
                className="w-full aspect-video rounded-2xl overflow-hidden border border-border cursor-zoom-in bg-bg-card"
                onClick={() => setLightboxIndex(0)}>
                {media[0].type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video src={media[0].url} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play size={24} className="text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={media[0].url} alt={media[0].caption || project.title}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                )}
              </div>

              {/* Thumbnails strip */}
              {media.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                  {media.slice(1).map((item, i) => (
                    <motion.div key={i}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setLightboxIndex(i + 1)}
                      className="aspect-video rounded-xl overflow-hidden border border-border cursor-zoom-in bg-bg-card relative">
                      {item.type === 'video' ? (
                        <>
                          <video src={item.url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={14} className="text-white fill-white" />
                          </div>
                        </>
                      ) : (
                        <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : project.image_url ? (
            /* Fallback to cover image if no media uploaded */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="w-full aspect-video rounded-2xl overflow-hidden border border-border bg-bg-card">
              <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
            </motion.div>
          ) : null}

          {/* ── Content + sidebar ── */}
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Left: text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 flex flex-col gap-8">

              {/* Title + tags */}
              <div>
                <h1 className="font-display font-extrabold text-3xl md:text-4xl text-text-primary mb-4">{project.title}</h1>
                <div className="flex flex-wrap gap-2">
                  {techArr.map((t) => (
                    <span key={t} className="px-3 py-1 bg-bg-card border border-border font-mono text-xs text-text-secondary rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Short description */}
              {project.description && (
                <p className="font-body text-text-secondary text-base leading-relaxed">{project.description}</p>
              )}

              <div className="w-full h-px bg-border" />

              {/* Detail sections — only render if filled */}
              <Section title="Project Overview" content={project.overview} />
              <Section title="The Challenge" content={project.challenge} />
              <Section title="The Solution" content={project.solution} />
            </motion.div>

            {/* Right: metadata sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4">

              <div className="admin-card flex flex-col gap-5 sticky top-24">
                <h3 className="font-display font-bold text-sm text-text-primary">Project Info</h3>

                {project.client && (
                  <div className="flex items-start gap-3">
                    <Building2 size={15} className="text-accent-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Client</p>
                      <p className="font-body text-sm text-text-secondary">{project.client}</p>
                    </div>
                  </div>
                )}

                {project.date && (
                  <div className="flex items-start gap-3">
                    <Calendar size={15} className="text-accent-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Date</p>
                      <p className="font-body text-sm text-text-secondary">{project.date}</p>
                    </div>
                  </div>
                )}

                {techArr.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Layers size={15} className="text-accent-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] text-text-muted uppercase tracking-wide mb-1">Tools</p>
                      <div className="flex flex-wrap gap-1.5">
                        {techArr.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-bg-secondary border border-border font-mono text-[10px] text-text-muted rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary justify-center text-sm">
                      <ExternalLink size={14} /> View Live Project
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center text-sm">
                      <Github size={14} /> View on GitHub
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Prev / Next navigation ── */}
          {(prevProject || nextProject) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              {prevProject ? (
                <Link to={`/project/${prevProject.id}`}
                  className="group flex flex-col gap-1 p-4 rounded-xl border border-border hover:border-accent-gold/40 hover:bg-bg-card transition-all">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wide flex items-center gap-1">
                    <ChevronLeft size={12} /> Previous
                  </span>
                  <span className="font-display font-semibold text-sm text-text-primary group-hover:text-accent-gold transition-colors line-clamp-1">
                    {prevProject.title}
                  </span>
                </Link>
              ) : <div />}

              {nextProject ? (
                <Link to={`/project/${nextProject.id}`}
                  className="group flex flex-col gap-1 p-4 rounded-xl border border-border hover:border-accent-gold/40 hover:bg-bg-card transition-all text-right ml-auto w-full">
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wide flex items-center gap-1 justify-end">
                    Next <ChevronRight size={12} />
                  </span>
                  <span className="font-display font-semibold text-sm text-text-primary group-hover:text-accent-gold transition-colors line-clamp-1">
                    {nextProject.title}
                  </span>
                </Link>
              ) : <div />}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox media={media} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
