import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';

export const DEFAULT_SITE_CONTENT = {
  // Hero
  hero_badge:            'Open to opportunities',
  hero_typing_strings:   ['Creative Professional', 'Problem Solver'],  // array
  hero_cta_primary:      'View My Work',
  hero_cta_secondary:    'Get in Touch',
  hero_resume_label:     'Download CV',
  hero_scroll_label:     'scroll',

  // About
  about_eyebrow:         'About Me',
  about_title1:          'Passion meets',
  about_title2:          'purpose',
  about_skills_title:    'My Toolkit',
  stat1_value: '5+',  stat1_label: 'Years of Experience',
  stat2_value: '40+', stat2_label: 'Projects Completed',
  stat3_value: '20+', stat3_label: 'Happy Clients',
  stat4_value: '3',   stat4_label: 'Awards Won',

  // Projects
  projects_eyebrow:         'Portfolio',
  projects_title1:          'Work that',
  projects_title2:          'speaks for itself',
  projects_subtitle:        "A selection of projects I'm proud of.",
  projects_filter_all:      'All',
  projects_filter_featured: 'Featured',
  projects_github_cta:      'See more on GitHub',

  // Experience
  experience_eyebrow: 'My Journey',
  experience_title1:  'Experience &',
  experience_title2:  'milestones',

  // Contact
  contact_eyebrow:             'Contact',
  contact_title1:              "Let's create something",
  contact_title2:              'together',
  contact_subtitle:            "I'm always open to new ideas and collaborations.",
  contact_email_label:         'Email',
  contact_location_label:      'Location',
  contact_socials_label:       'Find me on',
  contact_form_title:          'Send a message',
  contact_name_placeholder:    'Your name',
  contact_email_placeholder:   'your@email.com',
  contact_message_placeholder: 'Tell me about your project or idea...',
  contact_submit_label:        'Send Message',
  contact_success_title:       'Message sent!',
  contact_success_body:        "Thank you for reaching out. I'll get back to you shortly.",

  // Footer
  footer_tagline: 'Built with love and React',
};

const SiteConfigContext = createContext(null);

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('site_content').select('*').eq('id', 1).single();
      if (!error && data) {
        // Parse hero_typing_strings — could come back as array (JSONB) or string
        let typingStrings = DEFAULT_SITE_CONTENT.hero_typing_strings;
        if (data.hero_typing_strings) {
          typingStrings = typeof data.hero_typing_strings === 'string'
            ? JSON.parse(data.hero_typing_strings)
            : data.hero_typing_strings;
        }
        setConfig({ ...DEFAULT_SITE_CONTENT, ...data, hero_typing_strings: typingStrings });
      }
    } catch (err) {
      console.warn('Could not fetch site_content:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  return (
    <SiteConfigContext.Provider value={{ config, loading, refetchConfig: fetchConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error('useSiteConfig must be inside SiteConfigProvider');
  return ctx;
}
