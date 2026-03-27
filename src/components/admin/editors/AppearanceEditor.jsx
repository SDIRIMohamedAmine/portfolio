import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Palette, Check } from 'lucide-react';
import { supabase } from '../../../supabase/client';
import { useAppearance, THEME_PRESETS, DEFAULT_VARS } from '../../../context/AppearanceContext';

const CUSTOM_FIELDS = [
  { key: 'bg_primary',     var: '--color-bg-primary',    label: 'Background',         hint: 'Darkest page background' },
  { key: 'bg_card',        var: '--color-bg-card',        label: 'Card Background',    hint: 'Cards & modals' },
  { key: 'accent',         var: '--color-accent',         label: 'Accent Color',       hint: 'Buttons, highlights, underlines' },
  { key: 'accent_bright',  var: '--color-accent-bright',  label: 'Accent Hover',       hint: 'Lighter accent for hover states' },
  { key: 'text_primary',   var: '--color-text-primary',   label: 'Text — Primary',     hint: 'Headings & main text' },
  { key: 'text_secondary', var: '--color-text-secondary', label: 'Text — Secondary',   hint: 'Body copy & descriptions' },
  { key: 'border',         var: '--color-border',         label: 'Border Color',       hint: 'Card borders & dividers' },
];

// Preview swatch for a preset
function PresetCard({ preset, selected, onSelect }) {
  const v = preset.vars;
  return (
    <motion.button
      onClick={onSelect}
      className="relative flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left"
      style={{
        backgroundColor: v['--color-bg-card'],
        borderColor: selected ? v['--color-accent'] : v['--color-border'],
        boxShadow: selected ? `0 0 0 2px ${v['--color-accent']}` : 'none',
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: v['--color-accent'] }}>
          <Check size={11} style={{ color: v['--color-bg-primary'] }} />
        </div>
      )}

      {/* Mini site preview */}
      <div className="w-full rounded-xl overflow-hidden" style={{ backgroundColor: v['--color-bg-primary'], height: '80px' }}>
        {/* Fake navbar */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${v['--color-border']}` }}>
          <div className="w-12 h-2 rounded-full" style={{ backgroundColor: v['--color-accent'] }} />
          <div className="flex gap-1.5">
            {[1,2,3].map(i => <div key={i} className="w-6 h-1.5 rounded-full" style={{ backgroundColor: v['--color-border-bright'] }} />)}
          </div>
        </div>
        {/* Fake content */}
        <div className="px-3 pt-2 flex flex-col gap-1.5">
          <div className="w-24 h-2.5 rounded-full" style={{ backgroundColor: v['--color-text-primary'], opacity: 0.7 }} />
          <div className="w-32 h-2 rounded-full" style={{ backgroundColor: v['--color-text-secondary'], opacity: 0.5 }} />
          <div className="flex gap-1.5 mt-1">
            <div className="h-4 px-2 rounded-full flex items-center" style={{ backgroundColor: v['--color-accent'] }}>
              <div className="w-8 h-1 rounded" style={{ backgroundColor: v['--color-bg-primary'] }} />
            </div>
            <div className="h-4 px-2 rounded-full border" style={{ borderColor: v['--color-border-bright'] }}>
              <div className="w-6 h-1 mt-1.5 rounded" style={{ backgroundColor: v['--color-text-secondary'] }} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="font-display font-semibold text-sm" style={{ color: v['--color-text-primary'] }}>
          {preset.emoji} {preset.label}
        </p>
      </div>
    </motion.button>
  );
}

export default function AppearanceEditor({ addToast }) {
  const { appearance, refetchAppearance } = useAppearance();
  const [selectedPreset, setSelectedPreset] = useState(appearance?.preset_id || 'forest-night');
  const [customColors, setCustomColors] = useState({
    bg_primary:     '#04100a',
    bg_card:        '#071510',
    accent:         '#e8b04b',
    accent_bright:  '#f5c96a',
    text_primary:   '#eef5f0',
    text_secondary: '#8aab94',
    border:         '#0f2e1c',
  });
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (appearance) {
      setSelectedPreset(appearance.preset_id || 'forest-night');
      if (appearance.preset_id === 'custom') {
        setCustomColors({
          bg_primary:     appearance.bg_primary     || customColors.bg_primary,
          bg_card:        appearance.bg_card        || customColors.bg_card,
          accent:         appearance.accent         || customColors.accent,
          accent_bright:  appearance.accent_bright  || customColors.accent_bright,
          text_primary:   appearance.text_primary   || customColors.text_primary,
          text_secondary: appearance.text_secondary || customColors.text_secondary,
          border:         appearance.border         || customColors.border,
        });
      }
    }
  }, [appearance]);

  const applyPreviewVars = (presetId) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const root = document.documentElement;
      Object.entries(preset.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    }
  };

  const applyCustomPreview = (colors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg-primary',    colors.bg_primary);
    root.style.setProperty('--color-bg-secondary',  adjustBrightness(colors.bg_primary, 15));
    root.style.setProperty('--color-bg-tertiary',   adjustBrightness(colors.bg_primary, 25));
    root.style.setProperty('--color-bg-card',       colors.bg_card);
    root.style.setProperty('--color-accent',        colors.accent);
    root.style.setProperty('--color-accent-bright', colors.accent_bright);
    root.style.setProperty('--color-accent-dim',    adjustBrightness(colors.accent, -20));
    root.style.setProperty('--color-text-primary',  colors.text_primary);
    root.style.setProperty('--color-text-secondary',colors.text_secondary);
    root.style.setProperty('--color-text-muted',    adjustBrightness(colors.text_secondary, -30));
    root.style.setProperty('--color-border',        colors.border);
    root.style.setProperty('--color-border-bright', adjustBrightness(colors.border, 20));
  };

  // Simple brightness adjustment for hex colors
  const adjustBrightness = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  };

  const handlePresetSelect = (id) => {
    setSelectedPreset(id);
    if (id !== 'custom') {
      applyPreviewVars(id);
      setPreviewing(true);
    }
  };

  const handleCustomChange = (key, val) => {
    const updated = { ...customColors, [key]: val };
    setCustomColors(updated);
    if (selectedPreset === 'custom') {
      applyCustomPreview(updated);
      setPreviewing(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        id: 1,
        preset_id: selectedPreset,
        ...(selectedPreset === 'custom' ? customColors : {}),
      };
      const { error } = await supabase
        .from('site_appearance')
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      await refetchAppearance();
      setPreviewing(false);
      addToast('Theme saved!', 'success');
    } catch (err) {
      addToast(err.message || 'Save failed.', 'error');
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
            <Palette size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Appearance</h2>
            <p className="font-body text-xs text-text-muted">Color palette & theme</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {previewing && (
            <span className="font-mono text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
              👁 Previewing
            </span>
          )}
          <motion.button onClick={handleSave} disabled={saving} className="admin-btn"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {saving ? (
              <><motion.span className="w-4 h-4 border-2 border-bg-primary/40 border-t-bg-primary rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> Saving…</>
            ) : (
              <><Save size={15} /> Save Theme</>
            )}
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
        <span style={{ color: 'var(--color-accent)' }}>💡</span>
        <p className="font-body text-xs text-text-secondary">
          Click a preset to <strong className="text-text-primary">preview</strong> it live on this page, then click Save Theme to apply it to the public site.
        </p>
      </div>

      {/* Preset grid */}
      <div>
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Choose a Preset</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEME_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              selected={selectedPreset === preset.id}
              onSelect={() => handlePresetSelect(preset.id)}
            />
          ))}

          {/* Custom option */}
          <motion.button
            onClick={() => { setSelectedPreset('custom'); applyCustomPreview(customColors); setPreviewing(true); }}
            className="flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: selectedPreset === 'custom' ? 'var(--color-accent)' : 'var(--color-border)',
              boxShadow: selectedPreset === 'custom' ? '0 0 0 2px var(--color-accent)' : 'none',
            }}
            whileHover={{ scale: 1.02, y: -2 }}>
            {selectedPreset === 'custom' && (
              <div className="self-end w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent)' }}>
                <Check size={11} style={{ color: 'var(--color-bg-primary)' }} />
              </div>
            )}
            <div className="w-full h-[80px] rounded-xl flex items-center justify-center"
              style={{ backgroundColor: customColors.bg_primary, border: `2px dashed ${customColors.border}` }}>
              <span className="text-2xl">🎨</span>
            </div>
            <p className="font-display font-semibold text-sm text-text-primary">✏️ Custom</p>
          </motion.button>
        </div>
      </div>

      {/* Custom color pickers */}
      {selectedPreset === 'custom' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-card flex flex-col gap-4">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Custom Colors</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOM_FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={customColors[key] || '#000000'}
                    onChange={(e) => handleCustomChange(key, e.target.value)}
                    className="w-12 h-12 rounded-xl border cursor-pointer"
                    style={{ borderColor: 'var(--color-border-bright)', backgroundColor: 'var(--color-bg-secondary)' }}
                    title={label}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-sm text-text-primary">{label}</p>
                  <p className="font-mono text-xs text-text-muted">{customColors[key]} · {hint}</p>
                </div>
                <input
                  type="text"
                  value={customColors[key] || ''}
                  onChange={(e) => handleCustomChange(key, e.target.value)}
                  placeholder="#000000"
                  className="admin-input w-28 text-xs font-mono"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
