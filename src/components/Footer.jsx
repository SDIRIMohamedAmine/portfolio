import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Heart } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Footer() {
  const { info } = usePortfolio();
  const year = new Date().getFullYear();

  const socials = [
    { icon: Github, href: info.github_url },
    { icon: Linkedin, href: info.linkedin_url },
    { icon: Twitter, href: info.twitter_url },
  ].filter((s) => s.href && s.href !== '#');

  return (
    <footer className="border-t border-border bg-bg-secondary/60">
      <div className="section-container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-display font-extrabold text-lg text-text-primary">
              {info.first_name}<span className="text-accent-gold">.</span>
            </span>
            <p className="font-body text-xs text-text-muted">
              {info.title} · {info.location}
            </p>
          </div>

          <div className="flex items-center gap-1 font-body text-xs text-text-muted">
            <span>Built with</span>
            <Heart size={12} className="text-accent-gold mx-1" fill="currentColor" />
            <span>using React & Supabase</span>
          </div>

          <div className="flex items-center gap-4">
            {socials.map(({ icon: Icon, href }) => (
              <motion.a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="text-text-muted hover:text-accent-gold transition-colors"
                whileHover={{ scale: 1.15, y: -2 }}>
                <Icon size={17} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="font-mono text-xs text-text-muted">
            © {year} {info.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
