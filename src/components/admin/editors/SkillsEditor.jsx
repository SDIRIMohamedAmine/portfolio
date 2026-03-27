import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, Code2, ChevronDown } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { usePortfolio } from '../../../context/PortfolioContext';
import Modal from '../../ui/Modal';

// ── Emoji picker ──────────────────────────────────────────────────────────────
const EMOJI_GROUPS = [
  { label: 'Tech',        emojis: ['💻','🖥️','📱','⌨️','🖱️','📡','🔌','🔋','💾','💿','📀','🕹️','📲','🛰️','📟','🖨️'] },
  { label: 'Engineering', emojis: ['⚙️','🔧','🔩','🛠️','⚡','🔭','🔬','🧲','💡','🏗️','⚗️','🧪','🌡️','🧮','📐','📏'] },
  { label: 'Design',      emojis: ['🎨','🖌️','✏️','🖊️','✍️','🎭','📷','📸','🎬','🖼️','🎞️','🎪','🎠','🖍️','📐','🎯'] },
  { label: 'Business',    emojis: ['💼','📊','📈','📉','📋','💰','💳','🤝','📞','📨','🗃️','📌','📎','✉️','🗂️','📠'] },
  { label: 'Education',   emojis: ['📚','📖','🎓','📝','📓','📔','📕','📗','📘','📙','🏫','🧠','💬','🗣️','🔍','🏆'] },
  { label: 'Sports',      emojis: ['⚽','🏀','🏈','⚾','🎾','🏋️','🤸','🧗','🚴','🏊','🥊','⛷️','🏄','🎮','🎯','🥇'] },
  { label: 'Nature',      emojis: ['🌱','🌿','🌍','🌲','☀️','🌙','⭐','🔥','💧','🌊','🌸','🍀','🌾','🏔️','🌋','🌈'] },
  { label: 'Symbols',     emojis: ['🚀','✈️','🚗','🏠','🎯','🏆','🥇','🎉','💫','✨','⭐','🌟','💎','🔑','🛡️','⚓'] },
];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  return (
    <div className="relative">
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-2 px-3 py-2 admin-input w-auto text-xl">
          <span>{value || '⚡'}</span>
          <ChevronDown size={14} className="text-text-muted" />
        </button>
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
          placeholder="Type or pick →" className="admin-input flex-1" maxLength={8} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute left-0 top-full mt-2 z-50 rounded-2xl border border-border shadow-card-hover overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-secondary)', minWidth: '320px' }}>
            <div className="flex overflow-x-auto border-b border-border px-2 pt-2 gap-1">
              {EMOJI_GROUPS.map((g, i) => (
                <button key={g.label} onClick={() => setActiveGroup(i)}
                  className="shrink-0 px-3 py-1.5 rounded-t-lg font-mono text-[10px] transition-all"
                  style={activeGroup === i ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' } : { color: 'var(--color-text-muted)' }}>
                  {g.label}
                </button>
              ))}
            </div>
            <div className="p-3 grid grid-cols-8 gap-1">
              {EMOJI_GROUPS[activeGroup].emojis.map((e) => (
                <button key={e} onClick={() => { onChange(e); setOpen(false); }}
                  className="text-xl p-1.5 rounded-lg hover:scale-110 transition-transform hover:bg-white/5">
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Score slider ──────────────────────────────────────────────────────────────
function ScoreSlider({ value, onChange }) {
  const pct = (value / 10) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="admin-label mb-0">Proficiency Score</label>
        <div className="flex items-center gap-1">
          <span className="font-display font-bold text-lg" style={{ color: 'var(--color-accent)' }}>{value}</span>
          <span className="font-mono text-xs text-text-muted">/10</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range" min={1} max={10} step={1}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, var(--color-accent) ${pct}%, var(--color-border-bright) ${pct}%)`,
          }}
        />
        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-0.5">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <span key={n} className="font-mono text-[9px] text-text-muted">{n}</span>
          ))}
        </div>
      </div>
      <p className="font-mono text-[10px] text-text-muted">
        {value <= 3 ? 'Beginner' : value <= 5 ? 'Intermediate' : value <= 7 ? 'Advanced' : value <= 9 ? 'Expert' : 'Master'}
      </p>
    </div>
  );
}

// ── Skill form ────────────────────────────────────────────────────────────────
const EMPTY = { name: '', category: '', icon: '⚡', score: 7, description: '', display_order: 0 };

function SkillForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Skill Name</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. SOLIDWORKS, Photography…" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Category <span className="normal-case tracking-normal text-text-muted">(free text)</span></label>
          <input value={form.category} onChange={(e) => set('category', e.target.value)}
            placeholder="e.g. CAD Design, Engineering, Marketing…" className="admin-input" />
        </div>
      </div>

      <div>
        <label className="admin-label">Icon (emoji)</label>
        <EmojiPicker value={form.icon} onChange={(v) => set('icon', v)} />
      </div>

      <ScoreSlider value={form.score ?? 7} onChange={(v) => set('score', v)} />

      <div>
        <label className="admin-label">Description <span className="normal-case tracking-normal text-text-muted">(shown below the bar)</span></label>
        <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)}
          placeholder="Brief description of your level and experience with this skill…"
          rows={2} className="admin-input resize-none" />
      </div>

      <div>
        <label className="admin-label">Display Order</label>
        <input type="number" value={form.display_order}
          onChange={(e) => set('display_order', +e.target.value)} className="admin-input" />
      </div>

      <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border">
        <button onClick={onCancel} className="admin-btn-secondary">Cancel</button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name} className="admin-btn disabled:opacity-50">
          {saving ? 'Saving…' : <><Save size={15} /> Save Skill</>}
        </button>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export default function SkillsEditor({ addToast }) {
  const { skills, refetch } = usePortfolio();
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        const { error } = await supabase.from('skills').update(form).eq('id', editTarget.id);
        if (error) throw error;
        addToast('Skill updated!', 'success');
      } else {
        const { error } = await supabase.from('skills').insert(form);
        if (error) throw error;
        addToast('Skill added!', 'success');
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
    setDeleting(id);
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) addToast(error.message, 'error');
    else { addToast('Skill deleted.', 'success'); await refetch(); }
    setDeleting(null);
  };

  const categories = [...new Set(skills.map((s) => s.category || 'General'))];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
            <Code2 size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Skills</h2>
            <p className="font-body text-xs text-text-muted">{skills.length} skills · {categories.length} categories</p>
          </div>
        </div>
        <button onClick={() => { setEditTarget(null); setModalOpen(true); }} className="admin-btn">
          <Plus size={15} /> Add Skill
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
        <span style={{ color: 'var(--color-accent)' }}>💡</span>
        <p className="font-body text-xs text-text-secondary">
          The score (1–10) fills an animated progress bar on the public portfolio. Add a description to explain your expertise level.
        </p>
      </div>

      {/* Skills grouped by category */}
      {categories.map((cat) => {
        const catSkills = skills.filter((s) => (s.category || 'General') === cat)
          .sort((a, b) => (b.score ?? 5) - (a.score ?? 5));
        return (
          <div key={cat} className="flex flex-col gap-2">
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--color-accent)' }}>{cat}</p>
            <div className="flex flex-col gap-1.5">
              <AnimatePresence>
                {catSkills.map((skill) => (
                  <motion.div key={skill.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                    style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    {/* Mini bar preview */}
                    <span className="text-xl shrink-0">{skill.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-semibold text-sm text-text-primary">{skill.name}</span>
                        <span className="font-mono text-xs font-bold shrink-0 ml-2" style={{ color: 'var(--color-accent)' }}>
                          {skill.score ?? 5}/10
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border-bright)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${(skill.score ?? 5) * 10}%`,
                          background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))'
                        }} />
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => { setEditTarget(skill); setModalOpen(true); }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(skill.id)} disabled={deleting === skill.id}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-colors">
                        {deleting === skill.id
                          ? <motion.span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full block"
                              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {skills.length === 0 && (
        <div className="text-center py-12 text-text-muted font-body text-sm">
          No skills yet — add your first one!
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Skill' : 'Add Skill'} size="md">
        <SkillForm initial={editTarget || EMPTY} onSave={handleSave}
          onCancel={() => setModalOpen(false)} saving={saving} />
      </Modal>
    </div>
  );
}
