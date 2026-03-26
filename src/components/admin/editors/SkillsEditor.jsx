import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, Code2, GripVertical } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { usePortfolio } from '../../../context/PortfolioContext';
import Modal from '../../ui/Modal';

const EMPTY = { name: '', category: 'Frontend', icon: '⚡', display_order: 0 };
const CATEGORIES = ['Frontend', 'Backend', 'Tools'];

function SkillForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Skill Name</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)}
            placeholder="React" className="admin-input" />
        </div>
        <div>
          <label className="admin-label">Icon (emoji)</label>
          <input value={form.icon} onChange={(e) => set('icon', e.target.value)}
            placeholder="⚛️" className="admin-input text-xl" maxLength={4} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Category</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}
            className="admin-input">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="admin-label">Display Order</label>
          <input type="number" value={form.display_order} onChange={(e) => set('display_order', +e.target.value)}
            className="admin-input" />
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-2">
        <button onClick={onCancel} className="admin-btn-secondary">Cancel</button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name} className="admin-btn disabled:opacity-50">
          {saving ? 'Saving…' : <><Save size={15} /> Save Skill</>}
        </button>
      </div>
    </div>
  );
}

export default function SkillsEditor({ addToast }) {
  const { skills, refetch } = usePortfolio();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add new
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (skill) => { setEditTarget(skill); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

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
      closeModal();
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

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
            <Code2 size={18} className="text-accent-gold" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Skills</h2>
            <p className="font-body text-xs text-text-muted">{skills.length} skills across {CATEGORIES.length} categories</p>
          </div>
        </div>
        <button onClick={openAdd} className="admin-btn">
          <Plus size={15} /> Add Skill
        </button>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat} className="flex flex-col gap-3">
          <p className="font-mono text-xs text-accent-gold tracking-widest uppercase">{cat}</p>
          {grouped[cat].length === 0 ? (
            <p className="font-body text-sm text-text-muted italic px-2">No skills yet — add one above.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {grouped[cat].map((skill) => (
                  <motion.div key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="group flex items-center gap-2 pl-3 pr-2 py-2 bg-bg-card border border-border rounded-full hover:border-accent-gold/40 transition-all">
                    <span className="text-base leading-none">{skill.icon}</span>
                    <span className="font-body text-sm text-text-secondary">{skill.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      <button onClick={() => openEdit(skill)}
                        className="p-1 rounded-full hover:bg-accent-gold/20 text-text-muted hover:text-accent-gold transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(skill.id)} disabled={deleting === skill.id}
                        className="p-1 rounded-full hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors">
                        {deleting === skill.id
                          ? <motion.span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full block"
                              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          : <Trash2 size={12} />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      ))}

      <Modal open={modalOpen} onClose={closeModal} title={editTarget ? 'Edit Skill' : 'Add New Skill'}>
        <SkillForm
          initial={editTarget || EMPTY}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
        />
      </Modal>
    </div>
  );
}
