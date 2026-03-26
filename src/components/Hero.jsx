import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Twitter } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

function TypingText({ strings }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const arr = strings.length ? strings : ['Developer'];

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
      {displayed}<span className="animate-blink text-accent-gold">|</span>
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
        ctx.fillStyle = `rgba(232,176,75,${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(232,176,75,${0.06 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
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

  const socials = [
    { icon: Github, href: info.github_url, label: 'GitHub' },
    { icon: Linkedin, href: info.linkedin_url, label: 'LinkedIn' },
    { icon: Twitter, href: info.twitter_url, label: 'Twitter' },
  ].filter((s) => s.href && s.href !== '#');

  const typingStrings = [info.title, info.tagline, 'i Contributor'].filter(Boolean);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden dot-grid">
      <ParticleCanvas />
      <div className="glow-blob w-[600px] h-[600px] bg-accent-gold/8 -top-40 -right-40 opacity-60" />
      <div className="glow-blob w-[400px] h-[400px] bg-accent-teal/8 bottom-0 -left-40 opacity-40" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-bg-primary/60 to-bg-primary pointer-events-none" />

      <div className="section-container relative z-10 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">
            <motion.div variants={item} className="flex items-center gap-3">
              <span className="w-8 h-px bg-accent-gold" />
              <span className="font-mono text-xs text-accent-gold tracking-[0.3em] uppercase">Available for work</span>
            </motion.div>

            <motion.div variants={item}>
              <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-text-primary">
                Hi, I'm{' '}
                <span className="relative inline-block">
                  {info.first_name}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-1 bg-accent-gold rounded-full"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    style={{ width: '100%' }}
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

            <motion.div variants={item} className="flex flex-wrap items-center gap-4 mt-2">
              <motion.button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary"
                whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(232,176,75,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >
                View Projects <span className="opacity-70">→</span>
              </motion.button>
              <motion.button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Get in Touch
              </motion.button>
            </motion.div>

            <motion.div variants={item} className="flex items-center gap-5 mt-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="text-text-muted hover:text-accent-gold transition-colors"
                  whileHover={{ scale: 1.15, y: -2 }}>
                  <Icon size={20} strokeWidth={1.5} />
                </motion.a>
              ))}
              {info.email && (
                <>
                  <span className="w-12 h-px bg-border-bright" />
                  <span className="font-mono text-xs text-text-muted">{info.email}</span>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right visual — photo if available, otherwise code card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full border border-accent-gold/20 scale-110 animate-spin-slow" />
              <div className="absolute inset-0 rounded-full border border-accent-teal/10 scale-125" style={{ animation: 'spin 35s linear infinite reverse' }} />

              <motion.div
                className="relative w-72 h-72 rounded-full border border-border-bright bg-bg-card shadow-card overflow-hidden"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {info.avatar_url ? (
                  /* Real photo */
                  <>
                    <img
                      src={info.avatar_url}
                      alt={info.name}
                      className="w-full h-full object-cover"
                    />
                    {/* subtle gold overlay ring on top of photo */}
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-accent-gold/20 pointer-events-none" />
                  </>
                ) : (
                  /* Fallback — code card + initials */
                  <>
                    <div className="absolute inset-0 flex flex-col justify-center items-start gap-2 p-8 opacity-25">
                      {['const me = {', `  name: "${info.first_name}",`, `  role: "${info.title}",`, '  coffee: Infinity,', '};'].map((l, i) => (
                        <p key={i} className="font-mono text-xs text-accent-gold">{l}</p>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-radial from-accent-gold/10 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display font-extrabold text-6xl text-accent-gold/25">
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-accent-gold transition-colors cursor-pointer"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
      >
        <span className="font-mono text-xs tracking-widest">scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ArrowDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  );
}
