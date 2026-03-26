import { motion } from 'framer-motion';
import SectionTitle from './ui/SectionTitle';
import { usePortfolio } from '../context/PortfolioContext';

const CATEGORIES = ['Frontend', 'Backend', 'Tools'];

export default function About() {
  const { info, skills } = usePortfolio();

  const stats = [
    { value: '5+', label: 'Years Experience' },
    { value: '40+', label: 'Projects Shipped' },
    { value: '12k+', label: 'GitHub Stars' },
    { value: '3', label: 'Open Source Libs' },
  ];

  return (
    <section id="about" className="py-28 relative overflow-hidden">
      <div className="glow-blob w-[500px] h-[500px] bg-accent-gold/5 -left-60 top-1/3" />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div className="flex flex-col gap-8">
            <SectionTitle
              eyebrow="About Me"
              title={<>Turning ideas into<br /><span className="gradient-text">digital reality</span></>}
            />
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="font-body text-text-secondary leading-relaxed">{info.bio}</p>
              {info.bio_extended && (
                <p className="font-body text-text-secondary leading-relaxed">{info.bio_extended}</p>
              )}
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {stats.map(({ value, label }) => (
                <div key={label} className="card-base p-5 hover:border-accent-gold/30 transition-colors">
                  <p className="font-display font-extrabold text-3xl text-accent-gold">{value}</p>
                  <p className="font-body text-sm text-text-muted mt-1">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: skills */}
          <div className="flex flex-col gap-8">
            {CATEGORIES.map((cat, ci) => {
              const catSkills = skills.filter((s) => s.category === cat);
              if (!catSkills.length) return null;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: ci * 0.1 }}
                  className="flex flex-col gap-3"
                >
                  <p className="font-mono text-xs text-accent-gold tracking-[0.2em] uppercase">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill, i) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        whileHover={{ scale: 1.06, y: -2 }}
                        className="flex items-center gap-2 px-3.5 py-2 bg-bg-card border border-border rounded-full font-body text-sm text-text-secondary hover:border-accent-gold/40 hover:text-text-primary transition-all cursor-default"
                      >
                        <span className="text-base leading-none">{skill.icon}</span>
                        <span>{skill.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Marquee */}
        <div className="mt-20 overflow-hidden border-y border-border py-5 -mx-6 lg:-mx-10">
          <div className="flex">
            <div className="marquee-track">
              {[...skills, ...skills].map((s, i) => (
                <span key={i} className="font-display font-bold text-lg text-text-muted/30 whitespace-nowrap">
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
