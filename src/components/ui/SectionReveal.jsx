import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Wraps children in a scroll-triggered reveal animation.
 *
 * variant options:
 *   'slide-up'    — rises from below (default, like Joseph's portfolio)
 *   'slide-left'  — slides in from the right
 *   'slide-right' — slides in from the left
 *   'fade'        — pure opacity fade
 *   'scale'       — scales up from 96%
 *   'stagger'     — triggers children one-by-one (requires children to use motion.*)
 */

const VARIANTS = {
  'slide-up': {
    hidden:  { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden:  { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden:  { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0 },
  },
  'fade': {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  },
  'scale': {
    hidden:  { opacity: 0, scale: 0.93 },
    visible: { opacity: 1, scale: 1 },
  },
  'stagger': {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
};

const STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export function SectionReveal({
  children,
  variant = 'slide-up',
  delay = 0,
  duration = 0.65,
  className = '',
  margin = '-80px',
  once = true,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin });

  const isStagger = variant === 'stagger';
  const containerVariants = isStagger ? STAGGER_CONTAINER : {};
  const itemVariants = VARIANTS[variant] || VARIANTS['slide-up'];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={isStagger ? containerVariants : itemVariants}
      transition={
        isStagger
          ? {}
          : {
              duration,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item for use inside a SectionReveal variant="stagger" parent.
 * Each child will animate in sequence.
 */
export function RevealItem({ children, className = '', duration = 0.55 }) {
  return (
    <motion.div
      variants={VARIANTS['slide-up']}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated horizontal rule used between major sections.
 * A gold line sweeps in from left when the section scrolls into view.
 */
export function SectionDivider() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="relative h-px overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'var(--color-border)' }} />
      <motion.div
        className="absolute inset-y-0 left-0 h-full"
        style={{ background: `linear-gradient(90deg, var(--color-accent), transparent)` }}
        initial={{ width: '0%', opacity: 0 }}
        animate={inView ? { width: '60%', opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
