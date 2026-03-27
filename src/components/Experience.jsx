import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { SectionReveal } from './ui/SectionReveal';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

function TimelineItem({ item, index, isLeft }) {
  const isEdu = item.type === 'Education';
  const highlights = Array.isArray(item.highlights)
    ? item.highlights
    : (item.highlights || '').split('\n').filter(Boolean);

  return (
    <div className={`relative flex ${isLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} flex-col lg:items-center`}>
      <motion.div
        className={`lg:w-[calc(50%-2.5rem)] flex flex-col ${isLeft ? 'lg:items-end lg:text-right' : 'lg:items-start'}`}
        initial={{ opacity: 0, x: isLeft ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile: small icon row */}
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-bright)' }}>
            {isEdu ? <GraduationCap size={14} style={{ color: 'var(--color-accent)' }} />
                   : <Briefcase size={14} style={{ color: 'var(--color-accent)' }} />}
          </div>
          <span className="font-mono text-xs text-text-muted">{item.period}</span>
        </div>

        <motion.div
          className="card-base p-6 group w-full"
          whileHover={{ y: -4, boxShadow: '0 12px 50px rgba(0,0,0,0.7)' }}
          transition={{ duration: 0.2 }}
        >
          <span className="hidden lg:block font-mono text-xs text-text-muted mb-1">{item.period}</span>
          <h3 className="font-display font-bold text-base text-text-primary transition-colors duration-200"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}>
            {item.role}
          </h3>
          <a href={item.company_url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1 font-body text-sm w-fit mt-0.5 hover:opacity-80 transition-opacity ${isLeft ? 'lg:self-end' : ''}`}
            style={{ color: 'var(--color-accent)' }}>
            {item.company} <ExternalLink size={11} />
          </a>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-0.5 font-mono text-[10px] text-text-muted rounded-md"
              style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              {item.type}
            </span>
            <span className="font-mono text-xs text-text-muted">{item.location}</span>
          </div>
          <p className="font-body text-sm text-text-secondary leading-relaxed mt-3">{item.description}</p>
          {highlights.length > 0 && (
            <ul className={`mt-3 flex flex-col gap-1.5 ${isLeft ? 'lg:items-end' : ''}`}>
              {highlights.map((h, i) => (
                <li key={i} className={`flex items-start gap-2 font-body text-xs text-text-muted ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </motion.div>

      {/* Center dot — desktop */}
      <motion.div
        className="hidden lg:flex w-20 shrink-0 items-center justify-center z-10"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.08 + 0.25, type: 'spring', stiffness: 300 }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-gold"
          style={{ backgroundColor: 'var(--color-bg-card)', border: '2px solid color-mix(in srgb, var(--color-accent) 40%, transparent)' }}>
          {isEdu ? <GraduationCap size={16} style={{ color: 'var(--color-accent)' }} />
                 : <Briefcase size={16} style={{ color: 'var(--color-accent)' }} />}
        </div>
      </motion.div>

      <div className="hidden lg:block lg:w-[calc(50%-2.5rem)]" />
    </div>
  );
}

export default function Experience() {
  const { experience } = usePortfolio();
  const { config } = useSiteConfig();
  return (
    <section id="experience" className="py-28 relative overflow-hidden">
      <div className="glow-blob w-[500px] h-[500px] -left-40 top-1/3 opacity-20"
        style={{ background: 'var(--color-accent)' }} />
      <div className="section-container relative z-10">
        <SectionReveal variant="scale">
          <div className="flex justify-center mb-16">
            <SectionTitle
              eyebrow={config.experience_eyebrow}
              title={<>{config.experience_title1}<br /><span className="gradient-text">{config.experience_title2}</span></>}
              align="center"
            />
          </div>
        </SectionReveal>

        <div className="relative flex flex-col gap-8 lg:gap-12">
          <div className="timeline-line hidden lg:block" />
          {experience.map((item, i) => (
            <TimelineItem key={item.id} item={item} index={i} isLeft={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
