import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';

const DEFAULT_CERTS = [];

const CertificatesContext = createContext(null);

export function CertificatesProvider({ children }) {
  const [certificates, setCertificates] = useState(DEFAULT_CERTS);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!error && data) setCertificates(data);
    } catch (err) {
      console.warn('certificates fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  return (
    <CertificatesContext.Provider value={{ certificates, loading, refetchCertificates: fetchCertificates }}>
      {children}
    </CertificatesContext.Provider>
  );
}

export function useCertificates() {
  const ctx = useContext(CertificatesContext);
  if (!ctx) throw new Error('useCertificates must be inside CertificatesProvider');
  return ctx;
}
