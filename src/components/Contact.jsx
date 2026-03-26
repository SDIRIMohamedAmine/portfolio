import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import SectionTitle from './ui/SectionTitle';
import { usePortfolio } from '../context/PortfolioContext';

const INPUT = 'w-full bg-bg-secondary border border-border rounded-xl px-4 py-3.5 font-body text-sm text-text-primary placeholder-text-muted focus:border-accent-gold/60 focus:outline-none transition-all';

export default function Contact() {
  const { info } = usePortfolio();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const socials = [
    { icon: Github, label: 'GitHub', href: info.github_url },
    { icon: Linkedin, label: 'LinkedIn', href: info.linkedin_url },
    { icon: Twitter, label: 'Twitter', href: info.twitter_url },
  ].filter((s) => s.href && s.href !== '#');

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
      <div className="glow-blob w-[600px] h-[600px] bg-accent-gold/6 -right-60 bottom-0" />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="flex flex-col gap-8">
            <SectionTitle
              eyebrow="Get in Touch"
              title={<>Let's build something<br /><span className="gradient-text">extraordinary</span></>}
              subtitle="My inbox is always open."
            />
            <div className="flex flex-col gap-3">
              {info.email && (
                <motion.a href={`mailto:${info.email}`}
                  className="flex items-center gap-4 p-4 card-base hover:border-accent-gold/30 transition-all group"
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  whileHover={{ x: 4 }}>
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-accent-gold" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-text-muted mb-0.5">Email</p>
                    <p className="font-body text-sm text-text-primary group-hover:text-accent-gold transition-colors">{info.email}</p>
                  </div>
                </motion.a>
              )}
              {info.location && (
                <motion.div className="flex items-center gap-4 p-4 card-base"
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.1 }}>
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-accent-gold" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-text-muted mb-0.5">Location</p>
                    <p className="font-body text-sm text-text-primary">{info.location}</p>
                  </div>
                </motion.div>
              )}
            </div>
            {socials.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs text-text-muted tracking-widest uppercase">Find me on</p>
                <div className="flex gap-3 flex-wrap">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 card-base hover:border-accent-gold/30 text-text-secondary hover:text-accent-gold transition-all text-sm"
                      whileHover={{ scale: 1.04, y: -2 }}>
                      <Icon size={16} /> {label}
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <motion.div className="card-base p-8"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}>
            {status === 'sent' ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <CheckCircle size={48} className="text-accent-gold" />
                <h3 className="font-display font-bold text-xl text-text-primary">Message sent!</h3>
                <p className="font-body text-sm text-text-secondary">I'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="font-display font-bold text-xl text-text-primary mb-1">Send a message</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-text-muted">Name</label>
                    <input type="text" name="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name" required className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-text-muted">Email</label>
                    <input type="email" name="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com" required className={INPUT} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-text-muted">Message</label>
                  <textarea name="message" value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell me about your project..." required rows={5} className={`${INPUT} resize-none`} />
                </div>
                <motion.button type="submit" disabled={status === 'sending'}
                  className="btn-primary justify-center mt-2 disabled:opacity-60"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {status === 'sending' ? (
                    <><motion.span className="w-4 h-4 border-2 border-bg-primary/40 border-t-bg-primary rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> Sending…</>
                  ) : (
                    <><Send size={15} /> Send Message</>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
