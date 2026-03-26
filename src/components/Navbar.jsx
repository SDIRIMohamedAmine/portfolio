import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({ activeSection }) {
  const { info } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-border shadow-card' : ''
        }`}
      >
        <div className="section-container flex items-center justify-between h-[72px]">
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }}
            className="font-display font-extrabold text-xl text-text-primary hover:text-accent-gold transition-colors"
          >
            {info.first_name}<span className="text-accent-gold">.</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => {
              const id = href.replace('#', '');
              const active = activeSection === id;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => { e.preventDefault(); scrollTo(href); }}
                  className={`relative font-body text-sm transition-all duration-300 ${
                    active ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent-gold"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            {info.resume_url && info.resume_url !== '#' && (
              <a
                href={info.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex btn-outline text-sm py-2 px-5"
              >
                Resume
              </a>
            )}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
              onClick={() => setMobileOpen((p) => !p)}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={
                    mobileOpen
                      ? i === 0 ? { rotate: 45, y: 7 }
                        : i === 1 ? { opacity: 0 }
                        : { rotate: -45, y: -7 }
                      : { rotate: 0, y: 0, opacity: 1 }
                  }
                  className="block w-6 h-px bg-text-primary"
                />
              ))}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-72 bg-bg-secondary border-l border-border z-40 md:hidden flex flex-col pt-24 px-8 gap-6"
          >
            {NAV_LINKS.map(({ label, href }, i) => (
              <motion.a
                key={href}
                href={href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={(e) => { e.preventDefault(); scrollTo(href); }}
                className={`font-display text-2xl font-bold ${
                  activeSection === href.replace('#', '') ? 'text-accent-gold' : 'text-text-secondary'
                }`}
              >
                {label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
