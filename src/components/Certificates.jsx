import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Award, Calendar, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { SectionReveal } from './ui/SectionReveal';
import { useCertificates } from '../context/CertificatesContext';
import { useSiteConfig } from '../context/SiteConfigContext';

// ── Single certificate card ───────────────────────────────────────────────────
function CertCard({ cert, index }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group card-base overflow-hidden flex flex-col"
    >
      {/* Badge / header area */}
      <div
        className="relative flex items-center justify-center p-8 overflow-hidden"
        style={{
          background: `linear-gradient(135deg,
            color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-secondary)),
            color-mix(in srgb, var(--color-accent) 3%, var(--color-bg-card)))`,
          borderBottom: '1px solid var(--color-border)',
          minHeight: '160px',
        }}
      >
        {/* Decorative rings */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, var(--color-accent) 0%, transparent 50%)`,
          }}
        />

        {cert.badge_url && !imgFailed ? (
          <motion.img
            src={cert.badge_url}
            alt={`${cert.title} badge`}
            className="relative z-10 max-h-24 max-w-[140px] object-contain drop-shadow-lg"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <motion.div
            className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
              border: '2px solid color-mix(in srgb, var(--color-accent) 30%, transparent)',
            }}
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <Award size={36} style={{ color: 'var(--color-accent)' }} />
          </motion.div>
        )}

        {/* Issuer badge */}
        {cert.issuer && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 80%, transparent)',
              border: '1px solid var(--color-border-bright)',
              color: 'var(--color-text-muted)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {cert.issuer}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3
          className="font-display font-bold text-base text-text-primary leading-tight transition-colors duration-200"
          style={hovered ? { color: 'var(--color-accent)' } : {}}
        >
          {cert.title}
        </h3>

        {cert.description && (
          <p className="font-body text-xs text-text-muted leading-relaxed line-clamp-2">
            {cert.description}
          </p>
        )}

        <div className="flex flex-col gap-1.5 mt-auto pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          {cert.date && (
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-text-muted shrink-0" />
              <span className="font-mono text-[11px] text-text-muted">{cert.date}</span>
            </div>
          )}
          {cert.credential_id && (
            <div className="flex items-center gap-2">
              <Hash size={12} className="text-text-muted shrink-0" />
              <span className="font-mono text-[11px] text-text-muted truncate" title={cert.credential_id}>
                {cert.credential_id}
              </span>
            </div>
          )}
        </div>

        {/* View credential button */}
        {cert.credential_url && cert.credential_url !== '#' && (
          <motion.a
            href={cert.credential_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl font-body text-xs font-semibold transition-all duration-200 w-full justify-center"
            style={{
              backgroundColor: hovered
                ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
                : 'var(--color-bg-secondary)',
              border: `1px solid ${hovered ? 'color-mix(in srgb, var(--color-accent) 40%, transparent)' : 'var(--color-border)'}`,
              color: hovered ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <ExternalLink size={13} />
            View Credential
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function Certificates() {
  const { certificates, loading } = useCertificates();
  const { config } = useSiteConfig();
  const [showAll, setShowAll] = useState(false);

  if (loading) return null;
  if (!certificates.length) return null; // Hide section if no certs added yet

  const INITIAL_SHOW = 6;
  const visible = showAll ? certificates : certificates.slice(0, INITIAL_SHOW);
  const hiddenCount = certificates.length - INITIAL_SHOW;

  // Group by issuer if more than 4 certs and grouping makes sense
  const issuers = [...new Set(certificates.map((c) => c.issuer).filter(Boolean))];
  const useGrouped = issuers.length > 1 && certificates.length >= 4;

  return (
    <section id="certificates" className="py-28 relative overflow-hidden">
      {/* Glow */}
      <div
        className="glow-blob w-[500px] h-[500px] -right-40 top-1/3 opacity-20"
        style={{ background: 'var(--color-accent)' }}
      />

      <div className="section-container relative z-10">
        <SectionReveal variant="slide-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle
      
              title={
                <>
             
                  <span className="gradient-text">
                    {config.certificates_title2 || 'recognized'}
                  </span>
                </>
              }
              subtitle={config.certificates_subtitle || ''}
            />

            {/* Total count badge */}
            <div
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm self-start md:self-auto"
              style={{
                background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)',
                color: 'var(--color-accent)',
              }}
            >
              <Award size={15} />
              {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}
            </div>
          </div>
        </SectionReveal>

        {/* Grid */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((cert, i) => (
              <CertCard key={cert.id} cert={cert} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Show more / less */}
        {certificates.length > INITIAL_SHOW && (
          <div className="flex justify-center mt-10">
            <motion.button
              onClick={() => setShowAll((p) => !p)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm transition-all border"
              style={{
                borderColor: 'var(--color-border-bright)',
                color: 'var(--color-text-secondary)',
              }}
              whileHover={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)', scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {showAll ? (
                <><ChevronUp size={15} /> Show less</>
              ) : (
                <><ChevronDown size={15} /> Show {hiddenCount} more certificate{hiddenCount !== 1 ? 's' : ''}</>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
