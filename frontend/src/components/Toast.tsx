import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ToastProps {
  toastMessage: { text: string; type: 'success' | 'error' } | null;
}

export function Toast({ toastMessage }: ToastProps) {
  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          className={`fixed bottom-6 right-6 z-50 text-xs px-5 py-3.5 shadow-2xl rounded-xl display flex items-center gap-3 max-w-sm tracking-wide font-sans font-medium border ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/20' 
              : 'bg-red-950 text-red-300 border-red-500/20'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
