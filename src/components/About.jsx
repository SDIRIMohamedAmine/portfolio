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
      className="group"
    >
      {/* Header row */}
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
        <div className="flex items-center gap-1.5 shrink-0 ml-4">
          <span className="font-display font-bold text-base" style={{ color: ACCENT }}>{skill.score ?? 5}</span>
          <span className="font-mono text-xs text-text-muted">/10</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-border-bright)' }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))`,
          }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.0, delay: index * 0.07 + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Glow at tip */}
        <motion.div
          className="absolute inset-y-0 w-6 rounded-full"
          style={{ background: 'var(--color-accent)', filter: 'blur(6px)', opacity: 0.6 }}
          initial={{ left: 0 }}
          animate={inView ? { left: `calc(${pct}% - 12px)` } : { left: 0 }}
          transition={{ duration: 1.0, delay: index * 0.07 + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

// ── Skill category group ──────────────────────────────────────────────────────
function SkillCategoryGroup({ category, skills, startIndex }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs tracking-[0.2em] uppercase font-semibold"
          style={{ color: ACCENT }}>{category}</span>
        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        <span className="font-mono text-xs text-text-muted">{skills.length} skill{skills.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex flex-col gap-5">
        {skills.map((skill, i) => (
          <SkillBar key={skill.id} skill={skill} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}

// ── Stats counter tile ────────────────────────────────────────────────────────
function StatTile({ value, label, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
      className="card-base p-5 flex flex-col gap-1 transition-shadow duration-300"
    >
      <p className="font-display font-extrabold text-3xl" style={{ color: ACCENT }}>{value}</p>
      <p className="font-body text-sm text-text-muted">{label}</p>
    </motion.div>
  );
}

export default function About() {
  const { info, skills } = usePortfolio();
  const { config } = useSiteConfig();
  const [showAllSkills, setShowAllSkills] = useState(false);

  const hasResume = info.resume_url && info.resume_url !== '#';

  const stats = [
    { value: config.stat1_value, label: config.stat1_label },
    { value: config.stat2_value, label: config.stat2_label },
    { value: config.stat3_value, label: config.stat3_label },
    { value: config.stat4_value, label: config.stat4_label },
  ];

  // Group skills by category
  const categories = [...new Set(skills.map((s) => s.category || 'General'))];
  // Sort skills within each category by score desc
  const sortedSkills = [...skills].sort((a, b) => (b.score ?? 5) - (a.score ?? 5));

  // Limit to first 2 categories unless expanded
  const visibleCategories = showAllSkills ? categories : categories.slice(0, 2);
  const hiddenCount = categories.length - 2;

  let globalSkillIndex = 0;

  return (
    <section id="about" className="py-28 relative overflow-hidden">
      {/* BG glow */}
      <div className="glow-blob w-[600px] h-[600px] -left-60 top-1/4 opacity-30"
        style={{ background: ACCENT }} />

      <div className="section-container relative z-10">

        {/* ── Top: Bio + Stats ─────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">

          {/* Left — bio */}
          <SectionReveal variant="slide-right">
            <SectionTitle
              eyebrow={config.about_eyebrow}
              title={
                <>{config.about_title1}<br />
                  <span className="gradient-text">{config.about_title2}</span>
                </>
              }
            />

            <div className="flex flex-col gap-4 mt-6">
              {info.bio && (
                <p className="font-body text-text-secondary leading-relaxed">{info.bio}</p>
              )}
              {info.bio_extended && (
                <p className="font-body text-text-secondary leading-relaxed">{info.bio_extended}</p>
              )}
            </div>

            {/* Resume download button */}
            {hasResume && (
              <motion.a
                href={info.resume_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full font-display font-semibold text-sm transition-all duration-300 shadow-gold hover:shadow-gold-lg"
                style={{ backgroundColor: ACCENT, color: 'var(--color-bg-primary)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(232,176,75,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Download size={16} />
                {config.hero_resume_label || 'Download Resume'}
              </motion.a>
            )}
          </SectionReveal>

          {/* Right — stats */}
          <SectionReveal variant="slide-left" delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ value, label }, i) => (
                <StatTile key={label} value={value} label={label} index={i} />
              ))}
            </div>
          </SectionReveal>
        </div>

        {/* ── Skills section ───────────────────────────────── */}
        <SectionReveal variant="slide-up">
          <div className="flex items-center gap-4 mb-10">
            <div>
              <p className="font-mono text-xs tracking-[0.25em] uppercase mb-1" style={{ color: ACCENT }}>
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
              const catSkills = sortedSkills.filter((s) => (s.category || 'General') === category);
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

        {/* Show more / less toggle */}
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

        {/* Marquee ticker */}
        <div className="mt-20 overflow-hidden border-y py-5 -mx-6 lg:-mx-10"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex">
            <div className="marquee-track">
              {[...skills, ...skills].map((s, i) => (
                <span key={i} className="font-display font-bold text-lg whitespace-nowrap opacity-30">
                  {s.icon} {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
