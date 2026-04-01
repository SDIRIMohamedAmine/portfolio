import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { SectionReveal, RevealItem } from './ui/SectionReveal';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

const ACCENT = 'var(--color-accent)';

// ── Animated skill progress bar ───────────────────────────────────────────────
function SkillBar({ skill, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const pct = Math.min(100, Math.max(0, (skill.score ?? 5) * 10));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">{skill.icon}</span>
          <div>
            <p className="font-display font-semibold text-sm text-text-primary">{skill.name}</p>
            {skill.description && (
              <p className="font-body text-xs text-text-muted leading-relaxed mt-0.5 line-clamp-2">
                {skill.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <span className="font-display font-bold text-base" style={{ color: ACCENT }}>
            {skill.score ?? 5}
          </span>
          <span className="font-mono text-xs text-text-muted">/10</span>
        </div>
      </div>

      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-border-bright)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.0, delay: index * 0.07 + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 w-6 rounded-full"
          style={{ background: 'var(--color-accent)', filter: 'blur(6px)', opacity: 0.55 }}
          initial={{ left: 0 }}
          animate={inView ? { left: `calc(${pct}% - 12px)` } : { left: 0 }}
          transition={{ duration: 1.0, delay: index * 0.07 + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

function SkillCategoryGroup({ category, skills, startIndex }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: ACCENT }}>
          {category}
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        <span className="font-mono text-xs text-text-muted">
          {skills.length} skill{skills.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex flex-col gap-5">
        {skills.map((skill, i) => (
          <SkillBar key={skill.id} skill={skill} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ value, label, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="card-base p-5 flex flex-col gap-1"
    >
      <p className="font-display font-extrabold text-3xl" style={{ color: ACCENT }}>{value}</p>
      <p className="font-body text-sm text-text-muted">{label}</p>
    </motion.div>
  );
}

// ── Seamless marquee ──────────────────────────────────────────────────────────
function SkillMarquee({ skills }) {
  if (!skills.length) return null;
  // Triplicate to ensure seamless loop at any container width
  const items = [...skills, ...skills, ...skills];
  return (
    <div
      className="mt-20 overflow-hidden border-y py-5 -mx-6 lg:-mx-10"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Fade masks on the edges */}
      <div className="relative" style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}>
        <div
          className="flex gap-10 w-max"
          style={{ animation: 'marquee-loop 35s linear infinite' }}
        >
          {items.map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-2 font-display font-bold text-base whitespace-nowrap opacity-30 hover:opacity-60 transition-opacity cursor-default"
            >
              <span className="text-xl">{s.icon}</span>
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main About component ──────────────────────────────────────────────────────
export default function About() {
  const { info, skills } = usePortfolio();
  const { config } = useSiteConfig();
  const [showAllSkills, setShowAllSkills] = useState(false);

  const hasResume = info.resume_url && info.resume_url !== '#';

  // Dynamic stats from config — filter out empty ones
  const stats = (Array.isArray(config.stats) ? config.stats : []).filter(
    (s) => s.value && s.label
  );

  // Decide grid columns based on stat count
  const statCols =
    stats.length === 1 ? 'grid-cols-1 max-w-xs' :
    stats.length === 2 ? 'grid-cols-2 max-w-sm' :
    stats.length === 3 ? 'grid-cols-3' :
    'grid-cols-2';

  // Group skills by category, sorted by score
  const categories = [...new Set(skills.map((s) => s.category || 'General'))];
  const sortedSkills = [...skills].sort((a, b) => (b.score ?? 5) - (a.score ?? 5));
  const visibleCategories = showAllSkills ? categories : categories.slice(0, 2);
  const hiddenCount = categories.length - 2;

  let globalSkillIndex = 0;

  return (
    <section id="about" className="py-28 relative overflow-hidden">
      <div
        className="glow-blob w-[600px] h-[600px] -left-60 top-1/4 opacity-25"
        style={{ background: ACCENT }}
      />

      <div className="section-container relative z-10">
        {/* ── Bio + Stats ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left: bio */}
          <SectionReveal variant="slide-right">
            <SectionTitle
              eyebrow={config.about_eyebrow}
              title={
                <>
                  {config.about_title1}
                  <br />
                  <span className="gradient-text">{config.about_title2}</span>
                </>
              }
            />
            <div className="flex flex-col gap-4 mt-6">
             
              {info.bio_extended && (
                <p className="font-body text-text-secondary leading-relaxed">{info.bio_extended}</p>
              )}
            </div>

            {hasResume && (
              <motion.a
                href={info.resume_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full font-display font-semibold text-sm transition-all duration-300"
                style={{ backgroundColor: ACCENT, color: 'var(--color-bg-primary)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(232,176,75,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Download size={16} />
                {config.hero_resume_label || 'Download Resume'}
              </motion.a>
            )}
          </SectionReveal>

          {/* Right: stats — only render if there are any */}
          {stats.length > 0 && (
            <SectionReveal variant="slide-left" delay={0.1}>
              <div className={`grid ${statCols} gap-4`}>
                {stats.map(({ value, label }, i) => (
                  <StatTile key={`${value}-${label}`} value={value} label={label} index={i} />
                ))}
              </div>
            </SectionReveal>
          )}
        </div>

        {/* ── Skills ── */}
        <SectionReveal variant="slide-up">
          <div className="flex items-center gap-4 mb-10">
            <div>
              <p
                className="font-mono text-xs tracking-[0.25em] uppercase mb-1"
                style={{ color: ACCENT }}
              >
                {config.about_skills_title || 'My Toolkit'}
              </p>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl text-text-primary">
                Skills & Proficiency
              </h3>
            </div>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>
        </SectionReveal>

        {skills.length === 0 ? (
          <p className="font-body text-sm text-text-muted text-center py-12">
            No skills added yet — add some in the admin panel.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {visibleCategories.map((category) => {
              const catSkills = sortedSkills.filter(
                (s) => (s.category || 'General') === category
              );
              const startIdx = globalSkillIndex;
              globalSkillIndex += catSkills.length;
              return (
                <SkillCategoryGroup
                  key={category}
                  category={category}
                  skills={catSkills}
                  startIndex={startIdx}
                />
              );
            })}
          </div>
        )}

        {/* Show more/less */}
        {categories.length > 2 && (
          <div className="flex justify-center mt-10">
            <motion.button
              onClick={() => setShowAllSkills((p) => !p)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-sm transition-all border"
              style={{ borderColor: 'var(--color-border-bright)', color: 'var(--color-text-secondary)' }}
              whileHover={{ borderColor: ACCENT, color: ACCENT, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {showAllSkills ? (
                <><ChevronUp size={15} /> Show less</>
              ) : (
                <><ChevronDown size={15} /> Show {hiddenCount} more categor{hiddenCount !== 1 ? 'ies' : 'y'}</>
              )}
            </motion.button>
          </div>
        )}

        {/* Seamless marquee */}
        <SkillMarquee skills={skills} />
      </div>
    </section>
  );
}
