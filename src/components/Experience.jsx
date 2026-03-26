import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { usePortfolio } from '../context/PortfolioContext';

function TimelineItem({ item, index, isLeft }) {
  const isEdu = item.type === 'Education';
  const highlights = Array.isArray(item.highlights)
    ? item.highlights
    : (item.highlights || '').split('\n').filter(Boolean);

  return (
    <div className={`relative flex ${isLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'} flex-col lg:items-center gap-0`}>
      <motion.div
        className={`lg:w-[calc(50%-2.5rem)] flex flex-col ${isLeft ? 'lg:items-end lg:text-right' : 'lg:items-start'}`}
        initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Mobile: small icon row */}
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-bg-card border border-border-bright flex items-center justify-center shrink-0">
            {isEdu ? <GraduationCap size={14} className="text-accent-gold" /> : <Briefcase size={14} className="text-accent-gold" />}
          </div>
          <span className="font-mono text-xs text-text-muted">{item.period}</span>
        </div>

        <div className="card-base p-6 hover:border-accent-gold/25 transition-all group">
          <span className="hidden lg:block font-mono text-xs text-text-muted mb-1">{item.period}</span>
          <h3 className="font-display font-bold text-base text-text-primary group-hover:text-accent-gold transition-colors">{item.role}</h3>
          <a href={item.company_url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1 font-body text-sm text-accent-gold/80 hover:text-accent-gold w-fit mt-0.5 ${isLeft ? 'lg:self-end' : ''}`}>
            {item.company} <ExternalLink size={11} />
          </a>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-bg-secondary border border-border font-mono text-[10px] text-text-muted rounded-md">{item.type}</span>
            <span className="font-mono text-xs text-text-muted">{item.location}</span>
          </div>
          <p className="font-body text-sm text-text-secondary leading-relaxed mt-3">{item.description}</p>
          {highlights.length > 0 && (
            <ul className={`mt-3 flex flex-col gap-1.5 ${isLeft ? 'lg:items-end' : ''}`}>
              {highlights.map((h, i) => (
                <li key={i} className={`flex items-start gap-2 font-body text-xs text-text-muted ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-accent-gold shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      {/* Center dot */}
      <motion.div
        className="hidden lg:flex w-20 shrink-0 items-center justify-center z-10"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
      >
        <div className="w-10 h-10 rounded-full bg-bg-card border-2 border-accent-gold/40 flex items-center justify-center shadow-gold">
          {isEdu ? <GraduationCap size={16} className="text-accent-gold" /> : <Briefcase size={16} className="text-accent-gold" />}
        </div>
      </motion.div>

      <div className="hidden lg:block lg:w-[calc(50%-2.5rem)]" />
    </div>
  );
}

export default function Experience() {
  const { experience } = usePortfolio();
  return (
    <section id="experience" className="py-28 relative overflow-hidden">
      <div className="glow-blob w-[500px] h-[500px] bg-accent-purple/5 -left-40 top-1/3" />
      <div className="section-container relative z-10">
        <div className="flex justify-center mb-16">
          <SectionTitle
            eyebrow="Career Journey"
            title={<>Where I've been,<br /><span className="gradient-text">what I've built</span></>}
            align="center"
          />
        </div>
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
