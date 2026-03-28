import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle, Globe } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { SectionReveal } from './ui/SectionReveal';
import { supabase } from '../supabase/client';
import { usePortfolio } from '../context/PortfolioContext';
import { useSiteConfig } from '../context/SiteConfigContext';

// ── Favicon helper (same as Hero / Footer) ────────────────────────────────────
const PLATFORM_DOMAIN = {
  github: 'github.com', linkedin: 'linkedin.com', twitter: 'x.com',
  youtube: 'youtube.com', instagram: 'instagram.com', credly: 'credly.com',
  dribbble: 'dribbble.com', medium: 'medium.com', devto: 'dev.to', website: null,
};
function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}
function FaviconImg({ platform, href, size = 16 }) {
  const [failed, setFailed] = useState(false);
  const domain = PLATFORM_DOMAIN[platform] ?? extractDomain(href);
  const src = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
  if (!src || failed) return <Globe size={size} style={{ color: 'var(--color-text-muted)' }} />;
  return (
    <img src={src} alt={platform} width={size} height={size}
      className="rounded-sm object-contain" onError={() => setFailed(true)} />
  );
}

const INPUT_STYLE = {
  backgroundColor: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
};
const INPUT_CLS = 'w-full rounded-xl px-4 py-3.5 font-body text-sm focus:outline-none transition-all duration-200';

export default function Contact() {
  const { info } = usePortfolio();
  const { config } = useSiteConfig();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

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
    try {
      // 1. Save to Supabase (admin can read messages there)
      const { error: dbErr } = await supabase
        .from('contact_messages')
        .insert({ name: form.name, email: form.email, message: form.message });
      if (dbErr) console.warn('DB save:', dbErr.message);

      // 2. Attempt to send via EmailJS if configured
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

     if (serviceId && templateId && publicKey) {
  const { default: emailjs } = await import('@emailjs/browser');
  await emailjs.send(
    serviceId,
    templateId,
    { 
      name: form.name,    // Matches {{name}} in your template
      email: form.email,  // Matches {{email}} in your template
      message: form.message, 
      to_email: info.email 
    },
    publicKey
  );
}

      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('Send error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contact" className="py-28 relative overflow-hidden">
      <div className="glow-blob w-[600px] h-[600px] -right-60 bottom-0 opacity-20"
        style={{ background: 'var(--color-accent)' }} />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">

          {/* Left: info */}
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
                    <p className="font-body text-sm text-text-primary group-hover:opacity-80 transition-opacity">{info.email}</p>
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

            {/* All social links with favicons */}
            {allSocials.length > 0 && (
              <div className="flex flex-col gap-3 mt-6">
                <p className="font-mono text-xs text-text-muted tracking-widest uppercase">
                  {config.contact_socials_label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {allSocials.map(({ platform, label, href }) => (
                    <motion.a key={`${platform}-${href}`} href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 card-base text-text-secondary text-sm font-body"
                      whileHover={{ scale: 1.04, y: -2, borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
                      transition={{ duration: 0.15 }}>
                      <FaviconImg platform={platform} href={href} size={15} />
                      {label}
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </SectionReveal>

          {/* Right: form */}
          <SectionReveal variant="slide-left" delay={0.15}>
            <div className="card-base p-8 h-full">
              {status === 'sent' ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 py-16 text-center h-full">
                  <CheckCircle size={52} style={{ color: 'var(--color-accent)' }} />
                  <h3 className="font-display font-bold text-xl text-text-primary">{config.contact_success_title}</h3>
                  <p className="font-body text-sm text-text-secondary">{config.contact_success_body}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h3 className="font-display font-bold text-xl text-text-primary mb-1">
                    {config.contact_form_title}
                  </h3>

                  {status === 'error' && (
                    <div className="px-4 py-3 rounded-xl font-body text-sm text-red-400"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      Something went wrong. Your message was saved — try again or email directly.
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name',    type: 'text',  placeholder: config.contact_name_placeholder,  label: 'Name' },
                      { key: 'email',   type: 'email', placeholder: config.contact_email_placeholder, label: 'Email' },
                    ].map(({ key, type, placeholder, label }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-text-muted">{label}</label>
                        <input type={type} value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder} required
                          className={INPUT_CLS} style={INPUT_STYLE}
                          onFocus={(e) => e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-accent) 60%, transparent)'}
                          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'} />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-text-muted">Message</label>
                    <textarea value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder={config.contact_message_placeholder} required rows={5}
                      className={`${INPUT_CLS} resize-none`} style={INPUT_STYLE}
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

                  <p className="font-mono text-[10px] text-text-muted text-center">
                    Messages are saved securely. You'll receive a reply at the email you provide.
                  </p>
                </form>
              )}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
