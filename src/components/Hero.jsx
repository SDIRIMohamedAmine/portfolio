import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Download } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

function TypingText({ strings }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const arr = strings?.length ? strings : ['Professional'];

  useEffect(() => {
    const current = arr[idx % arr.length];
    let t;
    if (!deleting && displayed === current) {
      t = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed === '') {
      setDeleting(false);
      setIdx((i) => (i + 1) % arr.length);
    } else if (deleting) {
      t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), 45);
    } else {
      t = setTimeout(() => setDisplayed((d) => current.slice(0, d.length + 1)), 80);
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, idx, arr]);

  return (
    <span className="gradient-text">
      {displayed}<span className="animate-blink" style={{ color: 'var(--color-accent)' }}>|</span>
    </span>
  );
}

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let id;
    let W = (c.width = window.innerWidth);
    let H = (c.height = window.innerHeight);
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#e8b04b';
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.4 + 0.1,
    }));
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(accentColor.startsWith('#') ? accentColor : '#e8b04b');
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x = (p.x + p.dx + W) % W; p.y = (p.y + p.dy + H) % H;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${rgb},${0.06 * (1 - d / 110)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } };

export default function Hero() {
  const { info } = usePortfolio();
  const { config } = useSiteConfig();

  const coreLinks = [
    { platform: 'github',   label: 'GitHub',   href: info.github_url },
    { platform: 'linkedin', label: 'LinkedIn', href: info.linkedin_url },
    { platform: 'twitter',  label: 'Twitter',  href: info.twitter_url },
  ].filter((s) => s.href && s.href !== '#');

  const extraLinks = (info.social_links || []).filter((s) => s.url && s.url !== '#');

  const allSocials = [
    ...coreLinks,
    ...extraLinks.map((s) => ({ platform: s.platform, label: s.label, href: s.url })),
  ];

  const typingStrings = Array.isArray(config.hero_typing_strings) && config.hero_typing_strings.length
    ? config.hero_typing_strings
    : ['Creative Professional'];

  const hasResume = info.resume_url && info.resume_url !== '#';

  // Helper to strip https:// and trailing slashes for a cleaner display
  const cleanUrl = (url) => url?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden dot-grid">
      <ParticleCanvas />
      <div className="glow-blob w-[600px] h-[600px] opacity-40" style={{ background: 'var(--color-accent)', top: '-160px', right: '-160px' }} />
      <div className="glow-blob w-[400px] h-[400px] opacity-20" style={{ background: '#4ecdc4', bottom: 0, left: '-160px' }} />
      <div className="absolute inset-0 bg-gradient-radial from-transparent pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, transparent 40%, var(--color-bg-primary) 80%)` }} />

      <div className="section-container relative z-10 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

            <motion.div variants={item} className="flex items-center gap-3">
              <span className="w-8 h-px" style={{ background: 'var(--color-accent)' }} />
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-accent)' }}>
                {config.hero_badge}
              </span>
            </motion.div>

            <motion.div variants={item}>
              <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-text-primary">
                Hi, I'm{' '}
                <span className="relative inline-block">
                  {info.first_name}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-1 rounded-full"
                    style={{ background: 'var(--color-accent)', width: '100%' }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                  />
                </span>
                <br />{info.last_name}
              </h1>
            </motion.div>

            <motion.div variants={item} className="font-display text-xl md:text-2xl font-semibold text-text-secondary h-8">
              <TypingText strings={typingStrings} />
            </motion.div>

            <motion.p variants={item} className="font-body text-text-secondary text-base md:text-lg leading-relaxed max-w-lg">
              {info.bio}
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap items-center gap-3 mt-2">
              <motion.button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {config.hero_cta_primary} <span className="opacity-70">→</span>
              </motion.button>

              <motion.button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {config.hero_cta_secondary}
              </motion.button>

              {hasResume && (
                <motion.a
                  href={info.resume_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 font-display text-sm rounded-full transition-all duration-300 cursor-pointer"
                  style={{ border: '1px solid var(--color-border-bright)', color: 'var(--color-text-secondary)' }}
                  whileHover={{ scale: 1.03, borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                  whileTap={{ scale: 0.97 }}>
                  <Download size={14} /> {config.hero_resume_label || 'Download CV'}
                </motion.a>
              )}
            </motion.div>

            {/* UPDATED: Text-based Social Links */}
            <motion.div variants={item} className="flex flex-col gap-2 mt-4">
              {allSocials.map(({ platform, label, href }) => (
                <motion.a 
                  key={`${platform}-${href}`} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors duration-300 flex items-center gap-2"
                  whileHover={{ x: 5 }}>
                  <span style={{ color: 'var(--color-accent)' }}>{label}</span>
                  <span className="opacity-30">:</span>
                  <span>{cleanUrl(href)}</span>
                </motion.a>
              ))}
              {info.email && (
                <div className="flex items-center gap-2 mt-2">
                   <span className="w-8 h-px" style={{ background: 'var(--color-border-bright)' }} />
                   <span className="font-mono text-xs text-text-muted">{info.email}</span>
                </div>
              )}
            </motion.div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full scale-110 animate-spin-slow"
                style={{ border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }} />
              <div className="absolute inset-0 rounded-full scale-125"
                style={{ border: '1px solid color-mix(in srgb, #4ecdc4 10%, transparent)', animation: 'spin 35s linear infinite reverse' }} />
              <motion.div
                className="relative w-72 h-72 rounded-full shadow-card overflow-hidden"
                style={{ border: '1px solid var(--color-border-bright)', backgroundColor: 'var(--color-bg-card)' }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {info.avatar_url ? (
                  <>
                    <img src={info.avatar_url} alt={info.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 20%, transparent)' }} />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex flex-col justify-center items-start gap-2 p-8 opacity-20">
                      {[`const me = {`, `  name: "${info.first_name}",`, `  passion: "my work",`, `  energy: Infinity,`, `};`].map((l, i) => (
                        <p key={i} className="font-mono text-xs" style={{ color: 'var(--color-accent)' }}>{l}</p>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display font-extrabold text-6xl opacity-20" style={{ color: 'var(--color-accent)' }}>
                        {info.first_name?.[0]}{info.last_name?.[0]}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.button
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
      >
        <span className="font-mono text-xs tracking-widest">{config.hero_scroll_label}</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ArrowDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  );
}