import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(form.email, form.password);
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Invalid email or password.'
        : err.message);
      setLoading(false);
    } else {
      navigate('/admin-space');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary dot-grid flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="glow-blob w-[500px] h-[500px] bg-accent-gold/6 -top-40 left-1/2 -translate-x-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-admin-card border border-border rounded-2xl shadow-card-hover overflow-hidden">
          {/* Top stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-accent-gold via-accent-gold-bright to-accent-teal" />

          <div className="p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                <Lock size={24} className="text-accent-gold" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-2xl text-text-primary">Admin Space</h1>
                <p className="font-body text-sm text-text-muted mt-1">Sign in to manage your portfolio</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl"
              >
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="font-body text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="admin@yoursite.dev"
                    required
                    className="admin-input pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Your password"
                    required
                    className="admin-input pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary justify-center mt-2 w-full disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <><motion.span className="w-4 h-4 border-2 border-bg-primary/40 border-t-bg-primary rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> Signing in…</>
                ) : (
                  <><Lock size={15} /> Sign In</>
                )}
              </motion.button>
            </form>

            <p className="font-mono text-xs text-text-muted text-center">
              Only authorized admin can access this page.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <a href="/" className="font-body text-sm text-text-muted hover:text-accent-gold transition-colors">
            ← Back to portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
