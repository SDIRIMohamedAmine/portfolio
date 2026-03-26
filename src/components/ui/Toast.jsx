import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3500);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const isSuccess = toast.type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card-hover min-w-[260px] ${
        isSuccess
          ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
          : 'bg-accent-red/10 border-accent-red/30 text-accent-red'
      }`}
    >
      {isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
      <span className="font-body text-sm text-text-primary flex-1">{toast.message}</span>
      <button onClick={onRemove} className="text-text-muted hover:text-text-primary">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// Hook for managing toasts
let _id = 0;
export function useToast() {
  const [toasts, setToasts] = (window.__toastState = window.__toastState || [null, null]);
  // This is a simplified version - use with ToastProvider pattern
  return { toasts: [], addToast: () => {}, removeToast: () => {} };
}
