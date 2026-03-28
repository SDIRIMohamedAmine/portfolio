import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, FolderOpen, Star, ExternalLink, Upload, X, ImageIcon, Link, ChevronRight } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { usePortfolio } from '../../../context/PortfolioContext';
import Modal from '../../ui/Modal';

const GRADIENTS = [
  { label: 'Violet → Blue', value: 'from-violet-600/20 to-blue-600/10' },
  { label: 'Amber → Orange', value: 'from-amber-600/20 to-orange-600/10' },
  { label: 'Teal → Cyan', value: 'from-teal-600/20 to-cyan-600/10' },
  { label: 'Rose → Pink', value: 'from-rose-600/20 to-pink-600/10' },
  { label: 'Green → Emerald', value: 'from-green-600/20 to-emerald-600/10' },
  { label: 'Blue → Indigo', value: 'from-blue-600/20 to-indigo-600/10' },
];

const EMPTY_PROJECT = {
  title: '', description: '', tech: '',
  image_url: '', live_url: '', github_url: '',
  featured: false, gradient: GRADIENTS[0].value, display_order: 0,
  // detail page fields
  overview: '', challenge: '', solution: '',
  client: '', date: '',
  media: [], // array of { url, type: 'image'|'video', caption }
};

// ── Media manager sub-component ──────────────────────────────────────────────
function MediaManager({ media = [], onChange, addToast }) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const isVideo = /\.(mp4|webm|mov|ogg)$/i.test(trimmed);
    onChange([...media, { url: trimmed, type: isVideo ? 'video' : 'image', caption: '' }]);
    setUrlInput('');
  };

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    const newItems = [];
    setUploading(true);
    let errCount = 0;
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) { errCount++; continue; }
      if (file.size > 50 * 1024 * 1024) { errCount++; continue; }
      try {
        const ext = file.name.split('.').pop();
        const path = `projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('assets').upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('assets').getPublicUrl(path);
        newItems.push({ url: data.publicUrl, type: isVideo ? 'video' : 'image', caption: '' });
      } catch { errCount++; }
    }
    onChange([...media, ...newItems]);
    if (newItems.length > 0) addToast(`${newItems.length} file${newItems.length > 1 ? 's' : ''} uploaded!`, 'success');
    if (errCount > 0) addToast(`${errCount} file${errCount > 1 ? 's' : ''} failed or were skipped.`, 'error');
    setUploading(false);
  };
  const uploadFile = (file) => uploadFiles([file]);

  const removeItem = (idx) => onChange(media.filter((_, i) => i !== idx));
  const updateCaption = (idx, val) => onChange(media.map((m, i) => i === idx ? { ...m, caption: val } : m));

  return (
    <div className="flex flex-col gap-3">
      {/* Upload row */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="admin-btn-secondary flex-shrink-0 text-xs">
          {uploading
            ? <motion.span className="w-3.5 h-3.5 border border-accent-gold/40 border-t-accent-gold rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            : <Upload size={13} />}
          {uploading ? 'Uploading…' : 'Upload files'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={(e) => uploadFiles(e.target.files)} className="hidden" />
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addUrl()}
          placeholder="Or paste an image / video URL and press Enter"
          className="admin-input text-xs flex-1"
        />
        <button type="button" onClick={addUrl} className="admin-btn-secondary flex-shrink-0 text-xs">
          <Link size={13} /> Add
        </button>
      </div>

      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {media.map((item, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-border bg-bg-secondary aspect-video">
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.url} alt={item.caption || `media ${idx + 1}`} className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&q=40'; }} />
              )}
              {/* overlay */}
              <div className="absolute inset-0 bg-bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <button onClick={() => removeItem(idx)}
                  className="self-end w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-400">
                  <X size={10} />
                </button>
                <input
                  value={item.caption || ''}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                  placeholder="Caption…"
                  className="w-full bg-bg-primary/80 border border-border rounded px-2 py-1 font-body text-[10px] text-text-secondary placeholder-text-muted focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {item.type === 'video' && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-bg-primary/80 font-mono text-[9px] text-accent-teal rounded">VIDEO</span>
              )}
            </div>
          ))}
        </div>
      )}

      {media.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-6 text-center">
          <ImageIcon size={20} className="mx-auto mb-2 text-text-muted" />
          <p className="font-body text-xs text-text-muted">No media yet — upload files or paste URLs above</p>
        </div>
      )}
    </div>
  );
}

// ── Project form ──────────────────────────────────────────────────────────────
function ProjectForm({ initial, onSave, onCancel, saving, addToast }) {
  const techString = Array.isArray(initial.tech) ? initial.tech.join(', ') : initial.tech || '';
  const [form, setForm] = useState({ ...EMPTY_PROJECT, ...initial, tech: techString });
  const [tab, setTab] = useState('basic');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const coverInputRef = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadCover = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please select an image file.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('Image must be under 5MB.', 'error'); return; }
    setUploadingCover(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `projects/covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('assets').upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('assets').getPublicUrl(path);
      set('image_url', data.publicUrl);
      addToast('Cover uploaded!', 'success');
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = () => {
    const techArray = form.tech.split(',').map((t) => t.trim()).filter(Boolean);
    onSave({ ...form, tech: techArray });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'detail', label: 'Detail Page' },
    { id: 'media', label: `Media ${form.media?.length ? `(${form.media.length})` : ''}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-bg-secondary rounded-xl p-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg font-mono text-xs transition-all ${tab === t.id ? 'bg-accent-gold text-bg-primary font-semibold' : 'text-text-muted hover:text-text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {tab === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="admin-label">Project Title</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="My Awesome Project" className="admin-input" />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Short Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="What does this project do? What problem does it solve?" rows={3} className="admin-input resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Tech Stack <span className="text-text-muted normal-case tracking-normal">(comma-separated)</span></label>
            <input value={form.tech} onChange={(e) => set('tech', e.target.value)}
              placeholder="React, TypeScript, Node.js" className="admin-input" />
          </div>
          <div className="md:col-span-2">
            <label className="admin-label">Cover Image</label>
            <div className="flex gap-3 items-start">
              {form.image_url && (
                <div className="relative shrink-0">
                  <img src={form.image_url} alt="cover preview"
                    className="w-24 h-16 object-cover rounded-xl border border-border"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                  <button onClick={() => set('image_url', '')}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400">
                    <X size={9} />
                  </button>
                </div>
              )}
              <div className="flex-1 flex flex-col gap-2">
                <div
                  onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
                  onDragLeave={() => setCoverDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setCoverDragOver(false); uploadCover(e.dataTransfer.files[0]); }}
                  onClick={() => coverInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200
                    ${coverDragOver ? 'border-accent-gold bg-accent-gold/5' : 'border-border-bright hover:border-accent-gold/50 hover:bg-bg-secondary'}`}>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={(e) => uploadCover(e.target.files[0])} className="hidden" />
                  {uploadingCover ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.span className="w-3.5 h-3.5 border border-accent-gold/40 border-t-accent-gold rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                      <span className="font-body text-xs text-text-muted">Uploading…</span>
                    </div>
                  ) : (
                    <p className="font-body text-xs text-text-secondary">
                      <span className="text-accent-gold font-medium">Click to upload</span> or drag & drop
                    </p>
                  )}
                </div>
                <input
                  type="url"
                  value={form.image_url || ''}
                  onChange={(e) => set('image_url', e.target.value)}
                  placeholder="Or paste an image URL"
                  className="admin-input text-xs"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="admin-label">Live URL</label>
            <input value={form.live_url} onChange={(e) => set('live_url', e.target.value)}
              placeholder="https://myproject.com" className="admin-input" />
          </div>
          <div>
            <label className="admin-label">GitHub URL</label>
            <input value={form.github_url} onChange={(e) => set('github_url', e.target.value)}
              placeholder="https://github.com/..." className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Card Gradient</label>
            <select value={form.gradient} onChange={(e) => set('gradient', e.target.value)} className="admin-input">
              {GRADIENTS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-label">Display Order</label>
            <input type="number" value={form.display_order} onChange={(e) => set('display_order', +e.target.value)}
              className="admin-input" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set('featured', !form.featured)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.featured ? 'bg-accent-gold' : 'bg-border-bright'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${form.featured ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <label className="font-body text-sm text-text-secondary cursor-pointer" onClick={() => set('featured', !form.featured)}>
              Featured project
            </label>
          </div>
        </div>
      )}

      {/* Detail Page fields */}
      {tab === 'detail' && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-text-muted">These fields appear on the project detail page. Leave blank to hide.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Client / Company</label>
              <input value={form.client || ''} onChange={(e) => set('client', e.target.value)}
                placeholder="Acme Corp" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Date</label>
              <input value={form.date || ''} onChange={(e) => set('date', e.target.value)}
                placeholder="November 2024" className="admin-input" />
            </div>
          </div>
          <div>
            <label className="admin-label">Project Overview</label>
            <textarea value={form.overview || ''} onChange={(e) => set('overview', e.target.value)}
              placeholder="A thorough description of the project, its goals and context..." rows={4} className="admin-input resize-none" />
          </div>
          <div>
            <label className="admin-label">The Challenge</label>
            <textarea value={form.challenge || ''} onChange={(e) => set('challenge', e.target.value)}
              placeholder="What was the main problem or constraint you faced?" rows={3} className="admin-input resize-none" />
          </div>
          <div>
            <label className="admin-label">The Solution</label>
            <textarea value={form.solution || ''} onChange={(e) => set('solution', e.target.value)}
              placeholder="How did you solve it? What approach did you take?" rows={3} className="admin-input resize-none" />
          </div>
        </div>
      )}

      {/* Media */}
      {tab === 'media' && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-text-muted">Images and videos shown in the project detail gallery.</p>
          <MediaManager
            media={form.media || []}
            onChange={(m) => set('media', m)}
            addToast={addToast}
          />
        </div>
      )}

      <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-border">
        <button onClick={onCancel} className="admin-btn-secondary">Cancel</button>
        <button onClick={handleSave} disabled={saving || !form.title} className="admin-btn disabled:opacity-50">
          {saving ? 'Saving…' : <><Save size={15} /> Save Project</>}
        </button>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export default function ProjectsEditor({ addToast }) {
  const { projects, refetch } = usePortfolio();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (p) => { setEditTarget(p); setModalOpen(true); };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        const { error } = await supabase.from('projects').update(form).eq('id', editTarget.id);
        if (error) throw error;
        addToast('Project updated!', 'success');
      } else {
        const { error } = await supabase.from('projects').insert(form);
        if (error) throw error;
        addToast('Project added!', 'success');
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
    if (!window.confirm('Delete this project?')) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) addToast(error.message, 'error');
      else { addToast('Project deleted.', 'success'); await refetch(); }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
            <FolderOpen size={18} className="text-accent-gold" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Projects</h2>
            <p className="font-body text-xs text-text-muted">{projects.length} project{projects.length !== 1 ? 's' : ''} · {projects.filter((p) => p.featured).length} featured</p>
          </div>
        </div>
        <button onClick={openAdd} className="admin-btn">
          <Plus size={15} /> Add Project
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {projects.map((project) => {
            const techArr = Array.isArray(project.tech) ? project.tech : (project.tech || '').split(',').map(t => t.trim()).filter(Boolean);
            const mediaCount = Array.isArray(project.media) ? project.media.length : 0;
            return (
              <motion.div key={project.id}
                layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="admin-card flex gap-4 hover:border-border-bright transition-all group">
                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-bg-secondary">
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=60'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-sm text-text-primary truncate">{project.title}</h3>
                    {project.featured && (
                      <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-accent-gold/15 text-accent-gold font-mono text-[10px] rounded-full">
                        <Star size={10} fill="currentColor" /> FEATURED
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-text-muted mt-0.5 line-clamp-1">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {techArr.slice(0, 4).map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-bg-secondary border border-border font-mono text-[10px] text-text-muted rounded">{t}</span>
                    ))}
                    {techArr.length > 4 && <span className="px-2 py-0.5 font-mono text-[10px] text-text-muted">+{techArr.length - 4}</span>}
                    {mediaCount > 0 && (
                      <span className="px-2 py-0.5 bg-accent-teal/10 border border-accent-teal/20 font-mono text-[10px] text-accent-teal rounded">
                        {mediaCount} media
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center shrink-0">
                  <div className="flex gap-2">
                    {project.live_url && project.live_url !== '#' && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-bg-secondary border border-border text-text-muted hover:text-accent-gold hover:border-accent-gold/40 transition-all">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => openEdit(project)}
                      className="p-2 rounded-lg bg-bg-secondary border border-border text-text-muted hover:text-accent-gold hover:border-accent-gold/40 transition-all">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(project.id)} disabled={deleting === project.id}
                      className="p-2 rounded-lg bg-bg-secondary border border-border text-text-muted hover:text-red-400 hover:border-red-400/40 transition-all">
                      {deleting === project.id
                        ? <motion.span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full block"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {projects.length === 0 && (
          <div className="text-center py-12 text-text-muted font-body text-sm">No projects yet — add your first one!</div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Project' : 'Add New Project'} size="lg">
        <ProjectForm
          initial={editTarget || EMPTY_PROJECT}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          saving={saving}
          addToast={addToast}
        />
      </Modal>
    </div>
  );
}