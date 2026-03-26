import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, Briefcase, GraduationCap } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { usePortfolio } from '../../../context/PortfolioContext';
import Modal from '../../ui/Modal';

const TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Education'];

const EMPTY = {
  role: '', company: '', company_url: '', period: '',
  location: '', type: 'Full-time', description: '',
  highlights: '', display_order: 0,
};

function ExpForm({ initial, onSave, onCancel, saving }) {
  const hlString = Array.isArray(initial.highlights)
    ? initial.highlights.join('\n')
    : initial.highlights || '';
  const [form, setForm] = useState({ ...initial, highlights: hlString });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    const hlArray = form.highlights.split('\n').map((h) => h.trim()).filter(Boolean);
    onSave({ ...form, highlights: hlArray });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Job Title / Role</label>
          <input value={form.role} onChange={(e) => set('role', e.target.value)}
            placeholder="Senior Frontend Engineer" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Company / Institution</label>
          <input value={form.company} onChange={(e) => set('company', e.target.value)}
            placeholder="Vercel" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Company URL</label>
          <input value={form.company_url} onChange={(e) => set('company_url', e.target.value)}
            placeholder="https://vercel.com" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Period</label>
          <input value={form.period} onChange={(e) => set('period', e.target.value)}
            placeholder="2022 — Present" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Location</label>
          <input value={form.location} onChange={(e) => set('location', e.target.value)}
            placeholder="San Francisco, CA" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Type</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value)} className="admin-input">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="What you did, what you owned, the impact you had..." rows={3} className="admin-input resize-none" />
        </div>
        <div className="md:col-span-2">
          <label className="admin-label">
            Highlights <span className="text-text-muted normal-case tracking-normal">(one per line, shown as bullet points)</span>
          </label>
          <textarea value={form.highlights} onChange={(e) => set('highlights', e.target.value)}
            placeholder={"Reduced load time by 40%\nMentored 3 junior engineers\nOpen-sourced internal library with 5k stars"}
            rows={4} className="admin-input resize-none font-mono text-xs" />
        </div>
        <div>
          <label className="admin-label">Display Order</label>
          <input type="number" value={form.display_order} onChange={(e) => set('display_order', +e.target.value)}
            className="admin-input" />
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border">
        <button onClick={onCancel} className="admin-btn-secondary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !form.role || !form.company} className="admin-btn disabled:opacity-50">
          {saving ? 'Saving…' : <><Save size={15} /> Save Entry</>}
        </button>
      </div>
    </div>
  );
}

export default function ExperienceEditor({ addToast }) {
  const { experience, refetch } = usePortfolio();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (e) => { setEditTarget(e); setModalOpen(true); };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        const { error } = await supabase.from('experience').update(form).eq('id', editTarget.id);
        if (error) throw error;
        addToast('Experience updated!', 'success');
      } else {
        const { error } = await supabase.from('experience').insert(form);
        if (error) throw error;
        addToast('Experience entry added!', 'success');
      }
      await refetch();
      setModalOpen(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) return;
    setDeleting(id);
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (error) addToast(error.message, 'error');
    else { addToast('Entry deleted.', 'success'); await refetch(); }
    setDeleting(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
            <Briefcase size={18} className="text-accent-gold" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Experience</h2>
            <p className="font-body text-xs text-text-muted">{experience.length} entr{experience.length !== 1 ? 'ies' : 'y'} on the timeline</p>
          </div>
        </div>
        <button onClick={openAdd} className="admin-btn">
          <Plus size={15} /> Add Entry
        </button>
      </div>

      {/* Timeline list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {experience.map((exp) => {
            const isEdu = exp.type === 'Education';
            const highlights = Array.isArray(exp.highlights) ? exp.highlights : [];
            return (
              <motion.div key={exp.id} layout
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="admin-card flex gap-4 hover:border-border-bright transition-all">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border-bright flex items-center justify-center shrink-0 mt-1">
                  {isEdu ? <GraduationCap size={16} className="text-accent-gold" /> : <Briefcase size={16} className="text-accent-gold" />}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-sm text-text-primary">{exp.role}</h3>
                      <p className="font-body text-xs text-accent-gold/80">{exp.company}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono text-xs text-text-muted">{exp.period}</span>
                      <span className="px-2 py-0.5 bg-bg-secondary border border-border font-mono text-[10px] text-text-muted rounded-md">{exp.type}</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-text-muted mt-1 line-clamp-2">{exp.description}</p>
                  {highlights.length > 0 && (
                    <p className="font-mono text-[10px] text-text-muted mt-1.5">
                      {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center shrink-0">
                  <button onClick={() => openEdit(exp)}
                    className="p-2 rounded-lg bg-bg-secondary border border-border text-text-muted hover:text-accent-gold hover:border-accent-gold/40 transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(exp.id)} disabled={deleting === exp.id}
                    className="p-2 rounded-lg bg-bg-secondary border border-border text-text-muted hover:text-red-400 hover:border-red-400/40 transition-all">
                    {deleting === exp.id
                      ? <motion.span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full block"
                          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      : <Trash2 size={14} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {experience.length === 0 && (
          <div className="text-center py-12 text-text-muted font-body text-sm">No experience entries yet.</div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Experience' : 'Add Experience Entry'} size="lg">
        <ExpForm initial={editTarget || EMPTY} onSave={handleSave}
          onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  );
}
