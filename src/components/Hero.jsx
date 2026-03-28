import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Download, Globe } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

// ── Real favicon fetcher ──────────────────────────────────────────────────────
// Maps known platform names → canonical domains for Google favicon service
const PLATFORM_DOMAIN = {
  github:    'github.com',
  linkedin:  'linkedin.com',
  twitter:   'x.com',
  youtube:   'youtube.com',
  instagram: 'instagram.com',
  credly:    'credly.com',
  dribbble:  'dribbble.com',
  medium:    'medium.com',
  devto:     'dev.to',
  website:   null, // will extract from URL
};

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function FaviconImg({ platform, href, size = 20 }) {
  const [failed, setFailed] = useState(false);
  const domain = PLATFORM_DOMAIN[platform] ?? extractDomain(href);
  const src = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    : null;

  if (!src || failed) {
    return <Globe size={size} style={{ color: 'var(--color-accent)' }} />;
  }
  return (
    <img
      src={src}
      alt={platform}
      width={size}
      height={size}
      className="rounded-sm object-contain"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
    />
  );
}

// ── Typing animation ──────────────────────────────────────────────────────────
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
      {displayed}
      <span className="animate-blink" style={{ color: 'var(--color-accent)' }}>|</span>
    </span>
  );
}

// ── Particle canvas ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let id;
    let W = (c.width = window.innerWidth);
    let H = (c.height = window.innerHeight);
    const accentColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim() || '#e8b04b';
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(accentColor.startsWith('#') ? accentColor : '#e8b04b');
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x = (p.x + p.dx + W) % W;
        p.y = (p.y + p.dy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${rgb},${0.06 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// ── Main Hero component ───────────────────────────────────────────────────────
export default function Hero() {
  const { info } = usePortfolio();
  const { config } = useSiteConfig();

  const coreLinks = [
    { platform: 'github',   label: 'GitHub',   href: info.github_url },
    { platform: 'linkedin', label: 'LinkedIn', href: info.linkedin_url },
    { platform: 'twitter',  label: 'Twitter',  href: info.twitter_url },
  ].filter((s) => s.href && s.href !== '#');

  const extraLinks = (info.social_links || [])
    .filter((s) => s.url && s.url !== '#')
    .map((s) => ({ platform: s.platform, label: s.label, href: s.url }));

  const allSocials = [...coreLinks, ...extraLinks];

  const typingStrings =
    Array.isArray(config.hero_typing_strings) && config.hero_typing_strings.length
      ? config.hero_typing_strings
      : ['Creative Professional'];

  const hasResume = info.resume_url && info.resume_url !== '#';

  // Trim URL for display: strip protocol + www + trailing slash
  const cleanUrl = (url) => {
    try {
      const u = new URL(url);
      return (u.hostname.replace(/^www\./, '') + u.pathname)
        .replace(/\/$/, '')
        .slice(0, 40);
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 40);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden dot-grid">
      <ParticleCanvas />

      {/* Background glows */}
      <div
        className="glow-blob w-[300px] h-[300px] md:w-[600px] md:h-[600px] opacity-30 md:opacity-40"
        style={{ background: 'var(--color-accent)', top: '-100px', right: '-100px' }}
      />
      <div
        className="glow-blob w-[250px] h-[250px] md:w-[400px] md:h-[400px] opacity-15 md:opacity-20"
        style={{ background: '#4ecdc4', bottom: 0, left: '-100px' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, var(--color-bg-primary) 80%)',
        }}
      />

      <div className="section-container relative z-10 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Avatar / right visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:order-last"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full scale-110 animate-spin-slow"
                style={{
                  border:
                    '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
                }}
              />
              <div
                className="absolute inset-0 rounded-full scale-125"
                style={{
                  border:
                    '1px solid color-mix(in srgb, #4ecdc4 10%, transparent)',
                  animation: 'spin 35s linear infinite reverse',
                }}
              />
              <motion.div
                className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full shadow-card overflow-hidden"
                style={{
                  border: '1px solid var(--color-border-bright)',
                  backgroundColor: 'var(--color-bg-card)',
                }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {info.avatar_url ? (
                  <>
                    <img
                      src={info.avatar_url}
                      alt={info.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow:
                          'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 20%, transparent)',
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex flex-col justify-center items-start gap-2 p-6 md:p-8 opacity-20">
                      {[
                        'const me = {',
                        `  name: "${info.first_name}",`,
                        '  passion: "my work",',
                        '};',
                      ].map((l, i) => (
                        <p
                          key={i}
                          className="font-mono text-[10px] md:text-xs"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {l}
                        </p>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="font-display font-extrabold text-5xl md:text-6xl opacity-20"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        {info.first_name?.[0]}
                        {info.last_name?.[0]}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* ── Left content ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-5"
          >
            {/* Badge */}
            <motion.div variants={item} className="flex items-center gap-3">
              <span
                className="w-8 h-px shrink-0"
                style={{ background: 'var(--color-accent)' }}
              />
              <span
                className="font-mono text-xs tracking-[0.3em] uppercase"
                style={{ color: 'var(--color-accent)' }}
              >
                {config.hero_badge}
              </span>
            </motion.div>

            {/* Name */}
            <motion.div variants={item}>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-text-primary text-center lg:text-left">
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
                <br />
                {info.last_name}
              </h1>
            </motion.div>

            {/* Typing */}
            <motion.div
              variants={item}
              className="font-display text-xl md:text-2xl font-semibold text-text-secondary h-8 text-center lg:text-left"
            >
              <TypingText strings={typingStrings} />
            </motion.div>

            {/* Bio */}
            <motion.p
              variants={item}
              className="font-body text-text-secondary text-sm md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 text-center lg:text-left"
            >
              {info.bio}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={item}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-1"
            >
              <motion.button
                onClick={() =>
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="btn-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {config.hero_cta_primary}{' '}
                <span className="opacity-70">→</span>
              </motion.button>

              <motion.button
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="btn-outline"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {config.hero_cta_secondary}
              </motion.button>

              {hasResume && (
                <motion.a
                  href={info.resume_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 font-display text-sm rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    border: '1px solid var(--color-border-bright)',
                    color: 'var(--color-text-secondary)',
                  }}
                  whileHover={{
                    scale: 1.03,
                    borderColor: 'var(--color-accent)',
                    color: 'var(--color-accent)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Download size={14} />
                  {config.hero_resume_label || 'Download CV'}
                </motion.a>
              )}
            </motion.div>

            {/* ── Social links: favicon · label · url ── */}
            {allSocials.length > 0 && (
              <motion.div
                variants={item}
                className="flex flex-col gap-2 mt-2 items-center lg:items-start"
              >
                {allSocials.map(({ platform, label, href }) => (
                  <motion.a
                    key={`${platform}-${href}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Real favicon */}
                    <span className="shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                      <FaviconImg platform={platform} href={href} size={18} />
                    </span>

                    {/* Label */}
                    <span
                      className="font-mono text-[11px] font-semibold shrink-0"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {label}
                    </span>

                    {/* Separator */}
                    <span className="font-mono text-[11px] opacity-30 text-text-muted shrink-0">
                      :
                    </span>

                    {/* Cleaned URL */}
                    <span className="font-mono text-[11px] text-text-muted group-hover:text-text-secondary transition-colors duration-150 truncate max-w-[180px]">
                      {cleanUrl(href)}
                    </span>
                  </motion.a>
                ))}

                {/* Email */}
                {info.email && (
                  <div className="flex items-center gap-2 mt-1 opacity-50">
                    <span className="hidden lg:block w-8 h-px shrink-0" style={{ background: 'var(--color-border-bright)' }} />
                    <span className="font-mono text-[11px] text-text-muted">{info.email}</span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() =>
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
        }
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <span className="font-mono text-[10px] tracking-widest">
          {config.hero_scroll_label}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  );
}
