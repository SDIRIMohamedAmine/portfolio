import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Save, Award, Upload, X, ImageIcon,
  ExternalLink, Calendar, Hash, Link as LinkIcon,
} from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { useCertificates } from '../../../context/CertificatesContext';
import Modal from '../../ui/Modal';

const EMPTY = {
  title: '',
  issuer: '',
  date: '',
  credential_id: '',
  credential_url: '',
  badge_url: '',
  description: '',
  display_order: 0,
};

// ── Badge uploader sub-component ──────────────────────────────────────────────
function BadgeUploader({ value, onChange, addToast }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef(null);

  const uploadBadge = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5 MB.', 'error');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `certificates/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('assets')
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('assets').getPublicUrl(path);
      onChange(data.publicUrl);
      addToast('Badge uploaded!', 'success');
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-secondary))',
            border: '1px solid var(--color-border-bright)',
          }}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="badge preview"
                className="w-full h-full object-contain p-1"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors"
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <Award size={28} style={{ color: 'var(--color-text-muted)' }} />
          )}
          {uploading && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: 'color-mix(in srgb, var(--color-bg-primary) 70%, transparent)' }}
            >
              <motion.span
                className="w-5 h-5 border-2 border-t-transparent rounded-full"
                style={{ borderColor: 'var(--color-accent)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div className="flex-1 flex flex-col gap-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              uploadBadge(e.dataTransfer.files[0]);
            }}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
            style={{
              borderColor: dragOver ? 'var(--color-accent)' : 'var(--color-border-bright)',
              backgroundColor: dragOver
                ? 'color-mix(in srgb, var(--color-accent) 5%, transparent)'
                : 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-accent) 50%, transparent)'; }}
            onMouseLeave={(e) => { if (!dragOver) e.currentTarget.style.borderColor = 'var(--color-border-bright)'; }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => uploadBadge(e.target.files[0])}
              className="hidden"
            />
            <ImageIcon size={18} className="mx-auto mb-1 text-text-muted" />
            <p className="font-body text-xs text-text-secondary">
              <span style={{ color: 'var(--color-accent)' }} className="font-medium">
                Click to upload
              </span>{' '}
              or drag & drop
            </p>
            <p className="font-mono text-[10px] text-text-muted mt-0.5">PNG, SVG, JPG — max 5 MB</p>
          </div>

          {/* URL fallback */}
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste a badge image URL"
            className="admin-input text-xs"
          />
        </div>
      </div>
    </div>
  );
}

// ── Certificate form (used inside modal) ──────────────────────────────────────
function CertForm({ initial, onSave, onCancel, saving, addToast }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex flex-col gap-4">
      {/* Badge */}
      <div>
        <label className="admin-label">Badge Image</label>
        <BadgeUploader
          value={form.badge_url}
          onChange={(url) => set('badge_url', url)}
          addToast={addToast}
        />
      </div>

      {/* Title */}
      <div>
        <label className="admin-label">Certificate Title *</label>
        <input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Certified SOLIDWORKS Professional (CSWP)"
          className="admin-input"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Issuer */}
        <div>
          <label className="admin-label">Issuing Organization</label>
          <input
            value={form.issuer}
            onChange={(e) => set('issuer', e.target.value)}
            placeholder="e.g. Dassault Systèmes"
            className="admin-input"
          />
        </div>

        {/* Date */}
        <div>
          <label className="admin-label">Issue Date</label>
          <input
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            placeholder="e.g. June 2024"
            className="admin-input"
          />
        </div>

        {/* Credential ID */}
        <div>
          <label className="admin-label">Credential ID <span className="text-text-muted normal-case tracking-normal">(optional)</span></label>
          <input
            value={form.credential_id}
            onChange={(e) => set('credential_id', e.target.value)}
            placeholder="e.g. ABC-123456"
            className="admin-input"
          />
        </div>

        {/* Display order */}
        <div>
          <label className="admin-label">Display Order</label>
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => set('display_order', +e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      {/* Credential URL */}
      <div>
        <label className="admin-label">Credential URL <span className="text-text-muted normal-case tracking-normal">(link to verify)</span></label>
        <input
          type="url"
          value={form.credential_url}
          onChange={(e) => set('credential_url', e.target.value)}
          placeholder="https://www.credly.com/badges/..."
          className="admin-input"
        />
      </div>

      {/* Description */}
      <div>
        <label className="admin-label">Short Description <span className="text-text-muted normal-case tracking-normal">(optional)</span></label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What skills or knowledge does this certify?"
          rows={2}
          className="admin-input resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={onCancel} className="admin-btn-secondary">Cancel</button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.title}
          className="admin-btn disabled:opacity-50"
        >
          {saving ? 'Saving…' : <><Save size={15} /> Save Certificate</>}
        </button>
      </div>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────
export default function CertificatesEditor({ addToast }) {
  const { certificates, refetchCertificates } = useCertificates();
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);

  const openAdd  = () => { setEditTarget(null);    setModalOpen(true); };
  const openEdit = (c) => { setEditTarget(c);      setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        const { error } = await supabase.from('certificates').update(form).eq('id', editTarget.id);
        if (error) throw error;
        addToast('Certificate updated!', 'success');
      } else {
        const { error } = await supabase.from('certificates').insert(form);
        if (error) throw error;
        addToast('Certificate added!', 'success');
      }
      await refetchCertificates();
      closeModal();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    setDeleting(id);
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) addToast(error.message, 'error');
    else { addToast('Certificate deleted.', 'success'); await refetchCertificates(); }
    setDeleting(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
            }}
          >
            <Award size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Certificates</h2>
            <p className="font-body text-xs text-text-muted">
              {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} · shown on the public portfolio
            </p>
          </div>
        </div>
        <button onClick={openAdd} className="admin-btn">
          <Plus size={15} /> Add Certificate
        </button>
      </div>

      {/* Tip */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{
          background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
        }}
      >
        <span style={{ color: 'var(--color-accent)' }}>💡</span>
        <p className="font-body text-xs text-text-secondary">
          Upload the official badge image (from Credly, SOLIDWORKS, etc.) and paste the credential verification URL.
          The section auto-hides if no certificates are added.
        </p>
      </div>

      {/* Certificate list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="admin-card flex gap-4 hover:border-opacity-60 transition-all group"
              style={{ '--hover-border': 'var(--color-border-bright)' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-bright)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              {/* Badge thumbnail */}
              <div
                className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-secondary))',
                  border: '1px solid var(--color-border)',
                }}
              >
                {cert.badge_url ? (
                  <img
                    src={cert.badge_url}
                    alt={cert.title}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Award size={24} style={{ color: 'var(--color-accent)', opacity: 0.5 }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-sm text-text-primary truncate flex-1">
                    {cert.title}
                  </h3>
                </div>
                {cert.issuer && (
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-accent)', opacity: 0.85 }}>
                    {cert.issuer}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {cert.date && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                      <Calendar size={10} /> {cert.date}
                    </span>
                  )}
                  {cert.credential_id && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                      <Hash size={10} /> {cert.credential_id}
                    </span>
                  )}
                  {cert.credential_url && cert.credential_url !== '#' && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-[10px] hover:underline"
                      style={{ color: 'var(--color-accent)', opacity: 0.75 }}
                    >
                      <ExternalLink size={10} /> Verify
                    </a>
                  )}
                </div>
                {cert.description && (
                  <p className="font-body text-[11px] text-text-muted mt-1 line-clamp-1">
                    {cert.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cert)}
                  className="p-2 rounded-lg text-text-muted transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  disabled={deleting === cert.id}
                  className="p-2 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
                >
                  {deleting === cert.id ? (
                    <motion.span
                      className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full block"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {certificates.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)',
              }}
            >
              <Award size={28} style={{ color: 'var(--color-accent)', opacity: 0.5 }} />
            </div>
            <p className="font-body text-sm text-text-muted">
              No certificates yet — add your first one!
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editTarget ? 'Edit Certificate' : 'Add Certificate'}
        size="lg"
      >
        <CertForm
          initial={editTarget || EMPTY}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
          addToast={addToast}
        />
      </Modal>
    </div>
  );
}
