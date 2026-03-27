import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { SectionDivider } from '../components/ui/SectionReveal';
import { useActiveSection } from '../hooks/useActiveSection';
import { usePortfolio } from '../context/PortfolioContext';

const SECTIONS = ['hero', 'about', 'projects', 'experience', 'contact'];

// Custom cursor
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0, id;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = `${mx}px`; dot.style.top = `${my}px`;
    };
    const tick = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;
      id = requestAnimationFrame(tick);
    };
    const onEnter = () => setHovering(true);
    const onLeave = () => setHovering(false);
    document.addEventListener('mousemove', onMove);
    id = requestAnimationFrame(tick);
    const els = document.querySelectorAll('a, button, [role="button"]');
    els.forEach((el) => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave); });
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(id);
      els.forEach((el) => { el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave); });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className={`cursor-ring ${hovering ? 'hovering' : ''}`} />
    </>
  );
}

// Spinning cog loader
function SpinningCog() {
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--color-accent)' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </motion.svg>
  );
}

function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}>
      <div className="flex flex-col items-center gap-5">
        <SpinningCog />
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="font-mono text-xs text-text-muted tracking-[0.2em] uppercase">
          Loading
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const activeSection = useActiveSection(SECTIONS);
  const { loading: dataLoading } = usePortfolio();
  const [minTimeDone, setMinTimeDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), 600);
    return () => clearTimeout(t);
  }, []);
  const loading = dataLoading || !minTimeDone;

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <CustomCursor />

      <AnimatePresence>
        {loading && <Loader key="loader" />}
      </AnimatePresence>

      {!loading && (
        <>
          <Navbar activeSection={activeSection} />
          <main>
            <Hero />
            <SectionDivider />
            <About />
            <SectionDivider />
            <Projects />
            <SectionDivider />
            <Experience />
            <SectionDivider />
            <Contact />
          </main>
          <Footer />

          {/* Scroll to top */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-card transition-all z-40"
            style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-bright)', color: 'var(--color-text-muted)' }}
            animate={{ opacity: activeSection !== 'hero' ? 1 : 0, scale: activeSection !== 'hero' ? 1 : 0 }}
            whileHover={{ scale: 1.1, borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
            whileTap={{ scale: 0.9 }}>
            ↑
          </motion.button>
        </>
      )}
    </div>
  );
}
