import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { SectionReveal, RevealItem } from './ui/SectionReveal';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

const PLATFORM_ICONS = {
  github: '🐙', linkedin: '💼', twitter: '🐦', youtube: '▶️',
  instagram: '📸', website: '🌐', credly: '🏅', dribbble: '🎨',
  medium: '✍️', devto: '👩‍💻', other: '🔗',
};

const INPUT = 'w-full rounded-xl px-4 py-3.5 font-body text-sm focus:outline-none transition-all';

export default function Contact() {
  const { info } = usePortfolio();
  const { config } = useSiteConfig();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  // Core + custom social links
  const coreSocials = [
    { platform: 'github',   label: 'GitHub',   href: info.github_url },
    { platform: 'linkedin', label: 'LinkedIn', href: info.linkedin_url },
    { platform: 'twitter',  label: 'Twitter',  href: info.twitter_url },
  ].filter((s) => s.href && s.href !== '#');

  const extraSocials = (info.social_links || [])
    .filter((s) => s.url && s.url !== '#')
    .map((s) => ({ platform: s.platform, label: s.label, href: s.url }));

  const allSocials = [...coreSocials, ...extraSocials];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('sent');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <section id="contact" className="py-28 relative overflow-hidden">
      <div className="glow-blob w-[600px] h-[600px] -right-60 bottom-0 opacity-20"
        style={{ background: 'var(--color-accent)' }} />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">

          {/* Left */}
          <SectionReveal variant="slide-right">
            <SectionTitle
              eyebrow={config.contact_eyebrow}
              title={<>{config.contact_title1}<br /><span className="gradient-text">{config.contact_title2}</span></>}
              subtitle={config.contact_subtitle}
            />

            <div className="flex flex-col gap-3 mt-8">
              {info.email && (
                <motion.a href={`mailto:${info.email}`}
                  className="flex items-center gap-4 p-4 card-base group"
                  whileHover={{ x: 6, borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)' }}
                  transition={{ duration: 0.2 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}>
                    <Mail size={18} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="font-body text-xs text-text-muted mb-0.5">{config.contact_email_label}</p>
                    <p className="font-body text-sm text-text-primary transition-colors duration-200"
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}>{info.email}</p>
                  </div>
                </motion.a>
              )}
              {info.location && (
                <motion.div className="flex items-center gap-4 p-4 card-base"
                  whileHover={{ x: 6 }} transition={{ duration: 0.2 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}>
                    <MapPin size={18} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="font-body text-xs text-text-muted mb-0.5">{config.contact_location_label}</p>
                    <p className="font-body text-sm text-text-primary">{info.location}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {allSocials.length > 0 && (
              <div className="flex flex-col gap-3 mt-6">
                <p className="font-mono text-xs text-text-muted tracking-widest uppercase">
                  {config.contact_socials_label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {allSocials.map(({ platform, label, href }) => (
                    <motion.a key={`${platform}-${href}`} href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 card-base text-text-secondary text-sm font-body"
                      whileHover={{ scale: 1.05, y: -2, borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)', color: 'var(--color-accent)' }}
                      transition={{ duration: 0.15 }}>
                      <span>{PLATFORM_ICONS[platform] || '🔗'}</span>
                      {label}
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </SectionReveal>

          {/* Right: Form */}
          <SectionReveal variant="slide-left" delay={0.15}>
            <div className="card-base p-8 h-full">
              {status === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 py-16 text-center h-full">
                  <CheckCircle size={52} style={{ color: 'var(--color-accent)' }} />
                  <h3 className="font-display font-bold text-xl text-text-primary">{config.contact_success_title}</h3>
                  <p className="font-body text-sm text-text-secondary">{config.contact_success_body}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h3 className="font-display font-bold text-xl text-text-primary mb-1">{config.contact_form_title}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: 'name', type: 'text', placeholder: config.contact_name_placeholder, label: 'Name' },
                      { name: 'email', type: 'email', placeholder: config.contact_email_placeholder, label: 'Email' },
                    ].map(({ name, type, placeholder, label }) => (
                      <div key={name} className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-text-muted">{label}</label>
                        <input type={type} value={form[name]}
                          onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))}
                          placeholder={placeholder} required
                          className={INPUT}
                          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                          onFocus={(e) => e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-accent) 60%, transparent)'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'} />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-text-muted">Message</label>
                    <textarea value={form.message}
                      onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder={config.contact_message_placeholder} required rows={5}
                      className={`${INPUT} resize-none`}
                      style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-accent) 60%, transparent)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'} />
                  </div>
                  <motion.button type="submit" disabled={status === 'sending'}
                    className="btn-primary justify-center mt-2 disabled:opacity-60"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {status === 'sending' ? (
                      <><motion.span className="w-4 h-4 border-2 rounded-full"
                        style={{ borderColor: 'color-mix(in srgb, var(--color-bg-primary) 40%, transparent)', borderTopColor: 'var(--color-bg-primary)' }}
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                        Sending…</>
                    ) : (
                      <><Send size={15} /> {config.contact_submit_label}</>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
