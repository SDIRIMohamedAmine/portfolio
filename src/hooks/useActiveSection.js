import { useState, useEffect } from 'react';

export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observers = [];
    const cb = (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    };
    const opts = { rootMargin: '-40% 0px -55% 0px', threshold: 0 };
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const obs = new IntersectionObserver(cb, opts);
        obs.observe(el);
        observers.push(obs);
      }
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}
