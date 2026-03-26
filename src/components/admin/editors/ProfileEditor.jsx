import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Upload, X, ImageIcon } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { usePortfolio } from '../../../context/PortfolioContext';

const FIELDS = [
  { key: 'name', label: 'Full Name', placeholder: 'Alex Rivera', type: 'text', span: 2 },
  { key: 'first_name', label: 'First Name', placeholder: 'Alex', type: 'text' },
  { key: 'last_name', label: 'Last Name', placeholder: 'Rivera', type: 'text' },
  { key: 'title', label: 'Job Title', placeholder: 'Full Stack Developer', type: 'text' },
  { key: 'tagline', label: 'Tagline / Subtitle', placeholder: '& UI Engineer', type: 'text' },
  { key: 'email', label: 'Contact Email', placeholder: 'hello@yoursite.dev', type: 'email' },
  { key: 'location', label: 'Location', placeholder: 'San Francisco, CA', type: 'text' },
  { key: 'resume_url', label: 'Resume URL', placeholder: 'https://...', type: 'url' },
  { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/...', type: 'url' },
  { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...', type: 'url' },
  { key: 'twitter_url', label: 'Twitter/X URL', placeholder: 'https://twitter.com/...', type: 'url' },
  { key: 'bio', label: 'Short Bio', placeholder: 'A brief intro shown in the hero & about section...', type: 'textarea', span: 2, rows: 3 },
  { key: 'bio_extended', label: 'Extended Bio', placeholder: 'A longer description for the About section...', type: 'textarea', span: 2, rows: 4 },
];

export default function ProfileEditor({ addToast }) {
  const { info, refetch } = usePortfolio();
  const [form, setForm] = useState(info);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { setForm(info); }, [info]);

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const uploadAvatar = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB.', 'error');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatar/profile.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(path);
      // Bust cache by appending timestamp
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setForm((f) => ({ ...f, avatar_url: url }));
      addToast('Photo uploaded! Save changes to apply.', 'success');
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => uploadAvatar(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadAvatar(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('portfolio_info')
        .update({ ...form, id: 1 }).eq('id', form.id);
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
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
            <User size={18} className="text-accent-gold" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Profile</h2>
            <p className="font-body text-xs text-text-muted">Your personal info, bio & social links</p>
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
        {/* Preview */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full border-2 border-border-bright bg-bg-secondary overflow-hidden flex items-center justify-center">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-extrabold text-3xl text-accent-gold/30">
                {form.first_name?.[0]}{form.last_name?.[0]}
              </span>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-bg-primary/70 flex items-center justify-center">
              <motion.span className="w-6 h-6 border-2 border-accent-gold/40 border-t-accent-gold rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            </div>
          )}
          {form.avatar_url && !uploading && (
            <button
              onClick={() => setForm((f) => ({ ...f, avatar_url: '' }))}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors">
              <X size={10} />
            </button>
          )}
        </div>

        {/* Drop zone */}
        <div className="flex-1 w-full">
          <p className="admin-label mb-2">Profile Photo</p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200
              ${dragOver ? 'border-accent-gold bg-accent-gold/5' : 'border-border-bright hover:border-accent-gold/50 hover:bg-bg-secondary'}`}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
            <ImageIcon size={20} className="mx-auto mb-2 text-text-muted" />
            <p className="font-body text-sm text-text-secondary">
              <span className="text-accent-gold font-medium">Click to upload</span> or drag & drop
            </p>
            <p className="font-mono text-xs text-text-muted mt-1">PNG, JPG, WEBP — max 5MB</p>
          </div>

          {/* Or paste URL */}
          <div className="mt-3">
            <label className="admin-label">Or paste an image URL</label>
            <input
              type="url"
              value={form.avatar_url || ''}
              onChange={(e) => handleChange('avatar_url', e.target.value)}
              placeholder="https://..."
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map(({ key, label, placeholder, type, span, rows }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={span === 2 ? 'md:col-span-2' : ''}
          >
            <label className="admin-label">{label}</label>
            {type === 'textarea' ? (
              <textarea
                value={form[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                rows={rows || 3}
                className="admin-input resize-none"
              />
            ) : (
              <input
                type={type}
                value={form[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className="admin-input"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
