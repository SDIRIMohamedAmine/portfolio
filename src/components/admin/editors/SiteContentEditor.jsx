import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Layout, ChevronDown, ChevronRight, Plus, X, GripVertical } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { useSiteConfig, DEFAULT_SITE_CONTENT } from '../../../context/SiteConfigContext';

// ── Typing strings array editor ───────────────────────────────────────────────
function TypingStringsEditor({ strings, onChange }) {
  const [newVal, setNewVal] = useState('');
  const add = () => { const v = newVal.trim(); if (!v) return; onChange([...strings, v]); setNewVal(''); };
  const remove = (i) => onChange(strings.filter((_, idx) => idx !== i));
  const update = (i, val) => onChange(strings.map((s, idx) => idx === i ? val : s));

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {strings.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-muted w-5 shrink-0">{i + 1}.</span>
            <input value={s} onChange={(e) => update(i, e.target.value)}
              placeholder="e.g. Mechanical Engineer, Photographer…" className="admin-input flex-1 text-sm" />
            <button type="button" onClick={() => remove(i)}
              className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex gap-2 mt-1">
        <input value={newVal} onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a typing string and press Enter…" className="admin-input flex-1 text-sm" />
        <button type="button" onClick={add} className="admin-btn-secondary px-3 shrink-0"><Plus size={14} /></button>
      </div>
      <p className="font-mono text-[10px] text-text-muted">These cycle in the hero. Press Enter or + to add.</p>
    </div>
  );
}

// ── Dynamic stats editor ──────────────────────────────────────────────────────
function StatsEditor({ stats, onChange }) {
  const add = () => onChange([...stats, { value: '', label: '' }]);
  const remove = (i) => onChange(stats.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(stats.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      <div className="flex items-center justify-between">
        <label className="admin-label mb-0">Stats tiles (shown in About section)</label>
        <button type="button" onClick={add} className="admin-btn-secondary text-xs px-3 py-1.5">
          <Plus size={13} /> Add stat
        </button>
      </div>
      <p className="font-mono text-[10px] text-text-muted">
        Add as many stats as you want. Empty ones are hidden. Tiles adapt their layout automatically.
      </p>

      <AnimatePresence>
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end p-3 rounded-xl border"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-primary) 50%, transparent)', borderColor: 'var(--color-border)' }}>
            <div>
              {i === 0 && <label className="admin-label">Number / Value</label>}
              <input value={stat.value} onChange={(e) => update(i, 'value', e.target.value)}
                placeholder="e.g. 5+" className="admin-input" />
            </div>
            <div>
              {i === 0 && <label className="admin-label">Label</label>}
              <input value={stat.label} onChange={(e) => update(i, 'label', e.target.value)}
                placeholder="e.g. Years of Experience" className="admin-input" />
            </div>
            <div className={i === 0 ? 'mt-5' : ''}>
              <button type="button" onClick={() => remove(i)}
                className="p-2.5 rounded-xl border text-text-muted hover:text-red-400 hover:border-red-400/40 transition-all"
                style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {stats.length === 0 && (
        <p className="font-body text-xs text-text-muted italic px-2">
          No stats — the stats section will be hidden on the public site.
        </p>
      )}
    </div>
  );
}

// ── Section groups ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'hero', label: 'Hero Section', emoji: '🏠', desc: 'Full-screen landing',
    fields: [
      { key: 'hero_badge',          label: 'Badge text',           hint: '"Open to opportunities"' },
      { key: 'hero_typing_strings', label: 'Typing strings',       type: 'typing_array' },
      { key: 'hero_cta_primary',    label: 'Primary button' },
      { key: 'hero_cta_secondary',  label: 'Secondary button' },
      { key: 'hero_resume_label',   label: 'Resume download button text' },
      { key: 'hero_scroll_label',   label: 'Scroll indicator',     type: 'short' },
    ],
  },
  {
    id: 'about', label: 'About Section', emoji: '👤', desc: 'Bio & skills',
    fields: [
      { key: 'about_eyebrow',      label: 'Eyebrow label' },
      { key: 'about_title1',       label: 'Title — line 1' },
      { key: 'about_title2',       label: 'Title — line 2 (gradient)' },
      { key: 'about_skills_title', label: 'Skills sub-heading' },
      { key: 'stats',              label: 'Stats tiles', type: 'stats_array' },
    ],
  },
  {
    id: 'projects', label: 'Projects Section', emoji: '📁', desc: 'Portfolio grid',
    fields: [
      { key: 'projects_eyebrow',         label: 'Eyebrow label' },
      { key: 'projects_title1',          label: 'Title — line 1' },
      { key: 'projects_title2',          label: 'Title — line 2 (gradient)' },
      { key: 'projects_subtitle',        label: 'Subtitle',             type: 'textarea' },
      { key: 'projects_filter_all',      label: '"All" filter button',  type: 'short' },
      { key: 'projects_filter_featured', label: '"Featured" button',    type: 'short' },
      { key: 'projects_github_cta',      label: 'GitHub CTA button' },
    ],
  },
  {
    id: 'certificates', label: 'Certificates Section', emoji: '🏅', desc: 'Badges & credentials',
    fields: [

      { key: 'title',   label: 'Title — line 2 (gradient)' },
    ],
  },
  {
    id: 'experience', label: 'Experience Section', emoji: '📅', desc: 'Timeline',
    fields: [
      { key: 'experience_eyebrow', label: 'Eyebrow label' },
      { key: 'experience_title1',  label: 'Title — line 1' },
      { key: 'experience_title2',  label: 'Title — line 2 (gradient)' },
    ],
  },
  {
    id: 'contact', label: 'Contact Section', emoji: '✉️', desc: 'Form & links',
    fields: [
      { key: 'contact_eyebrow',             label: 'Eyebrow label' },
      { key: 'contact_title1',              label: 'Title — line 1' },
      { key: 'contact_title2',              label: 'Title — line 2 (gradient)' },
      { key: 'contact_subtitle',            label: 'Subtitle',             type: 'textarea' },
      { key: 'contact_email_label',         label: 'Email label',          type: 'short' },
      { key: 'contact_location_label',      label: 'Location label',       type: 'short' },
      { key: 'contact_socials_label',       label: '"Find me on" label' },
      { key: 'contact_form_title',          label: 'Form heading' },
      { key: 'contact_name_placeholder',    label: 'Name placeholder' },
      { key: 'contact_email_placeholder',   label: 'Email placeholder' },
      { key: 'contact_message_placeholder', label: 'Message placeholder',  type: 'textarea' },
      { key: 'contact_submit_label',        label: 'Submit button',        type: 'short' },
      { key: 'contact_success_title',       label: 'Success title' },
      { key: 'contact_success_body',        label: 'Success message',      type: 'textarea' },
    ],
  },
  {
    id: 'footer', label: 'Footer', emoji: '🔻', desc: 'Bottom of page',
    fields: [{ key: 'footer_tagline', label: 'Footer tagline' }],
  },
];

// ── DB column whitelist (no phantom columns) ──────────────────────────────────
const DB_TEXT_COLUMNS = [
  'hero_badge','hero_cta_primary','hero_cta_secondary','hero_resume_label','hero_scroll_label',
  'about_eyebrow','about_title1','about_title2','about_skills_title',
  'projects_eyebrow','projects_title1','projects_title2','projects_subtitle',
  'projects_filter_all','projects_filter_featured','projects_github_cta',
  'certificates_eyebrow','certificates_title1','certificates_title2','certificates_subtitle',
  'experience_eyebrow','experience_title1','experience_title2',
  'contact_eyebrow','contact_title1','contact_title2','contact_subtitle',
  'contact_email_label','contact_location_label','contact_socials_label',
  'contact_form_title','contact_name_placeholder','contact_email_placeholder',
  'contact_message_placeholder','contact_submit_label','contact_success_title','contact_success_body',
  'footer_tagline',
];

// ── Accordion section ─────────────────────────────────────────────────────────
function SectionGroup({ section, form, onChange, open, onToggle }) {
  const elements = section.fields.map((f) => {
    // Special: typing strings array
    if (f.type === 'typing_array') {
      return (
        <div key={f.key} className="md:col-span-2">
          <label className="admin-label">{f.label}</label>
          <TypingStringsEditor
            strings={Array.isArray(form[f.key]) ? form[f.key] : DEFAULT_SITE_CONTENT.hero_typing_strings}
            onChange={(arr) => onChange(f.key, arr)}
          />
        </div>
      );
    }
    // Special: dynamic stats array
    if (f.type === 'stats_array') {
      return (
        <StatsEditor
          key={f.key}
          stats={Array.isArray(form.stats) ? form.stats : DEFAULT_SITE_CONTENT.stats}
          onChange={(arr) => onChange('stats', arr)}
        />
      );
    }

    const isShort    = f.type === 'short';
    const isTextarea = f.type === 'textarea';
    return (
      <div key={f.key} className={isShort ? '' : 'md:col-span-2'}>
        <label className="admin-label">{f.label}</label>
        {isTextarea ? (
          <textarea value={form[f.key] ?? ''} onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.hint || DEFAULT_SITE_CONTENT[f.key] || ''} rows={2} className="admin-input resize-none" />
        ) : (
          <input value={form[f.key] ?? ''} onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.hint || DEFAULT_SITE_CONTENT[f.key] || ''} className="admin-input" />
        )}
      </div>
    );
  });

  return (
    <div className="admin-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-1 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.emoji}</span>
          <div className="text-left">
            <p className="font-display font-semibold text-sm text-text-primary">{section.label}</p>
            <p className="font-body text-xs text-text-muted">{section.desc}</p>
          </div>
        </div>
        {open ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-4"
          style={{ borderColor: 'var(--color-border)' }}>
          {elements}
        </motion.div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SiteContentEditor({ addToast }) {
  const { config, refetchConfig } = useSiteConfig();
  const [form, setForm] = useState({ ...DEFAULT_SITE_CONTENT, ...config });
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState({ hero: true });

  useEffect(() => {
    setForm((f) => ({ ...DEFAULT_SITE_CONTENT, ...config, ...f,
      hero_typing_strings: config.hero_typing_strings ?? DEFAULT_SITE_CONTENT.hero_typing_strings,
      stats: config.stats ?? DEFAULT_SITE_CONTENT.stats,
    }));
  }, [config]);

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleSection = (id) => setOpenSections((p) => ({ ...p, [id]: !p[id] }));
  const expandAll = () => setOpenSections(SECTIONS.reduce((a, s) => ({ ...a, [s.id]: true }), {}));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { id: 1 };
      DB_TEXT_COLUMNS.forEach((k) => { if (k in form) payload[k] = form[k]; });
      // JSONB columns
      payload.hero_typing_strings = Array.isArray(form.hero_typing_strings)
        ? form.hero_typing_strings : DEFAULT_SITE_CONTENT.hero_typing_strings;
      payload.stats = Array.isArray(form.stats)
        ? form.stats.filter((s) => s.value || s.label)
        : DEFAULT_SITE_CONTENT.stats;

      const { error } = await supabase.from('site_content').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      await refetchConfig();
      addToast('Site content saved!', 'success');
    } catch (err) {
      addToast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
            <Layout size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Site Content</h2>
            <p className="font-body text-xs text-text-muted">Every word on the public portfolio</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={expandAll} className="admin-btn-secondary text-xs px-3 py-2">Expand all</button>
          <motion.button onClick={handleSave} disabled={saving} className="admin-btn"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {saving ? (
              <><motion.span className="w-4 h-4 border-2 border-bg-primary/40 border-t-bg-primary rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                Saving…</>
            ) : (
              <><Save size={15} /> Save All</>
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
        <span style={{ color: 'var(--color-accent)' }}>💡</span>
        <p className="font-body text-xs text-text-secondary">
          Edit any text visible on the public site. Click <strong className="text-text-primary">Save All</strong> when done.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SECTIONS.map((section) => (
          <SectionGroup key={section.id} section={section} form={form} onChange={handleChange}
            open={!!openSections[section.id]} onToggle={() => toggleSection(section.id)} />
        ))}
      </div>
    </div>
  );
}
