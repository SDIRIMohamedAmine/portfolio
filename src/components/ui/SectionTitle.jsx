import { motion } from 'framer-motion';

export default function SectionTitle({ eyebrow, title, subtitle, align = 'left' }) {
  return (
    <motion.div
      className={`flex flex-col gap-3 ${align === 'center' ? 'items-center text-center' : 'text-left'}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      {eyebrow && (
        <span className="font-mono text-xs text-accent-gold tracking-[0.25em] uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-text-primary leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-text-secondary text-base md:text-lg max-w-xl leading-relaxed mt-1">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
