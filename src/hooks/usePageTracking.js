import { useEffect } from 'react';
import { supabase } from '../supabase/client';

/**
 * Logs a page visit to the `page_visits` table in Supabase.
 * Uses sessionStorage to avoid counting refreshes as new visits.
 * Runs only once per browser session.
 */
export function usePageTracking() {
  useEffect(() => {
    // Only track once per session
    const key = 'pv_tracked';
    if (sessionStorage.getItem(key)) return;

    const track = async () => {
      try {
        // Basic device detection
        const ua = navigator.userAgent || '';
        let device = 'Desktop';
        if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
          device = /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
        }

        // Browser name
        let browser = 'Other';
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';

        // Referrer — where did they come from?
        const referrer = document.referrer
          ? new URL(document.referrer).hostname
          : 'direct';

        await supabase.from('page_visits').insert({
          page: window.location.pathname || '/',
          referrer,
          device,
          browser,
          // We don't collect IP or personal data — keep it privacy-friendly
        });

        sessionStorage.setItem(key, '1');
      } catch (err) {
        // Silent fail — tracking should never break the portfolio
        console.warn('visit tracking:', err.message);
      }
    };

    // Small delay so it doesn't block first paint
    const t = setTimeout(track, 1500);
    return () => clearTimeout(t);
  }, []);
}
