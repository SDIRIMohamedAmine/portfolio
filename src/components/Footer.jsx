import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe } from 'lucide-react';
import { SectionReveal } from './ui/SectionReveal';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

// ── Same favicon helper as Hero ───────────────────────────────────────────────
const PLATFORM_DOMAIN = {
  github: 'github.com', linkedin: 'linkedin.com', twitter: 'x.com',
  youtube: 'youtube.com', instagram: 'instagram.com', credly: 'credly.com',
  dribbble: 'dribbble.com', medium: 'medium.com', devto: 'dev.to', website: null,
};

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}

function FaviconImg({ platform, href, size = 18 }) {
  const [failed, setFailed] = useState(false);
  const domain = PLATFORM_DOMAIN[platform] ?? extractDomain(href);
  const src = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
  if (!src || failed) return <Globe size={size} style={{ color: 'var(--color-text-muted)' }} />;
  return (
    <img src={src} alt={platform} width={size} height={size}
      className="rounded-sm object-contain" onError={() => setFailed(true)}
      style={{ width: size, height: size }} />
  );
}

export default function Footer() {
  const { info } = usePortfolio();
  const { config } = useSiteConfig();
  const year = new Date().getFullYear();

  const coreSocials = [
    { platform: 'github',   label: 'GitHub',   href: info.github_url },
    { platform: 'linkedin', label: 'LinkedIn', href: info.linkedin_url },
    { platform: 'twitter',  label: 'Twitter',  href: info.twitter_url },
  ].filter((s) => s.href && s.href !== '#');

  const extraSocials = (info.social_links || [])
    .filter((s) => s.url && s.url !== '#')
    .map((s) => ({ platform: s.platform, label: s.label, href: s.url }));

  const allSocials = [...coreSocials, ...extraSocials];

  return (
    <footer className="border-t"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 60%, transparent)' }}>
      <div className="section-container py-10">
        <SectionReveal variant="fade">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-display font-extrabold text-lg text-text-primary">
                {info.first_name}<span style={{ color: 'var(--color-accent)' }}>.</span>
              </span>
              <p className="font-body text-xs text-text-muted">{info.title} · {info.location}</p>
            </div>

            {/* Tagline */}
            <div className="flex items-center gap-1 font-body text-xs text-text-muted">
              <span>{config.footer_tagline}</span>
              <Heart size={11} style={{ color: 'var(--color-accent)', fill: 'var(--color-accent)' }} className="mx-1" />
            </div>

            {/* Social icons with real favicons */}
            {allSocials.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {allSocials.map(({ platform, label, href }) => (
                  <motion.a
                    key={`${platform}-${href}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                    whileHover={{ scale: 1.15, y: -2, borderColor: 'var(--color-accent)' }}
                  >
                    <FaviconImg platform={platform} href={href} size={16} />
                  </motion.a>
                ))}
              </div>
            )}
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
