import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Upload, X, ImageIcon, Plus, Trash2, Link, Globe, Github, Linkedin, Twitter, Youtube, Instagram, FileText } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { usePortfolio } from '../../../context/PortfolioContext';

const FIELDS = [
  { key: 'name',         label: 'Full Name',        placeholder: 'Your Name',             type: 'text',     span: 2 },
  { key: 'first_name',   label: 'First Name',        placeholder: 'Your',                  type: 'text' },
  { key: 'last_name',    label: 'Last Name',         placeholder: 'Name',                  type: 'text' },
  { key: 'title',        label: 'Job Title',         placeholder: 'e.g. Mechanical Engineer', type: 'text' },
  { key: 'tagline',      label: 'Tagline / Subtitle', placeholder: '& Creator',            type: 'text' },
  { key: 'email',        label: 'Contact Email',     placeholder: 'hello@yoursite.dev',    type: 'email' },
  { key: 'location',     label: 'Location',          placeholder: 'Your City, Country',    type: 'text' },
  { key: 'bio',          label: 'Short Bio',         placeholder: 'A brief intro…',        type: 'textarea', span: 2, rows: 3 },
  { key: 'bio_extended', label: 'Extended Bio',      placeholder: 'Longer description…',   type: 'textarea', span: 2, rows: 4 },
];

const PLATFORM_OPTIONS = [
  { value: 'github',    label: 'GitHub',    icon: Github },
  { value: 'linkedin',  label: 'LinkedIn',  icon: Linkedin },
  { value: 'twitter',   label: 'Twitter/X', icon: Twitter },
  { value: 'youtube',   label: 'YouTube',   icon: Youtube },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'website',   label: 'Website',   icon: Globe },
  { value: 'credly',    label: 'Credly',    icon: Link },
  { value: 'dribbble',  label: 'Dribbble',  icon: Globe },
  { value: 'medium',    label: 'Medium',    icon: Globe },
  { value: 'devto',     label: 'Dev.to',    icon: Globe },
  { value: 'other',     label: 'Other',     icon: Link },
];

function SocialLinksEditor({ links, onChange }) {
  const addLink = () => onChange([...links, { platform: 'other', label: '', url: '' }]);
  const removeLink = (i) => onChange(links.filter((_, idx) => idx !== i));
  const updateLink = (i, key, val) => onChange(links.map((l, idx) => idx === i ? { ...l, [key]: val } : l));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Additional Social Links</p>
        <button type="button" onClick={addLink} className="admin-btn-secondary text-xs px-3 py-2">
          <Plus size={13} /> Add Link
        </button>
      </div>

      <p className="font-body text-xs text-text-muted">
        GitHub, LinkedIn, Twitter are already in the fields above. Add extra links here (Credly, YouTube, portfolio, etc.)
      </p>

      <AnimatePresence>
        {links.map((link, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-[140px_1fr_1fr_auto] gap-2 items-end">
            <div>
              {i === 0 && <label className="admin-label">Platform</label>}
              <select value={link.platform} onChange={(e) => {
                const opt = PLATFORM_OPTIONS.find(o => o.value === e.target.value);
                updateLink(i, 'platform', e.target.value);
                if (opt && !link.label) updateLink(i, 'label', opt.label);
              }} className="admin-input text-xs">
                {PLATFORM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              {i === 0 && <label className="admin-label">Display Label</label>}
              <input value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)}
                placeholder="My Credly" className="admin-input text-xs" />
            </div>
            <div>
              {i === 0 && <label className="admin-label">URL</label>}
              <input type="url" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)}
                placeholder="https://..." className="admin-input text-xs" />
            </div>
            <div className={i === 0 ? 'mt-5' : ''}>
              <button type="button" onClick={() => removeLink(i)}
                className="p-2.5 rounded-xl bg-bg-secondary border border-border text-text-muted hover:text-red-400 hover:border-red-400/40 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {links.length === 0 && (
        <p className="font-body text-xs text-text-muted italic px-2">No extra links yet.</p>
      )}
    </div>
  );
}

// ── Resume uploader ───────────────────────────────────────────────────────────
function ResumeUploader({ value, onChange, addToast }) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState(value && !value.startsWith('http') ? 'file' : 'url');
  const fileRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      addToast('Only PDF or Word documents are allowed.', 'error'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('File must be under 10MB.', 'error'); return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `resume/cv.${ext}`;
      const { error } = await supabase.storage.from('assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('assets').getPublicUrl(path);
      onChange(data.publicUrl);
      addToast('Resume uploaded! Save changes to apply.', 'success');
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-card flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}>
          <FileText size={16} style={{ color: 'var(--color-accent)' }} />
        </div>
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest flex-1">Resume / CV</p>
        {/* Toggle */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          {['url', 'file'].map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className="px-3 py-1 rounded-md font-mono text-xs transition-all"
              style={mode === m
                ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }
                : { color: 'var(--color-text-muted)' }}>
              {m === 'url' ? '🔗 URL' : '📄 Upload'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'url' ? (
        <div>
          <label className="admin-label">Paste a link to your resume</label>
          <input type="url" value={value || ''} onChange={(e) => onChange(e.target.value)}
            placeholder="https://drive.google.com/... or https://yoursite.com/cv.pdf"
            className="admin-input" />
          {value && value !== '#' && (
            <a href={value} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 font-mono text-xs hover:underline"
              style={{ color: 'var(--color-accent)' }}>
              <FileText size={12} /> Preview current resume
            </a>
          )}
        </div>
      ) : (
        <div>
          <label className="admin-label">Upload PDF or Word document (max 10MB)</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200"
            style={{ borderColor: 'var(--color-border-bright)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-bright)'}
          >
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx"
              onChange={(e) => uploadFile(e.target.files[0])} className="hidden" />
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <motion.span className="w-4 h-4 border-2 border-t-transparent rounded-full"
                  style={{ borderColor: 'var(--color-accent)' }}
                  animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                <span className="font-body text-sm text-text-muted">Uploading…</span>
              </div>
            ) : (
              <>
                <Upload size={20} className="mx-auto mb-2 text-text-muted" />
                <p className="font-body text-sm text-text-secondary">
                  <span style={{ color: 'var(--color-accent)' }} className="font-medium">Click to upload</span> or drag & drop
                </p>
                <p className="font-mono text-xs text-text-muted mt-1">PDF, DOC, DOCX</p>
              </>
            )}
          </div>
          {value && value !== '#' && (
            <a href={value} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 font-mono text-xs hover:underline"
              style={{ color: 'var(--color-accent)' }}>
              <FileText size={12} /> Current: view uploaded file
            </a>
          )}
        </div>
      )}
    </div>
  );
}


export default function ProfileEditor({ addToast }) {
  const { info, refetch } = usePortfolio();
  const [form, setForm]           = useState(info);
  const [socialLinks, setSocialLinks] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(info);
    setSocialLinks(Array.isArray(info.social_links) ? info.social_links : []);
  }, [info]);

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const uploadAvatar = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please select an image file.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('Image must be under 5MB.', 'error'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatar/profile.${ext}`;
      const { error: uploadError } = await supabase.storage.from('assets').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('assets').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setForm((f) => ({ ...f, avatar_url: url }));
      addToast('Photo uploaded! Save changes to apply.', 'success');
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('portfolio_info')
        .update({ ...form, social_links: socialLinks, id: 1 })
        .eq('id', 1);
      if (error) throw error;
      await refetch();
      addToast('Profile saved successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
            <User size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Profile</h2>
            <p className="font-body text-xs text-text-muted">Your personal info, photo, bio & links</p>
          </div>
        </div>
        <motion.button onClick={handleSave} disabled={saving} className="admin-btn"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {saving ? (
            <><motion.span className="w-4 h-4 border-2 border-bg-primary/40 border-t-bg-primary rounded-full"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> Saving…</>
          ) : (
            <><Save size={15} /> Save Changes</>
          )}
        </motion.button>
      </div>

      {/* Avatar upload */}
      <div className="admin-card flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full border-2 overflow-hidden flex items-center justify-center"
            style={{ borderColor: 'var(--color-border-bright)', backgroundColor: 'var(--color-bg-secondary)' }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-extrabold text-3xl" style={{ color: 'color-mix(in srgb, var(--color-accent) 30%, transparent)' }}>
                {form.first_name?.[0]}{form.last_name?.[0]}
              </span>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-bg-primary) 70%, transparent)' }}>
              <motion.span className="w-6 h-6 border-2 border-t-transparent rounded-full"
                style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            </div>
          )}
          {form.avatar_url && !uploading && (
            <button onClick={() => setForm((f) => ({ ...f, avatar_url: '' }))}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400">
              <X size={10} />
            </button>
          )}
        </div>

        <div className="flex-1 w-full">
          <p className="admin-label mb-2">Profile Photo</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadAvatar(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200"
            style={{ borderColor: dragOver ? 'var(--color-accent)' : 'var(--color-border-bright)' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files[0])} className="hidden" />
            <ImageIcon size={20} className="mx-auto mb-2 text-text-muted" />
            <p className="font-body text-sm text-text-secondary">
              <span style={{ color: 'var(--color-accent)' }} className="font-medium">Click to upload</span> or drag & drop
            </p>
            <p className="font-mono text-xs text-text-muted mt-1">PNG, JPG, WEBP — max 5MB</p>
          </div>
          <div className="mt-3">
            <label className="admin-label">Or paste an image URL</label>
            <input type="url" value={form.avatar_url || ''} onChange={(e) => handleChange('avatar_url', e.target.value)}
              placeholder="https://..." className="admin-input" />
          </div>
        </div>
      </div>

      {/* Resume uploader */}
      <ResumeUploader
        value={form.resume_url}
        onChange={(url) => handleChange('resume_url', url)}
        addToast={addToast}
      />

      {/* Main fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label, placeholder, type, span, rows }) => (
          <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className={span === 2 ? 'md:col-span-2' : ''}>
            <label className="admin-label">{label}</label>
            {type === 'textarea' ? (
              <textarea value={form[key] || ''} onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder} rows={rows || 3} className="admin-input resize-none" />
            ) : (
              <input type={type} value={form[key] || ''} onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder} className="admin-input" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Core social URLs */}
      <div className="admin-card flex flex-col gap-4">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Main Social Profiles</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'github_url',   label: 'GitHub URL',   icon: Github },
            { key: 'linkedin_url', label: 'LinkedIn URL', icon: Linkedin },
            { key: 'twitter_url',  label: 'Twitter/X URL',icon: Twitter },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <label className="admin-label flex items-center gap-1"><Icon size={12} /> {label}</label>
              <input type="url" value={form[key] || ''} onChange={(e) => handleChange(key, e.target.value)}
                placeholder="https://..." className="admin-input" />
            </div>
          ))}
        </div>
      </div>

      {/* Additional social links */}
      <div className="admin-card">
        <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
      </div>
    </div>
  );
}
