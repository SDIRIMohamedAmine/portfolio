import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';

// ── Preset themes ─────────────────────────────────────────────────────────────
export const THEME_PRESETS = [
  {
    id: 'forest-night',
    label: 'Forest Night',
    emoji: '🌲',
    vars: {
      '--color-bg-primary':   '#04100a',
      '--color-bg-secondary': '#071a0e',
      '--color-bg-tertiary':  '#0a2216',
      '--color-bg-card':      '#071510',
      '--color-accent':       '#e8b04b',
      '--color-accent-dim':   '#b8882e',
      '--color-accent-bright':'#f5c96a',
      '--color-text-primary': '#eef5f0',
      '--color-text-secondary':'#8aab94',
      '--color-text-muted':   '#3d6650',
      '--color-border':       '#0f2e1c',
      '--color-border-bright':'#1a4a2e',
    },
  },
  {
    id: 'deep-navy',
    label: 'Deep Navy',
    emoji: '🌌',
    vars: {
      '--color-bg-primary':   '#07070e',
      '--color-bg-secondary': '#0e0e1a',
      '--color-bg-tertiary':  '#14141f',
      '--color-bg-card':      '#0f0f1c',
      '--color-accent':       '#e8b04b',
      '--color-accent-dim':   '#b8882e',
      '--color-accent-bright':'#f5c96a',
      '--color-text-primary': '#f0eff8',
      '--color-text-secondary':'#a09db8',
      '--color-text-muted':   '#5c5a72',
      '--color-border':       '#1e1d2e',
      '--color-border-bright':'#2e2c45',
    },
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    emoji: '🪨',
    vars: {
      '--color-bg-primary':   '#0a0a0a',
      '--color-bg-secondary': '#111111',
      '--color-bg-tertiary':  '#181818',
      '--color-bg-card':      '#0f0f0f',
      '--color-accent':       '#e8b04b',
      '--color-accent-dim':   '#b8882e',
      '--color-accent-bright':'#f5c96a',
      '--color-text-primary': '#f5f5f5',
      '--color-text-secondary':'#999999',
      '--color-text-muted':   '#555555',
      '--color-border':       '#1f1f1f',
      '--color-border-bright':'#2e2e2e',
    },
  },
  {
    id: 'deep-purple',
    label: 'Deep Purple',
    emoji: '🔮',
    vars: {
      '--color-bg-primary':   '#0d0812',
      '--color-bg-secondary': '#12091a',
      '--color-bg-tertiary':  '#180d22',
      '--color-bg-card':      '#100c18',
      '--color-accent':       '#c084fc',
      '--color-accent-dim':   '#9a3fc0',
      '--color-accent-bright':'#d8a8ff',
      '--color-text-primary': '#f0eef8',
      '--color-text-secondary':'#a89dc0',
      '--color-text-muted':   '#5a4e72',
      '--color-border':       '#1e1535',
      '--color-border-bright':'#2d2050',
    },
  },
  {
    id: 'midnight-teal',
    label: 'Midnight Teal',
    emoji: '🌊',
    vars: {
      '--color-bg-primary':   '#040f10',
      '--color-bg-secondary': '#071a1c',
      '--color-bg-tertiary':  '#0a2224',
      '--color-bg-card':      '#071416',
      '--color-accent':       '#2dd4bf',
      '--color-accent-dim':   '#14a090',
      '--color-accent-bright':'#5eead4',
      '--color-text-primary': '#eef5f5',
      '--color-text-secondary':'#8aaeb0',
      '--color-text-muted':   '#3d6268',
      '--color-border':       '#0f3032',
      '--color-border-bright':'#1a4a4e',
    },
  },
  {
    id: 'midnight-rose',
    label: 'Midnight Rose',
    emoji: '🌹',
    vars: {
      '--color-bg-primary':   '#100609',
      '--color-bg-secondary': '#180a10',
      '--color-bg-tertiary':  '#200e15',
      '--color-bg-card':      '#150810',
      '--color-accent':       '#f472b6',
      '--color-accent-dim':   '#c0406e',
      '--color-accent-bright':'#f9a8d4',
      '--color-text-primary': '#f8eef2',
      '--color-text-secondary':'#c099a8',
      '--color-text-muted':   '#6e4458',
      '--color-border':       '#2e1020',
      '--color-border-bright':'#4a1a32',
    },
  },
];

export const DEFAULT_VARS = THEME_PRESETS[0].vars; // Forest Night as default

// ── Context ───────────────────────────────────────────────────────────────────
const AppearanceContext = createContext(null);

function applyVars(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // Also update body background directly so there's no flash
  root.style.setProperty('background-color', vars['--color-bg-primary']);
  document.body.style.backgroundColor = vars['--color-bg-primary'];
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAppearance = useCallback(async () => {
    try {
      const { data } = await supabase.from('site_appearance').select('*').eq('id', 1).single();
      if (data) {
        setAppearance(data);
        const preset = THEME_PRESETS.find(p => p.id === data.preset_id);
        const vars = preset ? preset.vars : {
          ...DEFAULT_VARS,
          '--color-bg-primary':    data.bg_primary    || DEFAULT_VARS['--color-bg-primary'],
          '--color-bg-secondary':  data.bg_secondary  || DEFAULT_VARS['--color-bg-secondary'],
          '--color-bg-card':       data.bg_card       || DEFAULT_VARS['--color-bg-card'],
          '--color-accent':        data.accent        || DEFAULT_VARS['--color-accent'],
          '--color-accent-bright': data.accent_bright || DEFAULT_VARS['--color-accent-bright'],
          '--color-text-primary':  data.text_primary  || DEFAULT_VARS['--color-text-primary'],
          '--color-text-secondary':data.text_secondary|| DEFAULT_VARS['--color-text-secondary'],
          '--color-text-muted':    data.text_muted    || DEFAULT_VARS['--color-text-muted'],
          '--color-border':        data.border        || DEFAULT_VARS['--color-border'],
          '--color-border-bright': data.border_bright || DEFAULT_VARS['--color-border-bright'],
          '--color-bg-tertiary':   data.bg_tertiary   || DEFAULT_VARS['--color-bg-tertiary'],
          '--color-accent-dim':    data.accent_dim    || DEFAULT_VARS['--color-accent-dim'],
        };
        applyVars(vars);
      } else {
        applyVars(DEFAULT_VARS);
      }
    } catch {
      applyVars(DEFAULT_VARS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Apply defaults immediately to avoid flash
    applyVars(DEFAULT_VARS);
    fetchAppearance();
  }, [fetchAppearance]);

  return (
    <AppearanceContext.Provider value={{ appearance, loading, refetchAppearance: fetchAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
