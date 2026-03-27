import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { SectionReveal } from './ui/SectionReveal';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

const PLATFORM_ICONS = {
  github: '🐙', linkedin: '💼', twitter: '🐦', youtube: '▶️',
  instagram: '📸', website: '🌐', credly: '🏅', dribbble: '🎨',
  medium: '✍️', devto: '👩‍💻', other: '🔗',
};

export default function Footer() {
  const { info } = usePortfolio();
  const { config } = useSiteConfig();
  const year = new Date().getFullYear();

  const coreSocials = [
    { platform: 'github',   label: 'GitHub',   href: info.github_url },
    { platform: 'linkedin', label: 'LinkedIn', href: info.linkedin_url },
    { platform: 'twitter',  label: 'Twitter',  href: info.twitter_url },
  ].filter((s) => s.href && s.href !== '#');
  const extraSocials = (info.social_links || []).filter((s) => s.url && s.url !== '#');
  const allSocials = [
    ...coreSocials,
    ...extraSocials.map((s) => ({ platform: s.platform, label: s.label, href: s.url })),
  ];

  return (
    <footer className="border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 60%, transparent)' }}>
      <div className="section-container py-10">
        <SectionReveal variant="fade">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-display font-extrabold text-lg text-text-primary">
                {info.first_name}<span style={{ color: 'var(--color-accent)' }}>.</span>
              </span>
              <p className="font-body text-xs text-text-muted">{info.title} · {info.location}</p>
            </div>

            <div className="flex items-center gap-1 font-body text-xs text-text-muted">
              <span>{config.footer_tagline}</span>
              <Heart size={11} style={{ color: 'var(--color-accent)', fill: 'var(--color-accent)' }} className="mx-1" />
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              {allSocials.map(({ platform, label, href }) => (
                <motion.a key={`${platform}-${href}`} href={href} target="_blank" rel="noopener noreferrer"
                  title={label}
                  className="text-text-muted transition-colors text-lg"
                  whileHover={{ scale: 1.2, y: -2, color: 'var(--color-accent)' }}>
                  {PLATFORM_ICONS[platform] || '🔗'}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="font-mono text-xs text-text-muted">
              © {year} {info.name}. All rights reserved.
            </p>
          </div>
        </SectionReveal>
      </div>
    </footer>
  );
}
